import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateProductLogDto } from './dto/create-product-log.dto';
import { UpdateProductLogDto } from './dto/update-product-log.dto';
import { ProductLog } from './entities/product-log.entity';
import { ProductLogSearchDto } from 'src/helper/search.dto';
import { FastifyRequest } from 'fastify';
import dayjs from 'src/configs/dayjs-config';
import * as path from 'path';
import PdfPrinter from 'pdfmake/src/printer';
import { Product } from '../product/entities/product.entity';
import { TransferProductBranchList } from '../transfer-product-branch-lists/entities/transfer-product-branch-list.entity';

@Injectable()
export class ProductLogService {
  constructor(
    @InjectRepository(ProductLog)
    private readonly productLogRepository: Repository<ProductLog>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductLogDto: CreateProductLogDto): Promise<ProductLog> {
    const newProductLog = this.productLogRepository.create(createProductLogDto);
    return this.productLogRepository.save(newProductLog);
  }

  async findAll(searchProductLogDto: ProductLogSearchDto): Promise<{
    data: ProductLog[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const qb = this.productLogRepository.createQueryBuilder('product_log');
    const isBuyIn = searchProductLogDto.actionType === 'ซื้อเข้า';
    const OBJ = `product_log.obj::jsonb`;

    if (isBuyIn) {
      // ====== actionType = ซื้อเข้า → ไม่ join product, ใช้ obj.before ======

      qb.select([
        'product_brand.name',
        'product_model.name',
        'product_color.name',
        'product_storage.name',
        'product_type.name',
        'product_log.id',
        'product_log.action',
        'product_log.productId',
        'product_log.branchId',
        'product_log.userId',
        'product_log.create_date',
        'product_log.obj',
        'product.id',
        'product.code',
        'product.imei',
        'product.priceCostBuy',
        'product.machineCondition',
        'product.shopInsurance',
        'product.boxType',
        'product.hand',
        'product.batteryHealth',
        'product.create_date',
        'product.refOldStockNumber',
        'product.priceSale',
        'branch.name',
        'user.name',
      ])
        .leftJoin('product_log.product', 'product')
        .leftJoin('product_log.user', 'user')
        .leftJoin('product_log.branch', 'branch')
        .leftJoin('product.productBrand', 'product_brand')
        .leftJoin('product.productModel', 'product_model')
        .leftJoin('product.productColor', 'product_color')
        .leftJoin('product.productStorage', 'product_storage')
        .leftJoin('product.productType', 'product_type');

      // ค้นหาใน obj.before
      if (searchProductLogDto.search) {
        qb.andWhere(
          `(
          ${OBJ} -> 'before' ->> 'imei' ILIKE :search
          OR ${OBJ} -> 'before' ->> 'code' ILIKE :search
          OR ${OBJ} -> 'before' ->> 'catalog' ILIKE :search
        )`,
          { search: `%${searchProductLogDto.search}%` },
        );
      }

      if (searchProductLogDto.catalog) {
        qb.andWhere(`${OBJ} -> 'before' ->> 'catalog' ILIKE :catalog`, {
          catalog: `%${searchProductLogDto.catalog}%`,
        });
      }
    } else {
      qb.select([
        'product_brand.name',
        'product_model.name',
        'product_color.name',
        'product_storage.name',
        'product_type.name',
        'product_log.id',
        'product_log.action',
        'product_log.productId',
        'product_log.branchId',
        'product_log.userId',
        'product_log.create_date',
        'product.id',
        'product.code',
        'product.imei',
        'product.priceCostBuy',
        'product.machineCondition',
        'product.shopInsurance',
        'product.boxType',
        'product.hand',
        'product.batteryHealth',
        'product.create_date',
        'product.refOldStockNumber',
        'product.priceSale',
        'branch.name',
        'user.name',
      ])
        .leftJoin('product_log.product', 'product')
        .leftJoin('product_log.user', 'user')
        .leftJoin('product_log.branch', 'branch')
        .leftJoin('product.productBrand', 'product_brand')
        .leftJoin('product.productModel', 'product_model')
        .leftJoin('product.productColor', 'product_color')
        .leftJoin('product.productStorage', 'product_storage')
        .leftJoin('product.productType', 'product_type');

      // ✅ ให้ search ที่ product + action อย่างเดียว
      if (searchProductLogDto.search) {
        qb.andWhere(
          `(
        product.code ILIKE :search
        OR product.imei ILIKE :search
        OR product_log.action ILIKE :search
      )`,
          { search: `%${searchProductLogDto.search}%` },
        );
      }

      // ✅ filter catalog ที่ product แทน (หรือแล้วแต่จริงๆ เก็บอยู่ตรงไหน)
      if (searchProductLogDto.catalog) {
        qb.andWhere('product.catalog ILIKE :catalog', {
          catalog: `%${searchProductLogDto.catalog}%`,
        });
      }
    }

    // เงื่อนไข branch
    if (searchProductLogDto.branchId) {
      qb.andWhere('product_log.branchId = :branchId', {
        branchId: searchProductLogDto.branchId,
      });
    }

    // เงื่อนไขวันที่
    qb.andWhere('product_log.create_date BETWEEN :startDate AND :endDate', {
      startDate: new Date(searchProductLogDto.startDate),
      endDate: new Date(searchProductLogDto.endDate),
    });

    // เงื่อนไข actionType (ใช้ได้ทั้งสอง case)
    if (searchProductLogDto.actionType) {
      qb.andWhere('product_log.action ILIKE :actionType', {
        actionType: `%${searchProductLogDto.actionType}%`,
      });
    }

    // Pagination
    const total = await qb.getCount();

    qb.orderBy('product_log.create_date', 'DESC')
      .skip((searchProductLogDto.page - 1) * searchProductLogDto.pageSize)
      .take(searchProductLogDto.pageSize);

    const data = await qb.getMany();

    return {
      data,
      total,
      page: searchProductLogDto.page,
      pageSize: searchProductLogDto.pageSize,
    };
  }

  async reportListBuy(params: { req: FastifyRequest }): Promise<Buffer> {
    const { req } = params;

    // ----- helpers เฉพาะในฟังก์ชันนี้ (ไม่แตะโครงสร้างอื่น) -----
    const thDate = (d: any) => (d ? dayjs(d).format('DD/MM/YYYY') : '');
    const thTime = (d: any) => (d ? dayjs(d).format('HH:mm:ss') : '');
    const n2 = (v: any) =>
      Number(v || 0).toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    // รวมค่า product + fallback จาก obj.before แบบเดียวกับ frontend
    const normalizeRow = (row: any) => {
      let before: any = null;
      if (row?.obj) {
        try {
          const parsed =
            typeof row.obj === 'string' ? JSON.parse(row.obj) : row.obj;
          before = parsed?.before || null;
        } catch {
          before = null;
        }
      }
      const prod = row.product ?? {};
      return {
        ...row,
        code: row.code || prod.code || before?.code || '',
        product: {
          ...prod,
          code: before?.code ?? prod.code ?? '',
          imei: before?.imei ?? prod.imei ?? '',
          batteryHealth: before?.batteryHealth ?? prod.batteryHealth ?? 0,
          boxType: before?.boxType ?? prod.boxType ?? '',
          hand: before?.hand ?? prod.hand ?? '',
          machineCondition:
            before?.machineCondition ?? prod.machineCondition ?? 0,
          priceCostBuy: before?.priceCostBuy ?? prod.priceCostBuy ?? 0,
          priceSale: before?.priceSale ?? prod.priceSale ?? 0,
          refOldStockNumber:
            before?.refOldStockNumber ?? prod.refOldStockNumber ?? '',
          create_date:
            before?.create_date ?? prod.create_date ?? row.create_date,
          buyFormShop: before?.buyFormShop ?? prod.buyFormShop ?? '',
          productBrand:
            prod.productBrand ??
            (before?.productBrandName
              ? { name: before.productBrandName }
              : prod.productBrand),
          productModel:
            prod.productModel ??
            (before?.productModelName
              ? { name: before.productModelName }
              : prod.productModel),
          productColor:
            prod.productColor ??
            (before?.productColorName
              ? { name: before.productColorName }
              : prod.productColor),
          productStorage:
            prod.productStorage ??
            (before?.productStorageName
              ? { name: before.productStorageName }
              : prod.productStorage),
          productType:
            prod.productType ??
            (before?.productTypeName
              ? { name: before.productTypeName }
              : prod.productType),
        },
      };
    };

    // ===== 1) QUERY เดิมของคุณ (ต้นฉบับที่มีข้อมูลออกแน่) =====
    const { search, branchId, catalog, startDate, endDate, actionType } =
      (req.body as any) ?? {};

    const searchProductLogDto = {
      search: search?.value ?? null,
      branchId: branchId?.value ?? null,
      catalog: catalog?.value ?? null,
      startDate: startDate?.value ?? null,
      endDate: endDate?.value ?? 1,
      actionType: actionType?.value ?? null,
    };

    const qb = this.productLogRepository.createQueryBuilder('product_log');

    // actionType = ซื้อเข้า → ใช้ obj.before
    const OBJ = `product_log.obj::jsonb`;

    qb.select([
      'product_brand.name',
      'product_model.name',
      'product_color.name',
      'product_storage.name',
      'product_type.name',
      'product_log.id',
      'product_log.action',
      'product_log.productId',
      'product_log.branchId',
      'product_log.userId',
      'product_log.create_date',
      'product_log.obj',
      'product.id',
      'product.code',
      'product.imei',
      'product.priceCostBuy',
      'product.machineCondition',
      'product.shopInsurance',
      'product.boxType',
      'product.hand',
      'product.batteryHealth',
      'product.create_date',
      'product.refOldStockNumber',
      'product.priceSale',
      'branch.name',
      'user.name',
    ])
      .leftJoin('product_log.product', 'product')
      .leftJoin('product_log.user', 'user')
      .leftJoin('product_log.branch', 'branch')
      .leftJoin('product.productBrand', 'product_brand')
      .leftJoin('product.productModel', 'product_model')
      .leftJoin('product.productColor', 'product_color')
      .leftJoin('product.productStorage', 'product_storage')
      .leftJoin('product.productType', 'product_type');

    if (searchProductLogDto.search) {
      qb.andWhere(
        `(
        ${OBJ} -> 'before' ->> 'imei' ILIKE :search
        OR ${OBJ} -> 'before' ->> 'code' ILIKE :search
        OR ${OBJ} -> 'before' ->> 'catalog' ILIKE :search
      )`,
        { search: `%${searchProductLogDto.search}%` },
      );
    }

    if (searchProductLogDto.catalog) {
      qb.andWhere(`${OBJ} -> 'before' ->> 'catalog' ILIKE :catalog`, {
        catalog: `%${searchProductLogDto.catalog}%`,
      });
    }

    if (searchProductLogDto.branchId) {
      qb.andWhere('product_log.branchId = :branchId', {
        branchId: searchProductLogDto.branchId,
      });
    }

    qb.andWhere('product_log.create_date BETWEEN :startDate AND :endDate', {
      startDate: dayjs(searchProductLogDto.startDate).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
      endDate: dayjs(searchProductLogDto.endDate).format('YYYY-MM-DD HH:mm:ss'),
    });

    if (searchProductLogDto.actionType) {
      qb.andWhere('product_log.action ILIKE :actionType', {
        actionType: `%${searchProductLogDto.actionType}%`,
      });
    }

    qb.orderBy('product_log.create_date', 'DESC');
    const rowsRaw = await qb.getMany();

    // ===== 2) เตรียมข้อมูลสำหรับ PDF (THUNDER เท่านั้น) =====
    const rows = rowsRaw.map((r) => normalizeRow(r));

    const body: any = (req as any).body || {};
    const startText = body?.startDate?.value ?? body?.startDate;
    const endText = body?.endDate?.value ?? body?.endDate;
    const branchVal = body?.branchId?.value ?? body?.branchId ?? 0;

    let branchName = 'ทุกสาขา';
    if (branchVal) {
      try {
        const one = await this.productLogRepository
          .createQueryBuilder('pl')
          .leftJoin('pl.branch', 'branch')
          .select('branch.name', 'name')
          .where('pl.branchId = :bid', { bid: branchVal })
          .orderBy('pl.create_date', 'DESC')
          .limit(1)
          .getRawOne<{ name?: string }>();
        if (one?.name) branchName = one.name;
      } catch {}
    }

    // หัวตาราง THUNDER ตายตัว (รวมมือถือเป็นคอลัมน์เดียว)
    const tableHeader = [
      { text: 'ลำดับ', style: 'tableHeader' },
      { text: 'อีมี่', style: 'tableHeader' },
      { text: 'สินค้า', style: 'tableHeader' }, // รวมมือถือทั้งหมด
      { text: 'สภาพเครื่อง', style: 'tableHeader' }, // รวมสุขภาพแบต + มือหนึ่ง/สอง + %เครื่อง
      { text: 'ซื้อจากร้านค้า', style: 'tableHeader' },
      { text: 'ทุน', style: 'tableHeader' },
      { text: 'วันที่/เวลา', style: 'tableHeader' },
    ];

    const widths: (number | 'auto' | '*')[] = [
      30, // ลำดับ
      '*', // อีมี่
      '*', // สินค้า ← ยืดหยุ่น
      100, // สภาพเครื่อง (รวม 3 ค่าในคอลัมน์เดียว)
      '*', // ซื้อจากร้านค้า
      60, // วันที่/เวลา
      60, // ทุน
    ];

    const bodyTable: any[] = [tableHeader];
    let totalCost = 0;

    rows.forEach((row: any, idx: number) => {
      totalCost += Number(row?.product?.priceCostBuy || 0);

      const dateText = `${thDate(row?.product?.create_date)}\n${thTime(row?.product?.create_date)}`;

      // 👇 รวมข้อมูลมือถือในคอลัมน์ “สินค้า”
      const productCell = {
        alignment: 'left',
        stack: [
          {
            text: `${row?.product?.productBrand?.name || ''} ${row?.product?.productModel?.name || ''}`.trim(),
            margin: [0, 0, 0, 1],
          },
          {
            text: `${row?.product?.productStorage?.name || ''} ${row?.product?.productColor?.name || ''}`.replace(
              /^ • /,
              '',
            ),
            color: '#6b7280',
          },
        ],
      };

      // 👇 รวมสุขภาพแบต + มือหนึ่ง/สอง + %เครื่อง
      const conditionCell = {
        alignment: 'left',
        stack: [
          { text: `สภาพ: ${row?.product?.hand || ''}` },
          { text: `แบต: ${row?.product?.batteryHealth || 0}%` },
          { text: `เครื่อง: ${row?.product?.machineCondition || 0}%` },
        ],
      };

      bodyTable.push([
        { text: String(idx + 1), alignment: 'right' },
        { text: row?.product?.imei || '', alignment: 'left' },
        productCell,
        conditionCell,
        { text: row?.product?.buyFormShop || '', alignment: 'left' },
        { text: n2(row?.product?.priceCostBuy || 0), alignment: 'right' },
        { text: dateText, alignment: 'left' },
      ]);
    });

    // ===== 3) pdfmake (ฟอนต์ Sarabun แบบเดิมของคุณ) =====
    const fonts = {
      Sarabun: {
        normal: path.join(
          __dirname,
          '../../../node_modules/addthaifont-pdfmake/fonts/ThaiFonts/Sarabun-Regular.ttf',
        ),
      },
    };
    const printer = new PdfPrinter(fonts as any);

    const dateRangeText =
      startText && endText
        ? `${thDate(startText)} ถึง ${thDate(endText)}`
        : '—';

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [16, 52, 16, 20],
      info: {
        title: `buy-report-${branchName || 'all'}`,
        author: (req as any)?.user?.username || 'system',
        subject: `สร้างเมื่อ-${thDate(new Date())} ${thTime(new Date())}`,
        creator: (req as any)?.user?.username || 'system',
        producer: process.env.SERVICE_NAME || 'Report Service',
      },
      header: (currentPage: number) => ({
        text: `หน้า ${currentPage}`,
        alignment: 'right',
        fontSize: 10,
        margin: [16, 16, 16, 0],
      }),
      content: [
        {
          stack: [
            { text: 'รายการซื้อเข้า', style: 'header' },
            {
              columns: [
                {
                  width: '*',
                  stack: [
                    {
                      text: `วันที่: ${dateRangeText}`,
                      style: 'subheaderLeft',
                    },
                    {
                      text: `จำนวนรายการ: ${rows.length}`,
                      style: 'subheaderLeft',
                    },
                  ],
                },
                {
                  width: '*',
                  stack: [
                    { text: `สาขา: ${branchName}`, style: 'subheaderRight' },
                    {
                      text: `รวมทุน: ${n2(totalCost)} บ.`,
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
            widths,
            body: bodyTable,
            keepWithHeaderRows: true,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#f0f0f0' : null,
            hLineColor: () => '#e5e7eb',
            vLineColor: () => '#e5e7eb',
          },
        },
        ...(rows.length === 0
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
      defaultStyle: { font: 'Sarabun', lineHeight: 1.2, fontSize: 9.5 },
    };

    const pdfDoc = (printer as any).createPdfKitDocument(docDefinition);
    const buffers: Buffer[] = [];

    return await new Promise<Buffer>((resolve, reject) => {
      pdfDoc.on('data', (chunk: Buffer) => buffers.push(chunk));
      pdfDoc.on('error', (err: any) =>
        reject(new Error(`PDF generation failed: ${err?.message || err}`)),
      );
      pdfDoc.on('end', () => resolve(Buffer.concat(buffers)));
      pdfDoc.end();
    });
  }

  async findOne(id: number): Promise<ProductLog | null> {
    // ...

    // // 1) map จำนวนสต๊อกจริงตามที่พนักงานแจ้ง
    // const stockAdjustments: Record<string, number> = {
    //   // // คลองสี่วา - คลังอุปกรณ์
    //   // ENTHUN202505220004: 4,
    //   // FCTHUN202505280006: 3,
    //   // FCTHUN202509240001: 9,
    //   // KKTHUN202505270154: 2,
    //   // KKTHUN202505270161: 3,
    //   // KKTHUN202509120004: 9,
    //   // KKTHUN202509120005: 8,

    //   // // คลองสี่วา - คลังอะไหล่
    //   // PSTHUN202507010001: 0,
    //   // APTHUN202510280002: 0,
    //   // // DSPNK202509160006: 0, // (มีซ้ำอีกคลัง/อีกสาขา แต่จำนวนเท่ากัน)
    //   // RMTHUN202508090002: 0,
    //   // SAMSUNGTHUN202506050001: 0,
    //   // PSTHUN202507090002: 0,
    //   // PSTHUN202507080002: 0,

    //   // ศาลายา - คลังอุปกรณ์
    //   // NTMA202508180012: 5,
    //   // OGMA202506120005: 2,
    //   // OGMA202506120008: 2,
    //   // 'U&IMA202506070023': 10,
    //   // 'U&IMA202506070024': 10,
    //   // 'U&IMA202506080012': 2,
    //   // APPNK202506180016: 0, // มีหมายเหตุ “ช่องขายแล้วขึ้น 2 ...” แต่ไม่ได้ระบุ “ของจริงมี X” เลยใส่ 0 ไว้ก่อน
    //   // DSPNK202509160006: 0,

    //   // พระนครโฟน - สต๊อกอุปกรณ์
    //   // HGPNK202505300052: 86,
    //   // ENGPNK202505310063: 11,
    //   // FCPNK202506190002: 3,
    //   // FCPNK202509160003: 17,
    //   // KKPNK202505300003: 8,
    //   // NTGPNK202505300066: 5,
    //   // NTGPNK202505300083: 8,
    //   // NTGPNK202505310006: 11,
    //   // NTPNK202509140001: 9,
    // };

    // const codes = Object.keys(stockAdjustments);

    // // 2) ดึงสินค้าในกลุ่มนี้ออกมาก่อน
    // const products = await this.productRepository.find({
    //   where: { code: In(codes), branchId: 2 },
    //   order: { id: 'ASC' },
    // });
    // // //console.log('products', products);

    // // // 3) วนปรับสต๊อก + เตรียม log data
    // const updateData: { id: number; amount: number }[] = [];
    // const logDtos: CreateProductLogDto[] = [];

    // for (const product of products) {
    //   const realAmount = stockAdjustments[product.code];

    //   // กันพลาด ถ้าไม่มีค่าใน map จะข้าม
    //   if (typeof realAmount !== 'number') {
    //     continue;
    //   }

    //   // เตรียม update data
    //   updateData.push({ id: product.id, amount: realAmount });

    //   // เตรียม log data
    //   logDtos.push({
    //     productId: product.id,
    //     action: 'ปรับสต็อก',
    //     obj: JSON.stringify({
    //       before: { code: product.code, amount: product.amount },
    //       after: { code: product.code, amount: realAmount },
    //     }),
    //     branchId: product.branchId,
    //     userId: 1,
    //   });
    // }

    // // ทำ batch update พร้อมกัน
    // if (updateData.length > 0) {
    //   await Promise.all(
    //     updateData.map((data) =>
    //       this.productRepository.update(data.id, { amount: data.amount }),
    //     ),
    //   );
    // }

    // // ทำ batch insert log พร้อมกัน
    // if (logDtos.length > 0) {
    //   await this.productLogRepository.save(
    //     logDtos.map((dto) => this.productLogRepository.create(dto)),
    //   );
    // }

    // const rows = await this.productLogRepository
    //   .createQueryBuilder('productLog')
    //   // logicalProductId: เอา id จาก JSON ก่อน ถ้าไม่มีค่อยใช้ column productId
    //   .addSelect(
    //     `COALESCE(
    //     ("productLog"."obj"::jsonb -> 'before' ->> 'id')::int,
    //     "productLog"."productId"
    //   )`,
    //     'logicalProductId',
    //   )
    //   .distinctOn([
    //     `COALESCE(
    //     ("productLog"."obj"::jsonb -> 'before' ->> 'id')::int,
    //     "productLog"."productId"
    //   )`,
    //   ])
    //   .where('productLog.action IN (:...actions)', {
    //     actions: [
    //       'ซื้อเข้า',
    //       'ขายสินค้า',
    //       'โอนสินค้าไปยังสาขา',
    //       'รับสินค้าจากสาขา',
    //       'ฟรีสินค้า',
    //       'ปรับสต็อก'
    //     ],
    //   })
    //   // ถ้าต้อง filter เฉพาะอุปกรณ์เสริมด้วย
    //   .andWhere(
    //     `("productLog"."obj"::jsonb -> 'before' ->> 'catalog') ILIKE :search`,
    //     { search: '%อุปกรณ์เสริม%' },
    //   )
    //   // สำคัญ: ORDER BY ตัวแรกต้องเหมือน DISTINCT ON
    //   .orderBy(
    //     `COALESCE(
    //     ("productLog"."obj"::jsonb -> 'before' ->> 'id')::int,
    //     "productLog"."productId"
    //   )`,
    //     'ASC',
    //   )
    //   .addOrderBy('productLog.id', 'DESC') // ในแต่ละ logicalProductId เอา id ล่าสุด
    //   .getRawMany();

    // // เตรียมข้อมูลที่จะเอาไป update ทีเดียว
    // const updates: { productId: number; amount: number }[] = [];

    // for (const row of rows) {
    //   if (!row.productLog_obj) continue;

    //   try {
    //     const parsed = JSON.parse(row.productLog_obj) as {
    //       before?: { amount?: number | string; id?: number | string };
    //       after?: { amount?: number | string; id?: number | string };
    //     };

    //     // 1) หา amount (เอาจาก after ก่อน ถ้าไม่มีค่อย fallback before)
    //     let amount = parsed.after?.amount ?? parsed.before?.amount ?? null;
    //     if (amount == null) continue;

    //     amount = Number(amount);
    //     if (Number.isNaN(amount)) continue;

    //     // 2) id จาก JSON
    //     const jsonIdRaw = parsed.after?.id ?? parsed.before?.id ?? null;
    //     const jsonId = jsonIdRaw != null ? Number(jsonIdRaw) : NaN;
    //     const hasJsonId = !Number.isNaN(jsonId);

    //     // 3) id จาก column
    //     const columnId = Number(row.productLog_productId);
    //     const hasColumnId = !Number.isNaN(columnId);

    //     // 4) เลือก productId ที่จะใช้จริง
    //     let productId: number | null = null;

    //     if (hasJsonId) {
    //       // ใช้ JSON เป็นหลัก
    //       productId = jsonId;

    //       if (hasColumnId && columnId !== jsonId) {
    //         console.warn('productId mismatch, using JSON id', {
    //           columnId,
    //           jsonId,
    //           productLogId: row.productLog_id,
    //         });
    //       }
    //     } else if (hasColumnId) {
    //       productId = columnId;
    //     } else {
    //       continue;
    //     }

    //     updates.push({ productId, amount });
    //   } catch (e) {
    //     console.error('JSON parse error:', row.productLog_obj, e);
    //   }
    // }

    // if (updates.length > 0) {
    //   const ids = updates.map((u) => u.productId);

    //   const caseSql = `
    //   CASE "id"
    //     ${updates.map((u) => `WHEN ${u.productId} THEN ${u.amount}`).join(' ')}
    //     ELSE "amount"
    //   END
    // `;

    //   await this.productRepository
    //     .createQueryBuilder()
    //     .update()
    //     .set({
    //       amount: () => caseSql,
    //     })
    //     .where('"id" IN (:...ids)', { ids })
    //     .execute();
    // }

    // ถ้าคอลัมน์ isProductBuy เป็น boolean -> ใช้ true/false

    const buyFlag = '1';
    const transferStatus = '1'; // 0=รอ, 1=ยืนยัน, 2=ปฏิเสธ, 3=ยกเลิก

    const productLog = await this.productLogRepository
      .createQueryBuilder('productLog')
      .leftJoinAndSelect('productLog.product', 'product')
      .leftJoinAndSelect('product.productRepairs', 'productRepairs')

      .leftJoinAndMapOne(
        'product.latestTransferProductBranchList',
        'product.transferProductBranchList',
        'latestTransferProductBranchList',
        `
      "latestTransferProductBranchList"."id" = (
        SELECT "tpbl"."id"
        FROM "transfer_product_branch_list" "tpbl"
        INNER JOIN "transfer_product_branch" "tpb"
          ON "tpb"."id" = "tpbl"."transferProductBranchId"
        WHERE "tpbl"."productId" = "product"."id"
          AND "tpb"."status" = :transferStatus
        ORDER BY "tpb"."create_date" DESC, "tpbl"."id" DESC
        LIMIT 1
      )
    `,
        { transferStatus },
      )

      // ✅ เอา transferProductBranch มาเต็มได้ (เพราะต้องใช้ code + create_date)
      .leftJoinAndSelect(
        'latestTransferProductBranchList.transferProductBranch',
        'latestTransferProductBranch',
      )

      // ✅ branch/toBranch: เอาเฉพาะ id + name
      .leftJoin('latestTransferProductBranch.branch', 'branch')
      .addSelect(['branch.id', 'branch.name'])
      .leftJoin('latestTransferProductBranch.toBranch', 'toBranch')
      .addSelect(['toBranch.id', 'toBranch.name'])

      .leftJoinAndSelect(
        'product.productImages',
        'productImages',
        `"productImages"."isProductBuy" = :buy`,
        { buy: buyFlag },
      )
      .where('"productLog"."id" = :id', { id })
      .orderBy('"productImages"."seq"', 'ASC')
      .getOne();

    return productLog || null;
  }

  async findByProductId(id: number): Promise<any> {
    const logs = await this.productLogRepository.findOne({
      where: {
        productId: id,
        action: 'ซื้อเข้า',
      },
      order: {
        create_date: 'DESC',
      },
    });

    return logs?.id || { message_error: 'ไม่พบประวัติ' };
  }

  async update(
    id: number,
    updateProductLogDto: UpdateProductLogDto,
  ): Promise<void> {
    await this.productLogRepository.update(id, updateProductLogDto);
  }
}
