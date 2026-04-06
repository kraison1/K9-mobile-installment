import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { BankSearchDto } from 'src/helper/search.dto';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { isEmpty } from 'lodash';
import {
  MESSAGE_CHECK_SUCCESS,
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_SKIP_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { Ocr } from './entities/ocr.entity';
import dayjs from 'src/configs/dayjs-config';
import { Product } from '../product/entities/product.entity';
import { firstValueFrom } from 'rxjs';
import { Branch } from '../branchs/entities/branch.entity';

@Injectable()
export class OcrService {
  private readonly uploadsPath = path.join('uploads/ocr');

  constructor(
    @InjectRepository(Ocr)
    private readonly ocrRepository: Repository<Ocr>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    private readonly httpService: HttpService,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    const date = dayjs();
    const dateCode = date.format('YYYYMMDD');
    const startOfDay = date.startOf('day').toDate();
    const endOfDay = date.endOf('day').toDate();

    const ocrCount = await this.ocrRepository.count({
      where: {
        branchId: user.branchId,
        create_date: Between(startOfDay, endOfDay),
      },
    });

    const runNumber = String(ocrCount + 1).padStart(4, '0');
    const code = `ORC${user.branch.code}${dateCode}${runNumber}`;

    const existingOcr = await this.ocrRepository.findOne({ where: { code } });
    if (!isEmpty(existingOcr)) {
      throw new Error(`โค้ด ${code} ซ้ำในระบบ`);
    }

    const existingProduct = await this.productRepository
      .createQueryBuilder('product')
      .select([
        'product.id',
        'product.imei',
        'product.code',
        'product.catalog',
        'product.refOldStockNumber',
      ])
      .leftJoinAndSelect('product.productModel', 'productModel')
      .leftJoinAndSelect('product.productColor', 'productColor')
      .leftJoinAndSelect('product.productStorage', 'productStorage')
      .where('product.active = :active', { active: '1' })
      // .andWhere('product.id = :id', { id: 971 })
      .andWhere('product.catalog = :catalog', { catalog: 'มือถือ' })
      .andWhere('product.branchId = :branchId', { branchId: user.branchId })
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();

    if (!existingProduct) {
      await this.branchRepository.update(
        {
          id: user.branchId,
        },
        {
          isCheckOcr: '0',
        },
      );

      return {
        message_success: `${MESSAGE_SKIP_SUCCESS}: สาขา ${user.branch?.name || '-'}`,
      };
    }

    const newOcr = this.ocrRepository.create({
      code: code,
      productId: existingProduct.id,
      branchId: user.branchId,
      createByUserId: user.id,
    });

    const savedOcr = await this.ocrRepository.save(newOcr);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${savedOcr.code}`,
      infoBarcode: { ocrCode: savedOcr.code, product: existingProduct },
    };
  }

  async findAll(searchBankDto: BankSearchDto): Promise<{
    data: Ocr[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder = this.ocrRepository.createQueryBuilder('ocr');

    queryBuilder
      .select(['ocr'])
      .leftJoinAndSelect('ocr.branch', 'branch')
      .leftJoinAndSelect('ocr.create_by', 'create_by');

    if (searchBankDto.branchId !== 0) {
      queryBuilder.where('ocr.branchId = :branchId', {
        branchId: searchBankDto.branchId,
      });
    }

    if (searchBankDto.search) {
      queryBuilder.andWhere(
        '(ocr.code ILIKE :search OR ocr.imei ILIKE :search OR ocr.barcode ILIKE :search)',
        {
          search: `%${searchBankDto.search}%`,
        },
      );
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('ocr.create_date', 'DESC')
      .skip((searchBankDto.page - 1) * searchBankDto.pageSize)
      .take(searchBankDto.pageSize);

    const ocrs = await queryBuilder.getMany();

    return {
      data: ocrs,
      total,
      page: searchBankDto.page,
      pageSize: searchBankDto.pageSize,
    };
  }

  async findOne(id: number): Promise<Ocr | null> {
    return this.ocrRepository.findOne({
      where: { id },
      relations: ['branch', 'create_by'],
    });
  }

  async update(code: string, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    const existingOcr = await this.ocrRepository.findOne({
      where: { code: code, branchId: user.branchId },
      relations: ['product'],
    });

    const files = await req.saveRequestFiles();

    if (isEmpty(existingOcr)) {
      return { message_error: `ไม่พบข้อมูล Ocr ด้วยโค้ด: ${code}` };
    }

    let filePath = '';
    let fileOcr = existingOcr?.fileOcr ?? '';

    if (files.length > 0) {
      const file = files[0];
      const buffer = await fs.readFile(file.filepath);
      const filename = `${existingOcr.code}.png`;
      filePath = path.join(this.uploadsPath, existingOcr.code, filename);
      fileOcr = filePath;

      // console.log(`Saving image to path: ${filePath}`);

      await sharp(buffer)
        .png({ quality: 80, progressive: true })
        .toFile(filePath);

      // เรียก Python API เพื่อประมวลผลภาพ
      try {
        // console.log(`Calling Python API with image path: ${filePath}`);
        const response = await firstValueFrom(
          this.httpService.post(
            'http://python-service:5001/process-image',
            { image_path: filePath },
            { headers: { 'Content-Type': 'application/json' } },
          ),
        );

        const result = response.data;
        // console.log('Python API response:', result);

        const barcodes = result.barcodes || [];
        const imeis = result.imeis || [];
        const barcode = barcodes.length > 0 ? barcodes[0] : null;
        const imei = imeis.length > 0 ? imeis[0] : null;
        // console.log(`Extracted barcode: ${barcode}, IMEI: ${imei}`);

        if (barcode || imei) {
          // ลบช่องว่างออกจาก IMEI (เช่น "35 507239 116034 8" → "355072391160348")
          const gotImei = imei ? imei.replace(/\s/g, '') : null;
          // console.log(`Processed IMEI (spaces removed): ${gotImei}`);

          // แยกส่วน CODE128: ออก เพื่อให้ได้เฉพาะ ORCTPA1202505090002
          let extractedCode = barcode;
          if (barcode && barcode.startsWith('CODE128: ')) {
            extractedCode = barcode.replace('CODE128: ', '');
          }
          // console.log(`Extracted code from barcode: ${extractedCode}`);

          // ตรวจสอบว่า extractedCode ตรงกับ code ที่ส่งเข้ามาหรือไม่
          if (extractedCode !== code) {
            // console.log(
            //   `Barcode code mismatch. Expected: ${code}, Got: ${extractedCode}`,
            // );
            return { message_error: 'ocr Code ผิด' };
          }

          // ตรวจสอบว่า IMEI ตรงกับ existingOcr.product.imei หรือไม่
          if (existingOcr.product.imei && gotImei) {
            if (existingOcr.product.imei.length < 7 || gotImei.length < 7) {
              // console.log(
              //   `IMEI too short. Expected: ${existingOcr.product.imei}, Got: ${gotImei}`,
              // );
              return { message_error: 'IMEI จากรูปภาพไม่ถูกต้อง' };
            }

            let matchingChars = 0;
            const minLength = Math.min(
              existingOcr.product.imei.length,
              gotImei.length,
            );

            for (let i = 0; i < minLength; i++) {
              if (existingOcr.product.imei[i] === gotImei[i]) {
                matchingChars++;
              }
            }

            if (matchingChars < 7) {
              // console.log(
              //   `IMEI mismatch. Expected: ${existingOcr.product.imei}, Got: ${gotImei}, Matching characters: ${matchingChars}`,
              // );
              return { message_error: 'IMEI จากรูปภาพไม่ถูกต้อง' };
            }
          }

          await this.ocrRepository.update(
            { id: existingOcr.id },
            {
              barcode: barcode,
              imei: gotImei, // บันทึก IMEI ที่ไม่มีช่องว่างลงใน database
            },
          );
          // console.log(
          //   `Updated Ocr record with barcode: ${barcode}, IMEI: ${gotImei}`,
          // );
        } else {
          // console.log('No barcode or IMEI found in Python API response.');
          return { message_error: 'ติดต่อ orc-service ไม่ได้' };
        }
      } catch (error) {
        // console.error('Error calling Python API:', error.message);
        return { message_error: 'เกิดข้อผิดพลาดในการตรวจสอบ สินค้า' };
      } finally {
        await this.branchRepository.update(
          {
            id: user.branchId,
          },
          {
            isCheckOcr: '0',
          },
        );
        // console.log(`Set isCheckOcr to 0 for branchId: ${user.branchId}`);
      }
    }

    await this.ocrRepository.update(
      { id: existingOcr.id },
      { fileOcr: fileOcr, updateByUserId: user.id },
    );

    // console.log(`Successfully updated Ocr record with code: ${code}`);
    return { message_success: MESSAGE_CHECK_SUCCESS };
  }
}
