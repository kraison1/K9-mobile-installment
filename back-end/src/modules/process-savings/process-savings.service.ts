import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ProcessSavingSearchDto } from 'src/helper/search.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ProcessSaving } from './entities/process-saving.entity';
import { ProductSaving } from '../product-saving/entities/product-saving.entity';
import { isEmpty } from 'lodash';
import { Product } from '../product/entities/product.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { CreateProductLogDto } from '../product-log/dto/create-product-log.dto';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { ProcessSavingImage } from '../process-saving-images/entities/process-saving-image.entity';
import { TelegramNotificationService } from '../telegram-notification/telegram-notification.service';
import { Branch } from '../branchs/entities/branch.entity';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { generateRandomString } from 'src/helper/generateRandomString';

@Injectable()
export class ProcessSavingsService {
  private readonly uploadsPath = path.join('uploads/process-savings');

  constructor(
    @InjectRepository(ProcessSaving)
    private readonly processSavingRepository: Repository<ProcessSaving>,

    @InjectRepository(ProductSaving)
    private readonly productSavingRepository: Repository<ProductSaving>,

    @InjectRepository(ProcessSavingImage)
    private readonly processSavingImageRepository: Repository<ProcessSavingImage>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    private readonly productLogService: ProductLogService,

    private readonly telegramNotificationService: TelegramNotificationService,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;
    const { id, savingType, savingStatus } = req.body as any;
    const values = {
      productSavingId: id.value,
      createByUserId: user.id,
      branchId: user.branchId,
      status: '1',
      sumPrice: 0,
      savingStatus: savingStatus?.value || '',
      savingType: savingType?.value || 1,
    };

    const processSaving = await this.processSavingRepository.findOne({
      where: { productSavingId: values.productSavingId, status: '1' },
    });

    const fetchProductSaving = await this.productSavingRepository.findOne({
      where: {
        id: values.productSavingId,
        branchId: values.branchId,
      },
    });

    if (!isEmpty(processSaving)) {
      return {
        message_error: `เลขสัญญา ${fetchProductSaving.code} กำลังรอดำนเนิการ`,
      };
    }

    if (isEmpty(fetchProductSaving)) {
      return { message_error: 'ไม่พบหมายเลขสัญญานี้' };
    } else if (fetchProductSaving.status != '1') {
      return {
        message_error: `เลขสัญญา ${fetchProductSaving.code} ถูกดำเนินการไปแล้ว`,
      };
    }

    const { ...res } = fetchProductSaving;
    values.sumPrice =
      Number(res.priceCash) +
      Number(res.priceTransferCash) +
      Number(res.priceSumPay);

    const createProcessSaving = this.processSavingRepository.create(values);

    const branch = await this.branchRepository.findOneBy({
      id: values.branchId,
    });

    const message = `${values.savingStatus}: ${fetchProductSaving.code}`;
    await this.telegramNotificationService.sendTelegramNotify({
      botToken: branch.token_bot,
      chatId: branch.room_id_processSaving,
      message: message,
    });

    await this.processSavingRepository.save(createProcessSaving);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(searchProcessSavingSearchDto: ProcessSavingSearchDto): Promise<{
    data: ProcessSaving[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.processSavingRepository.createQueryBuilder('process_saving');

    queryBuilder
      .select([
        'process_saving.id',
        'process_saving.sumPrice',
        'process_saving.createByUserId',
        'process_saving.productSavingId',
        'process_saving.create_date',
        'process_saving.savingType',
        'process_saving.savingStatus',
        'process_saving.status',
        'productSaving.id',
        'productSaving.code',
        'productSaving.productId',
        'productSaving.customerId',
        'productSaving.payType',
        'productSaving.bankId',
        'product.id',
        'product.code',
        'product.imei',
        'product.refOldStockNumber',
        'product_model.id',
        'product_model.name',
        'product_color.id',
        'product_color.name',
        'product_storage.id',
        'product_storage.name',
        'customer.id',
        'customer.name',
        'customer.lastname',
        'customer.tel',
        'user.id',
        'user.name',
      ])
      .leftJoin('process_saving.productSaving', 'productSaving')
      .leftJoin('productSaving.product', 'product')
      .leftJoin('product.productModel', 'product_model')
      .leftJoin('product.productColor', 'product_color')
      .leftJoin('product.productStorage', 'product_storage')
      .leftJoin('productSaving.customer', 'customer')
      .leftJoin('process_saving.create_by', 'user');

    if (searchProcessSavingSearchDto.searchType == '1') {
      queryBuilder.andWhere(
        'process_saving.create_date BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(searchProcessSavingSearchDto.startDate),
          endDate: new Date(searchProcessSavingSearchDto.endDate),
        },
      );
    }

    if (searchProcessSavingSearchDto.status !== '0') {
      queryBuilder.andWhere('process_saving.status = :status', {
        status: searchProcessSavingSearchDto.status,
      });
    }

    if (searchProcessSavingSearchDto.branchId !== 0) {
      queryBuilder.andWhere('process_saving.branchId = :branchId', {
        branchId: searchProcessSavingSearchDto.branchId,
      });
    }

    if (searchProcessSavingSearchDto.search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('productSaving.code ILIKE :search', {
            search: `%${searchProcessSavingSearchDto.search}%`,
          })
            .orWhere('customer.name ILIKE :search', {
              search: `%${searchProcessSavingSearchDto.search}%`,
            })
            .orWhere('customer.lastname ILIKE :search', {
              search: `%${searchProcessSavingSearchDto.search}%`,
            })
            .orWhere('customer.tel ILIKE :search', {
              search: `%${searchProcessSavingSearchDto.search}%`,
            })
            .orWhere('product.code ILIKE :search', {
              search: `%${searchProcessSavingSearchDto.search}%`,
            })
            .orWhere('product.imei ILIKE :search', {
              search: `%${searchProcessSavingSearchDto.search}%`,
            });
        }),
      );
    }

    queryBuilder.orderBy('process_saving.create_date', 'DESC');

    const total = await queryBuilder.getCount();

    queryBuilder
      .skip(
        (searchProcessSavingSearchDto.page - 1) *
          searchProcessSavingSearchDto.pageSize,
      )
      .take(searchProcessSavingSearchDto.pageSize);

    const processSaving = await queryBuilder.getMany();

    return {
      data: processSaving,
      total,
      page: searchProcessSavingSearchDto.page,
      pageSize: searchProcessSavingSearchDto.pageSize,
    };
  }

  async findOne(id: number): Promise<ProcessSaving | null> {
    return this.processSavingRepository.findOne({
      where: { id },
      relations: ['processSavingImages'],
    });
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    await fs.ensureDir(this.uploadsPath);
    const files = await req.saveRequestFiles();
    const { sumPrice, priceReturnCustomer, status, payType, note } =
      req.body as any;
    const updateProcessDto = {
      sumPrice: sumPrice?.value ?? 0,
      priceReturnCustomer: priceReturnCustomer?.value ?? 0,
      status: status?.value ?? '',
      payType: payType?.value ?? '',
      note: note?.value ?? '',
    };
    const getProcessSaving = await this.processSavingRepository.findOne({
      where: { id },
      relations: ['productSaving'],
    });
    const { productSaving, ...processSaving } = getProcessSaving;
    await fs.ensureDir(`${this.uploadsPath}/${productSaving.code}`);
    for (let index = 0; index < files.length; index++) {
      const seq = index;
      const file = files[index];
      const buffer = await fs.readFile(file.filepath);
      const randomName = generateRandomString(6);
      const filename = `${randomName}-${seq}.png`;
      const filePath = path.join(
        `${this.uploadsPath}/${productSaving.code}`,
        filename,
      );
      await sharp(buffer).png({ quality: 80, progressive: true  }).toFile(filePath);
      const newProductImage = this.processSavingImageRepository.create({
        name: filePath,
        processSavingId: id,
        userId: user.id,
        seq: seq,
      });
      await this.processSavingImageRepository.save(newProductImage);
    }
    if (processSaving.status == '2' || processSaving.status == '3') {
      return { message_error: 'การดำเนินการไม่ถูกต้อง' };
    }
    if (updateProcessDto.status == '2') {
      processSaving.status = updateProcessDto.status;
      processSaving.priceReturnCustomer = updateProcessDto.priceReturnCustomer;
      processSaving.payType = updateProcessDto.payType;
      processSaving.note = updateProcessDto.note;

      // บันทึกการเปลี่ยนแปลง (ถ้าต้องการ)
      const productSaving = await this.productSavingRepository.findOne({
        where: {
          id: processSaving.productSavingId,
        },
      });

      productSaving.status = getProcessSaving.savingType;
      await this.productSavingRepository.save(productSaving);

      const product = await this.productRepository.findOne({
        where: { id: productSaving.productId },
      });
      if (product) {
        const savedProduct = { ...product };
        savedProduct.active = '1';
        savedProduct.amount = 1;
        // สร้าง product log
        const productLogDto: CreateProductLogDto = {
          productId: productSaving.productId,
          action:
            processSaving.savingType == '1'
              ? `ยึดออม: ${productSaving.code}`
              : `คืนออม: ${productSaving.code}`,
          obj: JSON.stringify({
            before: product,
            after: savedProduct,
          }),
          branchId: productSaving.branchId,
          userId: processSaving.createByUserId,
        };
        await this.productLogService.create(productLogDto);
        // อัปเดต productRepository
        await this.productRepository.update(
          { id: savedProduct.id },
          {
            active: savedProduct.active,
            amount: savedProduct.amount,
          },
        );
      }

      const branch = await this.branchRepository.findOneBy({
        id: processSaving.branchId,
      });

      const message = `ยืนยันการดำเนินการออม: ${productSaving.code}`;
      await this.telegramNotificationService.sendTelegramNotify({
        botToken: branch.token_bot,
        chatId: branch.room_id_processSaving,
        message: message,
      });

      await this.processSavingRepository.save(processSaving);

      return {
        message_success: `${MESSAGE_UPDATE_SUCCESS}`,
      };
    }
  }
}
