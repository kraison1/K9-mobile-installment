import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayOverlap, Repository } from 'typeorm';
import { CreateProductModelDto } from './dto/create-product-model.dto';
import { UpdateProductModelDto } from './dto/update-product-model.dto';
import { ProductModel } from './entities/product-model.entity';
import { ProductModelSearchDto } from 'src/helper/search.dto';
import { Product } from '../product/entities/product.entity';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';

@Injectable()
export class ProductModelService {
  constructor(
    @InjectRepository(ProductModel)
    private readonly productModelRepository: Repository<ProductModel>,
  ) {}

  private sanitizeCatalog(catalog?: string[]): string[] | undefined {
    if (!Array.isArray(catalog)) {
      return catalog;
    }
    // Ensure all items are strings, trim them, filter out empty ones, and remove duplicates.
    const sanitized = [
      ...new Set(
        catalog
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
      ),
    ];
    return sanitized;
  }

  async create(createProductModelDto: CreateProductModelDto): Promise<any> {
    const payload: CreateProductModelDto = {
      ...createProductModelDto,
      catalog: this.sanitizeCatalog(createProductModelDto.catalog),
    };
    const newProductModel = this.productModelRepository.create(payload);
    await this.productModelRepository.save(newProductModel);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${newProductModel.name}`,
    };
  }

  async findAll(searchProductModelDto: ProductModelSearchDto): Promise<{
    data: ProductModel[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.productModelRepository.createQueryBuilder('product_model');

    queryBuilder.select(['product_model']);

    if (searchProductModelDto.search) {
      queryBuilder.andWhere(
        `(
      LOWER(product_model.name) ILIKE LOWER(:search))`,
        {
          search: `%${searchProductModelDto.search}%`,
        },
      );
    }

    if (searchProductModelDto.active !== '2') {
      queryBuilder.andWhere('product_model.active = :active', {
        active: searchProductModelDto.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('product_model.name', 'ASC')
      .skip((searchProductModelDto.page - 1) * searchProductModelDto.pageSize)
      .take(searchProductModelDto.pageSize);

    const productModels = await queryBuilder.getMany();

    return {
      data: productModels,
      total,
      page: searchProductModelDto.page,
      pageSize: searchProductModelDto.pageSize,
    };
  }

  async getSelectByCatalog(
    catalogs: string[],
  ): Promise<Pick<ProductModel, 'id' | 'name'>[]> {
    return this.productModelRepository.find({
      where: {
        active: '1',
        catalog: ArrayOverlap(catalogs),
      },
      select: ['id', 'name'],
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<ProductModel | null> {
    return this.productModelRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateProductModelDto: UpdateProductModelDto,
  ): Promise<any> {
    const payloadToUpdate: UpdateProductModelDto = { ...updateProductModelDto };

    // Only sanitize if catalog is actually part of the update payload
    if (Object.prototype.hasOwnProperty.call(payloadToUpdate, 'catalog')) {
      payloadToUpdate.catalog = this.sanitizeCatalog(payloadToUpdate.catalog);
    }

    await this.productModelRepository.update(id, payloadToUpdate);
    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${updateProductModelDto.name}`,
    };
  }
}
