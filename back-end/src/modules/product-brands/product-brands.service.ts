import { values } from 'lodash';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductBrandDto } from './dto/create-product-brand.dto';
import { UpdateProductBrandDto } from './dto/update-product-brand.dto';
import { ProductBrand } from './entities/product-brand.entity';
import { ProductBrandSearchDto } from 'src/helper/search.dto';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { ProductModel } from '../product-model/entities/product-model.entity';
@Injectable()
export class ProductBrandsService {
  private readonly uploadsPath = path.join('uploads/brands');

  constructor(
    @InjectRepository(ProductBrand)
    private readonly productBrandRepository: Repository<ProductBrand>,

    @InjectRepository(ProductModel)
    private readonly productModelRepository: Repository<ProductModel>,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    await fs.ensureDir(this.uploadsPath);
    const files = await req.saveRequestFiles();

    const body = req.body as any;
    const { code, name, showStock, active, fileProductBrand } = body;
    const catalog = body['catalog[]'];

    let filePath = '';
    let fileProductBrandPath = fileProductBrand?.value ?? '';

    if (files.length > 0) {
      const file = files[0];
      const buffer = await fs.readFile(file.filepath);
      const filename = `${code.value}.png`;
      filePath = path.join(this.uploadsPath, filename);
      fileProductBrandPath = filePath;
      await sharp(buffer)
        .png({ quality: 80, progressive: true })
        .toFile(filePath);
    }

    let catalogValues: string[] = [];
    if (catalog) {
      if (Array.isArray(catalog)) {
        catalogValues = catalog.map((c: any) => c.value);
      } else {
        catalogValues = [catalog.value];
      }
    }

    const createDto: Partial<ProductBrand> = {
      code: code.value,
      name: name.value,
      catalog: catalogValues,
      active: active.value,
      showStock: showStock.value,
      fileProductBrand: fileProductBrandPath,
    };

    const createNew = this.productBrandRepository.create(createDto);
    await this.productBrandRepository.save(createNew);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${createNew.name}`,
    };
  }

  async findAll(searchProductBrandDto: ProductBrandSearchDto): Promise<{
    data: ProductBrand[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.productBrandRepository.createQueryBuilder('product_brand');

    if (searchProductBrandDto.search) {
      queryBuilder.where('LOWER(product_brand.name) ILIKE LOWER(:search)', {
        search: `%${searchProductBrandDto.search}%`,
      });
    }

    if (searchProductBrandDto.active !== '2') {
      queryBuilder.andWhere('product_brand.active = :active', {
        active: searchProductBrandDto.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('product_brand.name', 'ASC')
      .skip((searchProductBrandDto.page - 1) * searchProductBrandDto.pageSize)
      .take(searchProductBrandDto.pageSize);

    const productBrands = await queryBuilder.getMany();

    return {
      data: productBrands,
      total,
      page: searchProductBrandDto.page,
      pageSize: searchProductBrandDto.pageSize,
    };
  }

  async getSelect(): Promise<
    Pick<ProductBrand, 'id' | 'name' | 'code' | 'fileProductBrand'>[]
  > {
    return this.productBrandRepository.find({
      where: { active: '1' },
      select: ['id', 'name', 'code', 'fileProductBrand'],
      order: { name: 'ASC' },
    });
  }

  async getSelectByCatalog(catalogs: string[]): Promise<any> {
    const rows = await this.productBrandRepository
      .createQueryBuilder('productBrand')
      .select([
        'productBrand.id AS id',
        'productBrand.name AS brandName',
        'productBrand.fileProductBrand AS fileProductBrand',
        'productBrand.showStock AS showStock',
      ])
      .where('productBrand.catalog && :catalogs', { catalogs })
      .andWhere('productBrand.active = :active', { active: '1' })
      .andWhere('productBrand.showStock = :showStock', { showStock: '1' })
      .groupBy('productBrand.id')
      .addGroupBy('productBrand.name')
      .addGroupBy('productBrand.fileProductBrand')
      .orderBy('productBrand.name', 'ASC')
      .getRawMany();

    return rows;
  }

  async findOne(id: number): Promise<ProductBrand | null> {
    return this.productBrandRepository.findOne({ where: { id } });
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    await fs.ensureDir(this.uploadsPath);
    const files = await req.saveRequestFiles();

    const existingBrand = await this.productBrandRepository.findOne({
      where: { id },
    });

    const body = req.body as any;
    const { code, name, showStock, active, fileProductBrand } = body;
    const catalog = body['catalog[]'];

    let filePath = existingBrand.fileProductBrand;
    let fileProductBrandPath =
      fileProductBrand?.value ?? existingBrand.fileProductBrand;

    // Handle file upload if a file is sent
    if (files.length > 0) {
      const file = files[0];
      const buffer = await fs.readFile(file.filepath);
      const filename = `${code.value}.png`;
      filePath = path.join(this.uploadsPath, filename);
      fileProductBrandPath = filePath;

      await sharp(buffer)
        .png({ quality: 80, progressive: true })
        .toFile(filePath);
    }

    let catalogValues: string[] = [];
    if (catalog) {
      if (Array.isArray(catalog)) {
        catalogValues = catalog.map((c: any) => c.value);
      } else {
        catalogValues = [catalog.value];
      }
    }

    const updateDto: Partial<ProductBrand> = {
      code: code.value,
      name: name.value,
      catalog: catalogValues,
      showStock: showStock.value,
      active: active.value,
      fileProductBrand: fileProductBrandPath,
    };

    await this.productBrandRepository.update(id, updateDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${code.value}`,
    };
  }
}
