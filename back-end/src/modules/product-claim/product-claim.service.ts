import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductClaimDto } from './dto/create-product-claim.dto';
import { UpdateProductClaimDto } from './dto/update-product-claim.dto';
import { ProductClaim } from './entities/product-claim.entity';
import PdfPrinter from 'pdfmake/src/printer';
import { Repository, Between } from 'typeorm';
import { Branch } from '../branchs/entities/branch.entity';
import { Product } from '../product/entities/product.entity';
import { ClaimSearchDto } from 'src/helper/search.dto';
import { FastifyRequest } from 'fastify';
import {
  formatDateNumberWithoutTime,
  formatDateTH,
} from 'src/helper/formatDate';
import { formatNumberDigit } from 'src/helper/formatNumber';
import * as path from 'path';

import dayjs from 'src/configs/dayjs-config';
import { ProductPrice } from '../product-price/entities/product-price.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { CreateProductLogDto } from '../product-log/dto/create-product-log.dto';

@Injectable()
export class ProductClaimService {
  constructor(
    @InjectRepository(ProductClaim)
    private readonly productClaimRepository: Repository<ProductClaim>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    @InjectRepository(ProductPrice)
    private readonly productPriceRepository: Repository<ProductPrice>,

    private readonly productLogService: ProductLogService,
  ) {}

  async findAll(searchClaimDto: ClaimSearchDto): Promise<{
    data: ProductClaim[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.productClaimRepository.createQueryBuilder('productClaim');

    queryBuilder
      .select([
        'productClaim.id',
        'productClaim.amount',
        'productClaim.priceCostBuy',
        'productClaim.branchId',
        'productClaim.status',
        'productClaim.create_date',
        'productClaim.createByUserId',
        'product.id',
        'product.code',
        'product.catalog',
        'productModel.id',
        'productModel.name',
        'user.id',
        'user.name',
        'userUpdate.id',
        'userUpdate.name',
      ])
      .leftJoin('productClaim.create_by', 'user')
      .leftJoin('productClaim.update_by', 'userUpdate')
      .leftJoin('productClaim.product', 'product')
      .leftJoin('product.productModel', 'productModel');

    if (searchClaimDto.branchId) {
      queryBuilder.where('productClaim.branchId = :branchId', {
        branchId: searchClaimDto.branchId,
      });
    }

    if (searchClaimDto.search) {
      queryBuilder.andWhere(
        '(product.code ILIKE :search OR productModel.name ILIKE :search OR user.name ILIKE :search)',
        {
          search: `%${searchClaimDto.search}%`,
        },
      );
    }

    if (searchClaimDto.status) {
      queryBuilder.andWhere('productClaim.status = :status', {
        status: searchClaimDto.status,
      });
    }

    queryBuilder.andWhere('product.catalog = :catalog', {
      catalog: searchClaimDto.catalog,
    });

    queryBuilder.andWhere(
      'productClaim.create_date BETWEEN :startDate AND :endDate',
      {
        startDate: new Date(searchClaimDto.startDate),
        endDate: new Date(searchClaimDto.endDate),
      },
    );

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('productClaim.create_date', 'DESC')
      .skip((searchClaimDto.page - 1) * searchClaimDto.pageSize)
      .take(searchClaimDto.pageSize);

    const productClaims = await queryBuilder.getMany();

    return {
      data: productClaims,
      total,
      page: searchClaimDto.page,
      pageSize: searchClaimDto.pageSize,
    };
  }

  async findOne(id: number): Promise<ProductClaim | null> {
    return this.productClaimRepository.findOne({
      where: { id },
      relations: ['product', 'product.productModel'],
    });
  }

  async update(id: number, req: FastifyRequest) {
    const user = (req as any).user;
    const { status } = req.body as any;

    const productClaim = await this.productClaimRepository.findOne({
      where: { id },
    });

    if (status && status.value == '1' && status.value != productClaim.status) {
      const product = await this.productRepository.findOne({
        where: { id: productClaim.productId },
      });
      const productPrice = await this.productPriceRepository.findOne({
        where: {
          productId: productClaim.productId,
          branchId: productClaim.branchId,
          priceCostBuy:
            productClaim.amount > 1
              ? productClaim.priceCostBuy / productClaim.amount
              : productClaim.priceCostBuy,
        },
      });

      if (!productPrice) {
        return { message_error: 'เกิดปัญหาในการค้นหาราคาต้นทุนไม่เจอ' };
      }
      productPrice.amount = productPrice.amount + productClaim.amount;
      await this.productPriceRepository.save(productPrice);

      const afterProduct = {
        ...product,
        amount: product.amount + productClaim.amount,
        amountClaim: product.amountClaim - productClaim.amount,
      };

      const stockLogDto: CreateProductLogDto = {
        productId: productClaim.productId,
        action: 'คืนสินค้าจากเครม',
        obj: JSON.stringify({
          before: product,
          after: afterProduct,
        }),
        branchId: productClaim.branchId,
        userId: user.id,
      };

      await this.productLogService.create(stockLogDto);
      await this.productRepository.update(product.id, afterProduct);

      await this.productClaimRepository.update(id, {
        status: status.value,
        updateByUserId: user.id,
      });
    }
  }

  async printClaimsPdf(req: FastifyRequest): Promise<Buffer> {
    const user = (req as any).user;

    const { branchId, startDate, endDate } = req.body as any;
    const start = dayjs(startDate).startOf('day').toDate();
    const end = dayjs(endDate).endOf('day').toDate();

    // Base query for reuse
    const createBaseQuery = () =>
      this.productClaimRepository
        .createQueryBuilder('productClaim')
        .where('productClaim.branchId = :branchId', { branchId })
        .andWhere('productClaim.create_date BETWEEN :start AND :end', {
          start,
          end,
        });

    // Query 1: Fetch aggregated claims data, grouped by product
    const query1 = createBaseQuery()
      .select([
        'productModal.name as productName',
        'SUM(productClaim.amount) as totalAmount',
        'SUM(productClaim.priceCostBuy) as totalPriceCostBuy',
      ])
      .leftJoin('productClaim.product', 'product')
      .leftJoin('product.productModal', 'productModal')
      .groupBy('productModal.name')
      .orderBy('productModal.name', 'ASC')
      .getRawMany();

    // Query 2: Fetch grand totals
    const query2 = createBaseQuery()
      .select('SUM(productClaim.amount)', 'grandTotalAmount')
      .addSelect('SUM(productClaim.priceCostBuy)', 'grandTotalPriceCostBuy')
      .getRawOne();

    // Execute queries
    const [productClaims, totals] = await Promise.all([query1, query2]);
    const grandTotalAmount = Number(totals?.grandTotalAmount) || 0;
    const grandTotalPriceCostBuy = Number(totals?.grandTotalPriceCostBuy) || 0;

    const branch = await this.branchRepository.findOneBy({ id: branchId });
    if (!branch) {
      throw new Error('Branch not found');
    }

    // Define table structure for the PDF
    const tableHeader = [
      { text: 'ลำดับ', style: 'tableHeader' },
      { text: 'ชื่อสินค้า', style: 'tableHeader' },
      { text: 'จำนวนรวม', style: 'tableHeader' },
      { text: 'ต้นทุนรวม', style: 'tableHeader' },
    ];

    const tableBody = [
      tableHeader,
      ...productClaims.map((item: any, k: number) => [
        { text: k + 1, alignment: 'right' },
        { text: item.productName || '-', alignment: 'left' },
        {
          text: item.totalAmount
            ? formatNumberDigit(Number(item.totalAmount))
            : '0',
          alignment: 'right',
        },
        {
          text: item.totalPriceCostBuy
            ? formatNumberDigit(Number(item.totalPriceCostBuy))
            : '0',
          alignment: 'right',
        },
      ]),
    ];

    const fonts = {
      Sarabun: {
        normal: path.join(
          __dirname,
          '../../../node_modules/addthaifont-pdfmake/fonts/ThaiFonts/Sarabun-Regular.ttf',
        ),
      },
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [10, 10, 10, 10],
      info: {
        title: `สรุปรายงานเคลมสินค้า`,
        author: user.name,
        subject: `สร้างเมื่อ-${formatDateTH(dayjs())}`,
        creator: user.name,
        producer: process.env.SERVICE_NAME || 'ProductClaim Service',
      },
      content: [
        {
          stack: [
            { text: `สรุปรายงานเคลมสินค้า (ตามสินค้า)`, style: 'header' },
            {
              columns: [
                {
                  width: '*',
                  stack: [
                    {
                      text: `วันที่: ${formatDateNumberWithoutTime(
                        startDate,
                      )} ถึง ${formatDateNumberWithoutTime(endDate)}`,
                      style: 'subheaderLeft',
                    },
                    {
                      text: `จำนวนประเภทสินค้า: ${productClaims.length}`,
                      style: 'subheaderLeft',
                    },
                  ],
                },
                {
                  width: '*',
                  stack: [
                    {
                      text: `สาขา: ${branch.name}`,
                      style: 'subheaderRight',
                    },
                    {
                      text: `ยอดรวมทั้งหมด (จำนวน): ${formatNumberDigit(
                        grandTotalAmount,
                      )}`,
                      style: 'subheaderRight',
                    },
                    {
                      text: `ยอดรวมทั้งหมด (ต้นทุน): ${formatNumberDigit(
                        grandTotalPriceCostBuy,
                      )}`,
                      style: 'subheaderRight',
                    },
                  ],
                },
              ],
            },
          ],
        },
        { text: '', margin: [0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto'], // 4 columns
            body: tableBody,
            keepWithHeaderRows: true,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#f0f0f0' : null,
          },
        },
        ...(productClaims.length === 0
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

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const buffers: Buffer[] = [];

    pdfDoc.on('data', (chunk) => buffers.push(chunk));
    pdfDoc.end();

    return new Promise((resolve) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }
}
