import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThan, Brackets, Between } from 'typeorm';
import { ProductBookSearchDto } from 'src/helper/search.dto'; // Assuming you use a similar SearchDto
import { Branch } from '../branchs/entities/branch.entity';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { Product } from '../product/entities/product.entity';
import { toIntegerOrNull } from 'src/helper/transformValue';
import { ProductLogService } from '../product-log/product-log.service';
import { CreateProductLogDto } from '../product-log/dto/create-product-log.dto';
import * as _ from 'lodash';
import { ProductBook } from './entities/product-book.entity';
import { ProductBookImage } from 'src/modules/product-book-image/entities/product-book-image.entity';
import { MESSAGE_SAVE_SUCCESS } from 'src/helper/constanc';
import { generateRandomString } from 'src/helper/generateRandomString';

@Injectable()
export class ProductBookService {
  private readonly uploadsPath = path.join('uploads/product-books');

  constructor(
    @InjectRepository(ProductBook)
    private readonly productBookRepository: Repository<ProductBook>,

    @InjectRepository(ProductBookImage)
    private readonly productBookImageRepository: Repository<ProductBookImage>,

    private readonly productLogService: ProductLogService,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    await fs.ensureDir(this.uploadsPath);

    const files = await req.saveRequestFiles();

    const {
      priceTransferCash,
      priceCash,
      payType,
      bankId,
      customerId,
      productId,
      caseDate,
      note,
    } = req.body as any;

    const values = {
      customerId: toIntegerOrNull(customerId),
      createByUserId: user.id,
      branchId: user.branchId,
      productId: toIntegerOrNull(productId),
      payType: payType?.value ?? null,
      bankId: toIntegerOrNull(bankId?.value),
      caseDate: caseDate?.value ?? null,
      note: note?.value ?? null,
      priceTransferCash: Number(priceTransferCash?.value ?? 0),
      priceCash: Number(priceCash?.value ?? 0),
    };

    if (values.priceCash < 0) {
      return {
        message_error: `เงินสด ไม่ควรติดลบ `,
      };
    } else if (values.priceTransferCash < 0) {
      return {
        message_error: `เงินโอน ไม่ควรติดลบ `,
      };
    }

    if (_.isNumber(values.productId)) {
      const existingProduct = await this.productRepository.findOne({
        where: { id: values.productId },
      });

      const product = existingProduct;

      if (existingProduct.active != '1' || existingProduct.amount == 0) {
        return { message_error: `${existingProduct.code} ถูกขายไปแล้ว` };
      }

      existingProduct.active = '6';
      existingProduct.amount = 0;

      const productLogDto: CreateProductLogDto = {
        productId: existingProduct.id, // ใช้ id จาก product
        action: 'มัดจำ',
        obj: JSON.stringify({
          before: product,
          after: existingProduct,
        }),
        branchId: values.branchId,
        userId: values.createByUserId,
      };
      await this.productLogService.create(productLogDto);

      await this.productRepository.save(existingProduct);
    }

    const branch = await this.branchRepository.findOneOrFail({
      where: { id: values.branchId },
    });

    const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `${dateString}BO${branch.code}`;
    const lastSale = await this.productBookRepository.findOne({
      where: { code: Like(`${prefix}%`) },
      order: { code: 'DESC' },
    });

    const sequence = lastSale ? parseInt(lastSale.code.slice(-4)) + 1 : 1;
    const code = `${prefix}${sequence.toString().padStart(4, '0')}`;

    const savedProductBook = await this.productBookRepository.save({
      ...values,
      code: code,
      create_date: new Date(),
    });

    await this.productBookRepository.update(savedProductBook.id, values);

    if (files.length > 0) {
      await fs.ensureDir(`${this.uploadsPath}/${savedProductBook.code}`);

      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const buffer = await fs.readFile(file.filepath);
        const randomName = generateRandomString(6);
        const filename = `${randomName}-${index}.png`;
        const filePath = path.join(
          `${this.uploadsPath}/${savedProductBook.code}`,
          filename,
        );
        await sharp(buffer).png({ quality: 80, progressive: true  }).toFile(filePath);

        const newProductImage = this.productBookImageRepository.create({
          name: filePath,
          productBookId: savedProductBook.id,
          userId: savedProductBook.createByUserId,
        });

        await this.productBookImageRepository.save(newProductImage);
      }
    }

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${savedProductBook.code}`,
    };
  }

  async findAll(
    searchBookDto: ProductBookSearchDto,
    req?: FastifyRequest,
  ): Promise<{
    data: ProductBook[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const user = (req as any).user;

    const queryBuilder =
      this.productBookRepository.createQueryBuilder('product_book');

    queryBuilder
      .select([
        'product_book.id',
        'product_book.code',
        'product_book.priceTransferCash',
        'product_book.priceCash',

        'product_book.customerId',
        'product_book.caseDate',
        'product_book.create_date',
        'product_book.branchId',

        'product.id',
        'product.code',
        'product.imei',
        'product.refOldStockNumber',

        'product.productModelId',
        'product_model.id',
        'product_model.name',

        'product.productColorId',
        'product_color.id',
        'product_color.name',

        'product.productStorageId',
        'product_storage.id',
        'product_storage.name',

        'customer.id',
        'customer.name',
        'customer.lastname',
        'customer.tel',
        'user.id',
        'user.name',
      ])
      .leftJoin('product_book.product', 'product')
      .leftJoin('product.productModel', 'product_model')
      .leftJoin('product.productColor', 'product_color')
      .leftJoin('product.productStorage', 'product_storage')
      .leftJoin('product_book.customer', 'customer')
      .leftJoin('product_book.create_by', 'user');

    if (searchBookDto.branchId != 0) {
      queryBuilder.where('product_book.branchId = :branchId', {
        branchId: searchBookDto.branchId,
      });
    }

    if (searchBookDto.status != '0') {
      queryBuilder.andWhere('product_book.status = :status', {
        status: searchBookDto.status,
      });
    }

    if (searchBookDto.searchType == '1') {
      queryBuilder.andWhere(
        'product_book.create_date BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(searchBookDto.startDate),
          endDate: new Date(searchBookDto.endDate),
        },
      );
    }

    if (user.type == 'admin-external') {
      queryBuilder.andWhere('customer.createByUserId = :userId', {
        userId: user.id,
      });
    }

    if (searchBookDto.search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('product_book.code ILIKE :search', {
            search: `%${searchBookDto.search}%`,
          })
            .orWhere('customer.name ILIKE :search', {
              search: `%${searchBookDto.search}%`,
            })
            .orWhere('customer.lastname ILIKE :search', {
              search: `%${searchBookDto.search}%`,
            })
            .orWhere('customer.tel ILIKE :search', {
              search: `%${searchBookDto.search}%`,
            })
            .orWhere('product.code ILIKE :search', {
              search: `%${searchBookDto.search}%`,
            })
            .orWhere('product.imei ILIKE :search', {
              search: `%${searchBookDto.search}%`,
            });
        }),
      );
    }

    // Pagination
    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('product_book.caseDate', 'ASC')
      .skip((searchBookDto.page - 1) * searchBookDto.pageSize)
      .take(searchBookDto.pageSize);

    const products = await queryBuilder.getMany();

    return {
      data: products,
      total,
      page: searchBookDto.page,
      pageSize: searchBookDto.pageSize,
    };
  }

  async findOne(id: number): Promise<ProductBook | null> {
    return this.productBookRepository.findOne({
      where: { id },
      relations: ['productBookImages'],
    });
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    // const { isCancel } = req.body as any;
    // const values = {
    //   isCancel: isCancel.value,
    // };
    // const productBook = await this.productBookRepository.findOne({
    //   where: { id },
    // });
    // if (productBook.isMobileSale == '1') {
    //   if (productBook.isCancel == '1') {
    //     return {
    //       message_error: `มีการยกเลิกหมายเลขสัญญา ${productBook.code} ก่อนหน้าแล้ว`,
    //     };
    //   }
    //   if (values.isCancel == '1') {
    //     const product = await this.productRepository.findOne({
    //       where: { id: productBook.productId },
    //     });
    //     const updateProductDto: Product = {
    //       ...product,
    //       active: '1',
    //       amount: 1,
    //       note: `ยกเลิกสัญญา: ${productBook.code}`,
    //     };
    //     const productLogDto: CreateProductLogDto = {
    //       productId: product.id, // ใช้ id จาก product
    //       action: 'ยกเลิกสัญญา',
    //       obj: JSON.stringify({
    //         before: product,
    //         after: updateProductDto,
    //       }),
    //       branchId: product.branchId,
    //       userId: product.createByUserId, // ใช้ createByUserId แทน branchId
    //     };
    //     await this.productLogService.create(productLogDto);
    //     await this.productRepository.update(
    //       productBook.productId,
    //       updateProductDto,
    //     );
    //   }
    //   await this.productBookRepository.update(id, {
    //     ...productBook,
    //     isCancel: values.isCancel,
    //   });
    // }
  }
}
