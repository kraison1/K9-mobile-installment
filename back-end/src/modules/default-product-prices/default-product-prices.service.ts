import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDefaultProductPriceDto } from './dto/create-default-product-price.dto';
import { UpdateDefaultProductPriceDto } from './dto/update-default-product-price.dto';
import { DefaultProductPrice } from './entities/default-product-price.entity';
import { DefaultProductPriceSearchDto } from 'src/helper/search.dto';
import { MESSAGE_SAVE_SUCCESS, MESSAGE_UPDATE_SUCCESS } from 'src/helper/constanc';

@Injectable()
export class DefaultProductPricesService {
  constructor(
    @InjectRepository(DefaultProductPrice)
    private readonly defaultProductPriceRepository: Repository<DefaultProductPrice>,
  ) {}

  async create(
    createDefaultProductPriceDto: CreateDefaultProductPriceDto,
  ): Promise<any> {
    const newDefaultProductPrice = this.defaultProductPriceRepository.create(
      createDefaultProductPriceDto,
    );
    await this.defaultProductPriceRepository.save(newDefaultProductPrice);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(search: DefaultProductPriceSearchDto): Promise<{
    data: DefaultProductPrice[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder = this.defaultProductPriceRepository.createQueryBuilder(
      'default_product_price',
    );

    if (search.search) {
      queryBuilder.andWhere(
        '(default_product_price.label ILIKE :search OR default_product_price.value ILIKE :search)',
        { search: `%${search.search}%` },
      );
    }

    if (search.active !== '2') {
      queryBuilder.andWhere('default_product_price.active = :active', {
        active: search.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('default_product_price.value', 'ASC')
      .skip((search.page - 1) * search.pageSize)
      .take(search.pageSize);

    const defaultProductPrices = await queryBuilder.getMany();

    return {
      data: defaultProductPrices,
      total,
      page: search.page,
      pageSize: search.pageSize,
    };
  }

  async getSelect(): Promise<
    Pick<DefaultProductPrice, 'id' | 'label' | 'value'>[]
  > {
    return this.defaultProductPriceRepository.find({
      where: { active: '1' },
      select: ['id', 'label', 'value'],
      order: { value: 'ASC' },
    });
  }

  async findOne(id: number): Promise<DefaultProductPrice | null> {
    return this.defaultProductPriceRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateDefaultProductPriceDto: UpdateDefaultProductPriceDto,
  ): Promise<any> {
    await this.defaultProductPriceRepository.update(
      id,
      updateDefaultProductPriceDto,
    );

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }
}
