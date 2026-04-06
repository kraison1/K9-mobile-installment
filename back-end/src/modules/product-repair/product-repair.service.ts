import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import { CreateProductRepairDto } from './dto/create-product-repair.dto';
import { UpdateProductRepairDto } from './dto/update-product-repair.dto';
import { ProductRepair } from './entities/product-repair.entity';
import { ProductRepairSearchDto } from 'src/helper/search.dto'; // Assuming you use a similar SearchDto
import dayjs from 'src/configs/dayjs-config';
import { Branch } from '../branchs/entities/branch.entity';
import { Product } from '../product/entities/product.entity';
import { CreateProductLogDto } from '../product-log/dto/create-product-log.dto';
import { ProductLogService } from '../product-log/product-log.service';
import {
  MESSAGE_DELETE_SUCCESS,
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import {
  calPercent,
  checkIsFree,
  toIntegerOrNull,
} from 'src/helper/transformValue';
import { ProductPrice } from '../product-price/entities/product-price.entity';
import { ProductRepairList } from '../product-repair-lists/entities/product-repair-list.entity';
import { ProductRepairImage } from '../product-repair-image/entities/product-repair-image.entity';
import { generateRandomString } from 'src/helper/generateRandomString';
import { ProductClaim } from '../product-claim/entities/product-claim.entity';
import { isNumber } from 'lodash';
import { ProductSale } from '../product-sale/entities/product-sale.entity';

@Injectable()
export class ProductRepairService {
  private readonly uploadsPath = path.join('uploads/product-repairs');

  constructor(
    @InjectRepository(ProductRepair)
    private readonly productRepairRepository: Repository<ProductRepair>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    @InjectRepository(ProductPrice)
    private readonly productPriceRepository: Repository<ProductPrice>,

    @InjectRepository(ProductSale)
    private readonly productSaleRepository: Repository<ProductSale>,

    @InjectRepository(ProductRepairList)
    private readonly productRepairListsRepository: Repository<ProductRepairList>,

    @InjectRepository(ProductRepairImage)
    private readonly productRepairImageRepository: Repository<ProductRepairImage>,

    @InjectRepository(ProductClaim)
    private readonly productClaimRepository: Repository<ProductClaim>,

    private readonly productLogService: ProductLogService,
  ) {}

  // async create(createProductRepairDto: CreateProductRepairDto): Promise<any> {
  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    await fs.ensureDir(this.uploadsPath);

    const files = await req.saveRequestFiles();

    const {
      pricePredict,
      priceCost,
      priceWage,
      priceRepair,
      priceDiscount,
      priceTransferCash,
      priceCash,
      bankId,
      productId,
      productModelId,
      productBrandId,
      productTypeId,
      imei,
      note,
      shopName,
      typeRepair,
      active,
      payType,
      create_date,
      randomCode,
    } = req.body as any;

    const values = {
      code: '',
      priceEquipCost: 0,
      priceEquipProfit: 0,
      priceEquipSum: 0,
      priceDiscount: toIntegerOrNull(priceDiscount),
      priceCost: toIntegerOrNull(priceCost),
      pricePredict: toIntegerOrNull(pricePredict),
      priceTransferCash: Number(priceTransferCash?.value ?? 0),
      priceCash: Number(priceCash?.value ?? 0),
      mobilePriceCost: 0,
      priceWage: toIntegerOrNull(priceWage),
      priceRepair: toIntegerOrNull(priceRepair),
      productId: toIntegerOrNull(productId),
      productModelId: toIntegerOrNull(productModelId),
      productBrandId: toIntegerOrNull(productBrandId),
      productTypeId: toIntegerOrNull(productTypeId),

      imei: imei?.value ?? '',
      note: note?.value ?? '',
      shopName: shopName?.value ?? '',
      typeRepair: typeRepair?.value ?? '',
      active: active?.value ?? '',
      bankId: toIntegerOrNull(bankId),
      payType: payType?.value ?? '',
      createByUserId: user.id,
      branchId: user.branchId,
      create_date: create_date?.value || new Date(),
      randomCode: randomCode?.value ?? '1',
    };

    const productRepairLists = Object.keys(req.body).reduce((acc, key) => {
      const match = key.match(/^productRepairLists\[(\d+)\]\[(\w+)\]$/);
      if (match) {
        const [, index, field] = match;
        acc[index] = acc[index] || {};
        acc[index][field] = req.body[key].value;
      }
      return acc;
    }, []);

    const check = await Promise.all(
      productRepairLists.map(async (list) => {
        const totalStock = parseFloat(
          (
            await this.productPriceRepository
              .createQueryBuilder('productPrice')
              .select('SUM(productPrice.amount)', 'totalStock')
              .where('productPrice.productId = :productId', {
                productId: list.productId,
              })
              .andWhere('productPrice.branchId = :branchId', {
                branchId: user.branchId,
              })
              .getRawOne()
          )?.totalStock || '0',
        );

        if (totalStock < list.amount) {
          throw {
            message_error: `สินค้า ${list.productName} มีน้อยกว่า ${list.amount} (มีอยู่ ${totalStock})`,
          };
        }
      }),
    ).catch((err) => err);

    if (values.payType == '1') {
      values.priceCash = values.priceRepair;
      values.priceTransferCash = 0;
    } else if (values.payType == '2') {
      values.priceCash = 0;
      values.priceTransferCash = values.priceRepair;
    } else if (values.payType == '3') {
      if (values.priceCash <= 0) {
        return {
          message_error: `เงินสด ไม่ควรติดลบ`,
        };
      } else if (values.priceTransferCash <= 0) {
        return {
          message_error: `เงินโอน ไม่ควรติดลบ`,
        };
      }
    }

    if (check.message_error) {
      return check;
    }

    const branch = await this.branchRepository.findOneBy({
      id: values.branchId,
    });

    if (values.randomCode == '1') {
      const prefix = 'RP';

      const branchCode = branch.code;

      // สร้างรหัสวันที่ในรูปแบบ YYYYMMDD โดยใช้ dayjs
      const today = dayjs().format('YYYYMMDD');

      // นับจำนวน ProductRepair ที่สร้างในวันนั้นและสร้าง run number
      const runNumber = (
        (await this.productRepairRepository
          .createQueryBuilder('product_repair')
          .where('DATE(product_repair.create_date) = :today', {
            today: dayjs().format('YYYY-MM-DD'),
          })
          .getCount()) + 1
      )
        .toString()
        .padStart(4, '0'); // เพิ่ม run number และเติม 4 หลัก

      // สร้าง code ตาม format ที่ต้องการ
      const generatedCode = `${prefix}${branchCode}${today}${runNumber}`;

      // เพิ่ม code ที่สร้างใน DTO
      values.code = generatedCode;
    }

    // สร้างและบันทึก ProductRepair ใหม่
    const newProductRepair = this.productRepairRepository.create(values);
    const savedProductRepair =
      await this.productRepairRepository.save(newProductRepair);

    if (files && files.length > 0) {
      await fs.ensureDir(`${this.uploadsPath}/${savedProductRepair.code}`);

      for (let index = 0; index < files.length; index++) {
        const file = files[index];

        const buffer = await fs.readFile(file.filepath);
        const randomName = generateRandomString(6);
        const filename = `${randomName}-${index + 1}.png`; // เช่น s123vas-1.png
        const filePath = path.join(
          `${this.uploadsPath}/${savedProductRepair.code}`,
          filename,
        );

        await sharp(buffer)
          .png({ quality: 80, progressive: true })
          .toFile(filePath);

        const newProductImage = this.productRepairImageRepository.create({
          name: filePath,
          productRepairId: savedProductRepair.id,
          userId: savedProductRepair.createByUserId,
        });

        await this.productRepairImageRepository.save(newProductImage);
      }
    }

    const results = await Promise.all(
      productRepairLists.map((list) =>
        this.calculateCostAndStock(
          list,
          savedProductRepair.id,
          values.branchId,
          values.createByUserId,
        ),
      ),
    );

    let { priceEquipCost, priceEquipProfit, priceEquipSum } = results.reduce(
      (acc, result) => ({
        priceEquipCost: acc.priceEquipCost + result.priceCostBuy,
        priceEquipProfit: acc.priceEquipProfit + result.priceProfit,
        priceEquipSum: acc.priceEquipSum + result.priceEquipSum,
      }),
      { priceEquipCost: 0, priceEquipProfit: 0, priceEquipSum: 0 },
    );

    if (isNumber(savedProductRepair.productId)) {
      if (productRepairLists.length <= 0) {
        values.priceEquipCost = values.priceRepair;
        priceEquipCost = values.priceEquipCost;
        values.priceCost = priceEquipCost;
      } else {
        values.priceEquipCost = priceEquipCost;
        values.priceCost = priceEquipCost;
        values.priceEquipProfit = priceEquipProfit;
        values.priceEquipSum = priceEquipSum;
      }

      const product = await this.productRepository.findOne({
        where: {
          id: savedProductRepair.productId,
        },
      });

      values.mobilePriceCost =
        Number(priceEquipCost) + Number(product.priceCostBuy);

      product.priceRepair =
        Number(product.priceRepair) + Number(priceEquipCost);

      product.priceCostBuy =
        Number(product.priceCostBuy) + Number(priceEquipCost);

      const getProductSale = await this.productSaleRepository.findOne({
        where: {
          productId: savedProductRepair.productId,
          isPaySuccess: '4',
          isCancel: '0',
        },
      });

      if (getProductSale) {
        getProductSale.priceRepair =
          Number(getProductSale.priceRepair) + Number(priceEquipCost);

        getProductSale.priceSomeProfit =
          Number(getProductSale.priceSomeProfit) - Number(priceEquipCost);
        getProductSale.priceProfit =
          Number(getProductSale.priceProfit) - Number(priceEquipCost);

        await this.productSaleRepository.update(
          getProductSale.id,
          getProductSale,
        );
      } else {
        product.active = '8';
        product.updateByUserId = savedProductRepair.createByUserId;
        product.note = `ซ่อมสินค้า: ${savedProductRepair.code}`;
      }

      await this.productRepository.update(
        savedProductRepair.productId,
        product,
      );
    }

    if (values.typeRepair == '1') {
      values.priceEquipSum = values.priceEquipCost;
      values.priceEquipProfit = 0;
      values.priceWage = 0;
    } else if (values.typeRepair == '4') {
      values.priceEquipCost = values.priceCost;
      values.priceEquipSum = values.priceEquipCost;
      values.priceEquipProfit = values.priceRepair - values.priceEquipSum;
      values.priceWage = calPercent(
        values.priceEquipProfit,
        branch.percentWage,
      );
    } else {
      values.priceCost = priceEquipCost;
      values.priceEquipCost = priceEquipCost;
      values.priceEquipSum = priceEquipSum - values.priceDiscount;
      values.priceEquipProfit =
        productRepairLists.length > 0
          ? priceEquipProfit - values.priceDiscount
          : values.priceRepair;
      values.priceWage = calPercent(
        values.priceEquipProfit,
        branch.percentWage,
      );
    }

    await this.productRepairRepository.update(savedProductRepair.id, values);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${savedProductRepair.code}`,
    };
  }

  async calculateCostAndStock(
    list: any,
    productRepairId: number,
    branchId: number,
    createByUserId: number,
  ): Promise<{
    priceProfit: number;
    priceCostBuy: number;
    priceEquipSum: number;
  }> {
    const exactProduct = await this.productRepository.findOne({
      where: {
        id: list.productId,
        branchId: list.branchId,
      },
    });

    let obj = {
      productName: list.productName,
      amount: list.amount,
      productId: list.productId,
      isFree: list.isFree,
      catalog: exactProduct.catalog,
      priceSale: list.isFree == '1' ? 0 : list.priceSale,
      priceProfit: 0,
      priceCostBuy: 0,
      productRepairId: productRepairId,
      buyFormShop: exactProduct.buyFormShop,
    };

    // สร้าง product log สำหรับการเปลี่ยนแปลง stock
    const productBefore = { ...exactProduct };
    exactProduct.amount = exactProduct.amount - list.amount;

    if (obj.isFree == '0') {
      exactProduct.amountSale = Number(exactProduct.amountSale);
      exactProduct.amountSale += Number(list.amount);

      exactProduct.amountRemaining = Number(exactProduct.amountRemaining);
      exactProduct.amountRemaining += Number(list.amount);
    } else if (obj.isFree == '1') {
      exactProduct.amountFree = Number(exactProduct.amountFree);
      exactProduct.amountFree += Number(list.amount);
    } else if (obj.isFree == '2') {
      exactProduct.amountClaim = Number(exactProduct.amountClaim);
      exactProduct.amountClaim += Number(list.amount);
    }

    exactProduct.priceSumSale = Number(exactProduct.priceSumSale);
    exactProduct.priceSumSale += Number(list.priceSale);

    await this.productRepository.save(exactProduct);

    // Log การเปลี่ยนแปลง stock ของ product
    const stockLogDto: CreateProductLogDto = {
      productId: list.productId,
      action: checkIsFree(list.isFree),
      obj: JSON.stringify({
        before: productBefore,
        after: exactProduct,
      }),
      branchId: branchId,
      userId: createByUserId, // ใช้ userId จาก list หรือ null ถ้าไม่มี
    };

    await this.productLogService.create(stockLogDto);

    let totalCost = 0;

    const exactMatch = await this.productPriceRepository.findOne({
      where: {
        productId: list.productId,
        branchId: list.branchId,
        amount: MoreThan(0),
      },
      order: { priceCostBuy: 'DESC' },
    });

    if (exactMatch) {
      exactMatch.amount = exactMatch.amount - list.amount;
      await this.productPriceRepository.save(exactMatch);
      totalCost = exactMatch.priceCostBuy * list.amount;
    } else {
      const availablePrices = await this.productPriceRepository.find({
        where: {
          productId: list.productId,
          branchId: list.branchId,
          amount: MoreThan(0),
        },
        order: { priceCostBuy: 'DESC' },
        take: 100,
      });

      let totalStock = 0;
      const updatedStocks = [];

      for (const price of availablePrices) {
        const remainingQuantity = list.amount - totalStock;
        if (remainingQuantity <= 0) break;

        const usedAmount = Math.min(price.amount, remainingQuantity);
        totalCost += price.priceCostBuy * usedAmount;
        totalStock += usedAmount;

        price.amount -= usedAmount;
        updatedStocks.push(price);
      }

      if (updatedStocks.length > 0) {
        await this.productPriceRepository.save(updatedStocks);
      }
    }

    let priceProfit = 0;
    let priceEquipSum = 0;
    if (list.isFree == '1') {
      priceProfit = obj.priceSale - totalCost;
    } else {
      priceProfit = Number(list.amount * obj.priceSale) - totalCost;
    }

    obj.priceProfit = priceProfit;
    obj.priceCostBuy = totalCost;
    priceEquipSum = Number(list.amount * obj.priceSale);
    await this.productRepairListsRepository.save(obj);

    if (obj.isFree == '2') {
      const newProductClaim = this.productClaimRepository.create({
        createByUserId: createByUserId,
        priceCostBuy: obj.priceCostBuy,
        productId: obj.productId,
        branchId: branchId,
        amount: list.amount,
      });

      await this.productClaimRepository.save(newProductClaim);
    }

    return {
      priceProfit: priceProfit,
      priceCostBuy: totalCost,
      priceEquipSum: priceEquipSum,
    };
  }

  async findAll(searchDto: ProductRepairSearchDto): Promise<{
    data: any[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // const productRepairLists = await this.productRepairListsRepository.find();

    // for (let index = 0; index < productRepairLists.length; index++) {
    //   const lists = productRepairLists[index];
    //   const product = await this.productRepository.findOneBy({
    //     id: lists.productId,
    //   });
    //   lists.buyFormShop = product.buyFormShop;
    //   await this.productRepairListsRepository.save(lists);
    // }

    const { search, active, page, pageSize } = searchDto;
    const queryBuilder =
      this.productRepairRepository.createQueryBuilder('product_repair');

    queryBuilder
      .select([
        'product_repair.id',
        'product_repair.code',
        'product_repair.active',
        'product_repair.note',
        'product_repair.shopName',
        'product_repair.imei',
        'product_repair.pricePredict',
        'product_repair.priceRepair',
        'product_repair.priceEquipCost',
        'product_repair.priceEquipSum',
        'product_repair.priceEquipProfit',
        'product_repair.priceWage',
        'product_repair.create_date',
        'product_repair.typeRepair',
        'branch.id',
        'branch.name',
        'user.id',
        'user.name',
        'product.id',
        'product.code',
        'product.imei',
        'productModel.id',
        'productModel.name',

        'productShopModel.id',
        'productShopModel.name',

        'productRepairLists.id',
        'productRepairLists.productRepairId',
        'productRepairLists.productName',
        'productRepairLists.productId',
        'productRepairLists.amount',
        'productRepairLists.priceSale',

        'ListProduct.id',
        'ListProduct.code',
        'ListProduct.buyFormShop',

        'ListProduct.productModelId',
        'ListProductModel.id',
        'ListProductModel.name',

        'ListProduct.productTypeId',
        'ListProductType.id',
        'ListProductType.name',

        'ListProduct.productColorId',
        'ListProductColor.id',
        'ListProductColor.name',

        'ListProduct.productBrandId',
        'ListProductBrand.id',
        'ListProductBrand.name',
      ])
      .leftJoin('product_repair.branch', 'branch')
      .leftJoin('product_repair.product', 'product')
      .leftJoin('product.productModel', 'productShopModel')
      .leftJoin('product_repair.productModel', 'productModel')
      .leftJoin('product_repair.productRepairLists', 'productRepairLists')
      .leftJoin('productRepairLists.product', 'ListProduct')

      .leftJoin('ListProduct.productModel', 'ListProductModel')
      .leftJoin('ListProduct.productType', 'ListProductType')
      .leftJoin('ListProduct.productColor', 'ListProductColor')
      .leftJoin('ListProduct.productBrand', 'ListProductBrand')

      .leftJoin('product_repair.create_by', 'user');

    queryBuilder.andWhere(
      'product_repair.create_date BETWEEN :startDate AND :endDate',
      {
        startDate: new Date(searchDto.startDate),
        endDate: new Date(searchDto.endDate),
      },
    );

    if (searchDto.branchId && searchDto.branchId !== 0) {
      queryBuilder.andWhere('product_repair.branchId = :branchId', {
        branchId: searchDto.branchId,
      });
    }

    queryBuilder.andWhere('product_repair.typeRepair = :typeRepair', {
      typeRepair: searchDto.typeRepair,
    });

    // Filtering by 'active' if not '2'
    if (active !== '0') {
      queryBuilder.andWhere('product_repair.active = :active', {
        active,
      });
    }

    if (searchDto.search) {
      queryBuilder.andWhere(
        '(product_repair.code ILIKE :search OR product_repair.imei ILIKE :search OR product_repair.shopName ILIKE :search OR product.code ILIKE :search OR product.imei ILIKE :search)',
        { search: `%${searchDto.search}%` },
      );
    }

    // Pagination
    queryBuilder
      .orderBy('product_repair.create_date', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number): Promise<ProductRepair | null> {
    // const productRepairs = await this.productRepairRepository.find({
    //   where: { id: 790, typeRepair: '1' },
    //   relations: ['productRepairLists'],
    // });

    // for (let index = 0; index < productRepairs.length; index++) {
    //   let productRepair = productRepairs[index];
    //   if (productRepair.productRepairLists.length <= 0) {
    //     productRepair.priceWage = 0;
    //     productRepair.priceCost = productRepair.priceRepair;
    //     productRepair.priceEquipCost = productRepair.priceCost;
    //   } else {
    //     const cal = productRepair.productRepairLists.reduce((acc, list) => {
    //       return acc + Number(list.priceCostBuy);
    //     }, 0);

    //     productRepair.priceCost = 0;
    //     productRepair.priceEquipCost = cal;
    //     productRepair.priceWage = 0;
    //   }

    //   delete productRepair.productRepairLists;

    //   await this.productRepairRepository.update(productRepair.id, {
    //     ...productRepair,
    //   });
    // }

    return this.productRepairRepository.findOne({
      where: { id },
      relations: ['productRepairLists', 'productRepairImages'],
    });
  }

  // async update(
  //   id: number,
  //   updateProductRepairDto: UpdateProductRepairDto,
  // ): Promise<any> {
  async update(id: number, req: FastifyRequest): Promise<any> {
    // const existingProductRepair = await this.productRepairRepository.findOne({
    //   where: { id: id },
    // });
    // if (existingProductRepair.active !== updateProductRepairDto.active) {
    //   const existingProduct = await this.productRepository.findOne({
    //     where: { id: updateProductRepairDto.productId },
    //   });
    //   const updateProductDto = {
    //     ...existingProduct,
    //     active: '1',
    //     priceRepair:
    //       Number(existingProduct.priceRepair) -
    //       Number(updateProductRepairDto.priceRepair),
    //     updateByUserId: updateProductRepairDto.createByUserId,
    //     note: `ยกเลิกซ่อมสินค้า: ${updateProductRepairDto.code}`,
    //   };
    //   // บันทึกการเปลี่ยนแปลงลง ProductLog ก่อนอัปเดต
    //   const productLogDto: CreateProductLogDto = {
    //     productId: updateProductRepairDto.productId,
    //     action: 'ยกเลิกซ่อมสินค้า',
    //     obj: JSON.stringify({
    //       before: existingProduct,
    //       after: updateProductDto,
    //     }),
    //     branchId: updateProductRepairDto.branchId,
    //     userId: updateProductRepairDto.createByUserId,
    //   };
    //   await this.productLogService.create(productLogDto);
    //   // อัปเดต Product
    //   await this.productRepository.update(
    //     updateProductRepairDto.productId,
    //     updateProductDto,
    //   );
    //   await this.productRepairRepository.update(id, updateProductRepairDto);
    //   return {
    //     message_success: `${MESSAGE_UPDATE_SUCCESS}: ${updateProductRepairDto.code}`,
    //   };
    // }
  }

  async delete(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;
    const productRepair = await this.productRepairRepository.findOne({
      where: { id: id },
      relations: ['productRepairLists'],
    });

    const { productRepairLists } = productRepair;

    for (let index = 0; index < productRepairLists.length; index++) {
      const product = await this.productRepository.findOneBy({
        id: productRepairLists[index].productId,
      });

      const productPrice = await this.productPriceRepository.findOneBy({
        productId: productRepairLists[index].productId,
      });

      const existingProductPrice = { ...productPrice };
      existingProductPrice.amount =
        productPrice.amount + productRepairLists[index].amount;

      await this.productPriceRepository.update(
        { id: productPrice.id },
        { amount: existingProductPrice.amount },
      );

      const existingProduct = { ...product };
      existingProduct.amount =
        product.amount + productRepairLists[index].amount;
      existingProduct.amountSale = Number(existingProduct.amountSale);
      existingProduct.amountSale -= Number(productRepairLists[index].amount);

      existingProduct.amountRemaining = Number(existingProduct.amountRemaining);
      existingProduct.amountRemaining -= Number(
        productRepairLists[index].amount,
      );

      existingProduct.priceSumSale = Number(existingProduct.priceSumSale);
      existingProduct.priceSumSale -= Number(
        productRepairLists[index].priceSale,
      );

      const productLogDto: CreateProductLogDto = {
        productId: existingProduct.id, // ใช้ id จาก product
        action: `คืนสินค้า: ${productRepair.code}`,
        obj: JSON.stringify({
          before: product,
          after: existingProduct,
        }),
        branchId: user.branchId,
        userId: user.id,
      };

      await this.productLogService.create(productLogDto);

      await this.productRepository.update(
        { id: product.id },
        { amount: existingProduct.amount },
      );
    }

    if (isNumber(productRepair.productId)) {
      const product = await this.productRepository.findOne({
        where: {
          id: productRepair.productId,
        },
      });

      product.priceRepair =
        Number(product.priceRepair) - Number(productRepair.priceEquipCost);

      // product.priceCostBuy =
      //   Number(product.priceCostBuy) - Number(productRepair.priceEquipCost);

      const getProductSale = await this.productSaleRepository.findOne({
        where: {
          productId: productRepair.productId,
          isPaySuccess: '4',
          isCancel: '0',
        },
      });

      if (getProductSale) {
        getProductSale.priceRepair =
          Number(getProductSale.priceRepair) -
          Number(productRepair.priceEquipCost);
        getProductSale.priceSomeProfit =
          Number(getProductSale.priceSomeProfit) +
          Number(productRepair.priceEquipCost);
        getProductSale.priceProfit =
          Number(getProductSale.priceProfit) +
          Number(productRepair.priceEquipCost);
        await this.productSaleRepository.update(
          getProductSale.id,
          getProductSale,
        );
      }

      await this.productRepository.update(productRepair.productId, product);
    }

    // Construct folder path
    const folderPath = path.join(this.uploadsPath, productRepair.code);

    // Check if folder exists and delete
    if (await fs.pathExists(folderPath)) {
      await fs.remove(folderPath);
    }

    // Delete product sale record
    await this.productRepairRepository.delete({ id });
    await this.productRepairListsRepository.delete({ productRepairId: id });

    return {
      message_success: `${MESSAGE_DELETE_SUCCESS}: ${productRepair.code}`,
    };
  }
}
