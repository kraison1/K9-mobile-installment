import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePercentDownFinanceDto } from './dto/create-percent-down-finance.dto';
import { UpdatePercentDownFinanceDto } from './dto/update-percent-down-finance.dto';

import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
  MESSAGE_CHECK_SUCCESS,
} from 'src/helper/constanc';
import { PercentDownFinanceSearchDto } from 'src/helper/search.dto';
import { PercentDownFinance } from './entities/percent-down-finance.entity';
import { isEmpty } from 'lodash';

@Injectable()
export class PercentDownFinanceService {
  constructor(
    @InjectRepository(PercentDownFinance)
    private readonly percentDownFinanceRepository: Repository<PercentDownFinance>,
  ) {}

  async create(
    createPercentDownFinanceDto: CreatePercentDownFinanceDto,
  ): Promise<any> {
    const newPercentDownFinance = this.percentDownFinanceRepository.create(
      createPercentDownFinanceDto,
    );
    this.percentDownFinanceRepository.save(newPercentDownFinance);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(search: PercentDownFinanceSearchDto): Promise<{
    data: PercentDownFinance[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder = this.percentDownFinanceRepository.createQueryBuilder(
      'percent_down_finance',
    );

    queryBuilder.select([
      'percent_down_finance',
      'productModel.id',
      'productModel.name',
      'productStorage.id',
      'productStorage.name',
    ]);

    queryBuilder
      .leftJoin('percent_down_finance.productModel', 'productModel')
      .leftJoin('percent_down_finance.productStorage', 'productStorage');

    if (search.search) {
      queryBuilder.andWhere('productModel.name ILIKE :search', {
        search: `%${search.search}%`,
      });
    }

    if (search.active !== '2') {
      queryBuilder.andWhere('percent_down_finance.active = :active', {
        active: search.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('productModel.name', 'ASC') // Fixed alias from 'product_model' to 'productModel'
      .skip((search.page - 1) * search.pageSize)
      .take(search.pageSize);

    const percentDownFinances = await queryBuilder.getMany();

    return {
      data: percentDownFinances,
      total,
      page: search.page,
      pageSize: search.pageSize,
    };
  }

  async findOne(id: number): Promise<PercentDownFinance | null> {
    return this.percentDownFinanceRepository.findOne({ where: { id } });
  }

  async findPrice(
    productModelId: number,
    productStorageId: number,
    hand: string,
  ): Promise<any> {
    const findPriceFinance = await this.percentDownFinanceRepository.findOne({
      where: {
        productModelId: productModelId,
        productStorageId: productStorageId,
      },
    });

    if (!isEmpty(findPriceFinance)) {
      return {
        message_success: `${MESSAGE_CHECK_SUCCESS}`,
        data: {
          isPromotions: findPriceFinance.isPromotions,
          priceDownPayment: findPriceFinance.priceDownPayment,
          payPerMonth: findPriceFinance.payPerMonth,
          priceStart:
            hand == 'มือหนึ่ง'
              ? findPriceFinance.priceHandOne
              : findPriceFinance.priceStartHandTwo,
          priceEnd:
            hand == 'มือหนึ่ง'
              ? findPriceFinance.priceHandOne
              : findPriceFinance.priceEndHandTwo,
        },
      };
    } else {
      return {
        message_error: `ไม่พบข้อมูล กรุณาติดต่อแอดมิน`,
      };
    }
  }

  async update(
    id: number,
    updatePercentDownFinanceDto: UpdatePercentDownFinanceDto,
  ): Promise<any> {
    await this.percentDownFinanceRepository.update(
      id,
      updatePercentDownFinanceDto,
    );

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }
}
