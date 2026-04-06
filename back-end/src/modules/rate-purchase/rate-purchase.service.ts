import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
  MESSAGE_CHECK_SUCCESS,
} from 'src/helper/constanc';
import { RatePurchaseSearchDto } from 'src/helper/search.dto';
import { isEmpty } from 'lodash';
import { RatePurchase } from './entities/rate-purchase.entity';
import { CreateRateFinanceDto } from '../rate-finance/dto/create-rate-finance.dto';
import { UpdateRatePurchaseDto } from './dto/update-rate-purchase.dto';
import { FastifyRequest } from 'fastify';
import {
  formatDateTHWithOutTime,
  formatDateNumberWithoutTime,
  formatDateTH,
} from 'src/helper/formatDate';
import PdfPrinter from 'pdfmake/src/printer';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { formatNumberDigit } from 'src/helper/formatNumber';
@Injectable()
export class RatePurchaseService {
  constructor(
    @InjectRepository(RatePurchase)
    private readonly ratePurchaseRepository: Repository<RatePurchase>,
  ) {}

  async create(createRatePurchaseDto: CreateRateFinanceDto): Promise<any> {
    const newRatePurchase = this.ratePurchaseRepository.create(
      createRatePurchaseDto,
    );
    this.ratePurchaseRepository.save(newRatePurchase);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(search: RatePurchaseSearchDto): Promise<{
    data: RatePurchase[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.ratePurchaseRepository.createQueryBuilder('rate_purchase');

    queryBuilder.select([
      'rate_purchase',
      'productModel.id',
      'productModel.name',
      'productStorage.id',
      'productStorage.name',
    ]);

    queryBuilder
      .leftJoin('rate_purchase.productModel', 'productModel')
      .leftJoin('rate_purchase.productStorage', 'productStorage');

    if (search.search) {
      queryBuilder.andWhere('productModel.name ILIKE :search', {
        search: `%${search.search}%`,
      });
    }

    if (search.active !== '2') {
      queryBuilder.andWhere('rate_purchase.active = :active', {
        active: search.active,
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('productModel.name', 'ASC') // Fixed alias from 'product_model' to 'productModel'
      .skip((search.page - 1) * search.pageSize)
      .take(search.pageSize);

    const ratePurchases = await queryBuilder.getMany();

    return {
      data: ratePurchases,
      total,
      page: search.page,
      pageSize: search.pageSize,
    };
  }

  async findOne(id: number): Promise<RatePurchase | null> {
    return this.ratePurchaseRepository.findOne({ where: { id } });
  }

  async printRatePurchase(params: { req: FastifyRequest }): Promise<Buffer> {
    const { req } = params;

    const user = (req as any).user;

    const query =
      this.ratePurchaseRepository.createQueryBuilder('rate_purchase');

    query
      .select([
        'rate_purchase',
        'productModel.id',
        'productModel.name',
        'productStorage.id',
        'productStorage.name',
      ])
      .where('rate_purchase.active = :active', {
        active: '1',
      })
      .leftJoin('rate_purchase.productModel', 'productModel')
      .leftJoin('rate_purchase.productStorage', 'productStorage')
      .orderBy('productModel.name', 'ASC');

    const result = await query.getMany();

    // Define table header with isFree column
    const tableHeader = [
      { text: 'ลำดับ', style: 'tableHeader' },
      { text: 'รุ่น', style: 'tableHeader' },
      { text: 'ความจุ', style: 'tableHeader' }, // New column for isFree
      { text: 'ราคามือหนึ่ง	', style: 'tableHeader' },
      { text: 'ราคาเริ่มต้นมือสอง	', style: 'tableHeader' },
      { text: 'ราคาสูงสุดมือสอง	', style: 'tableHeader' },
    ];

    // Map result to table body, fixing field names and adding isFree
    const tableBody = [
      tableHeader,
      ...result.map((item, k) => [
        { text: k + 1, alignment: 'right' },
        { text: item.productModel?.name || '-', alignment: 'left' },
        { text: item.productStorage?.name || '-', alignment: 'left' },
        {
          text: item.priceHandOne ? formatNumberDigit(item.priceHandOne) : '0',
          alignment: 'right',
        },
        {
          text: item.priceStartHandTwo
            ? formatNumberDigit(item.priceStartHandTwo)
            : '0',
          alignment: 'right',
        },
        {
          text: item.priceEndHandTwo
            ? formatNumberDigit(item.priceEndHandTwo)
            : '0',
          alignment: 'right',
        },
      ]),
    ];

    // Define fonts
    const fonts = {
      Sarabun: {
        normal: path.join(
          __dirname,
          '../../..',
          'node_modules/addthaifont-pdfmake/fonts/ThaiFonts/Sarabun-Regular.ttf',
        ),
      },
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [20, 40, 20, 20],
      info: {
        title: `RatePurchase-${formatDateTH(new Date())}`,
        author: user?.username || 'System',
        subject: `สร้างเมื่อ-${formatDateTH(new Date())}`,
        creator: user?.username || 'System',
        producer: process.env.SERVICE_NAME || 'Payment Service',
      },
      header: (currentPage: number) => ({
        text: `หน้า ${currentPage}`,
        alignment: 'right',
        fontSize: 10,
        margin: [20, 10, 20, 0], // ลด top margin
      }),
      content: [
        { text: 'ตารางรับซื้อ', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
            body: tableBody,
            keepWithHeaderRows: true,
          },
          layout: {
            fillColor: (rowIndex: number) => {
              return rowIndex === 0 ? '#f0f0f0' : null;
            },
            paddingTop: () => 2,
            paddingBottom: () => 2,
          },
          margin: [0, 5, 0, 0],
        },
        ...(result.length === 0
          ? [
              {
                text: 'ไม่มีข้อมูลสำหรับแสดง',
                style: 'subheaderLeft',
                margin: [0, 5, 0, 0],
              },
            ]
          : []),
      ],
      styles: {
        header: {
          fontSize: 14,
          alignment: 'center',
          margin: [0, 0, 0, 0], // ควบคุมช่องว่าง
        },
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
        tableHeader: {
          fontSize: 10,
          alignment: 'center',
        },
      },
      defaultStyle: {
        font: 'Sarabun',
        lineHeight: 1, // ลดช่องว่าง
        fontSize: 10,
      },
    };

    // Create PDF
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const buffers: Buffer[] = [];

    pdfDoc.on('data', (chunk) => buffers.push(chunk));
    pdfDoc.end();

    return new Promise((resolve) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }

  async update(
    id: number,
    updateRatePurchaseDto: UpdateRatePurchaseDto,
  ): Promise<any> {
    await this.ratePurchaseRepository.update(id, updateRatePurchaseDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }
}
