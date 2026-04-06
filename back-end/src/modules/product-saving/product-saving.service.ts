import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Brackets } from 'typeorm';
import { ProductSavingSearchDto } from 'src/helper/search.dto'; // Assuming you use a similar SearchDto
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
import { MESSAGE_SAVE_SUCCESS } from 'src/helper/constanc';
import { ProductSavingImage } from '../product-saving-images/entities/product-saving-image.entity';
import { ProductSaving } from '../product-saving/entities/product-saving.entity';
import { generateRandomString } from 'src/helper/generateRandomString';
import { ProductBook } from '../product-book/entities/product-book.entity';
import { ProcessBook } from '../process-books/entities/process-book.entity';

@Injectable()
export class ProductSavingService {
  private readonly uploadsPath = path.join('uploads/product-savings');

  constructor(
    @InjectRepository(ProductSaving)
    private readonly productSavingRepository: Repository<ProductSaving>,

    @InjectRepository(ProductSavingImage)
    private readonly productSavingImageRepository: Repository<ProductSavingImage>,

    @InjectRepository(ProductBook)
    private readonly productBookRepository: Repository<ProductBook>,

    @InjectRepository(ProcessBook)
    private readonly processBookRepository: Repository<ProcessBook>,

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
      productBookId,
      note,
    } = req.body as any;

    const values = {
      customerId: toIntegerOrNull(customerId),
      createByUserId: user.id,
      branchId: user.branchId,
      productId: toIntegerOrNull(productId),
      productBookId: toIntegerOrNull(productBookId),
      payType: payType?.value ?? null,
      bankId: toIntegerOrNull(bankId?.value),
      note: note?.value ?? null,
      priceTransferCash: Number(priceTransferCash?.value ?? 0),
      priceCash: Number(priceCash?.value ?? 0),
      priceSumPay: 0,
    };

    if (_.isNumber(values.productBookId)) {
      const exactProductBook = await this.productBookRepository.findOneBy({
        id: values.productBookId,
      });

      if (exactProductBook.status != '1') {
        return {
          message_error: `มัดจำ ${exactProductBook.code} ถูกดำเนินการไปแล้ว`,
        };
      } else {
        exactProductBook.status = '5';
        await this.productBookRepository.update(
          {
            id: exactProductBook.id,
          },
          exactProductBook,
        );

        const exactProcessProductBook =
          await this.processBookRepository.findOneBy({
            productBookId: values.productBookId,
            status: '1',
          });

        if (exactProcessProductBook) {
          exactProcessProductBook.status = '2';

          await this.processBookRepository.update(
            {
              id: exactProcessProductBook.id,
            },
            exactProcessProductBook,
          );
        } else {
          return {
            message_error: `มัดจำ ${exactProductBook.code} ถูกดำเนินการไปแล้ว`,
          };
        }
      }
    }

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

      if (!_.isNumber(values.productBookId)) {
        if (existingProduct.active != '1' || existingProduct.amount == 0) {
          return { message_error: `${existingProduct.code} ถูกขายไปแล้ว` };
        }
      }

      existingProduct.active = '7';
      existingProduct.amount = 0;

      const productLogDto: CreateProductLogDto = {
        productId: existingProduct.id, // ใช้ id จาก product
        action: 'ออม',
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
    const prefix = `${dateString}SAO${branch.code}`;
    const lastSale = await this.productSavingRepository.findOne({
      where: { code: Like(`${prefix}%`) },
      order: { code: 'DESC' },
    });

    const sequence = lastSale ? parseInt(lastSale.code.slice(-4)) + 1 : 1;
    const code = `${prefix}${sequence.toString().padStart(4, '0')}`;

    const savedProductSaving = await this.productSavingRepository.save({
      ...values,
      code: code,
      create_date: new Date(),
    });

    await this.productSavingRepository.update(savedProductSaving.id, values);

    if (files.length > 0) {
      await fs.ensureDir(`${this.uploadsPath}/${savedProductSaving.code}`);

      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const buffer = await fs.readFile(file.filepath);
        const randomName = generateRandomString(6);
        const filename = `${randomName}-${index}.png`;
        const filePath = path.join(
          `${this.uploadsPath}/${savedProductSaving.code}`,
          filename,
        );
        await sharp(buffer)
          .png({ quality: 80, progressive: true })
          .toFile(filePath);

        const newProductImage = this.productSavingImageRepository.create({
          name: filePath,
          productSavingId: savedProductSaving.id,
          userId: savedProductSaving.createByUserId,
        });

        await this.productSavingImageRepository.save(newProductImage);
      }
    }

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${savedProductSaving.code}`,
    };
  }

  async findAll(searchSavingDto: ProductSavingSearchDto): Promise<{
    data: ProductSaving[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.productSavingRepository.createQueryBuilder('product_saving');

    queryBuilder
      .select([
        'product_saving.id',
        'product_saving.code',
        'product_saving.priceTransferCash',
        'product_saving.priceCash',
        'product_saving.priceSumPay',

        'product_saving.customerId',
        'product_saving.create_date',
        'product_saving.branchId',

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
      .leftJoin('product_saving.product', 'product')
      .leftJoin('product.productModel', 'product_model')
      .leftJoin('product.productColor', 'product_color')
      .leftJoin('product.productStorage', 'product_storage')
      .leftJoin('product_saving.customer', 'customer')
      .leftJoin('product_saving.create_by', 'user');

    if (searchSavingDto.branchId != 0) {
      queryBuilder.where('product_saving.branchId = :branchId', {
        branchId: searchSavingDto.branchId,
      });
    }

    if (searchSavingDto.status != '0') {
      queryBuilder.andWhere('product_saving.status = :status', {
        status: searchSavingDto.status,
      });
    }

    if (searchSavingDto.searchType == '1') {
      queryBuilder.andWhere(
        'product_saving.create_date BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(searchSavingDto.startDate),
          endDate: new Date(searchSavingDto.endDate),
        },
      );
    }

    if (searchSavingDto.search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('product_saving.code ILIKE :search', {
            search: `%${searchSavingDto.search}%`,
          })
            .orWhere('customer.name ILIKE :search', {
              search: `%${searchSavingDto.search}%`,
            })
            .orWhere('customer.lastname ILIKE :search', {
              search: `%${searchSavingDto.search}%`,
            })
            .orWhere('customer.tel ILIKE :search', {
              search: `%${searchSavingDto.search}%`,
            })
            .orWhere('product.code ILIKE :search', {
              search: `%${searchSavingDto.search}%`,
            })
            .orWhere('product.imei ILIKE :search', {
              search: `%${searchSavingDto.search}%`,
            });
        }),
      );
    }

    // Pagination
    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('product_saving.create_date', 'DESC')
      .skip((searchSavingDto.page - 1) * searchSavingDto.pageSize)
      .take(searchSavingDto.pageSize);

    const products = await queryBuilder.getMany();

    return {
      data: products,
      total,
      page: searchSavingDto.page,
      pageSize: searchSavingDto.pageSize,
    };
  }

  async findSaving(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    const { pageSize, page } = req.body as any;

    const queryBuilder =
      this.productSavingRepository.createQueryBuilder('product_saving');

    queryBuilder
      .select([
        'product_saving.id',
        'product_saving.code',
        'product_saving.priceTransferCash',
        'product_saving.priceCash',
        'product_saving.priceSumPay',

        'product_saving.customerId',
        'product_saving.create_date',
        'product_saving.branchId',

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
      .leftJoin('product_saving.product', 'product')
      .leftJoin('product.productModel', 'product_model')
      .leftJoin('product.productColor', 'product_color')
      .leftJoin('product.productStorage', 'product_storage')
      .leftJoin('product_saving.customer', 'customer')
      .leftJoin('product_saving.create_by', 'user');

    queryBuilder.where('product_saving.customerId = :customerId', {
      customerId: user.customerId,
    });

    queryBuilder.orderBy('product_saving.create_date', 'DESC');

    // Pagination
    const total = await queryBuilder.getCount();

    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const products = await queryBuilder.getMany();

    return {
      data: products,
      total,
      page: page,
      pageSize: pageSize,
    };
  }

  async findOne(id: number): Promise<ProductSaving | null> {
    return this.productSavingRepository.findOne({
      where: { id },
      relations: ['productSavingImages'],
    });
  }

  async getPaySaving(code: string, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;
    const fetchProductList = await this.productSavingRepository
      .createQueryBuilder('product_saving')
      .select([
        'product_saving.id',
        'product_saving.branchId',
        'product_saving.code',
        'product_saving.create_date',
        'product_saving.productId',
        'product_saving.customerId',
        'product_saving.priceTransferCash',
        'product_saving.priceCash',
        'product_saving.isCancel',
        'product_saving.status',
        'product_saving.priceSumPay',
        'productSavingPayMentImage.id',
        'productSavingPayMentImage.fileSavingPayMent',
        'productSavingPayMentImage.price',
        'productSavingPayMentImage.create_date',

        'customer.id',
        'customer.code',
        'customer.name',
        'customer.lastname',
        'customer.tel',
        'customer.facebook',
        'customer.nameRefOne',
        'customer.lastnameRefOne',
        'customer.telRefOne',
        'customer.relaRefOne',
        'customer.nameRefTwo',
        'customer.lastnameRefTwo',
        'customer.telRefTwo',
        'customer.relaRefTwo',
        'customer.fileCustomer',

        'product.id',
        'product.catalog',
        'product.imei',
        'product.refOldStockNumber',

        'product.batteryHealth',
        'product.productColorId',
        'productColor.id',
        'productColor.name',
        'product.productStorageId',
        'productStorage.id',
        'productStorage.name',
        'product.productModelId',
        'productModel.id',
        'productModel.name',
        'product.productBrandId',
        'productBrand.id',
        'productBrand.name',
      ])
      .leftJoin('product_saving.customer', 'customer')
      .leftJoin('product_saving.product', 'product')
      .leftJoin(
        'product_saving.productSavingPayMentImage',
        'productSavingPayMentImage',
      )

      .leftJoin('product.productColor', 'productColor')
      .leftJoin('product.productModel', 'productModel')
      .leftJoin('product.productStorage', 'productStorage')
      .leftJoin('product.productBrand', 'productBrand')
      .where('product_saving.code = :code', { code })
      .orderBy('productSavingPayMentImage.create_date', 'DESC')
      .getOne();

    const banks = await this.branchRepository.find({
      select: ['ownerBank', 'ownerBankName', 'ownerBankNo'],
      where: { id: user.branchId },
    });

    if (fetchProductList) {
      if (process.env.SYSTEM_BY == 'THUNDER') {
        return {
          ...fetchProductList,
          banks: banks,
        };
      } else {
        if (
          user.type != 'ผู้ดูแลระบบ' &&
          fetchProductList.branchId != user.branchId
        ) {
          return { message_error: `คุณไม่มีสิทธิดูสัญญานี้` };
        } else {
          return {
            ...fetchProductList,
            banks: banks,
          };
        }
      }
    } else {
      return { message_error: `ไม่พบหมายเลขสัญญา ${code} ในระบบ` };
    }
  }
}
