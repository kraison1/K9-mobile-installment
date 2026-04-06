import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BranchTransferPriceSearchDto } from 'src/helper/search.dto';
import { Branch } from '../branchs/entities/branch.entity';
import dayjs from 'src/configs/dayjs-config';
import {
  MESSAGE_DELETE_SUCCESS,
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { FastifyRequest } from 'fastify';
import sharp from 'sharp';

import * as fs from 'fs-extra';
import * as path from 'path';
import { generateRandomString } from 'src/helper/generateRandomString';
import { BranchTransferPrice } from './entities/branch-transfer-price.entity';
import { isEmpty } from 'lodash';

@Injectable()
export class BranchTransferPriceService {
  private readonly uploadsPath = path.join('uploads/branch-transfer-price');

  constructor(
    @InjectRepository(BranchTransferPrice)
    private readonly branchTransferPriceRepository: Repository<BranchTransferPrice>,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    await fs.ensureDir(this.uploadsPath);

    const { price, name, note, bankId, status, infoBank, fromBranchId } =
      req.body as any;
    const values = {
      price: price?.value ?? null,
      name: name?.value ?? null,
      note: note?.value ?? null,
      bankId: bankId?.value ?? null,
      status: status?.value ?? 1,
      infoBank: infoBank?.value ?? null,
      code: null,
      branchId: user.branchId,
      fromBranchId: fromBranchId?.value ?? null,
      createByUserId: user.id,
      filePrice: null,
    };

    const branch = await this.branchRepository.findOneOrFail({
      where: { id: values.branchId },
    });

    const dateCode = dayjs().format('YYYYMMDD'); // ใช้ dayjs แทน Date
    const lastBranchTransferPrice =
      await this.branchTransferPriceRepository.findOne({
        where: {
          code: Between(
            `${branch.code}${dateCode}0001`,
            `${branch.code}${dateCode}9999`,
          ),
        },
        order: { code: 'DESC' },
      });

    const runNumber = lastBranchTransferPrice
      ? (parseInt(lastBranchTransferPrice.code.slice(-4)) + 1)
          .toString()
          .padStart(4, '0')
      : '0001';
    values.code = `${branch.code}${dateCode}${runNumber}`;
    const newBranchTransferPrice =
      this.branchTransferPriceRepository.create(values);

    await this.branchTransferPriceRepository.save(newBranchTransferPrice);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${newBranchTransferPrice.code}`,
    };
  }

  async findAll(
    searchBranchTransferPriceDto: BranchTransferPriceSearchDto,
  ): Promise<{
    data: BranchTransferPrice[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder = this.branchTransferPriceRepository.createQueryBuilder(
      'branch_transfer_price',
    );

    queryBuilder
      .select([
        'branch_transfer_price.id',
        'branch_transfer_price.code',
        'branch_transfer_price.name',
        'branch_transfer_price.infoBank',
        'branch_transfer_price.fromInfoBank',
        'branch_transfer_price.create_date',
        'branch_transfer_price.price',
        'branch_transfer_price.status',
        'user.id',
        'user.name',
        'branch.name',
        'fromBranch.name',
      ])
      .leftJoin('branch_transfer_price.create_by', 'user')
      .leftJoin('branch_transfer_price.branch', 'branch')
      .leftJoin('branch_transfer_price.fromBranch', 'fromBranch');

    // ตรวจสอบ branchId
    queryBuilder
      .where('branch_transfer_price.branchId = :branchId', {
        branchId: searchBranchTransferPriceDto.branchId,
      })
      .orWhere('branch_transfer_price.fromBranchId = :fromBranchId', {
        fromBranchId: searchBranchTransferPriceDto.branchId,
      });

    if (searchBranchTransferPriceDto.status) {
      queryBuilder.where('branch_transfer_price.status = :status', {
        status: searchBranchTransferPriceDto.status,
      });
    }

    if (searchBranchTransferPriceDto.search) {
      queryBuilder.andWhere(
        '(branch_transfer_price.code ILIKE :search OR branch_transfer_price.infoBank ILIKE :search OR branch_transfer_price.fromInfoBank ILIKE :search)',
        {
          search: `%${searchBranchTransferPriceDto.search}%`,
        },
      );
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('branch_transfer_price.create_date', 'DESC')
      .skip(
        (searchBranchTransferPriceDto.page - 1) *
          searchBranchTransferPriceDto.pageSize,
      )
      .take(searchBranchTransferPriceDto.pageSize);

    const branchTransferPrices = await queryBuilder.getMany();

    return {
      data: branchTransferPrices,
      total,
      page: searchBranchTransferPriceDto.page,
      pageSize: searchBranchTransferPriceDto.pageSize,
    };
  }

  async findOne(id: number): Promise<BranchTransferPrice | null> {
    return this.branchTransferPriceRepository.findOne({ where: { id } });
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    await fs.ensureDir(this.uploadsPath);

    const user = (req as any).user;

    const existing = await this.branchTransferPriceRepository.findOneBy({
      id: id,
    });

    if (isEmpty(existing)) {
      return {
        message_error: `ไม่พบข้อมูล`,
      };
    }

    const {
      price,
      name,
      note,
      bankId,
      infoBank,
      fromInfoBank,
      fromBankId,
      fromBranchId,
      status,
      filePrice,
    } = req.body as any;

    const values = {
      price: price?.value ?? null,
      name: name?.value ?? null,
      note: note?.value ?? null,
      bankId: bankId?.value ?? null,
      infoBank: infoBank?.value ?? null,
      code: existing.code,
      branchId: existing.branchId,
      fromBranchId: fromBranchId?.value ?? null,
      fromBankId: fromBankId?.value ?? null,
      fromInfoBank: fromInfoBank?.value ?? null,
      status: status?.value ?? null,
      filePrice: filePrice?.value ?? null,
    };

    const files = await req.saveRequestFiles();

    if (values.branchId == user.branchId) {
      values.status = existing.status;
    }

    let filePath = '';
    let fileBranchTransferPricePath = values?.filePrice ?? '';

    if (files.length > 0) {
      // Delete old file if it exists
      if (existing.filePrice && (await fs.pathExists(existing.filePrice))) {
        try {
          await fs.unlink(existing.filePrice);
        } catch (error) {}
      }

      await fs.ensureDir(`${this.uploadsPath}/${values.code}`);
      const file = files[0];
      const buffer = await fs.readFile(file.filepath);
      const filename = `${generateRandomString(6)}.png`;
      filePath = path.join(this.uploadsPath, values.code, filename);
      fileBranchTransferPricePath = filePath;

      await sharp(buffer).png({ quality: 80, progressive: true  }).toFile(filePath);

      values.filePrice = fileBranchTransferPricePath;
    }

    await this.branchTransferPriceRepository.update(id, values);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${values.code}`,
    };
  }

  async delete(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    const branch_transfer_price =
      await this.branchTransferPriceRepository.findOne({
        where: { id },
      });

    if (user.branchId !== branch_transfer_price.branchId) {
      return {
        message_success: `คุณไม่มีสิทธิลบในสาขานี้`,
      };
    }

    if (isEmpty(branch_transfer_price)) {
      return {
        message_success: `ค้นหาค่าใช้จ่ายไม่เจอ`,
      };
    }

    try {
      // ตรวจสอบว่าไฟล์มีอยู่จริง
      const fileExists = await fs.pathExists(branch_transfer_price.filePrice);
      if (fileExists) {
        await fs.remove(branch_transfer_price.filePrice);
      }

      const expenseCode = branch_transfer_price.code;
      const folderPath = path.join(this.uploadsPath, expenseCode);
      const folderExists = await fs.pathExists(folderPath);
      if (folderExists) {
        // ตรวจสอบว่าโฟลเดอร์ว่างหรือไม่
        const files = await fs.readdir(folderPath);
        if (files.length === 0) {
          await fs.remove(folderPath); // ลบโฟลเดอร์ถ้าว่าง
        }
      }
    } catch (error) {}

    await this.branchTransferPriceRepository.delete(id);

    return {
      message_success: `${MESSAGE_DELETE_SUCCESS}`,
    };
  }
}
