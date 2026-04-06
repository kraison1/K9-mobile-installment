import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Not, Raw, Repository } from 'typeorm';
import { Bank } from './entities/bank.entity';
import { BankSearchDto } from 'src/helper/search.dto';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { isEmpty } from 'lodash';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';

@Injectable()
export class BankService {
  private readonly uploadsPath = path.join('uploads/bank');

  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    await fs.ensureDir(this.uploadsPath);
    const files = await req.saveRequestFiles();

    const {
      bankName,
      bankOwner,
      bankNo,
      priceLimit,
      branchId,
      active,
      isFirstTransfer,
      'bookType[]': bookType, // Access bookType[] explicitly
      priceAll,
      priceCurrent,
      fileBank,
    } = req.body as any;

    // Handle bookType as an array of objects [{ value: '1' }, { value: '2' }, ...]
    let bookTypeArray: string[] = [];
    if (Array.isArray(bookType)) {
      bookTypeArray = bookType
        .map((item) => item.value?.toString())
        .filter((value) => value !== undefined && value !== '');
    } else if (bookType?.value) {
      bookTypeArray = [bookType.value.toString()];
    }

    // Validate required fields
    if (!bankNo?.value || !bankName?.value || !bankOwner?.value) {
      return {
        message_error: 'กรุณากรอกข้อมูลที่จำเป็น: bankNo, bankName, bankOwner',
      };
    }

    // const checkBankNo = await this.bankRepository.findOne({
    //   where: { bankNo: bankNo.value },
    // });

    // if (!isEmpty(checkBankNo)) {
    //   return { message_error: `เลขบัญชี ซ้ำ : ${checkBankNo.bankOwner}` };
    // }

    let filePath = '';
    let fileBankPath = fileBank?.value ?? '';

    // Handle file upload if a file is sent
    if (files.length > 0) {
      const file = files[0];
      const buffer = await fs.readFile(file.filepath);
      const filename = `${bankNo.value}.png`;
      filePath = path.join(this.uploadsPath, filename);
      fileBankPath = filePath;

      await sharp(buffer).png({ quality: 80, progressive: true  }).toFile(filePath);
    }

    const createBankDto: Partial<Bank> = {
      bankName: bankName.value,
      bankOwner: bankOwner.value,
      bankNo: bankNo.value,
      priceLimit: parseFloat(priceLimit?.value) || 0,
      branchId: parseInt(branchId?.value, 10) || 1,
      active: active?.value ?? '1',
      isFirstTransfer: isFirstTransfer?.value ?? '0',
      bookType: bookTypeArray,
      priceAll: parseFloat(priceAll?.value) || 0,
      priceCurrent: parseFloat(priceCurrent?.value) || 0,
      fileBank: fileBankPath,
    };

    const newBank = this.bankRepository.create(createBankDto);

    if (isFirstTransfer?.value === '1') {
      await this.bankRepository.update(
        { branchId: parseInt(branchId?.value, 10) || 1 },
        { isFirstTransfer: '0' },
      );
    }

    await this.bankRepository.save(newBank);

    return { message_success: `${MESSAGE_SAVE_SUCCESS}: ${newBank.bankNo}` };
  }

  async findAll(searchBankDto: BankSearchDto): Promise<{
    data: Bank[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder = this.bankRepository.createQueryBuilder('bank');

    queryBuilder.select(['bank.*']);

    if (searchBankDto.branchId !== 0) {
      queryBuilder.where('bank.branchId = :branchId', {
        branchId: searchBankDto.branchId,
      });
    }

    if (searchBankDto.search) {
      queryBuilder.andWhere(
        '(bank.bankNo ILIKE :search OR bank.bankOwner ILIKE :search)',
        { search: `%${searchBankDto.search}%` },
      );
    }

    if (searchBankDto.active !== '2') {
      queryBuilder.andWhere('bank.active = :active', {
        active: searchBankDto.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('bank.bankOwner', 'ASC')
      .skip((searchBankDto.page - 1) * searchBankDto.pageSize)
      .take(searchBankDto.pageSize);

    const bankes = await queryBuilder.getRawMany();

    return {
      data: bankes,
      total,
      page: searchBankDto.page,
      pageSize: searchBankDto.pageSize,
    };
  }

  async getSelect(
    bookType: string,
    req: FastifyRequest,
  ): Promise<
    Pick<Bank, 'id' | 'bankName' | 'bankNo' | 'bankOwner' | 'branchId'>[]
  > {
    const user = (req as any).user;
    if (!user?.branchId) {
      return [];
    }

    return this.bankRepository.find({
      where: {
        active: '1',
        branchId: user.branchId,
        bookType: Raw((alias) => `${alias} ? :bookType`, {
          bookType,
        }),
      },
      select: ['id', 'bankName', 'bankNo', 'bankOwner', 'branchId'],
    });
  }

  async findOne(id: number): Promise<any> {
    const bank = await this.bankRepository.findOne({ where: { id } });
    return bank;
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    await fs.ensureDir(this.uploadsPath);
    const files = await req.saveRequestFiles();

    const {
      bankName,
      bankOwner,
      bankNo,
      priceLimit,
      active,
      isFirstTransfer,
      'bookType[]': bookType, // Access bookType[] explicitly
      fileBank,
      priceAll,
      branchId,
      priceCurrent,
    } = req.body as any;

    // Handle bookType as an array of objects [{ value: '1' }, { value: '2' }, ...]
    let bookTypeArray: string[] = [];
    if (Array.isArray(bookType)) {
      bookTypeArray = bookType
        .map((item) => item.value?.toString())
        .filter((value) => value !== undefined && value !== '');
    } else if (bookType?.value) {
      bookTypeArray = [bookType.value.toString()];
    }

    const existingBank = await this.bankRepository.findOne({
      where: { id },
    });

    if (!existingBank) {
      return { message_error: `Bank with ID ${id} not found` };
    }

    // if (bankNo.value !== existingBank.bankNo) {
    //   const checkBankNo = await this.bankRepository.findOne({
    //     where: {
    //       bankNo: bankNo.value,
    //       id: Not(Equal(id)),
    //     },
    //   });

    //   if (!isEmpty(checkBankNo)) {
    //     return { message_error: `เลขบัญชี ซ้ำ : ${checkBankNo.bankOwner}` };
    //   }
    // }

    if (isFirstTransfer.value === '1') {
      await this.bankRepository.update(
        { branchId: existingBank.branchId },
        { isFirstTransfer: '0' },
      );
    }

    let filePath = existingBank.fileBank;
    let fileBankPath = fileBank?.value ?? existingBank.fileBank;

    // Handle file upload if a file is sent
    if (files.length > 0) {
      const file = files[0];
      const buffer = await fs.readFile(file.filepath);
      const filename = `${bankNo.value}.png`;
      filePath = path.join(this.uploadsPath, filename);
      fileBankPath = filePath;

      await sharp(buffer).png({ quality: 80, progressive: true  }).toFile(filePath);
    }

    const updateData = {
      bankName: bankName?.value ?? existingBank.bankName,
      bankOwner: bankOwner?.value ?? existingBank.bankOwner,
      bankNo: bankNo?.value ?? existingBank.bankNo,
      priceLimit: parseFloat(priceLimit?.value) ?? existingBank.priceLimit,
      active: active?.value ?? existingBank.active,
      isFirstTransfer: isFirstTransfer?.value ?? existingBank.isFirstTransfer,
      fileBank: fileBankPath,
      bookType: bookTypeArray, // Store as array [1, 2, 3]
      priceAll: parseFloat(priceAll?.value) ?? existingBank.priceAll,
      branchId: parseInt(branchId?.value, 10) ?? existingBank.branchId,
      priceCurrent:
        parseFloat(priceCurrent?.value) ?? existingBank.priceCurrent,
    };

    await this.bankRepository.update(id, updateData);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${updateData.bankNo}`,
    };
  }
}
