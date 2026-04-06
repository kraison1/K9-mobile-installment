import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';
import { ProductUnit } from './entities/product-unit.entity';
import { ProductUnitSearchDto } from 'src/helper/search.dto';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';

@Injectable()
export class ProductUnitsService {
  constructor(
    @InjectRepository(ProductUnit)
    private readonly productUnitRepository: Repository<ProductUnit>,
  ) {}

  async create(createProductUnitDto: CreateProductUnitDto): Promise<any> {
    const newProductUnit =
      this.productUnitRepository.create(createProductUnitDto);
    await this.productUnitRepository.save(newProductUnit);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(searchProductUnitDto: ProductUnitSearchDto): Promise<{
    data: ProductUnit[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.productUnitRepository.createQueryBuilder('product_unit');

    if (searchProductUnitDto.search) {
      queryBuilder.where('product_unit.name ILIKE :search', {
        search: `%${searchProductUnitDto.search}%`,
      });
    }

    if (searchProductUnitDto.active !== '2') {
      queryBuilder.andWhere('product_unit.active = :active', {
        active: searchProductUnitDto.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('product_unit.name', 'ASC')
      .skip((searchProductUnitDto.page - 1) * searchProductUnitDto.pageSize)
      .take(searchProductUnitDto.pageSize);

    const productUnits = await queryBuilder.getMany();

    return {
      data: productUnits,
      total,
      page: searchProductUnitDto.page,
      pageSize: searchProductUnitDto.pageSize,
    };
  }

  async getSelect(): Promise<Pick<ProductUnit, 'id' | 'name'>[]> {
    return this.productUnitRepository.find({
      where: { active: '1' },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ProductUnit | null> {
    return this.productUnitRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateProductUnitDto: UpdateProductUnitDto,
  ): Promise<any> {
    await this.productUnitRepository.update(id, updateProductUnitDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }
}
