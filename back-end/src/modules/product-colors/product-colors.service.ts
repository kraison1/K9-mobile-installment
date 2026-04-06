import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductColorDto } from './dto/create-product-color.dto';
import { UpdateProductColorDto } from './dto/update-product-color.dto';
import { ProductColor } from './entities/product-color.entity';
import { ProductColorSearchDto } from 'src/helper/search.dto';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';

@Injectable()
export class ProductColorsService {
  constructor(
    @InjectRepository(ProductColor)
    private readonly productColorRepository: Repository<ProductColor>,
  ) {}

  async create(createProductColorDto: CreateProductColorDto): Promise<any> {
    const newProductColor = this.productColorRepository.create(
      createProductColorDto,
    );
    await this.productColorRepository.save(newProductColor);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${newProductColor.name}`,
    };
  }

  async findAll(searchProductColorDto: ProductColorSearchDto): Promise<{
    data: ProductColor[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.productColorRepository.createQueryBuilder('product_color');

    if (searchProductColorDto.search) {
      queryBuilder.where('LOWER(product_color.name) ILIKE LOWER(:search)', {
        search: `%${searchProductColorDto.search}%`,
      });
    }

    if (searchProductColorDto.active !== '2') {
      queryBuilder.andWhere('product_color.active = :active', {
        active: searchProductColorDto.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('product_color.name', 'ASC')
      .skip((searchProductColorDto.page - 1) * searchProductColorDto.pageSize)
      .take(searchProductColorDto.pageSize);

    const productColors = await queryBuilder.getMany();

    return {
      data: productColors,
      total,
      page: searchProductColorDto.page,
      pageSize: searchProductColorDto.pageSize,
    };
  }

  async getSelect(): Promise<Pick<ProductColor, 'id' | 'name'>[]> {
    return this.productColorRepository.find({
      where: { active: '1' },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ProductColor | null> {
    return this.productColorRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateProductColorDto: UpdateProductColorDto,
  ): Promise<any> {
    await this.productColorRepository.update(id, updateProductColorDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${updateProductColorDto.name}`,
    };
  }
}
