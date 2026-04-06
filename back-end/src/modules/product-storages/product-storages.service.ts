import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductStorageDto } from './dto/create-product-storage.dto';
import { UpdateProductStorageDto } from './dto/update-product-storage.dto';
import { ProductStorage } from './entities/product-storage.entity';
import { ProductStorageSearchDto } from 'src/helper/search.dto';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';

@Injectable()
export class ProductStoragesService {
  constructor(
    @InjectRepository(ProductStorage)
    private readonly productStorageRepository: Repository<ProductStorage>,
  ) {}

  async create(createProductStorageDto: CreateProductStorageDto): Promise<any> {
    const newProductStorage = this.productStorageRepository.create(
      createProductStorageDto,
    );
    await this.productStorageRepository.save(newProductStorage);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(searchProductStorageDto: ProductStorageSearchDto): Promise<{
    data: any[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.productStorageRepository.createQueryBuilder('product_storage');

    queryBuilder.select(['product_storage.*']);

    if (searchProductStorageDto.search) {
      queryBuilder.where('LOWER(product_storage.name) ILIKE LOWER(:search)', {
        search: `%${searchProductStorageDto.search}%`,
      });
    }

    if (searchProductStorageDto.active !== '2') {
      queryBuilder.andWhere('product_storage.active = :active', {
        active: searchProductStorageDto.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('product_storage.id', 'ASC')
      .skip(
        (searchProductStorageDto.page - 1) * searchProductStorageDto.pageSize,
      )
      .take(searchProductStorageDto.pageSize);

    const productStorages = await queryBuilder.getRawMany();

    return {
      data: productStorages,
      total,
      page: searchProductStorageDto.page,
      pageSize: searchProductStorageDto.pageSize,
    };
  }

  async getSelect(): Promise<Pick<ProductStorage, 'id' | 'name'>[]> {
    return (
      await this.productStorageRepository.find({
        where: { active: '1' },
        select: ['id', 'name'],
        order: { name: 'ASC' },
      })
    ).sort((a, b) => {
      const [sizeA, unitA] = a.name.split(' ');
      const [sizeB, unitB] = b.name.split(' ');
      return (
        (unitA === 'TB' ? parseFloat(sizeA) * 1024 : parseFloat(sizeA)) -
        (unitB === 'TB' ? parseFloat(sizeB) * 1024 : parseFloat(sizeB))
      );
    });
  }

  async findOne(id: number): Promise<ProductStorage | null> {
    return this.productStorageRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateProductStorageDto: UpdateProductStorageDto,
  ): Promise<any> {
    await this.productStorageRepository.update(id, updateProductStorageDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }
}
