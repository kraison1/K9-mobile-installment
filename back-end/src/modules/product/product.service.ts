import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductSaleSearchDto, ProductSearchDto } from 'src/helper/search.dto';
import {
  Between,
  Equal,
  In,
  Like,
  MoreThan,
  Not,
  Raw,
  Repository,
} from 'typeorm';
import { Product } from './entities/product.entity';
import { Branch } from '../branchs/entities/branch.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { CreateProductLogDto } from '../product-log/dto/create-product-log.dto';
import { ProductBrand } from '../product-brands/entities/product-brand.entity';
import dayjs from 'src/configs/dayjs-config';
import { FastifyRequest } from 'fastify';

import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { ProductImage } from '../product-image/entities/product-image.entity';
import { isArray, isEmpty } from 'lodash';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductLog } from '../product-log/entities/product-log.entity';
import {
  MESSAGE_DELETE_SUCCESS,
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { ProductBook } from '../product-book/entities/product-book.entity';
import { ProductSaving } from '../product-saving/entities/product-saving.entity';
import { generateRandomString } from 'src/helper/generateRandomString';
import { toIntegerOrNull, trimString } from 'src/helper/transformValue';
import { RedisService } from 'src/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/users.service';
// import { ProductPrice } from '../product-price/entities/product-price.entity';
import { TelegramNotificationService } from '../telegram-notification/telegram-notification.service';
import { formatNumberDigit } from 'src/helper/formatNumber';
import { formatDateTH } from 'src/helper/formatDate';
import PdfPrinter from 'pdfmake/src/printer';
import { Customer } from '../customer/entities/customer.entity';
import { User } from '../users/entities/user.entity';
import { TransferProductBranchList } from 'src/modules/transfer-product-branch-lists/entities/transfer-product-branch-list.entity';
import { ProductRepairList } from '../product-repair-lists/entities/product-repair-list.entity';

@Injectable()
export class ProductService {
  private readonly uploadsPath = path.join('uploads/products');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    @InjectRepository(ProductBrand)
    private readonly productBrandRepository: Repository<ProductBrand>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ProductSale)
    private readonly productSaleRepository: Repository<ProductSale>,

    @InjectRepository(ProductBook)
    private readonly productBookRepository: Repository<ProductBook>,

    @InjectRepository(ProductSaving)
    private readonly productSavingRepository: Repository<ProductSaving>,

    private readonly productLogService: ProductLogService,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    @InjectRepository(ProductRepairList)
    private readonly productRepairListRepository: Repository<ProductRepairList>,

    private readonly telegramNotificationService: TelegramNotificationService,

    private redisService: RedisService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    await fs.ensureDir(this.uploadsPath);

    const files = await req.saveRequestFiles();

    const {
      payPerMonth,
      valueMonth,
      refOldStockNumber,
      code,
      imei,
      catalog,
      batteryHealth,
      shopInsurance,
      shopCenterInsurance,
      shopCenterInsuranceDate,
      hand,
      simType,
      randomCode,
      boxType,
      freeGift,
      machineCondition,
      priceCostBuy,
      priceWholeSale,
      priceSale,
      priceReRider,
      priceRegAppleId,
      priceRepair,
      priceDownPayment,
      priceDownPaymentPercent,
      priceCommission,
      productTypeId,
      productColorId,
      productStorageId,
      productBrandId,
      productModelId,
      venderId,
      branchId,
      createByUserId,
      amount,
      active,
      isFinance,
      buyFormShop,
    } = req.body as any;

    // Normalize values to either the object's value or null
    const values = {
      refOldStockNumber: refOldStockNumber?.value ?? null,
      payPerMonth: toIntegerOrNull(payPerMonth?.value),
      valueMonth: valueMonth?.value ?? '6',
      code: code?.value ?? null,
      catalog: catalog?.value ?? null,
      // imei: imei?.value.trim() ?? null,
      imei: trimString(imei?.value),
      batteryHealth: batteryHealth?.value ?? null,
      shopInsurance: shopInsurance?.value ?? null,
      shopCenterInsurance: shopCenterInsurance?.value ?? null,
      shopCenterInsuranceDate: shopCenterInsuranceDate?.value ?? null,
      hand: hand?.value ?? null,
      simType: simType?.value ?? null,
      randomCode: randomCode?.value ?? null,
      boxType: boxType?.value ?? null,
      freeGift: freeGift?.value ?? null,
      machineCondition: machineCondition?.value ?? null,
      priceCostBuy: priceCostBuy?.value ?? 0,
      priceWholeSale: priceWholeSale?.value ?? 0,
      priceSale: priceSale?.value ?? 0,
      priceReRider: priceReRider?.value ?? 0,
      priceRegAppleId: priceRegAppleId?.value ?? 0,
      isFinance: isFinance?.value ?? '0',
      priceRepair: priceRepair?.value ?? 0,
      priceDownPayment: priceDownPayment?.value ?? 0,
      priceDownPaymentPercent: priceDownPaymentPercent?.value ?? 0,
      priceCommission: priceCommission?.value ?? 0,
      productTypeId: productTypeId?.value ?? null,
      productColorId: productColorId?.value ?? null,
      productStorageId: productStorageId?.value ?? null,
      productBrandId: productBrandId?.value ?? null,
      productModelId: productModelId?.value ?? null,
      venderId: venderId?.value ?? null,
      branchId: user.branchId,
      createByUserId: user.id,
      amount: catalog?.value == 'มือถือ' ? 1 : 0,
      active: active?.value ?? null,
      buyFormShop: buyFormShop?.value ?? '',
    };

    type BuyFromShop = { id: number; name: string; lastname: string };

    let findBuyFormShop: BuyFromShop | null = null;

    if (values.buyFormShop.trim() == '' && values.catalog == 'มือถือ') {
      if (values.isFinance === '1') {
        findBuyFormShop = (await this.userRepository.findOne({
          where: { id: user.id },
          select: ['id', 'name', 'lastname'],
        })) as BuyFromShop | null;
      } else {
        findBuyFormShop = (await this.customerRepository.findOne({
          where: { id: values.venderId },
          select: ['id', 'name', 'lastname'],
        })) as BuyFromShop | null;
      }

      if (findBuyFormShop) {
        values.buyFormShop = `${findBuyFormShop.name} ${findBuyFormShop.lastname}`;
      }
    }

    if (user.type == 'ไฟแนนซ์') {
      values.priceCostBuy = values.priceSale;
      values.priceWholeSale = values.priceSale;
    }

    // if (values.imei != undefined) {
    //   const checkImei = await this.productRepository.findOne({
    //     where: { imei: values.imei },
    //   });

    //   if (!isEmpty(checkImei)) {
    //     return { message_error: `เลขอีมี่ ซ้ำ : ${checkImei.code}` };
    //   }
    // }

    // Assuming branch and brand are valid and exist
    const branch = await this.branchRepository.findOne({
      where: { id: values.branchId },
    });

    const productBrand = await this.productBrandRepository.findOne({
      where: { id: values.productBrandId },
    });

    const date = dayjs();
    const dateCode = date.format('YYYYMMDD');
    const startOfDay = date.startOf('day').toDate();
    const endOfDay = date.endOf('day').toDate();

    const productsCount = await this.productRepository.count({
      where: {
        branchId: values.branchId,
        create_date: Between(startOfDay, endOfDay),
      },
    });

    const runNumber = String(productsCount + 1).padStart(4, '0');

    if (randomCode.value == '1' && values.catalog == 'มือถือ') {
      if (process.env.SYSTEM_BY == 'AAA') {
        values.code = `${productBrand.code}${branch.code}${dateCode}${runNumber}`;
      } else {
        values.code = `${branch.code}${dateCode}${runNumber}`;
      }
    } else {
      values.code = `${productBrand.code}${branch.code}${dateCode}${runNumber}`;
    }

    if (values.catalog == 'มือถือ') {
      values.amount = 1;
    } else {
      values.amount = 0;
    }
    const newProduct = this.productRepository.create(values);
    const savedProduct = await this.productRepository.save(newProduct);

    let isBuy = '1';

    if (savedProduct.isFinance == '1' || savedProduct.catalog != 'มือถือ') {
      isBuy = '2';
    }

    if (files && files.length > 0) {
      await fs.ensureDir(`${this.uploadsPath}/${savedProduct.code}`);
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const buffer = await fs.readFile(file.filepath);
        const randomName = generateRandomString(6);
        const filename = `${randomName}-${index}.png`;
        const filePath = path.join(
          `${this.uploadsPath}/${savedProduct.code}`,
          filename,
        );
        await sharp(buffer)
          .png({ quality: 80, progressive: true })
          .toFile(filePath);

        const newProductImage = this.productImageRepository.create({
          name: filePath,
          seq: index + 1,
          productId: savedProduct.id,
          userId: newProduct.createByUserId,
          isProductBuy: isBuy,
        });

        const savedImage =
          await this.productImageRepository.save(newProductImage);
        if (index === 0 && isBuy == '2') {
          // First file
          savedProduct.fileProduct = savedImage.name;
          await this.productRepository.save(savedProduct); // Update the product with the first image file name
        }
      }
    }

    if (savedProduct.catalog == 'มือถือ') {
      const infoProduct = await this.productRepository.findOne({
        where: { id: savedProduct.id },
        relations: ['productModel', 'productStorage', 'productColor'],
      });
      const messageBuyProduct = `นำมือถือเข้าคลัง : ${branch.name}
        * imei: ${savedProduct.imei}
        * รุ่น: ${infoProduct?.productModel?.name || ''}
        * ความจุ: ${infoProduct?.productStorage?.name || ''}
        * สี: ${infoProduct?.productColor?.name || ''}
        * ประเภท: ${savedProduct.hand}
        * ราคา: ${formatNumberDigit(savedProduct.priceCostBuy)}`;

      await this.telegramNotificationService.sendTelegramNotify({
        botToken: branch.token_bot,
        chatId: branch.room_id_buyProduct,
        message: messageBuyProduct,
      });

      const productLogDto: CreateProductLogDto = {
        productId: savedProduct.id,
        action: 'ซื้อเข้า',
        obj: JSON.stringify({ before: savedProduct }),
        branchId: savedProduct.branchId,
        userId: newProduct.createByUserId,
      };
      await this.productLogService.create(productLogDto);
    } else {
      const productLogDto: CreateProductLogDto = {
        productId: savedProduct.id,
        action: 'สร้างรายการสินค้า',
        obj: JSON.stringify({ before: savedProduct }),
        branchId: savedProduct.branchId,
        userId: newProduct.createByUserId,
      };
      await this.productLogService.create(productLogDto);
    }

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${savedProduct.code}`,
      data: await this.findOne(savedProduct.id, isBuy),
    };
  }

  async fetchPermission(user: any) {
    const cacheKey = `${this.configService.get<string>('REDIS_PERMISSION_KEY')}${user.userGroupId}`;
    let permissions: string[] = [];

    // ลองดึงจาก Redis
    const cachedPermissions = await this.redisService.get(cacheKey);
    if (cachedPermissions) {
      permissions = JSON.parse(cachedPermissions);
    } else {
      // ถ้าไม่มีใน Redis ให้ดึงจาก database (เหมือนใน JwtAuthGuard)
      const fullUser = await this.userService.findOneWithRelations({
        select: ['id', 'userGroupId'],
        where: { id: user.id },
        relations: ['userGroup'],
      });

      permissions = fullUser.userGroup?.permissions || [];

      // เก็บใน Redis ถ้า Redis ทำงาน
      if (this.redisService.isInitialized()) {
        await this.redisService.set(
          cacheKey,
          JSON.stringify(permissions),
          3600,
        );
      }
    }

    return permissions;
  }

  async createMultiple(createProductDtos: CreateProductDto[]): Promise<any> {
    const imeis = createProductDtos.map((dto) => dto.imei).filter(Boolean);
    const branchIds = [
      ...new Set(createProductDtos.map((dto) => dto.branchId ?? 1)),
    ];
    const brandIds = [
      ...new Set(createProductDtos.map((dto) => dto.productBrandId ?? 1)),
    ];

    const [existingProducts, branches, brands] = await Promise.all([
      this.productRepository.find({
        where: { imei: In(imeis) },
        select: ['imei', 'code'],
      }),
      this.branchRepository.find({ where: { id: In(branchIds) } }),
      this.productBrandRepository.find({ where: { id: In(brandIds) } }),
    ]);

    const existingImeiMap = new Map(
      existingProducts.map((p) => [p.imei, p.code]),
    );
    const branchMap = new Map(branches.map((b) => [b.id, b]));
    const brandMap = new Map(brands.map((b) => [b.id, b]));

    const date = dayjs();
    const dateCode = date.format('YYYYMMDD');
    const startOfDay = date.startOf('day').toDate();
    const endOfDay = date.endOf('day').toDate();

    let newProductCount = 0;
    let dupImei = [];
    let newItem = [];
    let sumCostPrice = 0;
    const telegramMessages: string[] = [];

    for (const dto of createProductDtos) {
      const values: Partial<Product> = {
        // คงค่าเดิมไว้
        payPerMonth: dto.payPerMonth,
        valueMonth: dto.valueMonth,
        refOldStockNumber: dto.refOldStockNumber,
        code: null,
        imei: dto.imei ?? null,
        catalog: dto.catalog ?? 'มือถือ',
        batteryHealth: dto.batteryHealth ?? 100,
        shopInsurance: dto.shopInsurance ?? '0',
        shopCenterInsurance: dto.shopCenterInsurance ?? '0',
        hand: dto.hand ?? 'มือสอง',
        simType: dto.simType ?? '0',
        randomCode: dto.randomCode ?? '1',
        simName: '',
        boxType: dto.boxType ?? '0',
        freeGift: dto.freeGift ?? '0',
        machineCondition: dto.machineCondition ?? 95,
        priceCostBuy: dto.priceCostBuy ? Number(dto.priceCostBuy) : 0,
        priceWholeSale: dto.priceWholeSale ? Number(dto.priceWholeSale) : 0,
        priceSale: dto.priceSale ? Number(dto.priceSale) : 0,
        priceDownPayment: dto.priceDownPayment ?? 0,
        priceDownPaymentPercent: dto.priceDownPaymentPercent ?? 0,
        priceRepair: dto.priceRepair ?? 0,
        priceReRider: dto.priceReRider ?? 0,
        priceRegAppleId: dto.priceRegAppleId ?? 0,
        priceETC: dto.priceETC ?? 0,
        priceCommission: dto.priceCommission ?? 300,
        productTypeId: dto.productTypeId ?? 1,
        productColorId: dto.productColorId ?? 1,
        productStorageId: dto.productStorageId ?? 1,
        productBrandId: dto.productBrandId ?? 1,
        productModelId: dto.productModelId ?? 1,
        branchId: dto.branchId ?? 1,
        createByUserId: dto.createByUserId ?? 1,
        amount: dto.amount ?? 0,
        venderId: dto.venderId ?? null,
        buyFormShop: dto.buyFormShop ?? '',
        active: dto.active ?? '1',
        create_date: new Date(),
      };

      const existingProduct = values.imei && existingImeiMap.get(values.imei);
      if (isEmpty(existingProduct)) {
        await this.productRepository.manager.transaction(
          async (transactionalEntityManager) => {
            const branch = branchMap.get(values.branchId);
            const brand = brandMap.get(values.productBrandId);
            if (!branch || !brand) {
              throw new Error(
                `Branch or Brand not found for IMEI: ${values.imei}`,
              );
            }

            const productsCount = await transactionalEntityManager.count(
              Product,
              {
                where: {
                  branchId: values.branchId,
                  create_date: Between(startOfDay, endOfDay),
                },
              },
            );
            const runNumber = String(productsCount + 1).padStart(4, '0');
            values.code = `${brand.code}${branch.code}${dateCode}${runNumber}`;

            const newProduct = transactionalEntityManager.create(
              Product,
              values,
            );
            const savedProduct =
              await transactionalEntityManager.save(newProduct);
            newItem.push(savedProduct.id);
            newProductCount++;
          },
        );
      } else {
        dupImei.push({ imei: values.imei });
      }
    }

    let newProducts = [];
    const branch = await this.branchRepository.findOne({
      where: { id: branchIds[0] },
    });

    if (newItem.length > 0) {
      newProducts = await this.productRepository
        .createQueryBuilder('product')
        .select([
          'product.id',
          'product.code',
          'product.catalog',
          'product.refOldStockNumber',
          'product.hand',
          'product.shopCenterInsurance',
          'product.shopCenterInsuranceDate',
          'product.batteryHealth',
          'product.imei',
          'productModel.name',
          'productColor.name',
          'productStorage.name',
        ])
        .leftJoin('product.productModel', 'productModel')
        .leftJoin('product.productColor', 'productColor')
        .leftJoin('product.productStorage', 'productStorage')
        .where('product.id IN (:...ids)', { ids: newItem })
        .orderBy('product.code', 'ASC')
        .getMany();

      for (const savedProduct of newProducts) {
        // สร้าง log
        const productLogDto: CreateProductLogDto = {
          productId: savedProduct.id,
          action: 'ซื้อเข้า',
          obj: JSON.stringify({ before: savedProduct }),
          branchId: savedProduct.branchId,
          userId: savedProduct.createByUserId,
        };
        await this.productLogService.create(productLogDto);

        const infoProduct = await this.productRepository.findOne({
          where: { id: savedProduct.id },
          relations: ['productModel', 'productStorage', 'productColor'],
        });

        sumCostPrice += Number(infoProduct.priceCostBuy);
        const messageBuyProduct = `นำมือถือเข้าคลัง : ${branch.name}
* imei: ${savedProduct.imei}
* รุ่น: ${infoProduct?.productModel?.name || ''}
* ความจุ: ${infoProduct?.productStorage?.name || ''}
* สี: ${infoProduct?.productColor?.name || ''}
* ประเภท: ${infoProduct.hand}
* ราคา: ${formatNumberDigit(infoProduct.priceCostBuy)}`;

        telegramMessages.push(messageBuyProduct);
      }

      // เพิ่มสรุปท้าย
      const summaryMessage = `นำมือถือเข้าคลังประจำวันที่ : ${formatDateTH(dayjs())}
* รวมจำนวน: ${formatNumberDigit(newItem.length)} เครื่อง
* ยอดเงินรวม: ${formatNumberDigit(sumCostPrice)} บาท`;

      telegramMessages.push(summaryMessage);

      // ส่งข้อความ Telegram ครั้งเดียว
      if (telegramMessages.length > 0) {
        await this.telegramNotificationService.sendTelegramNotify({
          botToken: branch.token_bot,
          chatId: branch.room_id_buyProduct,
          message: telegramMessages.join('\n\n'),
        });
      }
    }

    if (dupImei.length > 0) {
      const dupImeiList = dupImei.map((item) => item.imei).join(', ');
      return {
        message_error: `มีเลข IMEI ซ้ำ: ${dupImeiList}`,
        newProducts,
      };
    } else if (newItem.length === 0) {
      return {
        message:
          'ไม่มีการสร้างสินค้าใหม่ อาจเนื่องจาก IMEI ซ้ำหรือไม่มีข้อมูลที่ถูกต้อง',
        newProducts: [],
      };
    } else {
      return {
        message: `สร้างสินค้าใหม่ ${newProductCount} รายการสำเร็จ`,
        newProducts,
      };
    }
  }

  async findAll(
    searchProductDto: ProductSearchDto,
    req: FastifyRequest,
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = Number(searchProductDto.page ?? 1);
    const pageSize = Number(searchProductDto.pageSize ?? 50);
    const skip = (page - 1) * pageSize;

    // ✅ ต้องการอิง isPaySuccess
    const paySuccessList = ['1', '2', '3', '4', '8', '7'];

    // ===============================
    // 1) SUBQUERY BUILDER (อ้าง alias "product" ได้)
    // ===============================
    const qbForSub = this.productRepository.createQueryBuilder('product');

    // latest transfer per product
    const latestTransferSubQuery = qbForSub
      .subQuery()
      .select('MAX(tpl2.id)')
      .from(TransferProductBranchList, 'tpl2')
      .where('tpl2.productId = product.id')
      .getQuery();

    const latestReturnSaleSubQuery = qbForSub
      .subQuery()
      .select('MAX(psr.id)')
      .from(ProductSale, 'psr')
      .where('psr.productId = product.id')
      .andWhere('psr.isPaySuccess = :isPaySuccess')
      .getQuery();

    // latest sale per product (อิง isPaySuccess)
    const latestSaleSubQuery = qbForSub
      .subQuery()
      .select('MAX(ps2.id)')
      .from(ProductSale, 'ps2')
      .where('ps2.productId = product.id')
      .andWhere('ps2.isPaySuccess IN (:...paySuccessList)')
      .getQuery();

    // ===============================
    // 2) FILTERS (ใช้ร่วมกัน count/data)
    // ===============================
    const applyFilters = (
      qb: ReturnType<typeof this.productRepository.createQueryBuilder>,
    ) => {
      qb.andWhere('product.catalog = :catalog', {
        catalog: searchProductDto.catalog,
      });

      if (searchProductDto.branchId && searchProductDto.branchId !== 0) {
        qb.andWhere('product.branchId = :branchId', {
          branchId: searchProductDto.branchId,
        });
      }

      if (
        Array.isArray(searchProductDto.productBrandId) &&
        searchProductDto.productBrandId.length > 0
      ) {
        qb.andWhere('product_brand.id IN (:...productBrandId)', {
          productBrandId: searchProductDto.productBrandId,
        });
      }

      if (
        Array.isArray(searchProductDto.productModelId) &&
        searchProductDto.productModelId.length > 0
      ) {
        qb.andWhere('product_model.id IN (:...productModelId)', {
          productModelId: searchProductDto.productModelId,
        });
      }

      if (
        Array.isArray(searchProductDto.productTypeId) &&
        searchProductDto.productTypeId.length > 0
      ) {
        qb.andWhere('product_type.id IN (:...productTypeId)', {
          productTypeId: searchProductDto.productTypeId,
        });
      }

      if (searchProductDto.search) {
        qb.andWhere(
          `(
          product.code ILIKE :search OR
          product.imei ILIKE :search OR
          product."buyFormShop" ILIKE :search OR
          product."refOldStockNumber" ILIKE :search OR
          product_model.name ILIKE :search OR
          product_brand.name ILIKE :search OR
          product_type.name ILIKE :search
        )`,
          { search: `%${searchProductDto.search}%` },
        );
      }

      if (searchProductDto.active && searchProductDto.active !== '2') {
        qb.andWhere('product.active = :active', {
          active: searchProductDto.active,
        });

        if (searchProductDto.catalog != 'มือถือ') {
          qb.andWhere('product.amount > :amount', { amount: 0 });
        }
      }

      return qb;
    };

    // ===============================
    // 3) COUNT QUERY (ไม่ลาก one-to-many)
    // ===============================
    const countQb = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.productBrand', 'product_brand')
      .leftJoin('product.productModel', 'product_model')
      .leftJoin('product.productType', 'product_type');

    applyFilters(countQb);

    const totalRow = await countQb
      .select('COUNT(DISTINCT product.id)', 'cnt')
      .getRawOne<{ cnt: string }>();

    const total = Number(totalRow?.cnt ?? 0);

    // ===============================
    // 4) DATA QUERY
    // ===============================
    const dataQb = this.productRepository.createQueryBuilder('product');

    dataQb
      // ---- base joins ----
      .leftJoin('product.productBrand', 'product_brand')
      .leftJoin('product.productModel', 'product_model')
      .leftJoin('product.productColor', 'product_color')
      .leftJoin('product.productStorage', 'product_storage')
      .leftJoin('product.productType', 'product_type')
      .leftJoin('product.branch', 'branch')
      .leftJoin('product.vender', 'vender')
      .leftJoin('product.create_by', 'user')

      // ✅ รูปสินค้า buy=1
      .leftJoin(
        'product.productImages',
        'product_images',
        'product_images.isProductBuy = :buy',
        { buy: '1' },
      )

      // ✅ latest transfer list
      .leftJoin(
        'product.transferProductBranchList',
        'transfer_list',
        `transfer_list.id = (${latestTransferSubQuery})`,
      )
      .leftJoin('transfer_list.transferProductBranch', 'transfer_branch')
      .leftJoin('transfer_branch.branch', 'branch_source')

      .leftJoinAndMapOne(
        'product.productReturnSaleLatest',
        ProductSale,
        'product_return_latest',
        `product_return_latest.id = (${latestReturnSaleSubQuery})`,
      )
      .setParameters({
        paySuccessList,
        isPaySuccess: '6', // ✅ เพิ่มตัวนี้
      })

      // ✅ map sale ล่าสุดเข้า product.productSaleLatest
      .leftJoinAndMapOne(
        'product.productSaleLatest',
        ProductSale,
        'product_sale_latest',
        `product_sale_latest.id = (${latestSaleSubQuery})`,
      )

      // ✅ join ต่อไปที่ create_by ของ sale ล่าสุด
      .leftJoin('product_sale_latest.create_by', 'sale_creator')

      // ✅ join ต่อไปที่ branch ของ create_by (ตามที่ลูกค้าขอ)
      .leftJoin('sale_creator.branch', 'sale_creator_branch')

      // ✅ parameters ของ subquery
      .setParameters({ paySuccessList });

    applyFilters(dataQb);

    // ✅ SELECT เฉพาะที่จำเป็น + saleLatest แค่ id, code
    dataQb.select([
      'product',

      'product_brand.id',
      'product_brand.name',

      'product_model.id',
      'product_model.name',

      'product_color.id',
      'product_color.name',

      'product_storage.id',
      'product_storage.name',

      'product_type.id',
      'product_type.name',

      'branch.id',
      'branch.name',

      'user.id',
      'user.name',

      // images (ถ้าต้องการแสดง)
      'product_images.id',
      'product_images.name',
      'product_images.seq',

      // transfer (ถ้าต้องการแสดง)
      'transfer_list.id',
      'transfer_branch.id',
      'transfer_branch.code',
      'branch_source.id',
      'branch_source.name',

      // ✅ sale ล่าสุด: เอาแค่ id, code
      'product_sale_latest.id',
      'product_sale_latest.code',

      // ✅ คนสร้าง sale
      'sale_creator.id',
      'sale_creator.name',

      // ✅ สาขาของคนสร้าง sale
      'sale_creator_branch.id',
      'sale_creator_branch.name',

      // ✅ return ล่าสุด (เพิ่ม!)
      'product_return_latest.id',
      'product_return_latest.code',
    ]);

    // ✅ ORDER BY (อย่าใช้ alias ที่ซ้ำ/แปลก)
    if (searchProductDto.catalog != 'มือถือ') {
      dataQb.orderBy('product_type.name', 'ASC');
    }

    dataQb
      .addOrderBy('product_brand.name', 'ASC')
      .addOrderBy('product_model.name', 'ASC')
      .addOrderBy('product_color.name', 'ASC')
      .addOrderBy('product_storage.name', 'ASC')
      .addOrderBy('product.batteryHealth', 'ASC')
      .addOrderBy('product.boxType', 'ASC')
      .addOrderBy('product.hand', 'ASC')
      .addOrderBy('product_images.seq', 'ASC')
      .addOrderBy('product_sale_latest.id', 'DESC');

    dataQb.skip(skip).take(pageSize);

    const products = await dataQb.getMany();

    return {
      data: products,
      total,
      page,
      pageSize,
    };
  }

  async findAllSales(
    searchDto: ProductSaleSearchDto,
    req: FastifyRequest,
  ): Promise<{
    data: ProductRepairList[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const datStart = dayjs(searchDto.startDate).format('YYYY-MM-DD HH:mm:ss');
    const datEnd = dayjs(searchDto.endDate).format('YYYY-MM-DD HH:mm:ss');

    const qb = this.productRepairListRepository
      .createQueryBuilder('list')
      .innerJoinAndSelect('list.productRepair', 'repair')
      .leftJoin('repair.create_by', 'user')
      .leftJoin('list.product', 'product')
      .leftJoin('product.productBrand', 'product_brand')
      .leftJoin('product.productModel', 'product_model')
      .leftJoin('product.productColor', 'product_color')
      .leftJoin('product.productStorage', 'product_storage')
      .leftJoin('product.productType', 'product_type')
      .leftJoin(
        'product.productImages',
        'product_images',
        'product_images.isProductBuy = :buy',
        { buy: '2' },
      );

    qb.select([
      // ----- product_sale_list -----
      'list.id',
      'list.productName',
      'list.amount',
      'list.priceCostBuy',
      'list.priceSale',
      'list.priceProfit',
      'list.productId',
      'list.isFree',
      'list.catalog',
      'list.priceSale',
      'list.create_date',
      'list.buyFormShop',

      // ----- product_repair -----
      'repair.create_date',
      'repair.code',
      'user.id',
      'user.name',

      // ----- product -----
      'product.id',
      'product.code',

      'product_images.id',
      'product_images.productId',
      'product_images.name',

      // ----- brand / model -----
      'product_brand.id',
      'product_brand.name',
      'product_model.id',
      'product_model.name',
      'product_color.id',
      'product_color.name',
      'product_storage.id',
      'product_storage.name',
      'product_type.id',
      'product_type.name',
    ]);

    // 1) Branch
    if (searchDto.branchId) {
      qb.andWhere('repair.branchId = :branchId', {
        branchId: searchDto.branchId,
      });
    }

    // 2) Date range
    if (searchDto.startDate && searchDto.endDate) {
      qb.andWhere('repair.create_date BETWEEN :startDate AND :endDate', {
        startDate: datStart,
        endDate: datEnd,
      });
    }

    // 4) Catalog map
    if (searchDto.catalog) {
      qb.andWhere('list.catalog IN (:...catalogs)', {
        catalogs: ['อะไหล่ซ่อม'],
      });
    }

    // 5) Brand / Type filters
    if (
      Array.isArray(searchDto.productBrandId) &&
      searchDto.productBrandId.length
    ) {
      qb.andWhere('product."productBrandId" IN (:...brandIds)', {
        brandIds: searchDto.productBrandId,
      });
    }

    if (
      Array.isArray(searchDto.productTypeId) &&
      searchDto.productTypeId.length
    ) {
      qb.andWhere('product."productTypeId" IN (:...typeIds)', {
        typeIds: searchDto.productTypeId,
      });
    }

    // 6) Search
    if (searchDto.search && searchDto.search.trim()) {
      const q = `%${searchDto.search.trim()}%`;
      qb.andWhere(
        `(
          product.code ILIKE :search OR
          product_model.name ILIKE :search OR
          product_brand.name ILIKE :search OR
          product_type.name ILIKE :search
        )`,
        { search: `%${q}%` },
      );
    }
    // qb.addOrderBy('product_brand.name', 'ASC')
    //   .addOrderBy('product_brand.name', 'ASC')
    //   .addOrderBy('product_model.name', 'ASC')
    //   .addOrderBy('product_color.name', 'ASC')
    //   .addOrderBy('product_storage.name', 'ASC');

    // Count (เหมือนเดิม)
    const total = await qb.getCount();

    // Pagination + sort (✅ ไม่ใช้ alias ซ้ำ)
    qb.orderBy('repair.create_date', 'DESC')
      // .addOrderBy('list.id', 'ASC')
      .skip((searchDto.page - 1) * searchDto.pageSize)
      .take(searchDto.pageSize);

    const data = await qb.getMany();

    return {
      data,
      total,
      page: searchDto.page,
      pageSize: searchDto.pageSize,
    };
  }

  async getSelect(
    branchId: number,
    catalog: string,
    search: string,
    active: string,
    req: FastifyRequest,
  ): Promise<
    Pick<
      Product,
      | 'id'
      | 'code'
      | 'imei'
      | 'priceWholeSale'
      | 'priceSale'
      | 'payPerMonth'
      | 'valueMonth'
      | 'priceDownPayment'
      | 'priceDownPaymentPercent'
      | 'priceCostBuy'
      | 'catalog'
      | 'amount'
    >[]
  > {
    const user = (req as any).user;

    const query = this.productRepository
      .createQueryBuilder('products')
      .select([
        'products.id',
        'products.code',
        'products.payPerMonth',
        'products.valueMonth',
        'products.imei',
        'products.priceWholeSale',
        'products.priceSale',
        'products.priceDownPayment',
        'products.priceDownPaymentPercent',
        'products.priceCostBuy',
        'products.catalog',
        'products.buyFormShop',
        'products.amount',
      ]);

    if (active && active.includes(',')) {
      // ถ้า active มี comma, แปลว่ามีหลายค่า
      query.where('products.active IN (:...activeStatuses)', {
        activeStatuses: active.split(','),
      });
    } else if (active) {
      // ถ้ามีค่าเดียว
      query.where('products.active = :active', { active: active });
    }
    let permissions = await this.fetchPermission(user);

    if (permissions.includes('view-all-products') && catalog != 'มือถือ') {
    } else {
      if (!permissions.includes('view-all-branches')) {
        query.andWhere('products.branchId = :branchId', { branchId });
      }
      query.andWhere('products.catalog = :catalog', { catalog });
    }

    if (active.includes(',')) {
    } else {
      query.andWhere('products.amount > :amount', { amount: 0 });
    }

    if (!search || search.trim() === '' || search === 'null') {
      query.orderBy('RANDOM()').limit(50);
    } else {
      query.andWhere(
        '(products.id::text ILIKE :search OR products.code ILIKE :search OR products.imei ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return query.getMany();
  }

  async getSelectByCatalog(body: any): Promise<any> {
    const { catalog, productBrandId, branchId } = body;

    // 1) ให้แน่ใจว่า catalog เป็น array
    const catalogArray = Array.isArray(catalog)
      ? catalog
      : catalog != null
        ? [catalog]
        : [];

    if (catalogArray.length === 0) {
      return [];
    }

    // 2) เตรียม brandId เป็น array ที่สะอาด
    const brandArray = (
      Array.isArray(productBrandId)
        ? productBrandId
        : productBrandId != null
          ? [productBrandId]
          : []
    ).filter((b) => b !== null && b !== undefined);

    // 3) แปลงเป็น Postgres array literal -> '{มือถือ}' หรือ '{มือถือ,แท็บเล็ต}'
    const pgCatalogArrayLiteral = `{${catalogArray.join(',')}}`;

    // 4) สร้าง QueryBuilder ให้เร็วขึ้น: INNER JOIN + DISTINCT
    const qb = this.productRepository
      .createQueryBuilder('product')
      .innerJoin('product.productModel', 'productModel')
      .select(['productModel.id AS id', 'productModel.name AS name'])
      .distinct(true) // <<<<< สำคัญ ให้ DISTINCT มาอยู่หน้า SELECT
      .where('productModel.catalog && :catalog', {
        catalog: pgCatalogArrayLiteral,
      })
      .andWhere('productModel.active = :active', { active: '1' })
      .andWhere('productModel.id IS NOT NULL');

    // 5) filter ตาม brand ถ้ามี
    if (brandArray.length > 0) {
      qb.andWhere('product.productBrandId IN (:...productBrandId)', {
        productBrandId: brandArray,
      });
    }

    // 6) filter branch เฉพาะตอน branchId != 0
    // if (branchId != null && Number(branchId) !== 0) {
    //   qb.andWhere('product.branchId = :branchId', { branchId });
    // }

    const productModels = await qb
      .orderBy('productModel.name', 'ASC')
      .getRawMany();

    return productModels;
  }

  async getScan(
    branchId: number,
    catalog: string,
    search: string,
    active: string,
    req: FastifyRequest,
  ): Promise<any> {
    const user = (req as any).user;

    if (!branchId || !search?.trim()) {
      return { message_error: `กรุณา ระบุสาขา` };
    }

    const sanitizedCatalog = catalog?.trim();
    const whereConditions: any = {
      active: active,
      // ...(catalog?.trim() && { catalog: catalog }),
      code: Raw(
        () =>
          `"Product"."code" ILIKE '%${search.trim()}%' OR "Product"."imei" ILIKE '%${search.trim()}%' OR "Product"."refOldStockNumber" ILIKE '%${search.trim()}%'`,
      ),
    };

    // Fetch permissions (assumed to return string[])
    const permissions = await this.fetchPermission(user);

    // Adjust based on your permission logic

    if (
      !permissions.includes('view-all-products') ||
      sanitizedCatalog != 'มือถือ'
    ) {
      if (sanitizedCatalog) {
        whereConditions.catalog = sanitizedCatalog;
      }
      whereConditions.branchId = branchId;
    }

    const product = await this.productRepository.findOne({
      where: whereConditions,
      relations: ['productModel', 'productBrand', 'productColor'],
      select: [
        'id',
        'code',
        'imei',
        'priceWholeSale',
        'payPerMonth',
        'valueMonth',
        'priceSale',
        'priceDownPayment',
        'priceDownPaymentPercent',
        'priceCostBuy',
        'buyFormShop',
        'catalog',
        'amount',
      ],
    });

    if (!product) {
      return { message_error: `ไม่พบสินค้า` };
    }

    if (product.active == '4') {
      return { message_error: `สินค้าหมด` };
    }

    if (catalog == 'มือถือ') {
      return [product];
    } else {
      return product;
    }
  }

  // cutBefore2025 = (code) => {
  //   // หาตำแหน่งของ "2025"
  //   const index = code.indexOf('2025');

  //   // ถ้าเจอ "2025"
  //   if (index !== -1) {
  //     // ตัดตั้งแต่ตัวก่อนหน้า "2025" (index - 1) เป็นต้นไป
  //     // ซึ่งจะให้ส่วนตั้งแต่ "2025" ถึงท้ายสตริง
  //     return code.substring(index);
  //   }

  //   // ถ้าไม่เจอ "2025"
  //   return null; // หรือจัดการตามที่ต้องการ
  // };

  async findOne(id: number, buy: string = '2'): Promise<Product | null> {
    // const products = await this.productRepository.find({
    //   where: { catalog: Not('มือถือ'), active: '1' },
    // });

    // // Load all related productPrices in one query
    // const productIds = products.map(p => p.id);
    // const existingPrices = await this.productPriceRepository.find({
    //   where: { productId: In(productIds) },
    // });

    // // Create a Map for O(1) lookup
    // const priceMap = new Map<string, ProductPrice>();
    // existingPrices.forEach(price => {
    //   const key = `${price.productId}_${price.priceCostBuy}`;
    //   priceMap.set(key, price);
    // });

    // // Batch updates and creates
    // const updatePrices = [];
    // const createPrices = [];

    // for (let index = 0; index < products.length; index++) {
    //   const product = products[index];
    //   // product.code = this.cutBefore2025(product.code);
    //   const key = `${product.id}_${product.priceCostBuy}`;
    //   const productPrice = priceMap.get(key);

    //   if (!isEmpty(productPrice)) {
    //     productPrice.amount = product.amount;
    //     updatePrices.push(productPrice);
    //   } else {
    //     const newPrice = this.productPriceRepository.create({
    //       productId: product.id,
    //       priceCostBuy: product.priceCostBuy,
    //       amount: product.amount,
    //       branchId: product.branchId,
    //     });
    //     createPrices.push(newPrice);
    //   }

    //   // product.amountRemaining =
    //   //   Number(product.amount) + Number(product.amountSale);

    //   // await this.productRepository.update(product.id, product);
    // }

    // // Batch save all updates and creates
    // if (updatePrices.length > 0) {
    //   await this.productPriceRepository.save(updatePrices);
    // }
    // if (createPrices.length > 0) {
    //   await this.productPriceRepository.save(createPrices);
    // }

    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect(
        'product.productImages',
        'productImages',
        // กรองรูปในเงื่อนไข JOIN แทน
        'productImages.isProductBuy = :buy',
        { buy: buy }, // ให้ชนิดตรงกับคอลัมน์ (จากตัวอย่างเป็นสตริง)
      )
      .leftJoinAndSelect('product.productRepairs', 'productRepairs')
      .where('product.id = :id', { id })
      .orderBy('productRepairs.create_date', 'DESC')
      .addOrderBy('productImages.seq', 'ASC')
      .getOne();

    return product ?? null;

    // return this.productRepository.findOne({
    //   where: {
    //     id,
    //     productImages: {
    //       isProductBuy: '2',
    //     },
    //   },
    //   relations: ['productImages'],
    //   order: {
    //     productImages: {
    //       seq: 'ASC',
    //     },
    //   },
    // });
  }

  async findAccessibilityByProductId(
    id: number,
    req: FastifyRequest,
  ): Promise<any> {
    const user = (req as any).user;

    const productSaleLists = Object.keys(req.body).reduce((acc, key) => {
      const match = key.match(/^productSaleLists\[(\d+)\]\[(\w+)\]$/);
      if (match) {
        const [, index, field] = match;
        acc[index] = acc[index] || {};
        acc[index][field] = req.body[key].value;
      }
      return acc;
    }, []);

    const product = await this.productRepository.findOne({
      where: { id: id, branchId: user.branchId }, // Ensure product is in the user's branch
      relations: [
        'productModel',
        'productBrand',
        'productColor',
        'productType',
      ],
    });

    // if (!product) {
    //   return { message_error: 'ไม่พบข้อมูลสินค้า' };
    // }

    // const modelName = product.productModel.name.toLowerCase();

    // // 1. ค้นหาเคสและฟิล์มที่ตรงรุ่นในรายการขาย
    // const caseItemInList = productSaleLists.find(
    //   (item: any) =>
    //     item.productName.toLowerCase().includes('เคส') &&
    //     item.productName.toLowerCase().includes(modelName),
    // );

    // const filmItemInList = productSaleLists.find(
    //   (item: any) =>
    //     item.productName.toLowerCase().includes('ฟิมล์') &&
    //     item.productName.toLowerCase().includes(modelName),
    // );

    // console.log('caseItemInList', caseItemInList);
    // console.log('filmItemInList', filmItemInList);

    // // 2. ตรวจสอบสต็อกของเคสและฟิล์มที่ระบุในรายการขาย
    // const stockCase = await this.productRepository.findOneBy({
    //   id: Number(caseItemInList.productId),
    //   branchId: user.branchId,
    // });

    // const stockFilm = await this.productRepository.findOneBy({
    //   id: Number(filmItemInList.productId),
    //   branchId: user.branchId,
    // });

    // // if (!stockCase || stockCase.amount < Number(caseItemInList.amount)) {
    // //   return {
    // //     message_error: `สินค้า ${caseItemInList.productName} มีในสต็อกไม่เพียงพอ (ต้องการ ${caseItemInList.amount}, มี ${stockCase?.amount ?? 0})`,
    // //   };
    // // }
    // // if (!stockFilm || stockFilm.amount < Number(filmItemInList.amount)) {
    // //   return {
    // //     message_error: `สินค้า ${filmItemInList.productName} มีในสต็อกไม่เพียงพอ (ต้องการ ${filmItemInList.amount}, มี ${stockFilm?.amount ?? 0})`,
    // //   };
    // // }

    return product;
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    await fs.ensureDir(this.uploadsPath);

    const files = await req.saveRequestFiles();

    const {
      payPerMonth,
      valueMonth,
      refOldStockNumber,
      code,
      imei,
      catalog,
      batteryHealth,
      shopInsurance,
      shopCenterInsurance,
      shopCenterInsuranceDate,
      hand,
      simType,
      randomCode,
      boxType,
      freeGift,
      machineCondition,
      priceCostBuy,
      priceWholeSale,
      priceSale,
      priceReRider,
      priceRegAppleId,
      priceRepair,
      priceDownPayment,
      priceDownPaymentPercent,
      priceCommission,
      productTypeId,
      productColorId,
      productStorageId,
      productBrandId,
      productModelId,
      venderId,
      branchId,
      createByUserId,
      amount,
      active,
      updateByUserId,
      fileProduct,
      buyFormShop,
    } = req.body as any;

    const values = {
      payPerMonth: payPerMonth?.value ?? 0,
      valueMonth: valueMonth?.value ?? '6',
      refOldStockNumber: refOldStockNumber?.value ?? null,
      code: code?.value ?? null,
      imei: imei?.value ?? null,
      catalog: catalog?.value ?? null,
      batteryHealth: batteryHealth?.value ?? null,
      shopInsurance: shopInsurance?.value ?? null,
      shopCenterInsurance: shopCenterInsurance?.value ?? null,
      shopCenterInsuranceDate: shopCenterInsuranceDate?.value ?? null,
      hand: hand?.value ?? null,
      simType: simType?.value ?? null,
      randomCode: randomCode?.value ?? null,
      boxType: boxType?.value ?? null,
      freeGift: freeGift?.value ?? null,
      machineCondition: machineCondition?.value ?? null,
      priceCostBuy: priceCostBuy?.value ?? 0,
      priceWholeSale: priceWholeSale?.value ?? 0,
      priceSale: priceSale?.value ?? 0,
      priceReRider: priceReRider?.value ?? 0,
      priceRegAppleId: priceRegAppleId?.value ?? 0,
      priceRepair: priceRepair?.value ?? 0,
      priceDownPayment: priceDownPayment?.value ?? 0,
      priceDownPaymentPercent: priceDownPaymentPercent?.value ?? 0,
      priceCommission: priceCommission?.value ?? 300,
      productTypeId: productTypeId?.value ?? null,
      productColorId: productColorId?.value ?? null,
      productStorageId: productStorageId?.value ?? null,
      productBrandId: productBrandId?.value ?? null,
      productModelId: productModelId?.value ?? null,
      venderId: venderId?.value ?? null,
      branchId: branchId?.value ?? user.branchId,
      amount: amount?.value ?? 0,
      active: active?.value ?? null,
      updateByUserId: user.id,
      fileProduct: fileProduct?.value ?? null,
      buyFormShop: buyFormShop?.value ?? null,
    };

    const existingProduct = await this.productRepository.findOne({
      where: { id },
    });

    if (values.catalog == 'มือถือ') {
      if (values.active == '1') {
        values.amount = 1;
      }
      const productSale = await this.productSaleRepository.findOneBy({
        productId: id,
        isCancel: '0',
        isPaySuccess: Not(In(['5', '6'])),
      });

      if (
        !isEmpty(productSale) &&
        existingProduct.refOldStockNumber == refOldStockNumber
      ) {
        return {
          message_error: `ไม่สามารถอัพเดตได้เนื่องจากมีในสัญญา ${productSale.code}`,
        };
      }

      const productBook = await this.productBookRepository.findOneBy({
        productId: id,
        status: '1',
      });

      if (
        !isEmpty(productBook) &&
        existingProduct.refOldStockNumber == refOldStockNumber
      ) {
        return {
          message_error: `ไม่สามารถอัพเดตได้เนื่องจากมีในมัดจำ ${productBook.code}`,
        };
      }

      const productSaving = await this.productSavingRepository.findOneBy({
        productId: id,
        status: '1',
      });

      if (
        !isEmpty(productSaving) &&
        existingProduct.refOldStockNumber == refOldStockNumber
      ) {
        return {
          message_error: `ไม่สามารถอัพเดตได้เนื่องจากมีในออม ${productSaving.code}`,
        };
      }

      // const check = await this.productRepository.findOne({
      //   where: { imei: values.imei, id: Not(Equal(id)) },
      // });

      // if (!isEmpty(check)) {
      //   return { message_error: `เลขอีมี่ ซ้ำ : ${check.code}` };
      // }
    }

    let action = 'อัปเดต';
    if (existingProduct.active != values.active) {
      if (values.active == '0') {
        action = 'ปิดการใช้งาน';
      } else if (values.active == '1') {
        action = 'กำลังขาย';
      } else if (values.active == '3') {
        action = 'มีในสัญญา';
      } else if (values.active == '4') {
        action = 'ขายออกแล้ว';
      } else if (values.active == '5') {
        action = 'ย้ายสาขา';
      }
    }

    let firstFile = null;
    if (files.length > 0) {
      // Fetch the last image sequence
      const lastImage = await this.productImageRepository.findOne({
        where: { productId: id },
        order: { seq: 'DESC' }, // Assuming 'seq' is the field for sequence
      });

      const lastSeq = lastImage ? lastImage.seq : 0;
      await fs.ensureDir(`${this.uploadsPath}/${values.code}`);
      for (let index = 0; index < files.length; index++) {
        const seq = lastSeq + 1 + index;
        const file = files[index];
        const buffer = await fs.readFile(file.filepath);
        const randomName = generateRandomString(6);
        const filename = `${randomName}-${seq}.png`;
        const filePath = path.join(
          `${this.uploadsPath}/${values.code}`,
          filename,
        );

        if (index == 0) {
          firstFile = filePath;
        }

        await sharp(buffer)
          .png({ quality: 80, progressive: true })
          .toFile(filePath);

        const newProductImage = this.productImageRepository.create({
          name: filePath,
          productId: id,
          userId: values.updateByUserId,
          seq: seq,
        });

        await this.productImageRepository.save(newProductImage);
      }
    }

    if (values.fileProduct == null) {
      values.fileProduct = firstFile;
    }

    // บันทึกการเปลี่ยนแปลงลง ProductLog ก่อนอัปเดต
    const productLogDto: CreateProductLogDto = {
      productId: id,
      action: action,
      obj: JSON.stringify({
        before: existingProduct,
        after: values,
      }),
      branchId: values.branchId,
      userId: values.updateByUserId, // ใช้ updateByUserId เป็น userId
    };

    await this.productLogService.create(productLogDto);

    // อัปเดต Product
    await this.productRepository.update(id, values);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}: ${values.code}`,
      data: await this.findOne(id),
    };
  }

  async updateProductBuy(id: number, req: FastifyRequest): Promise<any> {
    try {
      const user = (req as any).user;

      const files = await req.saveRequestFiles();

      const { code } = req.body as any;

      const values = {
        code: code?.value ?? null,
      };

      let firstFile = null;
      if (files.length > 0) {
        // Fetch the last image sequence
        const lastImage = await this.productImageRepository.findOne({
          where: { productId: id },
          order: { seq: 'DESC' }, // Assuming 'seq' is the field for sequence
        });

        const lastSeq = lastImage ? lastImage.seq : 0;
        await fs.ensureDir(`${this.uploadsPath}/${values.code}`);
        for (let index = 0; index < files.length; index++) {
          const seq = lastSeq + 1 + index;
          const file = files[index];
          const buffer = await fs.readFile(file.filepath);
          const randomName = generateRandomString(6);
          const filename = `${randomName}-${seq}.png`;
          const filePath = path.join(
            `${this.uploadsPath}/${values.code}`,
            filename,
          );

          if (index == 0) {
            firstFile = filePath;
          }

          await sharp(buffer)
            .png({ quality: 80, progressive: true })
            .toFile(filePath);

          const newProductImage = this.productImageRepository.create({
            name: filePath,
            productId: id,
            userId: user.id,
            isProductBuy: '1',
            seq: seq,
          });

          await this.productImageRepository.save(newProductImage);
        }
      }
      return {
        message_success: MESSAGE_SAVE_SUCCESS,
      };
    } catch (error) {
      return {
        message_error: error?.message || 'เกิดข้อผิดพลาดในการลบรูปภาพ',
      };
    }
  }
  async delete(id: number, req: FastifyRequest): Promise<any> {
    // ค้นหาข้อมูล customer

    const productSale = await this.productSaleRepository.findOne({
      where: { productId: id, isCancel: '1' },
    });

    if (!isEmpty(productSale)) {
      return {
        message_error: `สินค้ามีในสัญญา ${productSale.code}`,
      };
    }

    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      return {
        message_error: 'ไม่พบข้อมูลสินค้า',
      };
    }

    // ลบไฟล์ที่เกี่ยวข้อง
    if (product.fileProduct) {
      const fileExists = await fs.pathExists(product.fileProduct);
      if (fileExists) {
        await fs.remove(product.fileProduct);
      }
    }

    // ลบโฟลเดอร์และไฟล์รูปภาพ
    const customerCode = product.code;
    const folderPath = path.join(this.uploadsPath, customerCode);

    const folderExists = await fs.pathExists(folderPath);
    if (folderExists) {
      // ลบ product images จาก database
      await this.productImageRepository.delete({ productId: id });

      // ลบไฟล์ทั้งหมดในโฟลเดอร์
      const files = await fs.readdir(folderPath);
      if (files.length > 0) {
        await Promise.all(
          files.map((file) => fs.remove(path.join(folderPath, file))),
        );
      }
      // ลบโฟลเดอร์
      await fs.remove(folderPath);
    }

    // ลบข้อมูล product จาก database
    await this.productRepository.delete(id);

    return {
      message_success: MESSAGE_DELETE_SUCCESS,
    };
  }

  async printStock(params: {
    branchId: number;
    catalog: string;
    req: FastifyRequest;
  }): Promise<Buffer> {
    const { branchId, catalog, req } = params;
    const user = (req as any).user;
    const isThunder = process.env.SYSTEM_BY === 'THUNDER';

    // =========================
    // 1) Query
    // =========================
    const query = this.productRepository.createQueryBuilder('product');

    // ✅ JOIN ให้ครบตามที่ใช้ orderBy/แสดงผล (ใช้ alias เดียวกันทั้งหมด)
    //    - ถ้า storage / color บางรายการไม่มี ให้ใช้ leftJoin
    query
      .innerJoin('product.productType', 'productType')
      .innerJoin('product.productModel', 'productModel')
      .innerJoin('product.productBrand', 'productBrand')
      .leftJoin('product.productColor', 'productColor')
      .leftJoin('product.productStorage', 'productStorage');

    // ✅ SELECT แบบ minimal ตาม catalog
    if (catalog === 'มือถือ') {
      const selectFields = [
        'product.imei',
        'product.batteryHealth',
        'product.amount',
        'product.boxType',
        'product.machineCondition',
        'product.priceWholeSale',
        'product.priceSale',

        'productBrand.name',
        'productType.name',
        'productStorage.name',
        'productColor.name',
        'productModel.name',
      ];

      if (!isThunder) selectFields.push('product.refOldStockNumber');

      query.select(selectFields);
    } else if (catalog === 'อะไหล่ซ่อม' || catalog === 'อุปกรณ์เสริม') {
      query.select([
        'product.code',
        'product.amount',
        'product.priceWholeSale',
        'product.priceSale',

        'productType.name',
        'productModel.name',
        'productBrand.name',
        'productColor.name',
        // storage ไม่ได้ใช้ในตารางนี้ก็ไม่ต้อง select แต่ join ไว้ได้เพื่อ orderBy
      ]);
    } else {
      // ✅ กันพัง: ถ้า catalog แปลก ๆ
      query.select([
        'product.code',
        'product.amount',
        'product.priceWholeSale',
        'product.priceSale',
        'productType.name',
        'productModel.name',
        'productBrand.name',
        'productColor.name',
        'productStorage.name',
      ]);
    }

    query
      .where('product.branchId = :branchId', { branchId })
      .andWhere('product.catalog = :catalog', { catalog })
      .andWhere('product.active = :active', { active: '1' });

    // ✅ ORDER BY ต้องใช้งาน alias ที่ join ไว้เท่านั้น (ห้ามใช้ product_brand/product_model/product_color)
    if (catalog !== 'มือถือ') {
      query.orderBy('productType.name', 'ASC');
    }

    query
      .addOrderBy('productBrand.name', 'ASC')
      .addOrderBy('productModel.name', 'ASC')
      .addOrderBy('productColor.name', 'ASC')
      .addOrderBy('productStorage.name', 'ASC')
      .addOrderBy('product.batteryHealth', 'ASC')
      .addOrderBy('product.boxType', 'ASC')
      .addOrderBy('product.hand', 'ASC');

    // ❌ ตัดออกก่อน เพราะยังไม่ได้ join alias เหล่านี้ (ไม่งั้นจะ error รอบต่อไป)
    // .addOrderBy('product_images.seq', 'ASC')
    // .addOrderBy('product_sale_latest.id', 'DESC');

    const products = await query.getMany();

    // =========================
    // 2) Dynamic Headers & Body
    // =========================
    let tableHeader: any[] = [];
    let tableBody: any[][] = [];
    let tableWidths: any[] = [];

    if (catalog === 'มือถือ') {
      const boxTypeTranslations: Record<string, string> = {
        '0': 'ไม่มี',
        '1': 'มี',
      };

      tableHeader = [
        { text: 'อีมี่', style: 'tableHeader' },
        { text: 'ประเภท', style: 'tableHeader' },
        { text: 'แบรนด์', style: 'tableHeader' },
        { text: 'รุ่น', style: 'tableHeader' },
        { text: 'ความจุ', style: 'tableHeader' },
        { text: 'สี', style: 'tableHeader' },
        { text: 'สุขภาพแบต', style: 'tableHeader' },
        { text: 'กล่อง', style: 'tableHeader' },
        { text: 'สภาพเครื่อง', style: 'tableHeader' },
        { text: 'คงคลัง', style: 'tableHeader' },
        { text: 'ราคาส่ง', style: 'tableHeader' },
        { text: 'ราคาปลีก', style: 'tableHeader' },
      ];

      tableWidths = [
        '*',
        'auto',
        '*',
        'auto',
        'auto',
        'auto',
        'auto',
        'auto',
        'auto',
        'auto',
        'auto',
        'auto',
      ];

      if (!isThunder) {
        tableHeader.splice(1, 0, { text: 'สต็อกเก่า', style: 'tableHeader' });
        tableWidths.splice(1, 0, 'auto');
      }

      tableBody = products.map((item: any) => {
        const row: any[] = [
          { text: item.imei || '-', alignment: 'left' },
          { text: item.productType?.name || '-', alignment: 'left' },
          { text: item.productBrand?.name || '-', alignment: 'left' },
          { text: item.productModel?.name || '-', alignment: 'left' },
          { text: item.productStorage?.name || '-', alignment: 'left' },
          { text: item.productColor?.name || '-', alignment: 'left' },
          { text: `${item.batteryHealth || 0}%`, alignment: 'right' },
          {
            text:
              boxTypeTranslations[String(item.boxType)] || item.boxType || '-',
            alignment: 'center',
          },
          { text: `${item.machineCondition || 0}%`, alignment: 'right' },
          { text: formatNumberDigit(item.amount), alignment: 'right' },
          { text: formatNumberDigit(item.priceWholeSale), alignment: 'right' },
          { text: formatNumberDigit(item.priceSale), alignment: 'right' },
        ];

        if (!isThunder) {
          row.splice(1, 0, {
            text: item.refOldStockNumber || '-',
            alignment: 'right',
          });
        }
        return row;
      });
    } else if (catalog === 'อะไหล่ซ่อม' || catalog === 'อุปกรณ์เสริม') {
      tableHeader = [
        { text: 'รหัส', style: 'tableHeader' },
        { text: 'ประเภท', style: 'tableHeader' },
        { text: 'รุ่น', style: 'tableHeader' },
        { text: 'แบรนด์', style: 'tableHeader' },
        { text: 'สี', style: 'tableHeader' },
        { text: 'คงคลัง', style: 'tableHeader' },
        { text: 'ราคาส่ง', style: 'tableHeader' },
        { text: 'ราคาปลีก', style: 'tableHeader' },
      ];

      tableWidths = ['*', '*', '*', '*', '*', 'auto', 'auto', 'auto'];

      tableBody = products.map((item: any) => [
        { text: item.code || '-', alignment: 'left' },
        { text: item.productType?.name || '-', alignment: 'left' },
        { text: item.productModel?.name || '-', alignment: 'left' },
        { text: item.productBrand?.name || '-', alignment: 'left' },
        { text: item.productColor?.name || '-', alignment: 'left' },
        { text: formatNumberDigit(item.amount), alignment: 'right' },
        { text: formatNumberDigit(item.priceWholeSale), alignment: 'right' },
        { text: formatNumberDigit(item.priceSale), alignment: 'right' },
      ]);
    }

    // ✅ Add sequence column
    const finalTableBody = [
      [{ text: 'ลำดับ', style: 'tableHeader' }, ...tableHeader],
      ...tableBody.map((row, index) => [
        { text: index + 1, alignment: 'right' },
        ...row,
      ]),
    ];
    tableWidths.unshift('auto');

    // =========================
    // 3) PDF Generation
    // =========================
    const fonts = {
      Sarabun: {
        normal: path.join(
          __dirname,
          '../../..',
          'node_modules/addthaifont-pdfmake/fonts/ThaiFonts/Sarabun-Regular.ttf',
        ),
      },
    };

    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
    });

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [20, 40, 20, 20],
      info: {
        title: `Stock-List-${catalog}-${branchId}`,
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
            { text: `รายงานสต็อกสินค้าคงคลัง (${catalog})`, style: 'header' },
            {
              columns: [
                {
                  width: '*',
                  stack: [
                    {
                      text: `วันที่พิมพ์: ${formatDateTH(new Date())}`,
                      style: 'subheaderLeft',
                    },
                    {
                      text: `จำนวนรายการ: ${products.length}`,
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
            widths: tableWidths,
            body: finalTableBody,
            keepWithHeaderRows: true,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#f0f0f0' : null,
          },
        },
        ...(products.length === 0
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
        fontSize: 8,
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const buffers: Buffer[] = [];

    pdfDoc.on('data', (chunk) => buffers.push(chunk));
    pdfDoc.end();

    return new Promise<Buffer>((resolve) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }
}
