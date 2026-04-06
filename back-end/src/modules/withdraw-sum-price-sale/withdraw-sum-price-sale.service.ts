import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { WithdrawSumPriceSale } from './entities/withdraw-sum-price-sale.entity';
import { WithdrawSumPriceSaleSearchDto } from 'src/helper/search.dto';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { generateRandomString } from 'src/helper/generateRandomString';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class WithdrawSumPriceSaleService {
  private readonly uploadsPath = path.join('uploads/withdrawSumPriceSale');

  constructor(
    @InjectRepository(WithdrawSumPriceSale)
    private readonly withdrawSumPriceSaleRepository: Repository<WithdrawSumPriceSale>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    await fs.ensureDir(this.uploadsPath);
    const files = await req.saveRequestFiles();

    const {
      amountWithdraw,
      amountRemaining,
      priceSale,
      priceSum,
      note,
      active,
      productId,
      fileWithdrawSumPriceSale,
    } = req.body as any;

    const product = await this.productRepository.findOne({
      where: { id: productId?.value },
    });

    if (amountWithdraw?.value > product.amountRemaining) {
      return {
        message_error: `ไม่สามารถเบิกมากกว่า จำนวนคงเหลือ ${product.amountRemaining}`,
      };
    }

    // Generate code
    const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `WD${dateString}`;
    const lastSale = await this.withdrawSumPriceSaleRepository.findOne({
      where: {
        code: Like(`${prefix}%`),
        branchId: user.branchId,
      },
      order: { code: 'DESC' },
    });

    const sequence = lastSale ? parseInt(lastSale.code.slice(-4)) + 1 : 1;
    const code = `${prefix}${sequence.toString().padStart(4, '0')}`;

    let filePath = fileWithdrawSumPriceSale?.value ?? '';

    // return code;

    // Handle file upload if a file is sent
    if (files.length > 0) {
      const file = files[0];
      const buffer = await fs.readFile(file.filepath);
      const filename = `${generateRandomString(6)}.png`;
      const codePath = path.join(this.uploadsPath, code);
      await fs.ensureDir(codePath);
      filePath = path.join(codePath, filename);

      await sharp(buffer)
        .png({ quality: 80, progressive: true })
        .toFile(filePath);
    }

    const createWithdrawSumPriceSaleDto: Partial<WithdrawSumPriceSale> = {
      code,
      branchId: user.branchId,
      createByUserId: user.id,
      amountWithdraw: parseFloat(amountWithdraw?.value) || 0,
      amountRemaining: parseFloat(amountRemaining?.value) || 0,
      priceSale: parseFloat(priceSale?.value) || 0,
      priceSum: parseFloat(priceSum?.value) || 0,
      note: note?.value || '',
      active: active?.value ?? '1',
      productId: productId?.value,
      fileWithdrawSumPriceSale: filePath,
    };

    const newWithdrawSumPriceSale = this.withdrawSumPriceSaleRepository.create(
      createWithdrawSumPriceSaleDto,
    );
    await this.withdrawSumPriceSaleRepository.save(newWithdrawSumPriceSale);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${newWithdrawSumPriceSale.code}`,
    };
  }

  async findAll(
    searchWithdrawSumPriceSaleDto: WithdrawSumPriceSaleSearchDto,
  ): Promise<{
    data: WithdrawSumPriceSale[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder = this.withdrawSumPriceSaleRepository.createQueryBuilder(
      'withdraw_sum_price_sale',
    );

    queryBuilder
      .select([
        'withdraw_sum_price_sale',
        'product.id',
        'product.productModelId',
        'product_model.id',
        'product_model.name',
        'product.productBrandId',
        'product_brand.id',
        'product_brand.name',
        'product.productColorId',
        'product_color.id',
        'product_color.name',
        'user.id',
        'user.name',
      ])
      .leftJoin('withdraw_sum_price_sale.product', 'product')
      .leftJoinAndSelect('product.productBrand', 'product_brand')
      .leftJoinAndSelect('product.productModel', 'product_model')
      .leftJoinAndSelect('product.productColor', 'product_color')
      .leftJoin('withdraw_sum_price_sale.create_by', 'user');

    queryBuilder.where(
      'withdraw_sum_price_sale.create_date BETWEEN :startDate AND :endDate',
      {
        startDate: new Date(searchWithdrawSumPriceSaleDto.startDate),
        endDate: new Date(searchWithdrawSumPriceSaleDto.endDate),
      },
    );

    if (searchWithdrawSumPriceSaleDto.branchId !== 0) {
      queryBuilder.andWhere('withdraw_sum_price_sale.branchId = :branchId', {
        branchId: searchWithdrawSumPriceSaleDto.branchId,
      });
    }

    if (searchWithdrawSumPriceSaleDto.status != '') {
      queryBuilder.andWhere('withdraw_sum_price_sale.status = :status', {
        status: searchWithdrawSumPriceSaleDto.status,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('withdraw_sum_price_sale.create_date', 'DESC')
      .skip(
        (searchWithdrawSumPriceSaleDto.page - 1) *
          searchWithdrawSumPriceSaleDto.pageSize,
      )
      .take(searchWithdrawSumPriceSaleDto.pageSize);

    const withdrawSumPriceSales = await queryBuilder.getMany();

    return {
      data: withdrawSumPriceSales,
      total,
      page: searchWithdrawSumPriceSaleDto.page,
      pageSize: searchWithdrawSumPriceSaleDto.pageSize,
    };
  }

  async findOne(id: number): Promise<WithdrawSumPriceSale | null> {
    return this.withdrawSumPriceSaleRepository.findOne({ where: { id } });
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    await fs.ensureDir(this.uploadsPath);
    const files = await req.saveRequestFiles();

    const {
      branchId,
      amountWithdraw,
      amountRemaining,
      priceSale,
      priceSum,
      note,
      status,
      active,
      fileWithdrawSumPriceSale,
    } = req.body as any;

    const existingWithdrawSumPriceSale =
      await this.withdrawSumPriceSaleRepository.findOne({ where: { id } });

    if (existingWithdrawSumPriceSale.status != '1') {
      return {
        message_success: `${existingWithdrawSumPriceSale.code} ถูกอัพเดตไปก่อนหน้าแล้ว`,
      };
    }

    let filePath = existingWithdrawSumPriceSale.fileWithdrawSumPriceSale;
    let fileWithdrawSumPriceSalePath =
      fileWithdrawSumPriceSale?.value ??
      existingWithdrawSumPriceSale.fileWithdrawSumPriceSale;

    if (files.length > 0) {
      // Delete old file if it exists
      if (existingWithdrawSumPriceSale.fileWithdrawSumPriceSale) {
        await fs
          .unlink(existingWithdrawSumPriceSale.fileWithdrawSumPriceSale)
          .catch(() => {});
      }

      const file = files[0];
      const buffer = await fs.readFile(file.filepath);
      const filename = `${generateRandomString(6)}.png`;
      const codePath = path.join(
        this.uploadsPath,
        existingWithdrawSumPriceSale.code,
      );
      await fs.ensureDir(codePath);
      filePath = path.join(codePath, filename);
      fileWithdrawSumPriceSalePath = filePath;

      await sharp(buffer)
        .png({ quality: 80, progressive: true })
        .toFile(filePath);
    }

    const updateData: Partial<WithdrawSumPriceSale> = {
      branchId:
        parseInt(branchId?.value, 10) ?? existingWithdrawSumPriceSale.branchId,
      amountWithdraw:
        parseFloat(amountWithdraw?.value) ??
        existingWithdrawSumPriceSale.amountWithdraw,
      amountRemaining:
        parseFloat(amountRemaining?.value) ??
        existingWithdrawSumPriceSale.amountRemaining,
      priceSale:
        parseFloat(priceSale?.value) ?? existingWithdrawSumPriceSale.priceSale,
      priceSum:
        parseFloat(priceSum?.value) ?? existingWithdrawSumPriceSale.priceSum,
      status: status?.value ?? existingWithdrawSumPriceSale.status,
      active: active?.value ?? existingWithdrawSumPriceSale.active,
      note: note?.value ?? existingWithdrawSumPriceSale.note,
      fileWithdrawSumPriceSale: fileWithdrawSumPriceSalePath,
    };

    if (updateData.status == '2') {
      const product = await this.productRepository.findOne({
        where: { id: existingWithdrawSumPriceSale.productId },
      });
      product.amountWithdraw = Number(product.amountWithdraw);
      product.amountWithdraw += Number(updateData.amountWithdraw);

      product.amountRemaining = Number(product.amountRemaining);
      product.amountRemaining -= Number(updateData.amountWithdraw);

      product.priceSumWithdraw = Number(product.priceSumWithdraw);
      product.priceSumWithdraw += Number(updateData.priceSum);

      await this.productRepository.update(product.id, product);
    }

    await this.withdrawSumPriceSaleRepository.update(id, updateData);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${existingWithdrawSumPriceSale.code}`,
    };
  }

  async delete(id: number): Promise<any> {
    const existingWithdrawSumPriceSale =
      await this.withdrawSumPriceSaleRepository.findOne({ where: { id } });

    if (existingWithdrawSumPriceSale.status == '2') {
      const product = await this.productRepository.findOne({
        where: { id: existingWithdrawSumPriceSale.productId },
      });

      product.amountWithdraw = Number(product.amountWithdraw);
      product.amountWithdraw -= Number(
        existingWithdrawSumPriceSale.amountWithdraw,
      );

      product.amountRemaining = Number(product.amountRemaining);
      product.amountRemaining += Number(
        existingWithdrawSumPriceSale.amountWithdraw,
      );

      product.priceSumWithdraw = Number(product.priceSumWithdraw);
      product.priceSumWithdraw -= Number(existingWithdrawSumPriceSale.priceSum);

      await this.productRepository.update(product.id, product);
    }

    // Delete the image file if it exists
    if (existingWithdrawSumPriceSale.fileWithdrawSumPriceSale) {
      await fs
        .unlink(existingWithdrawSumPriceSale.fileWithdrawSumPriceSale)
        .catch(() => {});
    }
    await this.withdrawSumPriceSaleRepository.delete(id);
  }
}
