import { Product } from 'src/modules/product/entities/product.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChangeProductPriceSearchDto } from 'src/helper/search.dto'; // Assuming you are using a similar search DTO
import dayjs from 'src/configs/dayjs-config';
import { ProductLogService } from '../product-log/product-log.service';
import { CreateProductLogDto } from '../product-log/dto/create-product-log.dto';
import { CreateChangeProductPriceDto } from './dto/create-change-product-price.dto';
import { ChangeProductPrice } from './entities/change-product-price.entity';
import { MESSAGE_SAVE_SUCCESS } from 'src/helper/constanc';

@Injectable()
export class ChangeProductPriceService {
  constructor(
    @InjectRepository(ChangeProductPrice)
    private readonly changeProductPriceRepository: Repository<ChangeProductPrice>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productLogService: ProductLogService,
  ) {}

  async create(
    createChangeProductPriceDto: CreateChangeProductPriceDto,
  ): Promise<any> {
    const prefix = 'Price';
    const today = dayjs().format('YYYYMMDD');

    const runNumber = (
      (await this.changeProductPriceRepository
        .createQueryBuilder('change_product_price')
        .where('DATE(change_product_price.create_date) = :today', {
          today: dayjs().format('YYYY-MM-DD'),
        })
        .getCount()) + 1
    )
      .toString()
      .padStart(4, '0'); // คำนวณ run number และเติม 4 หลัก

    // อัปเดต product ด้วยข้อมูลใหม่
    const updateProducts = await this.productRepository.find({
      where: {
        productModelId: createChangeProductPriceDto.productModelId,
        productStorageId: createChangeProductPriceDto.productStorageId,
        hand: createChangeProductPriceDto.hand,
        branchId: createChangeProductPriceDto.branchId,
        isFinance: '0',
        active: '1',
      },
    });

    // สร้าง ChangeProductPrice และบันทึกข้อมูล
    const newChangeProductPrice = this.changeProductPriceRepository.create({
      ...createChangeProductPriceDto,
      code: `${prefix}${today}${runNumber}`, // สร้าง code ในบรรทัดเดียว
    });

    for (let index = 0; index < updateProducts.length; index++) {
      const existingProduct = await this.productRepository.findOne({
        where: { id: updateProducts[index].id },
      });

      const updateProductDto = {
        ...existingProduct,
        // priceCostBuy: newChangeProductPrice.priceCostBuy,
        priceDownPayment: newChangeProductPrice.priceDownPayment,
        priceDownPaymentPercent: newChangeProductPrice.priceDownPaymentPercent,
        payPerMonth: newChangeProductPrice.payPerMonth,
        valueMonth: newChangeProductPrice.valueMonth,
        priceSale: newChangeProductPrice.priceSale,
        priceWholeSale: newChangeProductPrice.priceWholeSale,
        updateByUserId: newChangeProductPrice.createByUserId,
        note: `รหัสปรับราคาใหม่: ${newChangeProductPrice.code}`,
      };

      // บันทึกการเปลี่ยนแปลงลง ProductLog ก่อนอัปเดต
      const productLogDto: CreateProductLogDto = {
        productId: updateProducts[index].id,
        action: 'อัพเดตราคาใหม่',
        obj: JSON.stringify({
          before: existingProduct,
          after: updateProductDto,
        }),
        branchId: createChangeProductPriceDto.branchId,
        userId: createChangeProductPriceDto.createByUserId,
      };

      await this.productLogService.create(productLogDto);

      // อัปเดต Product
      await this.productRepository.update(
        updateProducts[index].id,
        updateProductDto,
      );
    }

    await this.changeProductPriceRepository.save(newChangeProductPrice);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(searchDto: ChangeProductPriceSearchDto): Promise<{
    data: ChangeProductPrice[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder = this.changeProductPriceRepository.createQueryBuilder(
      'change_product_price',
    );

    queryBuilder
      .select(['change_product_price', 'user.id', 'user.name'])
      .leftJoinAndSelect('change_product_price.productModel', 'product_model')
      .leftJoin('change_product_price.create_by', 'user');

    if (searchDto.search) {
      queryBuilder.where('change_product_price.code ILIKE :search', {
        search: `%${searchDto.search}%`,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('change_product_price.create_date', 'DESC')
      .skip((searchDto.page - 1) * searchDto.pageSize)
      .take(searchDto.pageSize);

    const changeProductPrices = await queryBuilder.getMany();

    return {
      data: changeProductPrices,
      total,
      page: searchDto.page,
      pageSize: searchDto.pageSize,
    };
  }

  async findOne(id: number): Promise<ChangeProductPrice | null> {
    return this.changeProductPriceRepository.findOne({ where: { id } });
  }
}
