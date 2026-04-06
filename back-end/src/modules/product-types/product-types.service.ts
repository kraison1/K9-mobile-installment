import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { ProductType } from './entities/product-type.entity';
import { ProductTypeSearchDto } from 'src/helper/search.dto';
import { ProductModel } from '../product-model/entities/product-model.entity';
import { Product } from '../product/entities/product.entity';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';

@Injectable()
export class ProductTypeService {
  constructor(
    @InjectRepository(ProductType)
    private readonly productTypeRepository: Repository<ProductType>,

    @InjectRepository(ProductModel)
    private readonly productModelRepository: Repository<ProductModel>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductTypeDto: CreateProductTypeDto): Promise<any> {
    const newProductType =
      this.productTypeRepository.create(createProductTypeDto);
    await this.productTypeRepository.save(newProductType);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(productTypeSearchDto: ProductTypeSearchDto): Promise<{
    data: any[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { search, active, page, pageSize } = productTypeSearchDto;
    const queryBuilder =
      this.productTypeRepository.createQueryBuilder('product_type');

    queryBuilder
      .select(['product_type'])
      .leftJoinAndSelect('product_type.productUnit', 'product_unit');

    // Handling search
    if (search) {
      queryBuilder.andWhere('LOWER(product_type.name) ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Filtering by 'active' if not '2'
    if (active !== '2') {
      queryBuilder.andWhere('product_type.active = :active', {
        active,
      });
    }

    // Pagination
    queryBuilder
      .orderBy('product_type.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async getSelect(
    catalog: string,
  ): Promise<Pick<ProductType, 'id' | 'name' | 'catalog'>[]> {
    return this.productTypeRepository.find({
      where: {
        active: '1',
        catalog,
      },
      select: ['id', 'name', 'catalog'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ProductType | null> {
    return this.productTypeRepository.findOne({ where: { id } });
  }

  async findByUnit(productUnitId: number): Promise<ProductType | null> {
    return this.productTypeRepository.findOne({
      where: { productUnitId: productUnitId },
    });
  }

  async update(
    id: number,
    updateProductTypeDto: UpdateProductTypeDto,
  ): Promise<any> {
    await this.productTypeRepository.update(id, updateProductTypeDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }
}
