import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManageProcessManageFinanceDto } from 'src/helper/search.dto';
import { ProcessManageFinance } from './entities/process-manage-finance.entity';
import { CreateProcessManageFinanceDto } from './dto/create-process-manage-finance.dto';
import { UpdateProcessManageFinanceDto } from './dto/update-process-manage-finance.dto';
import { Branch } from 'src/modules/branchs/entities/branch.entity';
import dayjs from 'src/configs/dayjs-config';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import {
  MESSAGE_DENIED,
  MESSAGE_PERMISSION_DENIED,
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { Product } from '../product/entities/product.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { generateRandomString } from 'src/helper/generateRandomString';
import { PercentDownFinance } from '../percent-down-finance/entities/percent-down-finance.entity';
import { RateFinance } from '../rate-finance/entities/rate-finance.entity';
import { app } from 'firebase-admin';

@Injectable()
export class ProcessManageFinanceService {
  private readonly uploadsPath = path.join('uploads/processManageFinances');

  constructor(
    @InjectRepository(ProcessManageFinance)
    private readonly processManageFinanceRepository: Repository<ProcessManageFinance>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductSale)
    private readonly productSaleRepository: Repository<ProductSale>,
    @InjectRepository(PercentDownFinance)
    private readonly percentDownFinanceRepository: Repository<PercentDownFinance>,
    @InjectRepository(RateFinance)
    private readonly rateFinanceRepository: Repository<RateFinance>,
  ) {}

  async create(
    createProcessManageFinanceDto: CreateProcessManageFinanceDto,
    req: FastifyRequest,
  ): Promise<any> {
    const user = (req as any).user;

    const product = await this.productRepository.findOne({
      where: { id: createProcessManageFinanceDto.productId },
    });

    if (user.type == 'ไฟแนนซ์') {
      if (product.createByUserId !== user.id) {
        return {
          message_error: `${MESSAGE_DENIED} ใช้ทรัพย์สิน: ${product.code}`,
        };
      }
    }

    const branch = await this.branchRepository.findOne({
      where: { id: user.branchId },
    });

    const currentDate = dayjs().format('YYYYMMDD');
    const prefix = `F${branch.code}${currentDate}`;

    const lastProcessManageFinance = await this.processManageFinanceRepository
      .createQueryBuilder('process_manage_finance')
      .where('process_manage_finance.branchId = :branchId', {
        branchId: branch.id,
      })
      .andWhere('process_manage_finance.code ILIKE :code', {
        code: `${prefix}%`,
      })
      .orderBy('process_manage_finance.code', 'DESC')
      .getOne();

    let runNumber = '0001';
    if (lastProcessManageFinance) {
      const latestRunNumber = parseInt(
        lastProcessManageFinance.code.slice(-4),
        10,
      );
      runNumber = (latestRunNumber + 1).toString().padStart(4, '0');
    }

    const percentDownFinance = await this.percentDownFinanceRepository.findOne({
      where: {
        productModelId: product.productModelId,
        productStorageId: product.productStorageId,
      },
    });

    let priceDown =
      percentDownFinance.isPromotions == '1'
        ? Number(percentDownFinance.priceDownPayment)
        : await this.calPriceDown(
            product.priceSale,
            percentDownFinance.percentDown,
          );

    product.priceDownPayment = priceDown;
    product.priceDownPaymentPercent = percentDownFinance.percentDown;

    await this.productRepository.update(product.id, product);

    const rateFinance = await this.rateFinanceRepository.findOne({
      where: {
        valueMonth: Number(product.valueMonth),
      },
    });

    let priceRemaining = product.priceSale - priceDown;

    let priceCommission =
      percentDownFinance.isPromotions == '1'
        ? Number(percentDownFinance.priceCommission)
        : await this.calPriceCommission(
            priceRemaining,
            rateFinance.percentCommission,
          );

    let priceReceive =
      priceRemaining + priceCommission - branch.priceBranchService;

    const processManageFinanceCode = `${prefix}${runNumber}`;
    const processManageFinance = this.processManageFinanceRepository.create({
      ...createProcessManageFinanceDto,
      createByUserId: user.id,
      branchId: user.branchId,
      code: processManageFinanceCode,
      isPromotions: percentDownFinance.isPromotions,
      priceDown: priceDown,
      priceCommission: priceCommission,
      priceReceive: priceReceive,
      priceBranchService: branch.priceBranchService,
      priceCost: product.priceCostBuy,
    });

    this.processManageFinanceRepository.save(processManageFinance);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${processManageFinance.code}`,
      data: processManageFinance.code,
    };
  }

  async calPriceDown(priceSale: number, percentDown: number) {
    let priceAdjusted = priceSale * (percentDown / 100);

    // Check if the number ends in "00"
    if (priceAdjusted % 100 === 0) {
      // If it ends in "00", keep it as is
      priceAdjusted = priceAdjusted;
    } else {
      // If it doesn't end in "00", round up to the next 100
      priceAdjusted = Math.ceil(priceAdjusted / 100) * 100;
    }

    return priceAdjusted;
  }

  async calPriceCommission(priceRemaining: number, percentCommission: number) {
    const num = priceRemaining * (percentCommission / 100);
    const unitDigit = num % 10; // หาหลักหน่วย
    const base = Math.floor(num / 10) * 10; // ตัดหลักหน่วย
    if (unitDigit <= 5) {
      return base; // ปัดเป็น 0
    } else {
      return base + 10; // ปัดเป็น 10
    }
  }

  async findAll(
    search: ManageProcessManageFinanceDto,
    req?: FastifyRequest,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = Math.max(1, Number(search.page) || 1);
    const pageSize = Math.min(200, Math.max(1, Number(search.pageSize) || 50));
    const offset = (page - 1) * pageSize;

    const qb = this.processManageFinanceRepository
      .createQueryBuilder('pmf')
      .leftJoin('pmf.create_by', 'create_by')
      .leftJoin('pmf.approve_by', 'approve_by')
      .leftJoin('pmf.product', 'product')
      .leftJoin('pmf.customer', 'customer')
      .leftJoin('product.productModel', 'productModel')
      .leftJoin('product.productColor', 'productColor')
      .leftJoin('product.productStorage', 'productStorage');

    qb.select([
      'pmf.id AS "process_manage_finance_id"',
      'pmf.code AS "process_manage_finance_code"',
      'pmf.createByUserId AS "process_manage_finance_createByUserId"',
      'pmf.priceBranchService AS "process_manage_finance_priceBranchService"',
      'pmf.priceCommission AS "process_manage_finance_priceCommission"',
      'pmf.priceCost AS "process_manage_finance_priceCost"',
      'pmf.priceDown AS "process_manage_finance_priceDown"',
      'pmf.priceReceive AS "process_manage_finance_priceReceive"',
      'pmf.approveByUserId AS "process_manage_finance_approveByUserId"',
      'pmf.productId AS "process_manage_finance_productId"',
      'pmf.customerId AS "process_manage_finance_customerId"',
      'pmf.create_date AS "process_manage_finance_create_date"',
      'pmf.note AS "process_manage_finance_note"',
      'pmf.isPromotions AS "process_manage_finance_isPromotions"',
      'pmf.status AS "process_manage_finance_status"',
      'pmf.branchId AS "process_manage_finance_branchId"',
      'pmf.fileProcessManageFinance AS "process_manage_finance_fileProcessManageFinance"',

      'create_by.name AS "create_by_name"',
      'approve_by.name AS "approve_by_name"',

      'product.id AS "product_id"',
      'product.code AS "product_code"',
      'product.imei AS "product_imei"',
      'product.batteryHealth AS "product_batteryHealth"',
      'product.productColorId AS "product_productColorId"',
      'product.productStorageId AS "product_productStorageId"',
      'product.productModelId AS "product_productModelId"',

      'customer.name AS "customer_name"',
      'customer.lastname AS "customer_lastname"',
      'customer.tel AS "customer_tel"',

      'productModel.id AS "productModel_id"',
      'productModel.name AS "productModel_name"',
      'productColor.name AS "productColor_name"',
      'productStorage.id AS "productStorage_id"',
      'productStorage.name AS "productStorage_name"',

      `CASE WHEN pmf.status = '1' THEN 'รอดำเนินการ'
          WHEN pmf.status = '2' THEN 'ยืนยัน'
          WHEN pmf.status = '3' THEN 'ปฏิเสธ'
          ELSE 'ไม่ระบุ' END AS "status_str"`,

      `CASE WHEN pmf.isPromotions = '1' THEN 'มีโปรโมชั่น'
          ELSE 'ไม่มีโปรโมชั่น' END AS "promotions_str"`,
    ]);

    // === Filters ===
    if (search.status && search.status !== '0') {
      qb.andWhere('pmf.status = :status', { status: search.status });
    }
    if (search.search) {
      const term = `%${search.search}%`;
      qb.andWhere(
        '(pmf.code ILIKE :term OR productModel.name ILIKE :term OR customer.name ILIKE :term)',
        { term },
      );
    }
    if (Number(search.branchId)) {
      qb.andWhere('pmf.branchId = :branchId', {
        branchId: Number(search.branchId),
      });
    }
    if (search.startDate && search.endDate) {
      qb.andWhere('pmf.create_date BETWEEN :start AND :end', {
        start: search.startDate,
        end: search.endDate,
      });
    }

    // === Total ===
    const countQb = qb.clone().select('COUNT(DISTINCT pmf.id)', 'cnt');
    const { cnt } = await countQb.getRawOne<{ cnt: string }>();
    const total = Number(cnt) || 0;

    // === Data + Pagination ===
    qb.orderBy('pmf.create_date', 'DESC').addOrderBy('pmf.id', 'DESC');
    qb.offset(offset).limit(pageSize);

    const data = await qb.getRawMany();

    return { data, total, page, pageSize };
  }

  async findOne(id: number): Promise<ProcessManageFinance | null> {
    return this.processManageFinanceRepository.findOne({ where: { id } });
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    await fs.ensureDir(this.uploadsPath);
    const files = await req.saveRequestFiles();

    const user = (req as any).user;
    const { status, note } = req.body as any;

    const existingProcessManageFinance =
      await this.processManageFinanceRepository.findOne({
        where: { id },
      });

    if (existingProcessManageFinance.status != '1') {
      return {
        message_error: `${existingProcessManageFinance.code} ถูกดำเนินการไปแล้ว`,
      };
    }

    if (user.type === 'ไฟแนนซ์') {
      if (existingProcessManageFinance.status !== status) {
        return {
          message_error: `${MESSAGE_PERMISSION_DENIED}: ${existingProcessManageFinance.code}`,
        };
      }
    } else {
      if (existingProcessManageFinance.status !== status) {
        // return {
        //   message_error: `${MESSAGE_PERMISSION_DENIED}: ${existingProcessManageFinance.code}`,
        // };
      }
    }

    const updateData = {
      approveByUserId: user.id,
      status: status?.value || existingProcessManageFinance.status,
      note: note?.value || existingProcessManageFinance.note,
      fileProcessManageFinance:
        existingProcessManageFinance.fileProcessManageFinance,
    };

    let filePath = existingProcessManageFinance.fileProcessManageFinance;

    if (files.length > 0) {
      await fs.ensureDir(
        `${this.uploadsPath}/${existingProcessManageFinance.code}`,
      );

      // Delete existing file if it exists
      if (filePath && (await fs.pathExists(filePath))) {
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.error(`Failed to delete existing file ${filePath}:`, error);
          // Continue execution even if deletion fails to avoid blocking the update
        }
      }

      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const buffer = await fs.readFile(file.filepath);
        const randomName = generateRandomString(6);
        const filename = `${randomName}-${index}.png`;
        filePath = path.join(
          `${this.uploadsPath}/${existingProcessManageFinance.code}`,
          filename,
        );
        await sharp(buffer)
          .png({ quality: 80, progressive: true })
          .toFile(filePath);

        updateData.fileProcessManageFinance = filePath;
      }
    }

    await this.processManageFinanceRepository.update(id, updateData);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${existingProcessManageFinance.code}`,
    };
  }
}
