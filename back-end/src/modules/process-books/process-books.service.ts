import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ProcessBookSearchDto } from 'src/helper/search.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, MoreThan, Not, Repository } from 'typeorm';
import { ProcessBook } from './entities/process-book.entity';
import { ProductBook } from '../product-book/entities/product-book.entity';
import { isEmpty, isNumber } from 'lodash';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { Product } from '../product/entities/product.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { CreateProductLogDto } from '../product-log/dto/create-product-log.dto';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { ProcessBookImage } from '../process-book-images/entities/process-book-image.entity';
import { TelegramNotificationService } from '../telegram-notification/telegram-notification.service';
import { Branch } from '../branchs/entities/branch.entity';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { generateRandomString } from 'src/helper/generateRandomString';

@Injectable()
export class ProcessBooksService {
  private readonly uploadsPath = path.join('uploads/process-books');

  constructor(
    @InjectRepository(ProcessBook)
    private readonly processBookRepository: Repository<ProcessBook>,

    @InjectRepository(ProductBook)
    private readonly productBookRepository: Repository<ProductBook>,

    @InjectRepository(ProcessBookImage)
    private readonly processBookImageRepository: Repository<ProcessBookImage>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    private readonly productLogService: ProductLogService,

    private readonly telegramNotificationService: TelegramNotificationService,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;
    const { id, bookType, bookStatus } = req.body as any;
    const values = {
      productBookId: id.value,
      createByUserId: user.id,
      branchId: user.branchId,
      status: '1',
      sumPrice: 0,
      bookStatus: bookStatus?.value || '',
      bookType: bookType?.value || 1,
    };

    const processBook = await this.processBookRepository.findOne({
      where: { productBookId: values.productBookId, status: '1' },
    });

    const fetchProductBook = await this.productBookRepository.findOne({
      where: {
        id: values.productBookId,
        branchId: values.branchId,
      },
    });

    if (!isEmpty(processBook)) {
      return {
        message_error: `เลขสัญญา ${fetchProductBook.code} กำลังรอดำนเนิการ`,
      };
    }

    if (isEmpty(fetchProductBook)) {
      return { message_error: 'ไม่พบหมายเลขสัญญานี้' };
    } else if (fetchProductBook.status != '1') {
      return {
        message_error: `เลขสัญญา ${fetchProductBook.code} ถูกดำเนินการไปแล้ว`,
      };
    }

    const { ...res } = fetchProductBook;
    values.sumPrice = Number(res.priceCash) + Number(res.priceTransferCash);

    const createProcessBook = this.processBookRepository.create(values);

    const branch = await this.branchRepository.findOneBy({
      id: values.branchId,
    });

    const message = `มีในมัดจำ: ${fetchProductBook.code}
    โดย: ${user.name}`;
    await this.telegramNotificationService.sendTelegramNotify({
      botToken: branch.token_bot,
      chatId: branch.room_id_processBook,
      message: message,
    });

    await this.processBookRepository.save(createProcessBook);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(searchProcessBookSearchDto: ProcessBookSearchDto): Promise<{
    data: ProcessBook[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.processBookRepository.createQueryBuilder('process_book');

    queryBuilder
      .select([
        'process_book.id',
        'process_book.sumPrice',
        'process_book.createByUserId',
        'process_book.productBookId',
        'process_book.create_date',
        'process_book.bookType',
        'process_book.bookStatus',
        'process_book.status',
        'productBook.id',
        'productBook.code',
        'productBook.productId',
        'productBook.customerId',
        'productBook.payType',
        'productBook.bankId',
        'product.id',
        'product.code',
        'product.imei',
        'product.refOldStockNumber',
        'product_model.id',
        'product_model.name',
        'product_color.id',
        'product_color.name',
        'product_storage.id',
        'product_storage.name',
        'customer.id',
        'customer.name',
        'customer.lastname',
        'customer.tel',
        'user.id',
        'user.name',
      ])
      .leftJoin('process_book.productBook', 'productBook')
      .leftJoin('productBook.product', 'product')
      .leftJoin('product.productModel', 'product_model')
      .leftJoin('product.productColor', 'product_color')
      .leftJoin('product.productStorage', 'product_storage')
      .leftJoin('productBook.customer', 'customer')
      .leftJoin('process_book.create_by', 'user');

    if (searchProcessBookSearchDto.searchType == '1') {
      queryBuilder.andWhere(
        'process_book.create_date BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(searchProcessBookSearchDto.startDate),
          endDate: new Date(searchProcessBookSearchDto.endDate),
        },
      );
    }

    if (searchProcessBookSearchDto.status !== '0') {
      queryBuilder.andWhere('process_book.status = :status', {
        status: searchProcessBookSearchDto.status,
      });
    }

    if (searchProcessBookSearchDto.branchId !== 0) {
      queryBuilder.andWhere('process_book.branchId = :branchId', {
        branchId: searchProcessBookSearchDto.branchId,
      });
    }

    if (searchProcessBookSearchDto.search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('productBook.code ILIKE :search', {
            search: `%${searchProcessBookSearchDto.search}%`,
          })
            .orWhere('customer.name ILIKE :search', {
              search: `%${searchProcessBookSearchDto.search}%`,
            })
            .orWhere('customer.lastname ILIKE :search', {
              search: `%${searchProcessBookSearchDto.search}%`,
            })
            .orWhere('customer.tel ILIKE :search', {
              search: `%${searchProcessBookSearchDto.search}%`,
            })
            .orWhere('product.code ILIKE :search', {
              search: `%${searchProcessBookSearchDto.search}%`,
            })
            .orWhere('product.imei ILIKE :search', {
              search: `%${searchProcessBookSearchDto.search}%`,
            });
        }),
      );
    }

    queryBuilder.orderBy('process_book.create_date', 'DESC');

    const total = await queryBuilder.getCount();

    queryBuilder
      .skip(
        (searchProcessBookSearchDto.page - 1) *
          searchProcessBookSearchDto.pageSize,
      )
      .take(searchProcessBookSearchDto.pageSize);

    const processBook = await queryBuilder.getMany();

    return {
      data: processBook,
      total,
      page: searchProcessBookSearchDto.page,
      pageSize: searchProcessBookSearchDto.pageSize,
    };
  }

  async findOne(id: number): Promise<ProcessBook | null> {
    return this.processBookRepository.findOne({
      where: { id },
      relations: ['processBookImages'],
    });
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    await fs.ensureDir(this.uploadsPath);
    const files = await req.saveRequestFiles();
    const { sumPrice, priceReturnCustomer, status, payType, note } =
      req.body as any;
    const updateProcessDto = {
      sumPrice: sumPrice?.value ?? 0,
      priceReturnCustomer: priceReturnCustomer?.value ?? 0,
      status: status?.value ?? '',
      payType: payType?.value ?? '',
      note: note?.value ?? '',
    };
    const getProcessBook = await this.processBookRepository.findOne({
      where: { id },
      relations: ['productBook'],
    });
    const { productBook, ...processBook } = getProcessBook;

    await fs.ensureDir(`${this.uploadsPath}/${productBook.code}`);
    for (let index = 0; index < files.length; index++) {
      const seq = index;
      const file = files[index];
      const buffer = await fs.readFile(file.filepath);
      const randomName = generateRandomString(6);
      const filename = `${randomName}-${seq}.png`;
      const filePath = path.join(
        `${this.uploadsPath}/${productBook.code}`,
        filename,
      );
      await sharp(buffer).png({ quality: 80, progressive: true  }).toFile(filePath);
      const newProductImage = this.processBookImageRepository.create({
        name: filePath,
        processBookId: id,
        userId: user.id,
        seq: seq,
      });
      await this.processBookImageRepository.save(newProductImage);
    }
    if (processBook.status == '2' || processBook.status == '3') {
      return { message_error: 'การดำเนินการไม่ถูกต้อง' };
    }

    if (updateProcessDto.status == '2') {
      processBook.status = updateProcessDto.status;
      processBook.priceReturnCustomer = updateProcessDto.priceReturnCustomer;
      processBook.payType = updateProcessDto.payType;
      processBook.note = updateProcessDto.note;

      // บันทึกการเปลี่ยนแปลง (ถ้าต้องการ)
      const productBook = await this.productBookRepository.findOne({
        where: {
          id: processBook.productBookId,
        },
      });

      productBook.status = getProcessBook.bookType;

      await this.productBookRepository.save(productBook);

      if (isNumber(productBook.productId)) {
        const product = await this.productRepository.findOne({
          where: { id: productBook.productId },
        });

        if (product) {
          const savedProduct = { ...product };
          savedProduct.active = '1';
          savedProduct.amount = 1;
          // สร้าง product log
          const productLogDto: CreateProductLogDto = {
            productId: productBook.productId,
            action:
              processBook.bookType == '1'
                ? `ยึดมัดจำ: ${productBook.code}`
                : `คืนมัดจำ: ${productBook.code}`,
            obj: JSON.stringify({
              before: product,
              after: savedProduct,
            }),
            branchId: productBook.branchId,
            userId: processBook.createByUserId,
          };
          await this.productLogService.create(productLogDto);
          // อัปเดต productRepository
          await this.productRepository.update(
            { id: savedProduct.id },
            {
              active: savedProduct.active,
              amount: savedProduct.amount,
            },
          );
        }
      }

      const branch = await this.branchRepository.findOneBy({
        id: processBook.branchId,
      });

      const message = `ยืนยันการดำเนินการมัดจำ: ${productBook.code}
      โดย: ${user.name}`;
      await this.telegramNotificationService.sendTelegramNotify({
        botToken: branch.token_bot,
        chatId: branch.room_id_processBook,
        message: message,
      });

      await this.processBookRepository.save(processBook);

      return {
        message_success: `${MESSAGE_UPDATE_SUCCESS}`,
      };
    }
  }
}
