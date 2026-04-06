import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateProductBuyDto } from './dto/create-product-buy.dto';
import { ProductBuy } from './entities/product-buy.entity';
import { Branch } from '../branchs/entities/branch.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { CreateProductLogDto } from '../product-log/dto/create-product-log.dto';
import dayjs from 'src/configs/dayjs-config';
import { ProductBuySearchDto } from 'src/helper/search.dto';
import { ProductBuyLists } from '../product-buy-lists/entities/product-buy-list.entity';
import { Product } from '../product/entities/product.entity';
import PdfPrinter from 'pdfmake/src/printer';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { ProductPrice } from '../product-price/entities/product-price.entity';
import { toIntegerOrNull } from 'src/helper/transformValue';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { generateRandomString } from 'src/helper/generateRandomString';
import { TelegramNotificationService } from '../telegram-notification/telegram-notification.service';
import { formatNumberDigit, formatNumberDigit2 } from 'src/helper/formatNumber';
import {
  formatDateTH,
  formatDateNumberWithoutTime,
} from 'src/helper/formatDate';

@Injectable()
export class ProductBuyService {
  private readonly uploadsPath = path.join('uploads/product-buy');

  constructor(
    @InjectRepository(ProductBuy)
    private readonly productBuyRepository: Repository<ProductBuy>,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    @InjectRepository(ProductBuyLists)
    private readonly productBuyListsRepository: Repository<ProductBuyLists>,

    private readonly productLogService: ProductLogService,

    @InjectRepository(ProductPrice)
    private readonly productPriceRepository: Repository<ProductPrice>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly telegramNotificationService: TelegramNotificationService,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    await fs.ensureDir(this.uploadsPath);

    const files = await req.saveRequestFiles();

    const {
      venderId,
      branchId,
      catalog,
      createByUserId,
      priceSumAll,
      status,
      tackingNumber,
      transportId,
    } = req.body as any;

    const values = {
      venderId: venderId?.value ?? null,
      branchId: branchId?.value ?? null,
      catalog: catalog?.value ?? null,
      createByUserId: createByUserId?.value ?? null,
      priceSumAll: priceSumAll?.value ?? null,
      status: status?.value ?? null,
      tackingNumber: tackingNumber?.value ?? null,
      transportId: toIntegerOrNull(transportId?.value),
    };

    const productBuyLists = Object.keys(req.body).reduce((acc, key) => {
      const match = key.match(/^productBuyLists\[(\d+)\]\[(\w+)\]$/);
      if (match) {
        const [, index, field] = match;
        acc[index] = acc[index] || {};
        acc[index][field] = req.body[key].value;
      }
      return acc;
    }, []);

    const branch = await this.branchRepository.findOne({
      where: { id: values.branchId },
    });

    const dateCode = dayjs().format('YYYYMMDD');
    const prefix = `BS${branch.code}${dateCode}`;

    const latestProductBuy = await this.productBuyRepository
      .createQueryBuilder('productBuy')
      .where('productBuy.branchId = :branchId', {
        branchId: branch.id,
      })
      .andWhere('productBuy.code ILIKE :code', {
        code: `${prefix}%`,
      })
      .orderBy('productBuy.code', 'DESC')
      .getOne();

    const runNumber = latestProductBuy
      ? (parseInt(latestProductBuy.code.slice(-4), 10) + 1)
          .toString()
          .padStart(4, '0')
      : '0001';

    const productBuyListsCode = `${prefix}${runNumber}`;

    const newProductBuy = this.productBuyRepository.create({
      ...values,
      code: productBuyListsCode,
    });

    const savedProductBuy = await this.productBuyRepository.save(newProductBuy);

    // บันทึก ProductBuyLists
    const productBuyListEntities = productBuyLists.map((list) => {
      return this.productBuyListsRepository.create({
        productName: list.productName,
        productId: parseInt(list.productId, 10),
        amount: parseInt(list.amount, 10),
        priceSumCostBuy: parseFloat(list.priceSumCostBuy),
        priceCostBuy: parseFloat(list.priceCostBuy),
        productBuyId: savedProductBuy.id,
      });
    });
    await this.productBuyListsRepository.save(productBuyListEntities);

    // จัดการไฟล์
    if (files.length > 0) {
      await fs.ensureDir(`${this.uploadsPath}/${savedProductBuy.branchId}`);

      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const buffer = await fs.readFile(file.filepath);
        const randomName = generateRandomString(6);
        const filename = `${randomName}.png`;
        const filePath = path.join(
          `${this.uploadsPath}/${savedProductBuy.branchId}`,
          filename,
        );

        let imageType = '1';
        if (file.fieldname === 'uploadFileBuyCustomer') {
          imageType = '2';
        }

        await sharp(buffer)
          .png({ quality: 80, progressive: true })
          .toFile(filePath);

        if (imageType === '1') {
          savedProductBuy.fileProductBuy = filePath;
        } else if (imageType === '2') {
          savedProductBuy.fileProductBuyCustomer = filePath;
        }

        await this.productBuyRepository.save(savedProductBuy);
      }
    }

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${newProductBuy.code}`,
    };
  }

  async findAll(searchDto: ProductBuySearchDto): Promise<{
    data: ProductBuy[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.productBuyRepository.createQueryBuilder('productBuy');

    queryBuilder
      .select([
        'productBuy',
        'create_by.id',
        'create_by.name',
        'branch.id',
        'branch.name',
      ])
      .leftJoin('productBuy.branch', 'branch')
      .leftJoinAndSelect('productBuy.transport', 'transport')
      .leftJoin('productBuy.create_by', 'create_by');

    queryBuilder.where(
      'productBuy.create_date BETWEEN :startDate AND :endDate',
      {
        startDate: new Date(searchDto.startDate),
        endDate: new Date(searchDto.endDate),
      },
    );

    if (searchDto.search) {
      queryBuilder.andWhere(
        '(productBuy.code ILIKE :search OR productBuy.tackingNumber ILIKE :search)',
        { search: `%${searchDto.search}%` },
      );
    }

    if (searchDto.catalog != '0') {
      queryBuilder.andWhere('productBuy.catalog = :catalog', {
        catalog: searchDto.catalog,
      });
    }

    // ตรวจสอบ branchId
    if (searchDto.branchId) {
      queryBuilder.andWhere('productBuy.branchId = :branchId', {
        branchId: searchDto.branchId,
      });
    }

    queryBuilder.andWhere('productBuy.status = :status', {
      status: searchDto.status,
    });

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('productBuy.create_date', 'DESC')
      .skip((searchDto.page - 1) * searchDto.pageSize)
      .take(searchDto.pageSize);

    const productBuyListses = await queryBuilder.getMany();

    return {
      data: productBuyListses,
      total,
      page: searchDto.page,
      pageSize: searchDto.pageSize,
    };
  }

  async reportListBuy(params: {
    status: string;
    branchId: number;
    startDate: string;
    endDate: string;
    req: FastifyRequest;
  }): Promise<Buffer> {
    const statusType = {
      0: 'รอยืนยัน',
      1: 'ยืนยัน',
      2: 'ยกเลิก',
    };

    const { branchId, endDate, startDate, status, req } = params;

    const user = (req as any).user;

    const start = dayjs(startDate).format('YYYY-MM-DD');
    const end = dayjs(endDate).format('YYYY-MM-DD');

    // Database query
    const query = this.productBuyRepository
      .createQueryBuilder('product_buy')
      .select([
        'product_buy.id',
        'product_buy.status',
        'product_buy.priceSumAll',
        'product_buy.create_date',
        'branch.name',
        'branch.id',
      ])
      .leftJoin('product_buy.branch', 'branch')
      .where('product_buy.create_date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
      .andWhere('product_buy.status = :status', {
        status,
      });

    if (branchId != 0) {
      query.andWhere('product_buy.branchId = :branchId', {
        branchId,
      });
    }

    const product_buy = await query.getMany();

    const { priceSumAll } = product_buy.reduce(
      (totals, item) => {
        totals.priceSumAll += Number(item.priceSumAll) || 0;
        return totals;
      },
      { priceSumAll: 0 },
    );

    const query_product_buy_lists = this.productBuyListsRepository
      .createQueryBuilder('product_buy_lists')
      .select('product_buy_lists.productName', 'productName')
      .addSelect('product_buy_lists.productId', 'productId')
      .addSelect('SUM(product_buy_lists.amount)', 'amount')
      .addSelect('SUM(product_buy_lists.priceSumCostBuy)', 'priceSumCostBuy')
      .where('product_buy_lists.productBuyId IN (:...ids)', {
        ids: product_buy.map((item) => item.id),
      })
      .groupBy('product_buy_lists.productId')
      .addGroupBy('product_buy_lists.productName');

    const product_buy_lists = await query_product_buy_lists.getRawMany();

    // Define table header
    const tableHeader = [
      { text: 'ลำดับ', style: 'tableHeader' },
      { text: 'สินค้า', style: 'tableHeader' },
      { text: 'จำนวน', style: 'tableHeader' },
      { text: 'ราคารวม', style: 'tableHeader' },
    ];

    // Define table body with all 7 columns
    const tableBody = [
      tableHeader,
      ...product_buy_lists.map((item, k) => [
        { text: k + 1, alignment: 'right' },
        { text: item.productName || '-', alignment: 'left' },
        { text: item.amount || '-', alignment: 'right' },
        {
          text: formatNumberDigit2(item.priceSumCostBuy) || '-',
          alignment: 'right',
        },
      ]),
    ];

    // Fetch branch details
    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
    });

    // Define fonts
    const fonts = {
      Sarabun: {
        normal: path.join(
          __dirname,
          '../../../node_modules/addthaifont-pdfmake/fonts/ThaiFonts/Sarabun-Regular.ttf',
        ),
      },
    };

    const printer = new PdfPrinter(fonts);

    // Document definition
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [20, 40, 20, 20],
      info: {
        title: `paymentStatus-${branchId}`,
        author: user?.username || 'System',
        subject: `สร้างเมื่อ-${formatDateTH(new Date())}`,
        creator: user?.username || 'System',
        producer: process.env.SERVICE_NAME || 'Payment Service',
      },
      header: (currentPage: number) => ({
        text: `หน้า ${currentPage}`,
        alignment: 'right',
        fontSize: 10,
        margin: [20, 20, 20, 0],
      }),
      content: [
        {
          stack: [
            { text: `รายการซื่อเข้า`, style: 'header' },
            {
              columns: [
                {
                  width: '*',
                  stack: [
                    {
                      text: `วันที่: ${formatDateNumberWithoutTime(start)} ถึง ${formatDateNumberWithoutTime(end)}`,
                      style: 'subheaderLeft',
                    },
                    {
                      text: `จำนวนรายการ: ${product_buy_lists.length} (${statusType[status] || status})`,
                      style: 'subheaderLeft',
                    },
                  ],
                },
                {
                  width: '*',
                  stack: [
                    {
                      text: `สาขา: ${branch?.name || 'ไม่พบสาขา'}`,
                      style: 'subheaderRight',
                    },
                    {
                      text: `รวมยอด: ${formatNumberDigit2(priceSumAll)} บ.`,

                      style: 'subheaderRight',
                    },
                  ],
                },
              ],
            },
          ],
        },

        { text: '', margin: [0, 10] }, // Spacer
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*'], // Match 7 columns
            body: tableBody,
            keepWithHeaderRows: true,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#f0f0f0' : null,
          },
        },
        ...(product_buy_lists.length === 0
          ? [
              {
                text: 'ไม่มีข้อมูลสำหรับแสดง',
                style: 'subheaderLeft',
                margin: [0, 10],
              },
            ]
          : []),
      ],
      styles: {
        header: { fontSize: 14, alignment: 'center', margin: [0, 0, 0, 10] },
        subheaderLeft: {
          fontSize: 10,
          alignment: 'left',
          margin: [0, 2, 0, 2],
        },
        subheaderRight: {
          fontSize: 10,
          alignment: 'right',
          margin: [0, 2, 0, 2],
        },
        tableHeader: { fontSize: 10, alignment: 'center' },
      },
      defaultStyle: {
        font: 'Sarabun',
        lineHeight: 1.2,
        fontSize: 10,
      },
    };

    // Create PDF
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const buffers: Buffer[] = [];

    pdfDoc.on('data', (chunk) => buffers.push(chunk));
    pdfDoc.on('error', (err) => {
      throw new Error(`PDF generation failed: ${err.message}`);
    });
    pdfDoc.end();

    return new Promise<Buffer>((resolve) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }

  async findOne(id: number): Promise<any> {
    // const productBuys = await this.productBuyRepository.find({
    //   relations: ['productBuyLists'],
    // });

    // for (let index = 0; index < productBuys.length; index++) {
    //   const { productBuyLists, ...res } = productBuys[index];
    //   let priceSumAll = 0;
    //   for (let index2 = 0; index2 < productBuyLists.length; index2++) {
    //     priceSumAll += Number(productBuyLists[index2].priceSumCostBuy);
    //   }

    //   await this.productBuyRepository.update(
    //     {
    //       id: res.id,
    //     },
    //     {
    //       priceSumAll: priceSumAll,
    //     },
    //   );
    // }

    // const productBuyLists = await this.productBuyListsRepository.find();
    // for (let index = 0; index < productBuyLists.length; index++) {
    //   const product = await this.productRepository.findOne({
    //     where: { id: productBuyLists[index].productId },
    //     relations: ['productModel', 'productBrand', 'productColor'],
    //   });
    //   productBuyLists[index].productName =
    //     `${product.productModel.name}, ${product.productColor.name} (${product.productBrand.name})`;
    //   await this.productBuyListsRepository.update(
    //     productBuyLists[index].id,
    //     productBuyLists[index],
    //   );
    // }

    return this.productBuyRepository.findOne({
      where: { id },
      relations: ['productBuyLists'],
    });
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    await fs.ensureDir(this.uploadsPath);

    const files = await req.saveRequestFiles();

    const {
      venderId,
      branchId,
      catalog,
      updateByUserId,
      priceSumAll,
      status,
      tackingNumber,
      transportId,
      code,
    } = req.body as any;

    const productBuyLists = Object.keys(req.body).reduce((acc, key) => {
      const match = key.match(/^productBuyLists\[(\d+)\]\[(\w+)\]$/);
      if (match) {
        const [, index, field] = match;
        acc[index] = acc[index] || {};
        acc[index][field] = req.body[key].value;
      }
      return acc;
    }, []);

    const values = {
      code: code?.value ?? null,
      branchId: branchId?.value ?? null,
      venderId: venderId?.value ?? null,

      catalog: catalog?.value ?? null,
      updateByUserId: updateByUserId?.value ?? null,
      priceSumAll: priceSumAll?.value ?? null,
      status: status?.value ?? null,
      tackingNumber: tackingNumber?.value ?? null,
      transportId: toIntegerOrNull(transportId?.value),
    };

    const existingProductBuy = await this.productBuyRepository.findOne({
      where: { id: id },
    });

    const branch = await this.branchRepository.findOne({
      where: { id: values.branchId },
    });

    if (values.status == '1' && existingProductBuy.status == '0') {
      const nameProduct: { name: string; amount: number }[] = [];

      for (let index = 0; index < productBuyLists.length; index++) {
        const product = await this.productRepository.findOne({
          where: { id: productBuyLists[index].productId },
        });

        nameProduct.push({
          name: productBuyLists[index].productName,
          amount: productBuyLists[index].amount,
        });

        const existingProduct = product;

        product.amount =
          Number(product.amount) + Number(productBuyLists[index].amount);

        product.priceCostBuy = Number(productBuyLists[index].priceCostBuy);

        await this.productRepository.save(product);

        const existingProductPrice = await this.productPriceRepository.findOne({
          where: {
            productId: productBuyLists[index].productId,
            priceCostBuy: productBuyLists[index].priceCostBuy,
          },
        });

        if (existingProductPrice) {
          existingProductPrice.amount =
            Number(existingProductPrice.amount) +
            Number(productBuyLists[index].amount);

          await this.productPriceRepository.save(existingProductPrice);
        } else {
          const productPrice = this.productPriceRepository.create({
            productId: productBuyLists[index].productId,
            priceCostBuy: productBuyLists[index].priceCostBuy,
            amount: productBuyLists[index].amount,
            branchId: values.branchId,
          });

          await this.productPriceRepository.save(productPrice);
        }

        const productLogDto: CreateProductLogDto = {
          productId: product.id,
          action: 'ซื้อเข้า',
          obj: JSON.stringify({
            before: existingProduct,
            after: product,
          }),
          branchId: existingProduct.branchId,
          userId: values.updateByUserId,
        };
        await this.productLogService.create(productLogDto);
      }

      const productListMessage = nameProduct
        .map(
          (item, index) => `${index + 1}. ${item.name} - ${item.amount} หน่วย`,
        )
        .join('\n');

      // สร้างข้อความแจ้งเตือน
      const messageBuyProduct = `นำเข้า${values.catalog} : ${branch.name}
      * รหัส: ${values.code}
      * รายการ:\n- ${productListMessage}
      * รวมยอด: ${formatNumberDigit(values.priceSumAll)} บ.`;

      await this.telegramNotificationService.sendTelegramNotify({
        botToken: branch.token_bot,
        chatId: branch.room_id_buyProduct,
        message: messageBuyProduct,
      });
    } else if (values.status == '2' && existingProductBuy.status == '1') {
      const nameProduct: { name: string; amount: number }[] = [];

      for (let index = 0; index < productBuyLists.length; index++) {
        const product = await this.productRepository.findOne({
          where: { id: productBuyLists[index].productId },
        });

        nameProduct.push({
          name: productBuyLists[index].productName,
          amount: productBuyLists[index].amount,
        });

        const existingProduct = product;

        product.amount =
          Number(product.amount) - Number(productBuyLists[index].amount);

        product.priceCostBuy = Number(productBuyLists[index].priceCostBuy);

        await this.productRepository.save(product);

        const existingProductPrice = await this.productPriceRepository.findOne({
          where: {
            productId: productBuyLists[index].productId,
            priceCostBuy: productBuyLists[index].priceCostBuy,
          },
        });

        if (existingProductPrice) {
          existingProductPrice.amount =
            Number(existingProductPrice.amount) -
            Number(productBuyLists[index].amount);

          await this.productPriceRepository.save(existingProductPrice);
        }

        const productLogDto: CreateProductLogDto = {
          productId: product.id,
          action: 'คืนสินค้า',
          obj: JSON.stringify({
            before: existingProduct,
            after: product,
          }),
          branchId: existingProduct.branchId,
          userId: values.updateByUserId,
        };
        await this.productLogService.create(productLogDto);
      }

      const productListMessage = nameProduct
        .map(
          (item, index) => `${index + 1}. ${item.name} - ${item.amount} หน่วย`,
        )
        .join('\n');

      // สร้างข้อความแจ้งเตือน
      const messageBuyProduct = `ปฏิเสธ${values.catalog} : ${branch.name}
      * รหัส: ${values.code}
      * รายการ:
        - ${productListMessage}
      * รวมยอด: ${values.priceSumAll} บ.`;

      await this.telegramNotificationService.sendTelegramNotify({
        botToken: branch.token_bot,
        chatId: branch.room_id_buyProduct,
        message: messageBuyProduct,
      });
    } else if (values.status == '0' && existingProductBuy.status == '0') {
      for (let index = 0; index < productBuyLists.length; index++) {
        await this.productBuyListsRepository.update(
          productBuyLists[index].id,
          productBuyLists[index],
        );
      }
    }

    if (files.length > 0) {
      await fs.ensureDir(`${this.uploadsPath}/${values.branchId}`);

      const file = files[0];
      const buffer = await fs.readFile(file.filepath);
      const filename = `${values.code}.png`;
      const filePath = path.join(
        `${this.uploadsPath}/${values.branchId}`,
        filename,
      );
      await sharp(buffer)
        .png({ quality: 80, progressive: true })
        .toFile(filePath);
    }
    await this.productBuyRepository.update(id, values);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${values.code}`,
    };
  }
}
