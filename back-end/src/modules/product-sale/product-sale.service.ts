import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Like,
  MoreThan,
  Brackets,
  Raw,
  In,
  Not,
  IsNull,
  DataSource,
} from 'typeorm';
import { ProductSale } from './entities/product-sale.entity';
import { ProductSaleSearchDto } from 'src/helper/search.dto'; // Assuming you use a similar SearchDto
import { Branch } from '../branchs/entities/branch.entity';
import PdfPrinter from 'pdfmake/src/printer';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { Product } from '../product/entities/product.entity';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { ProductSaleList } from '../product-sale-lists/entities/product-sale-list.entity';
import { checkIsFree, toIntegerOrNull } from 'src/helper/transformValue';
import { ProductPrice } from '../product-price/entities/product-price.entity';
import {
  formatDateTHWithOutTime,
  formatDateNumberWithoutTime,
  formatDateTH,
} from 'src/helper/formatDate';
import { formatNumberDigit, formatNumberDigit2 } from 'src/helper/formatNumber';
import dayjs from 'src/configs/dayjs-config';
import { ProductLogService } from '../product-log/product-log.service';
import { CreateProductLogDto } from '../product-log/dto/create-product-log.dto';
import { ProductPaymentImage } from '../product-payment-images/entities/product-payment-image.entity';
import * as _ from 'lodash';
import { ProductSaleImage } from '../product-sale-images/entities/product-sale-image.entity';
import { ProductBook } from '../product-book/entities/product-book.entity';
import { ProcessBook } from '../process-books/entities/process-book.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Bank } from '../banks/entities/bank.entity';
import { TelegramNotificationService } from '../telegram-notification/telegram-notification.service';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_DELETE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { generateRandomString } from 'src/helper/generateRandomString';
import { ProductSaving } from '../product-saving/entities/product-saving.entity';
import { ProcessSaving } from '../process-savings/entities/process-saving.entity';
import { ManageAppleId } from '../manage-apple-id/entities/manage-apple-id.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { BranchTransferPrice } from '../branch-transfer-price/entities/branch-transfer-price.entity';
import { ProductService } from '../product/product.service';
import { ProductRepair } from '../product-repair/entities/product-repair.entity';
import { ProcessManageFinance } from '../process-manage-finance/entities/process-manage-finance.entity';
import { ProductClaim } from '../product-claim/entities/product-claim.entity';

export class ProductSaleService {
  private readonly uploadsPath = path.join('uploads/product-sales');
  private readonly masterImagePath = path.join('uploads/masterImagePath');

  private readonly radFilePath = path.join(__dirname, '..', '..', '..');

  constructor(
    @InjectRepository(ProductSale)
    private readonly productSaleRepository: Repository<ProductSale>,

    @InjectRepository(ProductPayMentList)
    private readonly productPayMentListsRepository: Repository<ProductPayMentList>,

    @InjectRepository(ProductPaymentImage)
    private readonly productPaymentImageRepository: Repository<ProductPaymentImage>,

    @InjectRepository(ProductSaleList)
    private readonly productSaleListsRepository: Repository<ProductSaleList>,

    @InjectRepository(ProductBook)
    private readonly productBookRepository: Repository<ProductBook>,

    @InjectRepository(ProcessManageFinance)
    private readonly processManageFinanceRepository: Repository<ProcessManageFinance>,

    @InjectRepository(ProductRepair)
    private readonly productRepairRepository: Repository<ProductRepair>,

    @InjectRepository(ProcessBook)
    private readonly processBookRepository: Repository<ProcessBook>,

    @InjectRepository(ProductSaving)
    private readonly productSavingRepository: Repository<ProductSaving>,

    @InjectRepository(ProcessSaving)
    private readonly processSavingRepository: Repository<ProcessSaving>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(ProductSaleImage)
    private readonly productSaleImageRepository: Repository<ProductSaleImage>,

    private readonly productLogService: ProductLogService,
    private readonly telegramNotificationService: TelegramNotificationService,

    @InjectRepository(ProductPayMentList)
    private readonly productPayMentListRepository: Repository<ProductPayMentList>,

    @InjectRepository(ManageAppleId)
    private readonly manageAppleIdRepository: Repository<ManageAppleId>,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    @InjectRepository(ProductPrice)
    private readonly productPriceRepository: Repository<ProductPrice>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,

    @InjectRepository(BranchTransferPrice)
    private readonly branchTransferPriceRepository: Repository<BranchTransferPrice>,

    @InjectRepository(ProductClaim)
    private readonly productClaimRepository: Repository<ProductClaim>,

    private productService: ProductService,
    private readonly dataSource: DataSource,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    await fs.ensureDir(this.uploadsPath);

    const files = await req.saveRequestFiles();

    const {
      randomCode,
      code,
      note,
      productBookId,
      productSavingId,
      caseDate,
      priceDownType,
      priceTransferCash,
      priceCash,
      useCalType,
      payPerMonth,
      customerId,
      customerMirrorId,
      productId,
      payType,
      priceType,
      priceSale,
      priceETC,
      priceRegAppleId,
      priceReRider,
      priceReRiderCustomer,
      priceDownPayment,
      priceAdjusted,
      priceBeforeAdjusted,
      priceSumAdjusted,
      priceEquipCash,
      priceEquipTransferCash,
      priceReRiderCash,
      priceReRiderTransferCash,
      priceRegAppleIdCash,
      priceRegAppleIdTransferCash,
      priceDiscount,
      priceTotalPaid,
      saleType,
      transportId,
      tackingNumber,
      rateFinanceId,
      valueEqual,
      valueMonth,
      isMobileSale,
      rentAppID,
      rentPass,
      rentPin,
      bankId,
      processManageFinanceId,
      create_date,
      isClaim,
      resellerId,
      priceReseller,
      isCash,
    } = req.body as any;

    const values = {
      customerId: toIntegerOrNull(customerId),
      customerMirrorId: toIntegerOrNull(customerMirrorId),
      productId: toIntegerOrNull(productId),
      resellerId: toIntegerOrNull(resellerId),
      payType: payType?.value ?? null,
      randomCode: randomCode?.value ?? '1',
      code: code?.value ?? null,
      bankId: toIntegerOrNull(bankId?.value),
      priceDownType: priceDownType?.value ?? null,
      caseDate: caseDate?.value ?? null,
      priceType: priceType?.value ?? null,
      useCalType: useCalType?.value ?? null,
      rentAppID: rentAppID?.value ?? null,
      rentPass: rentPass?.value ?? null,

      rentPin: rentPin?.value ?? null,
      processManageFinanceId: processManageFinanceId?.value ?? null,
      note: note?.value ?? null,
      productBookId: toIntegerOrNull(productBookId?.value),
      productSavingId: toIntegerOrNull(productSavingId?.value),
      payPerMonth: Number(payPerMonth?.value ?? 0),
      priceTransferCash: Number(priceTransferCash?.value ?? 0),
      priceCash: Number(priceCash?.value ?? 0),
      priceReseller: Number(priceReseller?.value ?? 0),
      isCash: isCash?.value ?? '0',

      priceSumInvoices: 0,
      priceSumPayInvoices: 0,
      isClaim: isClaim?.value ?? '0',
      create_date: create_date?.value || new Date(),
      // ราคาขาย
      priceCostBuy: 0,

      // ราคาขาย
      priceSale: Number(priceSale?.value ?? 0),
      // บริการอื่น ๆ (บ.)
      priceETC: Number(priceETC?.value ?? 0),
      // AppleID (บ.)
      priceRegAppleId: Number(priceRegAppleId?.value ?? 0),
      // รับค่าส่ง (บ.)
      priceReRider: Number(priceReRider?.value ?? 0),
      // รับค่าส่งจาก ลค. (บ.)
      priceReRiderCustomer: Number(priceReRiderCustomer?.value ?? 0),
      // ยอดวางดาวน์ (%)
      priceDownPayment: Number(priceDownPayment?.value ?? 0),
      priceBeforeAdjusted: Number(priceBeforeAdjusted?.value ?? 0),
      // รวมราคาจัด (บ.)
      priceSumAdjusted: Number(priceSumAdjusted?.value ?? 0),
      // ยอดวางดาวน์
      priceAdjusted: Number(priceAdjusted?.value ?? 0),
      // ส่วนลด (บ.)
      priceDiscount: Number(priceDiscount?.value ?? 0),
      // รวมยอดที่จ่ายก่อนรับ (บ.)
      priceTotalPaid: Number(priceTotalPaid?.value ?? 0),
      // ก่อนกำไร (บ.)
      priceSomeProfit: 0,
      // กำไร (บ.)
      priceProfit: 0,
      priceEquipCost: 0,
      priceEquipProfit: 0,
      priceEquipSum: 0,
      priceEquipTransferCash: Number(priceEquipTransferCash?.value ?? 0),
      priceEquipCash: Number(priceEquipCash?.value ?? 0),
      priceRegAppleIdTransferCash: Number(
        priceRegAppleIdTransferCash?.value ?? 0,
      ),
      priceRegAppleIdCash: Number(priceRegAppleIdCash?.value ?? 0),
      priceReRiderTransferCash: Number(priceReRiderTransferCash?.value ?? 0),
      priceReRiderCash: Number(priceReRiderCash?.value ?? 0),
      valueMonth: Number(valueMonth?.value ?? 0),
      valueEqual: Number(valueEqual?.value ?? 0),
      saleType: saleType?.value ?? null,
      transportId: toIntegerOrNull(transportId?.value),
      tackingNumber: tackingNumber?.value ?? null,
      createByUserId: user.id,
      branchId: user.branchId,
      isMobileSale: isMobileSale?.value ?? null,
      rateFinanceId: toIntegerOrNull(rateFinanceId?.value),
      isPaySuccess: '4',
      shopAppID: '',
      shopPass: '',
      shopPin: '',
      ownerBank: '',
      ownerBankName: '',
      ownerBankNo: '',
      hand: '',
    };

    if (values.saleType == '3' || values.saleType == '4') {
      const customer = await this.customerRepository.findOne({
        where: { id: values.customerId },
        relations: ['productSale', 'customerImages'],
        order: {
          customerImages: {
            seq: 'ASC',
          },
        },
      });

      if (_.isNumber(customer)) {
        const pendingContracts = customer.productSale
          .filter((sale) => sale.isPaySuccess !== '1')
          .map((sale) => sale.code);

        if (pendingContracts.length > 0) {
          return {
            message_error: `ลูกค้ามีสัญญาที่ยังคงค้างในระบบ: ${pendingContracts}`,
          };
        }
      }
    }

    if (!_.isNull(values.processManageFinanceId)) {
      const processManageFinance =
        await this.processManageFinanceRepository.findOne({
          where: { id: values.processManageFinanceId },
        });

      if (processManageFinance.status == '1') {
        processManageFinance.status = '2';

        await this.processManageFinanceRepository.update(
          processManageFinance.id,
          processManageFinance,
        );
      } else {
        return {
          message_error: `${processManageFinance.code} ถูกดำเนินการไปแล้ว`,
        };
      }
    }

    const productSaleLists = Object.keys(req.body).reduce((acc, key) => {
      const match = key.match(/^productSaleLists\[(\d+)\]\[(\w+)\]$/);
      if (match) {
        const [, index, field] = match;
        acc[index] = acc[index] || {};
        acc[index][field] = req.body[key].value;
      }
      return acc;
    }, []);

    const check = await Promise.all(
      productSaleLists.map(async (list) => {
        const totalStock = parseFloat(
          (
            await this.productPriceRepository
              .createQueryBuilder('productPrice')
              .select('SUM(productPrice.amount)', 'totalStock')
              .where('productPrice.productId = :productId', {
                productId: list.productId,
              })
              .andWhere('productPrice.branchId = :branchId', {
                branchId: values.branchId,
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
      values.priceCash = values.priceTotalPaid;
      values.priceTransferCash = 0;

      values.priceReRiderCash = values.priceReRider;
      values.priceReRiderTransferCash = 0;

      values.priceRegAppleIdCash = values.priceRegAppleId;
      values.priceRegAppleIdTransferCash = 0;
    } else if (values.payType == '2') {
      values.priceCash = 0;
      values.priceTransferCash = values.priceTotalPaid;

      values.priceReRiderCash = 0;
      values.priceReRiderTransferCash = values.priceReRider;

      values.priceRegAppleIdCash = 0;
      values.priceRegAppleIdTransferCash = values.priceRegAppleId;
    } else if (values.payType == '3') {
      if (values.isMobileSale == '0') {
        values.priceCash = values.priceEquipCash;
        values.priceTransferCash = values.priceEquipTransferCash;
      }

      if (values.priceCash <= 0) {
        return {
          message_error: `เงินสด ไม่ควรติดลบ`,
        };
      } else if (values.priceTransferCash <= 0) {
        return {
          message_error: `เงินโอน ไม่ควรติดลบ`,
        };
      }

      if (values.priceReRider > 0) {
        if (
          values.priceReRiderCash == 0 &&
          values.priceReRiderTransferCash == 0
        ) {
          return {
            message_error: `เงินสดรับค่าส่ง และ เงินโอนรับค่าส่ง ไม่ตวรเป็น 0 บาท`,
          };
        } else if (
          values.priceReRiderCash < 0 ||
          values.priceReRiderTransferCash < 0
        ) {
          return {
            message_error: `เงินสดรับค่าส่ง หรือ เงินโอนรับค่าส่ง ไม่ตวรติดลบ`,
          };
        }
      }

      if (values.priceRegAppleId > 0) {
        if (
          values.priceRegAppleIdCash == 0 &&
          values.priceRegAppleIdTransferCash == 0
        ) {
          return {
            message_error: `เงินสดค่าสมัครอีเมล/AppleID/อื่น ๆ และ เงินโอนค่าสมัครอีเมล/AppleID/อื่น ๆ ไม่ตวรเป็น 0 บาท`,
          };
        } else if (
          values.priceRegAppleIdCash < 0 ||
          values.priceRegAppleIdTransferCash < 0
        ) {
          return {
            message_error: `เงินสดค่าสมัครอีเมล/AppleID/อื่น ๆ หรือ เงินโอนค่าสมัครอีเมล/AppleID/อื่น ๆ ไม่ตวรติดลบ`,
          };
        }
      }

      if (productSaleLists.length > 0) {
        if (values.priceEquipCash < 0 || values.priceEquipTransferCash < 0) {
          return {
            message_error: `เงินสดอุปกรณ์ หรือ เงินโอนอุปกรณ์ ไม่ตวรติดลบ`,
          };
        }
      }
    }

    if (check.message_error) {
      return check;
    }

    const branch = await this.branchRepository.findOneBy({
      id: values.branchId,
    });

    values.ownerBank = branch.ownerBank;
    values.ownerBankName = branch.ownerBankName;
    values.ownerBankNo = branch.ownerBankNo;

    const existingProduct = await this.productRepository.findOne({
      where: { id: values.productId },
      relations: [
        'productModel',
        'productType',
        'productColor',
        'productStorage',
      ],
    });

    if (values.randomCode == '1') {
      if (
        process.env.SYSTEM_BY == 'THUNDER' &&
        values.isMobileSale == '1' &&
        ['3', '4'].includes(values.saleType)
      ) {
        const branchDown = await this.branchRepository.findOneBy({
          isBranchDown: '1',
        });

        values.ownerBank = branchDown.ownerBank;
        values.ownerBankName = branchDown.ownerBankName;
        values.ownerBankNo = branchDown.ownerBankNo;

        const year = new Date().getFullYear().toString();

        const lastSale = await this.productSaleRepository.findOne({
          where: {
            isMobileSale: '1',
            branchId: branchDown.id,
          },
          order: { code: 'DESC' },
        });

        const sequence = lastSale ? parseInt(lastSale.code.slice(-4)) + 1 : 1;
        values.code = `${branchDown.code}${sequence.toString().padStart(5, '0')}`; // เช่น BR0010001
        values.branchId = branchDown.id;
      } else {
        const dateString = new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, '');
        const saleTypeMap = { '1': 'ST1', '2': 'ST2', '3': 'ST3', '4': 'ST4' };
        const prefix = `${dateString}${saleTypeMap[values.saleType] || 'ST1'}${branch.code}`;
        const lastSale = await this.productSaleRepository.findOne({
          where: { code: Like(`${prefix}%`) },
          order: { code: 'DESC' },
        });

        const sequence = lastSale ? parseInt(lastSale.code.slice(-4)) + 1 : 1;
        values.code = `${prefix}${sequence.toString().padStart(4, '0')}`;
      }
    }

    if (values.isMobileSale == '1') {
      const product = existingProduct;

      if (
        values.productBookId == undefined &&
        values.productSavingId == undefined
      ) {
        if (product.active != '1' || product.amount == 0) {
          return { message_error: `${product.code} ถูกขายไปแล้ว` };
        }
      } else {
        if (_.isNumber(values.productBookId)) {
          const exactProductBook = await this.productBookRepository.findOneBy({
            id: values.productBookId,
          });

          if (exactProductBook.status != '1') {
            return {
              message_error: `มัดจำ ${exactProductBook.code} ถูกดำเนินการไปแล้ว`,
            };
          } else {
            exactProductBook.status = '4';
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
        } else if (_.isNumber(values.productSavingId)) {
          const exactProductSaving =
            await this.productSavingRepository.findOneBy({
              id: values.productSavingId,
            });

          if (exactProductSaving.status != '1') {
            return {
              message_error: `ออม ${exactProductSaving.code} ถูกดำเนินการไปแล้ว`,
            };
          } else {
            exactProductSaving.status = '4';
            await this.productSavingRepository.update(
              {
                id: exactProductSaving.id,
              },
              exactProductSaving,
            );
            const exactProcessProductBook =
              await this.processSavingRepository.findOneBy({
                productSavingId: values.productSavingId,
                status: '1',
              });
            if (exactProcessProductBook) {
              exactProcessProductBook.status = '2';
              await this.processSavingRepository.update(
                {
                  id: exactProcessProductBook.id,
                },
                exactProcessProductBook,
              );
            } else {
              return {
                message_error: `ออม ${exactProductSaving.code} ถูกดำเนินการไปแล้ว`,
              };
            }
          }
        }
      }

      values.priceCostBuy = Number(existingProduct.priceCostBuy);

      // saleType 1 ขายหน้าร้าน
      // saleType 2 ขายออนไลน์
      // saleType 3 เช่าหน้าร้าน
      // saleType 4 เช่าออนไลน์

      if (values.saleType == '3' || values.saleType == '4') {
        const manageAppleId = await this.manageAppleIdRepository
          .createQueryBuilder('manageAppleId')
          // .where('manageAppleId.branchId = :branchId', { branchId: branch.id })
          .andWhere('manageAppleId.active = :active', { active: '1' })
          .orderBy('manageAppleId.count', 'ASC')
          .getOne();

        // if (_.isEmpty(manageAppleId)) {
        //   return {
        //     message_error: `กรุณาเพิ่ม AppleId ก่อน`,
        //   };
        // }

        const shopAppID = manageAppleId.appId.trim();

        values.shopAppID = shopAppID;
        values.shopPass = manageAppleId.pass;
        values.shopPin = String(Math.floor(Math.random() * 10000)).padStart(
          4,
          '0',
        );

        if (process.env.SYSTEM_BY == 'THUNDER') {
          if (
            existingProduct.productType.name.toLowerCase().includes('ipad') ||
            existingProduct.productType.name.toLowerCase().includes('tablet')
          ) {
            values.shopPin = '5321';
          } else {
            values.shopPin = existingProduct.imei.slice(8, 12); // ดึงตัวอักษรตำแหน่งที่ 9-12
          }
        }

        manageAppleId.count = Number(manageAppleId.count) + 1;
        await this.manageAppleIdRepository.update(
          {
            id: manageAppleId.id,
          },
          {
            count: manageAppleId.count,
          },
        );

        const messageManageAppleId = `Lock สัญญา: ${values.code}
        * imei: ${product.imei}
        * appId: ${values.shopAppID}
        * pass: ${values.shopPass}
        * pin: ${values.shopPin}
        * จำนวน: ${manageAppleId.count}`;
        await this.telegramNotificationService.sendTelegramNotify({
          botToken: branch.token_bot,
          chatId: branch.room_id_lockAppleId,
          message: messageManageAppleId,
        });

        // คำนวณ priceSomeProfit
        values.priceSomeProfit =
          values.priceSumAdjusted -
          (values.priceCostBuy - values.priceDownPayment);

        // คำนวณ priceProfit
        values.priceProfit =
          values.priceSumAdjusted * -1 + values.priceSomeProfit;

        if (values.useCalType == '2') {
          const calSumMonth = values.payPerMonth * values.valueMonth;
          values.priceSumInvoices = calSumMonth;
          values.priceSomeProfit = calSumMonth - values.priceBeforeAdjusted;
          values.priceProfit = values.priceBeforeAdjusted * -1;
        }
      } else {
        const calSale = values.priceSale - values.priceCostBuy;
        values.priceSomeProfit = calSale;
        values.priceProfit = calSale;
        values.isPaySuccess = '1';
      }

      if (values.isMobileSale == '1') {
        existingProduct.priceETC =
          Number(existingProduct.priceETC) + Number(values.priceETC);

        existingProduct.priceRegAppleId =
          Number(existingProduct.priceRegAppleId) +
          Number(values.priceRegAppleId);

        existingProduct.priceReRider =
          Number(existingProduct.priceReRider) + Number(values.priceReRider);

        values.hand = existingProduct.hand;

        if (existingProduct.hand == 'มือหนึ่ง') {
          existingProduct.hand = 'มือสอง';
          existingProduct.shopCenterInsurance = 'มี';
          existingProduct.shopCenterInsuranceDate = dayjs()
            .add(1, 'year')
            .toDate();
        }

        if (['3', '4'].includes(values.saleType)) {
          existingProduct.branchId = values.branchId;
          existingProduct.active = '3'; //มีในสัญญา
        } else {
          existingProduct.active = '4'; //ขายสด
        }

        existingProduct.amount = 0;

        const { productModel, productColor, productStorage, ...res } =
          existingProduct;

        const productLogDto: CreateProductLogDto = {
          productId: existingProduct.id, // ใช้ id จาก product
          action: values.isCash == '1' ? 'ขายสด' : 'มีในสัญญา',
          obj: JSON.stringify({
            before: product,
            after: res,
          }),
          branchId: values.branchId,
          userId: values.createByUserId, // ใช้ createByUserId แทน branchId
        };

        if (values.saleType == '3' || values.saleType == '4') {
          await this.productLogService.create(productLogDto);
        } else {
          await this.productLogService.create({
            ...productLogDto,
            action: 'ขายออกแล้ว',
          });
        }

        await this.productRepository.save(existingProduct);
      }
    }

    if (values.isMobileSale == '0' && values.productId) {
      const existingProduct = await this.productRepository.findOne({
        where: { id: values.productId },
      });

      const updateProductDto = {
        ...existingProduct,
        active: '8',
        // priceRepair:
        //   Number(existingProduct.priceRepair) +
        //   Number(newProductRepair.priceRepair),
        updateByUserId: values.createByUserId,
        note: `ซ่อมสินค้า: ${values.code}`,
      };

      // บันทึกการเปลี่ยนแปลงลง ProductLog ก่อนอัปเดต
      const productLogDto: CreateProductLogDto = {
        productId: existingProduct.id,
        action: 'เพิ่มค่าซ่อมสินค้า',
        obj: JSON.stringify({
          before: existingProduct,
          after: updateProductDto,
        }),
        branchId: values.branchId,
        userId: values.createByUserId,
      };

      await this.productLogService.create(productLogDto);

      // อัปเดต Product
      await this.productRepository.update(existingProduct.id, updateProductDto);
    }

    const savedProductSale = await this.productSaleRepository.save(values);

    const results = await Promise.all(
      productSaleLists.map((list) =>
        this.calculateCostAndStock(
          {
            ...list,
            branchId: savedProductSale.branchId,
          },
          savedProductSale.id,
          values.branchId,
          values.createByUserId,
        ),
      ),
    );

    const {
      priceEquDiscount,
      priceEquipCost,
      priceEquipProfit,
      priceEquipSum,
    } = results.reduce(
      (acc, result) => ({
        priceEquipCost: acc.priceEquipCost + result.priceCostBuy,
        priceEquipProfit: acc.priceEquipProfit + result.priceProfit,
        priceEquipSum: acc.priceEquipSum + result.priceEquipSum,
        priceEquDiscount: acc.priceEquDiscount + result.priceDiscount,
      }),
      {
        priceEquipCost: 0,
        priceEquipProfit: 0,
        priceEquipSum: 0,
        priceEquDiscount: 0,
      },
    );

    values.priceEquipCost = priceEquipCost;
    values.priceEquipProfit =
      isMobileSale == '0'
        ? priceEquipProfit - priceEquDiscount
        : priceEquipProfit;
    values.priceEquipSum =
      isMobileSale == '0' ? priceEquipSum - priceEquDiscount : priceEquipSum;

    if (values.payType == '1') {
      values.priceEquipCash =
        isMobileSale == '0' ? priceEquipSum - priceEquDiscount : priceEquipSum;
      values.priceEquipTransferCash = 0;
    } else if (values.payType == '2') {
      values.priceEquipCash = 0;
      values.priceEquipTransferCash =
        isMobileSale == '0' ? priceEquipSum - priceEquDiscount : priceEquipSum;
    }

    if (values.isMobileSale == '0') {
      values.priceSomeProfit = values.priceTotalPaid - values.priceEquipCost;
      values.priceProfit = values.priceSomeProfit;
    }

    const productPayMentLists = Object.keys(req.body).reduce((acc, key) => {
      const match = key.match(/^productPayMentLists\[(\d+)\]\[(\w+)\]$/);
      if (match) {
        const [, index, field] = match;
        acc[index] = acc[index] || {};
        acc[index][field] = req.body[key].value;
      }
      return acc;
    }, []);

    const productPaymentListEntities = productPayMentLists.map((list, k) => {
      return this.productPayMentListsRepository.create({
        datePay: list.datePay,
        payNo: k + 1,
        price: parseFloat(list.price.replace(/,/g, '')),
        productSaleId: savedProductSale.id,
        branchId: savedProductSale.branchId,
      });
    });

    if (values.saleType == '3' || values.saleType == '4') {
      const payPerMonth = productPaymentListEntities[0].price;
      values.priceSumInvoices = payPerMonth * values.valueMonth;
    }

    if (savedProductSale.isMobileSale == '1') {
      const message = `${savedProductSale.isCash == '1' ? 'ขายสด' : 'มีในสัญญา'}: ${savedProductSale.code}
      ทรัพย์สิน: ${existingProduct.imei}
      รุ่น: ${existingProduct.productModel.name}
      สี: ${existingProduct.productColor.name}
      ความจุ: ${existingProduct.productStorage.name}
      โดย: ${user.name}`;
      await this.telegramNotificationService.sendTelegramNotify({
        botToken: branch.token_bot,
        chatId: savedProductSale.isCash == '1' ? branch.room_id_sale_cash : branch.room_id_processCases,
        message: message,
      });
    }

    await this.productSaleRepository.update(savedProductSale.id, values);

    await this.productPayMentListsRepository.save(productPaymentListEntities);

    if (files.length > 0) {
      await fs.ensureDir(`${this.uploadsPath}/${savedProductSale.code}`);

      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const buffer = await fs.readFile(file.filepath);
        const randomName = generateRandomString(6);
        const filename = `${randomName}-${index + 1}.png`; // เช่น s123vas-1.png
        const filePath = path.join(
          `${this.uploadsPath}/${savedProductSale.code}`,
          filename,
        );

        await sharp(buffer)
          .png({ quality: 80, progressive: true })
          .toFile(filePath);

        let imageType = '1';
        if (file.fieldname === 'uploadFileProductSaleCustomer[]') {
          imageType = '2';
        }

        const newProductImage = this.productSaleImageRepository.create({
          name: filePath,
          productSaleId: savedProductSale.id,
          type: imageType,
          userId: savedProductSale.createByUserId,
        });

        await this.productSaleImageRepository.save(newProductImage);
      }
    }

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${values.code}`,
    };
  }

  async calculateCostAndStock(
    list: any,
    productSaleId: number,
    branchId: number,
    createByUserId: number,
  ): Promise<{
    priceDiscount: number;
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
      priceSumSale: 0,
      priceDiscount: 0,
      priceProfit: 0,
      priceCostBuy: 0,
      productSaleId: productSaleId,
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
    if (list.isFree == '1') {
      priceProfit = -totalCost;
    } else {
      priceProfit = Number(list.amount * obj.priceSale) - totalCost;
    }

    const priceEquipSum =
      Number(list.amount * obj.priceSale) - Number(list.priceDiscount);
    const finalProfit = priceProfit - Number(list.priceDiscount);

    obj.priceSumSale = priceEquipSum;
    obj.priceDiscount = Number(list.priceDiscount);
    obj.priceProfit = finalProfit;
    obj.priceCostBuy = totalCost;

    await this.productSaleListsRepository.save(obj);

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
      priceDiscount: obj.priceDiscount,
      priceProfit: finalProfit,
      priceCostBuy: totalCost,
      priceEquipSum: priceEquipSum,
    };
  }

  async findAll(searchProductDto: ProductSaleSearchDto): Promise<{
    data: ProductSale[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    // -------------------------
    // 1) Normalize Date
    // -------------------------
    const datStart = dayjs(searchProductDto.startDate).format(
      'YYYY-MM-DD HH:mm:ss',
    );
    const datEnd = dayjs(searchProductDto.endDate).format(
      'YYYY-MM-DD HH:mm:ss',
    );

    const skip = (searchProductDto.page - 1) * searchProductDto.pageSize;
    const take = searchProductDto.pageSize;

    const isCash = String(searchProductDto.isCash ?? '0'); // '1' | '0'
    const status = String(searchProductDto.isPaySuccess ?? '0'); // '0' = ทั้งหมด/ไม่กรอง
    const specialStatus = ['7', '8', '9']; // 7=ครบสัญญา, 8=ติดตามเครื่อง, 9=หนี้เสีย

    // -------------------------
    // 2) Common Filters (ใช้ร่วมกันทั้ง cash / non-cash)
    // -------------------------
    const applyBaseFilters = (
      qb: ReturnType<typeof this.productSaleRepository.createQueryBuilder>,
    ) => {
      qb.leftJoin('ps.create_by', 'user_creator').where(
        'ps.isMobileSale = :isMobileSale',
        {
          isMobileSale: searchProductDto.isMobileSale,
        },
      );

      qb.andWhere('ps.isCash = :isCash', { isCash });

      // saleType
      if (Array.isArray(searchProductDto.saleType)) {
        qb.andWhere('ps.saleType IN (:...saleTypes)', {
          saleTypes: searchProductDto.saleType,
        });
      } else if (searchProductDto.saleType != null) {
        qb.andWhere('ps.saleType = :saleType', {
          saleType: searchProductDto.saleType,
        });
      }

      // isCancel
      if (searchProductDto.isCancel != null) {
        qb.andWhere('ps.isCancel = :isCancel', {
          isCancel: searchProductDto.isCancel,
        });
      }

      // branchId
      if (searchProductDto.branchId != 0) {
        qb.andWhere(
          new Brackets((q) => {
            q.where('ps.branchId = :branchId').orWhere(
              'user_creator.branchId = :branchId',
            );
          }),
          { branchId: searchProductDto.branchId },
        );
      }

      // search
      if (searchProductDto.search) {
        const searchLike = `%${searchProductDto.search}%`;
        const searchBy = String(searchProductDto.searchBy ?? '0');

        qb.andWhere(
          new Brackets((q) => {
            switch (searchBy) {
              default:
                q.where('ps.code ILIKE :search', { search: searchLike })
                  .orWhere(
                    `EXISTS (
                    SELECT 1 FROM "customer" c
                    WHERE c.id = ps."customerId"
                      AND (c.name ILIKE :search OR c.lastname ILIKE :search OR c.tel ILIKE :search)
                  )`,
                    { search: searchLike },
                  )
                  .orWhere(
                    `EXISTS (
                    SELECT 1 FROM "product" p
                    WHERE p.id = ps."productId"
                      AND (p.code ILIKE :search OR p.imei ILIKE :search OR p."refOldStockNumber" ILIKE :search)
                  )`,
                    { search: searchLike },
                  );
            }
          }),
        );
      }

      return qb;
    };

    // -------------------------
    // 3) Payment/Status Filters (แยก isCash)
    // -------------------------
    const applyPaymentFilters = (
      qb: ReturnType<typeof this.productSaleRepository.createQueryBuilder>,
    ) => {
      // ✅ ขายสด: อิงวันสร้าง sale และใช้ ps.isPaySuccess (ไม่พึ่ง payment list)
      if (isCash === '1') {
        qb.andWhere('ps.create_date BETWEEN :startDate AND :endDate', {
          startDate: datStart,
          endDate: datEnd,
        });

        if (status !== '0') {
          qb.andWhere('ps.isPaySuccess = :isPaySuccess', {
            isPaySuccess: status,
          });
        }

        return qb;
      }

      // ✅ ไม่ขายสด
      if (searchProductDto.searchType === '0') {
        // โหมดเดิม: อิง payment list
        if (status !== '0') {
          const sq = qb
            .subQuery()
            .select('1')
            .from(ProductPayMentList, 'ppl')
            .where('ppl.productSaleId = ps.id')
            .andWhere('ppl.isPaySuccess = :isPaySuccess')
            .getQuery();

          qb.andWhere(`EXISTS (${sq})`, { isPaySuccess: status });
        }
      } else {
        // searchType != 0
        if (status !== '0') {
          if (specialStatus.includes(status)) {
            qb.andWhere('ps.isPaySuccess = :isPaySuccess', {
              isPaySuccess: status,
            });

            qb.andWhere('ps.create_date BETWEEN :startDate AND :endDate', {
              startDate: datStart,
              endDate: datEnd,
            });
          } else {
            const sqMatch = qb
              .subQuery()
              .select('1')
              .from(ProductPayMentList, 'ppl')
              .where('ppl.productSaleId = ps.id')
              .andWhere('ppl.datePay BETWEEN :startDate AND :endDate')
              .andWhere('ppl.isPaySuccess = :isPaySuccess')
              .getQuery();

            qb.andWhere(`EXISTS (${sqMatch})`, {
              startDate: datStart,
              endDate: datEnd,
              isPaySuccess: status,
            });
          }
        } else {
          qb.andWhere('ps.create_date BETWEEN :startDate AND :endDate', {
            startDate: datStart,
            endDate: datEnd,
          });
        }
      }

      return qb;
    };

    const applyAllFilters = (
      qb: ReturnType<typeof this.productSaleRepository.createQueryBuilder>,
    ) => {
      applyBaseFilters(qb);
      applyPaymentFilters(qb);
      return qb;
    };

    // -------------------------
    // 4) COUNT (DISTINCT)
    // -------------------------
    const countQb = this.productSaleRepository.createQueryBuilder('ps');
    applyAllFilters(countQb);

    const totalRow = await countQb
      .select('COUNT(DISTINCT ps.id)', 'cnt')
      .getRawOne<{ cnt: string }>();

    const total = Number(totalRow?.cnt ?? 0);

    // -------------------------
    // 5) PAGE SUBQUERY (ids only)
    // -------------------------
    const pageSubQb = this.productSaleRepository.createQueryBuilder('ps');
    applyAllFilters(pageSubQb);

    pageSubQb
      .select('ps.id', 'id')
      .orderBy('ps.create_date', 'DESC')
      .limit(take)
      .offset(skip);

    // -------------------------
    // 6) SUM SUBQUERY (optional ใช้ประกอบ ถ้าหน้าคุณใช้)
    // -------------------------
    const pplSumSub = this.dataSource
      .createQueryBuilder()
      .from(ProductPayMentList, 'ppl')
      .select('ppl.productSaleId', 'productSaleId')
      .addSelect('SUM(ppl.price)', 'sumPrice')
      .addSelect('SUM(ppl.pricePay)', 'sumPricePay')
      .addSelect('SUM(ppl.priceDebt)', 'sumPriceDebt')
      .groupBy('ppl.productSaleId');

    // -------------------------
    // 7) MAIN QUERY (SELECT เฉพาะที่ตารางใช้)
    // -------------------------
    const mainQb = this.productSaleRepository
      .createQueryBuilder('product_sale')
      .innerJoin(
        '(' + pageSubQb.getQuery() + ')',
        'page_ids',
        'page_ids.id = product_sale.id',
      )
      .setParameters(pageSubQb.getParameters())

      // ✅ join แบบไม่ select ทั้งก้อน
      .leftJoin('product_sale.product', 'product')
      .leftJoin('product.productModel', 'product_model')
      .leftJoin('product.productColor', 'product_color')
      .leftJoin('product.productStorage', 'product_storage')

      .leftJoin('product_sale.customer', 'customer')
      .leftJoin('product_sale.reseller', 'reseller')

      .leftJoin('product_sale.processManageFinance', 'processManageFinance')
      .leftJoin('processManageFinance.create_by', 'vender')

      .leftJoin('product_sale.create_by', 'user')
      .leftJoin('user.branch', 'branch')

      .leftJoin('product_sale.productPayMentLists', 'productPayMentLists')

      .leftJoin(
        '(' + pplSumSub.getQuery() + ')',
        'ppl_sum',
        'ppl_sum."productSaleId" = product_sale.id',
      )
      .setParameters(pplSumSub.getParameters());

    // ✅ รูปแรก: ทำเป็น subquery หา id แล้ว map เป็น array ชื่อเดิม (productSaleImages)
    mainQb.leftJoin(
      ProductSaleImage,
      'psi1',
      `
      psi1."id" = (
        SELECT psi.id
        FROM "product_sale_image" psi
        WHERE psi."productSaleId" = product_sale.id
        ORDER BY psi.create_date ASC, psi.id ASC
        LIMIT 1
      )
    `,
    );

    // map ให้ frontend ยังใช้ productSaleImages[0] ได้เหมือนเดิม
    mainQb.leftJoinAndMapMany(
      'product_sale.productSaleImages',
      ProductSaleImage,
      'psi1_map',
      'psi1_map.id = psi1.id',
    );

    // ✅ ตัด productSaleLists ออกถ้าเป็น mobile sale (ใน React ไม่ได้ใช้)
    // ถ้าไม่ใช่ mobile sale ค่อย join/select เฉพาะที่จำเป็น
    if (searchProductDto.isMobileSale == '0') {
      mainQb.leftJoin('product_sale.productSaleLists', 'productSaleLists');
    }

    // ✅ SELECT เฉพาะคอลัมน์ที่ตารางใช้จริง
    mainQb.select([
      // product_sale
      'product_sale.id',
      'product_sale.code',
      'product_sale.create_date',
      'product_sale.saleType',
      'product_sale.hand',
      'product_sale.priceRepair',
      'product_sale.priceTotalPaid',
      'product_sale.priceDownPayment',
      'product_sale.priceSumInvoices',
      'product_sale.priceSumPayInvoices',
      'product_sale.priceReseller',
      'product_sale.isMobileSale',
      'product_sale.customerId',
      'product_sale.productId',

      // customer
      'customer.id',
      'customer.name',
      'customer.lastname',
      'customer.tel',

      // product + relations
      'product.id',
      'product.code',
      'product.imei',
      'product.refOldStockNumber',
      'product.batteryHealth',
      'product.boxType',
      'product.shopCenterInsurance',
      'product.shopCenterInsuranceDate',
      'product.shopInsurance',
      'product.priceCostBuy',
      'product.priceRepair',

      'product_model.id',
      'product_model.name',
      'product_color.id',
      'product_color.name',
      'product_storage.id',
      'product_storage.name',

      // reseller
      'reseller.id',
      'reseller.code',

      // user + branch
      'user.id',
      'user.name',
      'branch.id',
      'branch.name',

      // processManageFinance + vender
      'processManageFinance.id',
      'vender.id',
      'vender.name',

      // payment list (สีแถว + ตารางย่อย)
      'productPayMentLists.id',
      'productPayMentLists.payNo',
      'productPayMentLists.datePay',
      'productPayMentLists.price',
      'productPayMentLists.pricePay',
      'productPayMentLists.priceDebt',
      'productPayMentLists.isPaySuccess',

      // รูปแรก
      'psi1.id',
      'psi1.name',
      'psi1_map.id',
      'psi1_map.name',
    ]);

    // ถ้าไม่ใช่ mobile sale: select ฟิลด์ที่ React ใช้จริงของ productSaleLists
    if (searchProductDto.isMobileSale == '0') {
      mainQb.addSelect([
        'productSaleLists.id',
        'productSaleLists.isFree',
        'productSaleLists.productName',
        'productSaleLists.priceCostBuy',
      ]);
    }

    mainQb
      .orderBy('product_sale.create_date', 'DESC')
      .addOrderBy('productPayMentLists.datePay', 'ASC');

    // ✅ ใช้ getMany เพื่อให้ relation เติมตาม select ที่เลือกไว้
    const data = await mainQb.getMany();

    return {
      data,
      total,
      page: searchProductDto.page,
      pageSize: searchProductDto.pageSize,
    };
  }

  async findRental(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    const { pageSize, page } = req.body as any;

    const queryBuilder =
      this.productSaleRepository.createQueryBuilder('product_sale');

    queryBuilder
      .select([
        'product_sale.id',
        'product_sale.code',
        'product_sale.isCancel',
        'product_sale.isPaySuccess',
        'product_sale.priceSumInvoices',
        'product_sale.priceSumPayInvoices',
        'product_sale.create_date',
        'product.id',
        'product.fileProduct',
        'product.imei',
        'product.batteryHealth',
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
      ])
      .leftJoin('product_sale.product', 'product')
      .leftJoin('product.productModel', 'product_model')
      .leftJoin('product.productColor', 'product_color')
      .leftJoin('product.productStorage', 'product_storage');

    queryBuilder.where('product_sale.customerId = :customerId', {
      customerId: user.customerId,
    });

    queryBuilder.andWhere('product_sale.isMobileSale = :isMobileSale', {
      isMobileSale: '1',
    });

    queryBuilder.andWhere('product_sale.isCancel = :isCancel', {
      isCancel: '0',
    });

    queryBuilder.andWhere('product_sale.saleType IN (:...saleType)', {
      saleType: ['3', '4'],
    });

    queryBuilder.orderBy('product_sale.create_date', 'DESC');

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

  // async findOne(id: number): Promise<any> {
  // async findOne(id: number): Promise<ProductSale | null> {
  async findOne(id: number): Promise<any> {
    // const productSales = await this.productSaleRepository.find();

    // for (let index = 0; index < productSales.length; index++) {
    //   const productSale = productSales[index];
    //   const shopAppID = await this.manageAppleIdRepository.findOneBy({
    //     appId: productSale.shopAppID.trim(),
    //   });

    //   await this.productSaleRepository.update(
    //     { id: productSale.id },
    //     { manageAppleId: shopAppID.id },
    //   );
    // }

    // const productSales = await this.productSaleRepository.find({
    //   where: { processManageFinanceId: Not(IsNull()) },
    //   relations: ['product'],
    // });

    // for (let index = 0; index < productSales.length; index++) {
    //   const productSale = productSales[index];
    //   await this.processManageFinanceRepository.update(
    //     { id: productSale.processManageFinanceId },
    //     {
    //       priceCost: productSale.product.priceCostBuy,
    //       approveByUserId: productSale.createByUserId,
    //     },
    //   );
    // }

    // // Optimized batch processing
    // interface RawLog {
    //   obj: string;
    //   productId: number;
    // }

    // const BATCH_SIZE = 500;
    // // 1. Fetch all sales that need updating, only selecting necessary columns.
    // const salesToProcess = await this.productSaleRepository.find({
    //   select: ['id', 'productId'],
    //   where: { isMobileSale: '1' },
    // });

    // if (salesToProcess.length > 0) {
    //   const salesToUpdate = [];

    //   // 2. Process in batches
    //   for (let i = 0; i < salesToProcess.length; i += BATCH_SIZE) {
    //     const chunk = salesToProcess.slice(i, i + BATCH_SIZE);
    //     const productIds = chunk.map((sale) => sale.productId).filter(Boolean);

    //     if (productIds.length === 0) {
    //       continue;
    //     }

    //     // 3. Fetch the latest 'ซื้อเข้า' log for each product in the batch.
    //     const relevantLogs: RawLog[] =
    //       await this.productSaleRepository.manager.query(
    //         `
    //       SELECT obj, "productId" FROM (
    //           SELECT obj, "productId", ROW_NUMBER() OVER(PARTITION BY "productId" ORDER BY create_date DESC) as rn
    //           FROM product_log
    //           WHERE "productId" = ANY($1) AND action = 'ซื้อเข้า'
    //       ) tmp WHERE rn = 1
    //     `,
    //         [productIds],
    //       );

    //     // 4. Create a Map for efficient lookup.
    //     const logMap = new Map<number, RawLog>(
    //       relevantLogs.map((log) => [log.productId, log]),
    //     );

    //     // 5. Prepare data for update.
    //     for (const sale of chunk) {
    //       const log = logMap.get(sale.productId);
    //       if (log && log.obj) {
    //         try {
    //           const parsedObj = JSON.parse(log.obj);
    //           const hand = parsedObj?.before?.hand;
    //           if (hand) {
    //             salesToUpdate.push({ id: sale.id, hand: hand });
    //           }
    //         } catch (e) {
    //           console.error(
    //             `เกิดข้อผิดพลาดในการ parse JSON สำหรับ productId: ${sale.productId}`,
    //             e,
    //           );
    //         }
    //       }
    //     }
    //   }

    //   // 6. Save all updates to the database in batches.
    //   if (salesToUpdate.length > 0) {
    //     // Note: This requires a 'hand' column in the 'ProductSale' table/entity.
    //     await this.productSaleRepository.save(salesToUpdate, { chunk: 100 });
    //   }
    // }

    // const products = await this.productRepository.find({
    //   where: { branchId: 3, catalog: 'อุปกรณ์เสริม' }, // ระบุเงื่อนไข
    //   select: [
    //     'id',
    //     'branchId',
    //     'amount',
    //     'priceCostBuy',
    //     'priceSale',
    //   ], // เลือกเฉพาะคอลัมน์ที่ต้องการ
    // });

    // for (let index = 0; index < products.length; index++) {
    //   const product = products[index];

    //   // ดึงข้อมูล productPrice ที่เกี่ยวข้องกับ product แต่ละรายการ
    //   const productPrice = await this.productPriceRepository.findOne({
    //     where: {
    //       productId: product.id,
    //       branchId: product.branchId,
    //     },
    //   });

    //   // ตรวจสอบว่า productPrice มีอยู่จริงก่อนทำการ update
    //   if (productPrice) {
    //     await this.productPriceRepository.update(
    //       {
    //         productId: product.id,
    //         branchId: product.branchId,
    //         id: productPrice.id, // ใช้ ID ของ productPrice ในการ update
    //       },
    //       {
    //         amount: product.amount,
    //       },
    //     );
    //   } else {
    //     // ถ้าไม่มี ให้สร้างใหม่
    //     const newProductPrice = this.productPriceRepository.create({
    //       productId: product.id,
    //       branchId: product.branchId,
    //       amount: product.amount,
    //       priceCostBuy: product.priceCostBuy,
    //     });
    //     await this.productPriceRepository.save(newProductPrice);
    //   }
    // }

    // 1. ดึงข้อมูล product sales ที่ต้องการอัปเดตเท่านั้น
    // const productSalesToUpdate = await this.productSaleRepository.find({
    //   where: {
    //     saleType: In(['3', '4']),
    //     id: MoreThan(4192),
    //   },
    //   select: ['id', 'branchId'], // เลือกเฉพาะ field ที่จำเป็น
    // });

    // if (productSalesToUpdate.length > 0) {
    //   // 2. ดึง branchId ที่ไม่ซ้ำกันออกมา
    //   const branchIds = [
    //     ...new Set(productSalesToUpdate.map((ps) => ps.branchId)),
    //   ];

    //   // 3. ดึงข้อมูล branch ทั้งหมดที่ต้องการใน query เดียว
    //   const branches = await this.branchRepository.find({
    //     where: {
    //       id: In(branchIds),
    //     },
    //     select: ['id', 'ownerBank', 'ownerBankName', 'ownerBankNo'],
    //   });

    //   // 4. สร้าง Map ของ branch เพื่อให้ค้นหาได้รวดเร็ว
    //   const branchMap = new Map(branches.map((b) => [b.id, b]));

    //   // 5. เตรียมข้อมูลสำหรับการอัปเดตเป็นชุด (batch update)
    //   const updatePayloads = productSalesToUpdate
    //     .map((sale) => {
    //       const branch = branchMap.get(sale.branchId);
    //       if (branch) {
    //         return {
    //           id: sale.id,
    //           ownerBank: branch.ownerBank,
    //           ownerBankName: branch.ownerBankName,
    //           ownerBankNo: branch.ownerBankNo,
    //         };
    //       }
    //       return null;
    //     })
    //     .filter((payload) => payload !== null);

    //   // 6. สั่งอัปเดตข้อมูลทั้งหมดในครั้งเดียว โดยแบ่งเป็นชุดๆ (chunk) เพื่อประสิทธิภาพ
    //   if (updatePayloads.length > 0) {
    //     await this.productSaleRepository.save(updatePayloads, { chunk: 500 });
    //   }
    // }

    // const productSale = await this.productSaleRepository.findOne({
    //   where: { id: id },
    //   relations: ['product'],
    // });

    // const productSaleLists = await this.productSaleListsRepository.find();

    // for (let index = 0; index < productSaleLists.length; index++) {
    //   const productSaleList = productSaleLists[index];

    //   productSaleList.priceSumSale =
    //     Number(productSaleList.amount) * Number(productSaleList.priceSale);

    //   await this.productSaleListsRepository.update(
    //     {
    //       id: productSaleList.id,
    //     },
    //     {
    //       ...productSaleList,
    //     },
    //   );
    // }

    // const manageAppleId = await this.manageAppleIdRepository
    //   .createQueryBuilder('manageAppleId')
    //   .where('manageAppleId.branchId = :branchId', {
    //     branchId: productSale.branchId,
    //   })
    //   .andWhere('manageAppleId.active = :active', { active: '1' })
    //   .orderBy('manageAppleId.count', 'ASC')
    //   .getOne();

    // const branch = await this.branchRepository.findOneBy({
    //   id: productSale.branchId,
    // });

    // manageAppleId.count = Number(manageAppleId.count) + 1;

    // const messageManageAppleId = `Lock สัญญา: ${productSale.product.imei}
    // * appId: ${manageAppleId.appId}
    // * pass: ${manageAppleId.pass}
    // * pin: ${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}
    // * จำนวน: ${manageAppleId.count}`;
    // // return messageManageAppleId;

    // await this.manageAppleIdRepository.update(
    //   {
    //     id: manageAppleId.id,
    //   },
    //   {
    //     count: manageAppleId.count,
    //   },
    // );

    // await this.telegramNotificationService.sendTelegramNotify({
    //   botToken: branch.token_bot,
    //   chatId: branch.room_id_lockAppleId,
    //   message: messageManageAppleId,
    // });

    // const productSales = await this.productSaleRepository.find({
    //   where: { isCancel: '0' },
    //   relations: ['productSaleLists'],
    // });

    // for (let index = 0; index < productSales.length; index++) {
    //   const { productSaleLists, ...productSale } = productSales[index];
    //   for (let index2 = 0; index2 < productSaleLists.length; index2++) {
    //     const productSale = productSaleLists[index2];
    //     const product = await this.productRepository.findOne({
    //       where: { id: productSale.productId },
    //     });

    //     if (productSale.isFree == '0') {
    //       product.amountSale = Number(product.amountSale);
    //       product.amountSale += Number(productSale.amount);

    //       product.amountRemaining = Number(product.amountRemaining);
    //       product.amountRemaining += Number(productSale.amount);

    //       product.priceSumSale = Number(product.priceSumSale);
    //       product.priceSumSale += Number(productSale.priceSale);
    //     }

    //     await this.productRepository.update(product.id, product);
    //   }
    // }

    return this.productSaleRepository.findOne({
      where: { id },
      relations: [
        'productPayMentLists',
        'productSaleLists',
        'productSaleImages',
      ],
      order: {
        productPayMentLists: {
          payNo: 'ASC',
        },
      },
    });
  }

  async notifyContact(id: number, type: string): Promise<any> {
    const productSale = await this.productSaleRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    const messageManageAppleId = `${type == 'lock' ? 'Lock สัญญา' : 'UnLock สัญญา'}: ${productSale.code}
    * imei: ${productSale.product.imei}
    * appId: ${productSale.shopAppID}
    * pass: ${productSale.shopPass}
    * pin: ${productSale.shopPin}`;

    const branch = await this.branchRepository.findOneBy({
      id: productSale.branchId,
    });

    await this.telegramNotificationService.sendTelegramNotify({
      botToken: branch.token_bot,
      chatId: branch.room_id_lockAppleId,
      message: messageManageAppleId,
    });
  }

  async reportProductById(id: number, req: FastifyRequest): Promise<Buffer> {
    const user = (req as any).user;

    const productSaleList = await this.productSaleListsRepository.find({
      where: { productId: id },
      relations: ['productSale'],
      order: {
        create_date: 'DESC',
      },
    });

    const isFreeTranslations = {
      '0': 'ซื้อ',
      '1': 'แถม',
      '2': 'เครม',
    };

    // Calculate totals using reduce to avoid multiple loops
    const { totalAmount, totalPriceSumSale } = productSaleList.reduce(
      (totals, item) => {
        totals.totalAmount += Number(item.amount) || 0;
        totals.totalPriceSumSale += Number(item.priceSumSale) || 0;
        return totals;
      },
      { totalAmount: 0, totalPriceSumSale: 0 },
    );

    const tableHeader = [
      { text: 'ลำดับ', style: 'tableHeader' },
      { text: 'เลขสัญญา', style: 'tableHeader' },
      { text: 'วันที่', style: 'tableHeader' },
      { text: 'ประเภท', style: 'tableHeader' },
      { text: 'จำนวน', style: 'tableHeader' },
      { text: 'ราคาขาย', style: 'tableHeader' },
    ];

    const tableBody = [
      tableHeader,
      ...productSaleList.map((item, k) => [
        { text: k + 1, alignment: 'right' },
        { text: item.productSale?.code || '-', alignment: 'left' },
        {
          text: formatDateTH(item.productSale?.create_date) || '-',
          alignment: 'left',
        },
        { text: isFreeTranslations[item.isFree] || '-', alignment: 'left' }, // Add isFree translation

        {
          text: item.amount ? formatNumberDigit(item.amount) : '0',
          alignment: 'right',
        },
        {
          text: item.priceSumSale ? formatNumberDigit(item.priceSumSale) : '0',
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

    const product = await this.productRepository.findOne({
      where: { id },
    });

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [20, 40, 20, 20],
      info: {
        title: `Product-${product.code}`,
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
            { text: `ประวัติการขายของ ${product.code}`, style: 'header' },
            {
              columns: [
                {
                  width: '*',
                  stack: [
                    {
                      text: `วันที่: ${formatDateNumberWithoutTime(dayjs())}`,
                      style: 'subheaderLeft',
                    },
                    {
                      text: `จำนวนรายการ: ${productSaleList.length}`,
                      style: 'subheaderLeft',
                    },
                  ],
                },
                {
                  width: '*',
                  stack: [
                    {
                      text: ` `,
                      style: 'subheaderRight',
                    },
                    {
                      text: `รวมยอดเป็นเงิน: ${formatNumberDigit(totalPriceSumSale)} บ.`,
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
            widths: ['auto', '*', '*', 'auto', 'auto', 'auto'],
            body: tableBody,
            keepWithHeaderRows: true,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#f0f0f0' : null,
          },
        },
        ...(productSaleList.length === 0
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

  async getProfit(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;
    const { startDate, endDate, branchId } = req.body as any;

    // ดึง permissions จาก Redis

    let permissions = await this.productService.fetchPermission(user);

    const saleProductMobile = await this.fetchProductSaleDaylily(
      '1',
      branchId,
      startDate,
      endDate,
    );

    const saleProductAccessibility = await this.fetchProductSaleDaylily(
      '0',
      branchId,
      startDate,
      endDate,
    );

    const saleProductReRider = await this.fetchProductSaleDaylily(
      '2',
      branchId,
      startDate,
      endDate,
    );

    const saleProductRegAppleId = await this.fetchProductSaleDaylily(
      '3',
      branchId,
      startDate,
      endDate,
    );

    let productPayMent = [];

    if (permissions.includes('view-productPayMent')) {
      productPayMent = await this.fetchProductPayMent(
        branchId,
        startDate,
        endDate,
      );
    }

    const productBook = await this.fetchProductBook(
      branchId,
      startDate,
      endDate,
    );

    const productRepair = await this.fetchProductRepair(
      branchId,
      startDate,
      endDate,
    );

    const expenses = await this.fetchExpenses(branchId, startDate, endDate);

    const branchTransferPrice = await this.fetchBranchTransferPrice(
      branchId,
      startDate,
      endDate,
    );

    return {
      saleProductMobile: saleProductMobile,
      saleProductAccessibility: saleProductAccessibility,
      saleProductReRider: saleProductReRider,
      saleProductRegAppleId: saleProductRegAppleId,

      productPayMent: productPayMent,
      productBook: productBook,
      productRepair: productRepair,

      expenses: expenses,
      branchTransferPrice: branchTransferPrice,
    };
  }

  async getSummaryProfit(req: FastifyRequest): Promise<any> {
    const { startDate, endDate, branchId } = req.body as any;

    const productPayMent = await this.fetchProductPayMent(
      branchId,
      startDate,
      endDate,
    );

    return {
      productPayMent: productPayMent,
    };
  }

  async fetchProductSaleDaylily(
    isMobileSale: '1' | '0' | '2' | '3',
    branchId: number,
    startDate: any,
    endDate: any,
  ): Promise<any> {
    // Define field mappings for sumCash and sumTransfer based on isMobileSale
    const fieldMappings: Record<
      string,
      { sumCashField: string; sumTransferField: string }
    > = {
      '0': {
        sumCashField: 'priceEquipCash',
        sumTransferField: 'priceEquipTransferCash',
      },
      '2': {
        sumCashField: 'priceReRiderCash',
        sumTransferField: 'priceReRiderTransferCash',
      },
      '3': {
        sumCashField: 'priceRegAppleIdCash',
        sumTransferField: 'priceRegAppleIdTransferCash',
      },
    };

    // Create Query Builder
    const queryBuilder = this.productSaleRepository
      .createQueryBuilder('product_sale')
      .select([
        'product_sale."isCancel" AS "isCancel"',
        'product_sale."payType" AS "payType"',
        'bank.bankNo AS "bankNo"',
        'bank.bankOwner AS "bankOwner"',
        'bank.bankName AS "bankName"',
        'COUNT(*) AS "count"',
      ])
      .where('product_sale.create_date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      })
      .leftJoin('product_sale.bank', 'bank')
      .groupBy('product_sale."isCancel"')
      .addGroupBy('product_sale."payType"')
      .addGroupBy('product_sale.bankId')
      .addGroupBy('bank.bankNo')
      .addGroupBy('bank.bankOwner')
      .addGroupBy('bank.bankName');

    // Add conditional selections based on isMobileSale
    if (isMobileSale === '1') {
      queryBuilder.andWhere('product_sale."isMobileSale" = :isMobileSale', {
        isMobileSale,
      });
      queryBuilder.addSelect([
        `
  SUM(
    COALESCE(product_sale."priceCash", 0)
    - COALESCE(product_sale."priceRegAppleIdCash", 0)
    - COALESCE(product_sale."priceEquipCash", 0)
    - COALESCE(product_sale."priceReRiderCash", 0)
  )::FLOAT AS "sumCash"
  `,

        // โอน: หัก AppleID + อุปกรณ์ + ค่าส่ง "เสมอ"
        `
  SUM(
    COALESCE(product_sale."priceTransferCash", 0)
    - COALESCE(product_sale."priceRegAppleIdTransferCash", 0)
    - COALESCE(product_sale."priceEquipTransferCash", 0)
    - COALESCE(product_sale."priceReRiderTransferCash", 0)
  )::FLOAT AS "sumTransfer"
  `,
      ]);
    } else if (isMobileSale === '0') {
      const { sumCashField, sumTransferField } = fieldMappings[isMobileSale];

      queryBuilder
        .andWhere('product_sale."priceEquipSum" > :priceEquipSum', {
          priceEquipSum: 0,
        })
        .addSelect([
          `SUM(product_sale."${sumCashField}") AS "sumCash"`,
          `SUM(product_sale."${sumTransferField}") AS "sumTransfer"`,
        ]);
    } else {
      const { sumCashField, sumTransferField } = fieldMappings[isMobileSale];
      if (isMobileSale == '2') {
        queryBuilder.andWhere('product_sale."priceReRider" > :priceReRider', {
          priceReRider: 0,
        });
      } else if (isMobileSale == '3') {
        queryBuilder.andWhere(
          'product_sale."priceRegAppleId" > :priceRegAppleId',
          {
            priceRegAppleId: 0,
          },
        );
      }
      queryBuilder.addSelect([
        `SUM(product_sale."${sumCashField}") AS "sumCash"`,
        `SUM(product_sale."${sumTransferField}") AS "sumTransfer"`,
      ]);
    }

    // Add branchId condition only when branchId is not 0
    if (branchId !== 0) {
      queryBuilder.andWhere('product_sale."branchId" = :branchId', {
        branchId,
      });
    }

    // Run query
    const productSales = await queryBuilder.getRawMany();

    // Calculate totals
    const totalCount = productSales.reduce(
      (sum, p) => sum + Number(p.count),
      0,
    );

    const contractCount = productSales
      .filter((p) => p.isCancel === '0')
      .reduce((sum, p) => sum + Number(p.count), 0);

    const contractTotalPaid = productSales
      .filter((p) => p.isCancel === '0')
      .reduce(
        (sum, p) => sum + Number(p.sumCash || 0) + Number(p.sumTransfer || 0),
        0,
      );

    // Create summary message
    const typeLabel =
      isMobileSale === '1'
        ? 'มือถือ'
        : isMobileSale === '0'
          ? 'อุปกรณ์'
          : isMobileSale === '2'
            ? 'รับค่าส่ง'
            : isMobileSale === '3'
              ? 'ค่าสมัครอีเมล/AppleID/อื่น ๆ'
              : 'ไม่ระบุ';

    return {
      typeLabel,
      productSales,
      totalCount,
      contractCount,
      contractTotalPaid,
    };
  }

  async fetchProductBook(branchId: number, startDate: any, endDate: any) {
    const queryBuilder = this.productBookRepository
      .createQueryBuilder('productBook')
      .leftJoin('productBook.bank', 'bank')
      .select([
        'productBook.bankId AS "bankId"',
        'bank.bankName AS "bankName"',
        'bank.bankNo AS "bankNo"',
        'bank.bankOwner AS "bankOwner"',
        'productBook.payType AS "payType"',
        'COUNT(productBook.id)::INTEGER AS "count"',
        'SUM(productBook.priceTransferCash)::FLOAT AS "totalTransferCash"',
        'SUM(productBook.priceCash)::FLOAT AS "totalPriceCash"',
      ])

      .where('productBook.create_date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
      .groupBy('productBook.bankId')
      .addGroupBy('bank.bankName')
      .addGroupBy('bank.bankNo')
      .addGroupBy('bank.bankOwner')
      .addGroupBy('productBook.payType')
      .addGroupBy('productBook.status')
      .orderBy('productBook.bankId', 'ASC')
      .addOrderBy('productBook.payType', 'ASC')
      .addOrderBy('productBook.status', 'ASC');

    if (branchId !== 0) {
      queryBuilder.andWhere('productBook.branchId = :branchId', { branchId });
    }

    const results = await queryBuilder.getRawMany();

    return results;
  }

  async fetchProductRepair(branchId: number, startDate: any, endDate: any) {
    const queryBuilder = this.productRepairRepository
      .createQueryBuilder('product_repair')
      .select([
        'product_repair.id',
        'product_repair.code',
        'product_repair.active',
        'product_repair.note',
        'product_repair.imei',
        'product_repair."pricePredict"',
        'product_repair."priceRepair"',
        'product_repair."priceEquipProfit"',
        'product_repair."shopName"',
        'product_repair.create_date',
        `CASE product_repair."typeRepair"
           WHEN '1' THEN 'เครื่องหน้าร้าน'
           WHEN '2' THEN 'ลูกค้าหน้าร้าน'
           WHEN '3' THEN 'ร้านค้าส่งซ่อม'
           ELSE 'ไม่ระบุ'
         END AS typeRepair`,
        'branch.id',
        'branch.name',
        'user.id',
        'user.name',
        'product.id',
        'product.code',
        'product.imei',
        'productModel.id',
        'productModel.name',
        'repairProductModel.id',
        'repairProductModel.name',
      ])
      .leftJoin('product_repair.branch', 'branch')
      .leftJoin('product_repair.product', 'product')
      .leftJoin('product.productModel', 'productModel')
      .leftJoin('product_repair.productModel', 'repairProductModel')
      .leftJoin('product_repair.create_by', 'user')
      .andWhere('product_repair.active = :active', { active: '1' })
      .andWhere('product_repair.create_date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
      .orderBy('product_repair.id', 'DESC');

    if (branchId !== 0) {
      queryBuilder.andWhere('product_repair.branchId = :branchId', {
        branchId,
      });
    }

    const results = await queryBuilder.getRawMany();

    return results;
  }

  async fetchExpenses(branchId: number, startDate: any, endDate: any) {
    const queryBuilder = this.expenseRepository
      .createQueryBuilder('expenses')
      .select([
        'expenses.expenseTypeId AS "expenseTypeId"',
        'expenseType.name AS "expenseTypeName"',
        'expenses.bankId AS "bankId"',
        'bank.bankName AS "bankName"',
        'bank.bankNo AS "bankNo"',
        'bank.bankOwner AS "bankOwner"',

        'expenses.payType AS "payType"',
        'SUM(CAST(expenses.price AS DECIMAL))::FLOAT AS "totalPrice"',
        'COUNT(*)::INTEGER AS "count"',
      ])
      .leftJoin('expenses.bank', 'bank')
      .leftJoin('expenses.expenseType', 'expenseType')
      .where('expenses.create_date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });

    if (branchId !== 0) {
      queryBuilder.andWhere('expenses.branchId = :branchId', { branchId });
    }

    queryBuilder
      .groupBy('expenses.expenseTypeId')
      .addGroupBy('expenseType.name')
      .addGroupBy('expenses.bankId')
      .addGroupBy('bank.bankName')
      .addGroupBy('bank.bankNo')
      .addGroupBy('bank.bankOwner')
      .addGroupBy('expenses.payType');

    return await queryBuilder.getRawMany();
  }

  async fetchBranchTransferPrice(
    branchId: number,
    startDate: any,
    endDate: any,
  ) {
    const queryBuilder = this.branchTransferPriceRepository
      .createQueryBuilder('branch_transfer_price')
      .select([
        'branch_transfer_price.branchId AS "branchId"',
        'branch.name AS "branchName"',
        'branch_transfer_price.fromBranchId AS "fromBranchId"',
        'fromBranch.name AS "fromBranchName"',
        'branch_transfer_price.status AS "status"',
        'SUM(CAST(branch_transfer_price.price AS DECIMAL))::FLOAT AS "totalPrice"',
        'COUNT(*)::INTEGER AS "count"',
      ])
      .leftJoin('branch_transfer_price.branch', 'branch')
      .leftJoin('branch_transfer_price.fromBranch', 'fromBranch');

    if (branchId !== 0) {
      queryBuilder
        .where('branch_transfer_price.branchId = :branchId', { branchId })
        .andWhere(
          'branch_transfer_price.create_date BETWEEN :startDate AND :endDate',
          {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          },
        )
        .orWhere('branch_transfer_price.fromBranchId = :branchId', {
          branchId,
        })
        .andWhere(
          'branch_transfer_price.create_date BETWEEN :startDate AND :endDate',
          {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          },
        );
    } else {
      queryBuilder.where(
        'branch_transfer_price.create_date BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      );
    }
    queryBuilder
      .groupBy('branch_transfer_price.branchId')
      .addGroupBy('branch.name')
      .addGroupBy('branch_transfer_price.fromBranchId')
      .addGroupBy('fromBranch.name')
      .addGroupBy('branch_transfer_price.status');

    return queryBuilder.getRawMany();
  }

  async getPayDown(code: string, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;
    const fetchProductList = await this.productSaleRepository
      .createQueryBuilder('productSale')
      .select([
        'productSale.id',
        'productSale.branchId',
        'productSale.saleType',
        'productSale.caseDate',
        'productSale.priceSumInvoices',
        'productSale.priceSumPayInvoices',
        'productSale.isCancel',
        'productSale.code',
        'productSale.create_date',
        'productSale.productId',
        'productSale.customerId',
        'productSale.isPaySuccess',

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

        'customerMirror.id',
        'customerMirror.code',
        'customerMirror.name',
        'customerMirror.lastname',
        'customerMirror.tel',
        'customerMirror.facebook',
        'customerMirror.nameRefOne',
        'customerMirror.lastnameRefOne',
        'customerMirror.telRefOne',
        'customerMirror.relaRefOne',
        'customerMirror.nameRefTwo',
        'customerMirror.lastnameRefTwo',
        'customerMirror.telRefTwo',
        'customerMirror.relaRefTwo',
        'customerMirror.fileCustomer',

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
      .leftJoin('productSale.customer', 'customer')
      .leftJoin('productSale.customerMirror', 'customerMirror')
      .leftJoin('productSale.product', 'product')
      .leftJoin('product.productColor', 'productColor')
      .leftJoin('product.productModel', 'productModel')
      .leftJoin('product.productStorage', 'productStorage')
      .leftJoin('product.productBrand', 'productBrand')
      .where('productSale.code = :code', { code })
      .andWhere('product.catalog = :catalog', { catalog: 'มือถือ' })
      .andWhere('productSale.isCancel = :isCancel', { isCancel: '0' })
      .getOne();

    if (fetchProductList) {
      if (process.env.SYSTEM_BY == 'THUNDER') {
        return fetchProductList;
      } else {
        if (
          user.type != 'ผู้ดูแลระบบ' &&
          fetchProductList.branchId != user.branchId
        ) {
          return { message_error: `คุณไม่มีสิทธิดูสัญญานี้` };
        } else if (!['3', '4'].includes(fetchProductList.saleType)) {
          return { message_error: `เลขสัญญานี้ไม่สามารถดูได้` };
        } else {
          return fetchProductList;
        }
      }
    } else {
      return { message_error: `ไม่พบหมายเลขสัญญา ${code} ในระบบ` };
    }
  }

  async getCustomerPayDown(code: string, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;
    const fetchProductList = await this.productSaleRepository
      .createQueryBuilder('productSale')
      .select([
        'productSale.id',
        'productSale.branchId',
        'productSale.saleType',
        'productSale.caseDate',
        'productSale.priceSumInvoices',
        'productSale.priceSumPayInvoices',
        'productSale.ownerBank',
        'productSale.ownerBankName',
        'productSale.ownerBankNo',

        'productSale.isCancel',
        'productSale.code',
        'productSale.create_date',
        'productSale.productId',
        'productSale.customerId',
        'productSale.isPaySuccess',
        'productPayMentLists.datePay',
        'productPayMentLists.payNo',
        'productPayMentLists.isPaySuccess',
        'productPayMentLists.price',
        'productPayMentLists.priceDebt',
        'productPayMentLists.pricePay',
        'productPaymentImages',

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

        'customerMirror.id',
        'customerMirror.code',
        'customerMirror.name',
        'customerMirror.lastname',
        'customerMirror.tel',
        'customerMirror.facebook',
        'customerMirror.nameRefOne',
        'customerMirror.lastnameRefOne',
        'customerMirror.telRefOne',
        'customerMirror.relaRefOne',
        'customerMirror.nameRefTwo',
        'customerMirror.lastnameRefTwo',
        'customerMirror.telRefTwo',
        'customerMirror.relaRefTwo',
        'customerMirror.fileCustomer',

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
      .leftJoin('productSale.customer', 'customer')
      .leftJoin('productSale.customerMirror', 'customerMirror')
      .leftJoin('productSale.product', 'product')
      .leftJoin('productSale.productPayMentLists', 'productPayMentLists')
      .leftJoin('productSale.productPaymentImages', 'productPaymentImages')

      .leftJoin('product.productColor', 'productColor')
      .leftJoin('product.productModel', 'productModel')
      .leftJoin('product.productStorage', 'productStorage')
      .leftJoin('product.productBrand', 'productBrand')
      .where('productSale.code = :code', { code })
      .andWhere('product.catalog = :catalog', { catalog: 'มือถือ' })
      .andWhere('productSale.isCancel = :isCancel', { isCancel: '0' })
      .orderBy('productPayMentLists.payNo', 'ASC')
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
        } else if (!['3', '4'].includes(fetchProductList.saleType)) {
          return { message_error: `เลขสัญญานี้ไม่สามารถดูได้` };
        } else {
          return {
            ...fetchProductList,
            priceSumInvoices: 0,
            priceSumPayInvoices: 0,
            banks: banks,
          };
        }
      }
    } else {
      return { message_error: `ไม่พบหมายเลขสัญญา ${code} ในระบบ` };
    }
  }

  async printPaymentList(params: {
    branchId: number;
    startDate: string;
    endDate: string;
    paymentStatus: string;
    req: FastifyRequest;
  }): Promise<Buffer> {
    const hideOldStock = process.env.SYSTEM_BY === 'THUNDER';

    const statusTranslations = {
      FAIL_PAIR: 'ยังไม่ชำระ',
      FULL_PAIR: 'ชำระครบ (ไม่มีค่าปรับ)',
      FULL_WITH_PENALTY: 'ชำระครบ (มีค่าปรับ)',
      NOT_FULL_PAIR: 'ชำระไม่ครบ (ไม่มีค่าปรับ)',
      PARTIAL_PENALTY_INCOMPLETE: 'ชำระไม่ครบ (ค่าปรับไม่ครบ)',
      ERROR: 'ข้อมูลผิดพลาด',
    };

    const statusPayType = {
      1: 'เงินสด',
      2: 'เงินโอน',
    };

    const { branchId, endDate, startDate, paymentStatus, req } = params;

    const user = (req as any).user;

    const start = dayjs(startDate).format('YYYY-MM-DD HH:mm:ss');
    const end = dayjs(endDate).format('YYYY-MM-DD HH:mm:ss');

    if (paymentStatus == '1' || paymentStatus == '2') {
      // Database query
      const query = this.productPaymentImageRepository
        .createQueryBuilder('product_payment_image')
        .select(['product_payment_image', 'productSale', 'product'])
        .leftJoin('product_payment_image.productSale', 'productSale')
        .leftJoin('productSale.product', 'product')
        .where(
          'product_payment_image.datePay BETWEEN :startDate AND :endDate',
          {
            startDate: start,
            endDate: end,
          },
        )

        .andWhere('product_payment_image.payType = :paymentStatus', {
          paymentStatus,
        })
        .orderBy('productSale.code', 'ASC'); // Enable sorting for consistent output

      if (branchId !== 0) {
        query.andWhere('product_payment_image.branchId = :branchId', {
          branchId,
        });
      }

      const productPaymentImages = await query.getMany();

      // Define table header
      const tableHeader = [
        { text: 'ลำดับ', style: 'tableHeader' },
        { text: 'เลขสัญญา', style: 'tableHeader' },
        { text: 'รหัสสินค้า', style: 'tableHeader' },
        { text: 'IMEI', style: 'tableHeader' },
        { text: 'รหัสสต็อกเก่า', style: 'tableHeader' },
        { text: 'ชำระ', style: 'tableHeader' },
      ];

      // Define table body with all 7 columns
      const tableBody = [
        tableHeader,
        ...productPaymentImages.map((item, k) => [
          { text: k + 1, alignment: 'right' },
          { text: item.productSale?.code || '-', alignment: 'left' },
          { text: item.productSale?.product?.code || '-', alignment: 'left' },
          { text: item.productSale?.product?.imei || '-', alignment: 'left' },
          {
            text: item.productSale?.product?.refOldStockNumber || '-',
            alignment: 'right',
          },
          {
            text: item.price ? formatNumberDigit(item.price) : '0',
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
              { text: `ตารางค่าบริการรายเดือน`, style: 'header' },
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
                        text: `จำนวนรายการ: ${productPaymentImages.length}`,
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
                        text: `สถานะ: ${statusPayType[paymentStatus] || paymentStatus}`,
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
              widths: ['auto', '*', '*', '*', '*', 'auto'], // Match 7 columns
              body: tableBody,
              keepWithHeaderRows: true,
            },
            layout: {
              fillColor: (rowIndex: number) =>
                rowIndex === 0 ? '#f0f0f0' : null,
            },
          },
          ...(productPaymentImages.length === 0
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
    } else {
      const EPS = 0.01; // epsilon กันทศนิยม

      let query = this.productPayMentListRepository
        .createQueryBuilder('product_payment_list')
        .select([
          'product_payment_list.datePay AS datePay',
          'product_payment_list.price AS price',
          'COALESCE(product_payment_list.priceDebt,0) AS "priceDebt"', // ค่าปรับ
          'product_payment_list.pricePay AS "pricePay"', // ชำระแล้ว
          '(product_payment_list.price + COALESCE(product_payment_list.priceDebt,0)) AS "totalExpected"', // ยอดต้องชำระ
          'product.id AS productId',
          'product.imei AS imei',
          'product.code AS code',
          'product.refOldStockNumber AS "refOldStockNumber"',
          'productSale.code AS "saleCode"',
        ])
        .leftJoin('product_payment_list.productSale', 'productSale')
        .leftJoin('productSale.product', 'product')
        .where('productSale.isCancel = :isCancel', { isCancel: '0' })
        .andWhere(
          'product_payment_list.datePay BETWEEN :startDate AND :endDate',
          {
            startDate: start,
            endDate: end,
          },
        );

      if (branchId !== 0) {
        query.andWhere('product_payment_list.branchId = :branchId', {
          branchId,
        });
      }

      // กรองตามสถานะการชำระ
      switch (paymentStatus) {
        case 'FAIL_PAIR':
          // ยังไม่ชำระ: ต้องเป็นงวดที่มียอดจริง และจ่าย ~0
          query
            .andWhere('product_payment_list.price > :eps', { eps: EPS })
            .andWhere('COALESCE(product_payment_list.pricePay,0) <= :eps', {
              eps: EPS,
            });
          break;

        case 'FULL_PAIR':
          // ชำระครบ (ไม่มีค่าปรับ) : มียอดจริง และจ่ายเท่ากับ price ภายใน eps
          query
            .andWhere('product_payment_list.price > :eps', { eps: EPS })
            .andWhere('COALESCE(product_payment_list.priceDebt,0) <= :eps', {
              eps: EPS,
            })
            .andWhere(
              'ABS(COALESCE(product_payment_list.pricePay,0) - product_payment_list.price) <= :eps',
              { eps: EPS },
            );
          break;

        case 'FULL_WITH_PENALTY':
          // ชำระครบ (มีค่าปรับ): totalExpected > 0 และจ่ายเท่ากับ totalExpected ภายใน eps
          query
            .andWhere('COALESCE(product_payment_list.priceDebt,0) > :eps', {
              eps: EPS,
            })
            .andWhere(
              '(product_payment_list.price + COALESCE(product_payment_list.priceDebt,0)) > :eps',
              { eps: EPS },
            )
            .andWhere(
              'ABS(COALESCE(product_payment_list.pricePay,0) - (product_payment_list.price + COALESCE(product_payment_list.priceDebt,0))) <= :eps',
              { eps: EPS },
            );
          break;

        case 'NOT_FULL_PAIR':
          // ชำระไม่ครบ (ไม่มีค่าปรับ): มียอดจริง, มีการจ่าย แต่ยัง < price - eps
          query
            .andWhere('COALESCE(product_payment_list.priceDebt,0) <= :eps', {
              eps: EPS,
            })
            .andWhere('product_payment_list.price > :eps', { eps: EPS })
            .andWhere('COALESCE(product_payment_list.pricePay,0) > :eps', {
              eps: EPS,
            })
            .andWhere(
              'COALESCE(product_payment_list.pricePay,0) < product_payment_list.price - :eps',
              { eps: EPS },
            );
          break;

        case 'PARTIAL_PENALTY_INCOMPLETE':
          // ชำระไม่ครบ (มีค่าปรับ): totalExpected > 0, มีการจ่าย แต่ยัง < totalExpected - eps
          query
            .andWhere('COALESCE(product_payment_list.priceDebt,0) > :eps', {
              eps: EPS,
            })
            .andWhere(
              '(product_payment_list.price + COALESCE(product_payment_list.priceDebt,0)) > :eps',
              { eps: EPS },
            )
            .andWhere('COALESCE(product_payment_list.pricePay,0) > :eps', {
              eps: EPS,
            })
            .andWhere(
              'COALESCE(product_payment_list.pricePay,0) < (product_payment_list.price + COALESCE(product_payment_list.priceDebt,0)) - :eps',
              { eps: EPS },
            );
          break;

        case 'ERROR':
          query.andWhere(`
      (
        product_payment_list.price < 0
        OR COALESCE(product_payment_list.pricePay,0) < 0
        OR COALESCE(product_payment_list.priceDebt,0) < 0
      )`);
          break;
      }

      query.orderBy('productSale.code', 'ASC');

      const productPayMentLists = await query.getRawMany();

      // หัวตาราง: เพิ่มคอลัมน์ค่าปรับ + ยอดต้องชำระ
      const tableHeader = [
        { text: 'ลำดับ', style: 'tableHeader' },
        { text: 'เลขสัญญา', style: 'tableHeader' },
        // { text: 'รหัสสินค้า', style: 'tableHeader' },
        { text: 'IMEI', style: 'tableHeader' },
        ...(hideOldStock
          ? []
          : [{ text: 'รหัสสต็อกเก่า', style: 'tableHeader' }]),
        { text: 'ยอดหลัก', style: 'tableHeader' },
        { text: 'ค่าปรับ', style: 'tableHeader' },
        { text: 'ยอดต้องชำระ', style: 'tableHeader' },
        { text: 'ชำระแล้ว', style: 'tableHeader' },
      ];

      const tableBody = [
        tableHeader,
        ...productPayMentLists.map((item, k) => [
          { text: k + 1, alignment: 'right' },
          { text: item.saleCode || '-', alignment: 'left' },
          // { text: item.code || '-', alignment: 'left' },
          { text: item.imei || '-', alignment: 'left' },
          ...(hideOldStock
            ? []
            : [{ text: item.refOldStockNumber || '-', alignment: 'right' }]),
          {
            text: item.price ? formatNumberDigit(item.price) : '0',
            alignment: 'right',
          },
          {
            text: item.priceDebt ? formatNumberDigit(item.priceDebt) : '0',
            alignment: 'right',
          },
          {
            text: item.totalExpected
              ? formatNumberDigit(item.totalExpected)
              : '0',
            alignment: 'right',
          },
          {
            text: item.pricePay ? formatNumberDigit(item.pricePay) : '0',
            alignment: 'right',
          },
        ]),
      ];

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

      const widths = hideOldStock
        ? ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto'] // ไม่มีรหัสสต็อกเก่า
        : ['auto', '*', '*', '*', 'auto', 'auto', 'auto', 'auto']; // มีรหัสสต็อกเก่า

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
              { text: `ตารางค่าบริการรายเดือน`, style: 'header' },
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
                        text: `จำนวนรายการ: ${productPayMentLists.length}`,
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
                        text: `สถานะ: ${statusTranslations[paymentStatus] || paymentStatus}`,
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
              body: tableBody,
              keepWithHeaderRows: true,
            },
            layout: {
              fillColor: (rowIndex: number) =>
                rowIndex === 0 ? '#f0f0f0' : null,
            },
          },
          ...(productPayMentLists.length === 0
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
        defaultStyle: { font: 'Sarabun', lineHeight: 1.2, fontSize: 10 },
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

  async printAccessibilityList(params: {
    branchId: number;
    startDate: string;
    endDate: string;
    // paymentStatus: string;
    req: FastifyRequest;
  }): Promise<Buffer> {
    const isFreeTranslations = {
      '0': 'ซื้อ',
      '1': 'แถม',
      '2': 'เครม',
    };

    // const { branchId, endDate, startDate, paymentStatus, req } = params;
    const { branchId, endDate, startDate, req } = params;

    const user = (req as any).user;

    const start = dayjs(startDate).format('YYYY-MM-DD HH:mm:ss');
    const end = dayjs(endDate).format('YYYY-MM-DD HH:mm:ss');

    const query = this.productSaleRepository
      .createQueryBuilder('productSale')
      .innerJoin('productSale.productSaleLists', 'productSaleLists')
      .select([
        'productSaleLists.productId AS productId',
        'productSaleLists.productName AS productName',
        'productSaleLists.isFree AS isFree',
        'SUM(productSaleLists.amount) AS totalAmount',
        'SUM(productSaleLists.priceSumSale) AS totalSale',
        'SUM(productSaleLists.priceProfit) AS totalProfit',
      ])
      .where('productSale.create_date BETWEEN :startDate AND :endDate', {
        startDate: startDate,
        endDate: endDate,
      })
      // .andWhere('productSale.payType = :paymentStatus', { paymentStatus })

      .andWhere('productSale.isCancel = :isCancel', { isCancel: '0' })

      .groupBy(
        'productSaleLists.productId, productSaleLists.productName, productSaleLists.isFree',
      )
      .orderBy('productSaleLists.productName', 'ASC');

    if (branchId !== 0) {
      query.andWhere('productSale.branchId = :branchId', { branchId });
    }

    const result = await query.getRawMany();

    // Define table header with isFree column
    const tableHeader = [
      { text: 'ลำดับ', style: 'tableHeader' },
      { text: 'รายการ', style: 'tableHeader' },
      { text: 'สถานะ', style: 'tableHeader' }, // New column for isFree
      { text: 'จำนวน', style: 'tableHeader' },
      { text: 'ยอดรวม', style: 'tableHeader' },
    ];

    // Map result to table body, fixing field names and adding isFree
    const tableBody = [
      tableHeader,
      ...result.map((item, k) => [
        { text: k + 1, alignment: 'right' },
        { text: item.productname || '-', alignment: 'left' }, // Fixed: productName
        { text: isFreeTranslations[item.isfree] || '-', alignment: 'left' }, // Add isFree translation
        { text: item.totalamount || '-', alignment: 'right' }, // Fixed: totalAmount
        {
          text: item.totalsale ? formatNumberDigit(item.totalsale) : '0',
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

    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
    });

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [20, 40, 20, 20],
      info: {
        title: `accessibilityList-${branchId}`,
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
        // Main header (shown only on the first page)
        {
          stack: [
            { text: `ตารางการขายอุปกรณ์`, style: 'header' },
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
                      text: `จำนวนรายการ: ${result.length}`,
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
                      // text: `สถานะ: ${statusTranslations[paymentStatus] || paymentStatus}`,
                      text: `สถานะ: ทั้งหมด`,
                      style: 'subheaderRight',
                    },
                  ],
                },
              ],
            },
          ],
        },
        { text: '', margin: [0, 10] }, // Spacer
        // Single table with isFree column
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto'], // Adjusted widths for new column
            body: tableBody,
            keepWithHeaderRows: true,
          },
          layout: {
            fillColor: (rowIndex: number) => {
              return rowIndex === 0 ? '#f0f0f0' : null; // Header row background
            },
          },
        },
        // Handle no data case
        ...(result.length === 0
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
        tableHeader: {
          fontSize: 10,
          alignment: 'center',
        },
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
    pdfDoc.end();

    return new Promise((resolve) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }

  async fetchProductPayMent(
    branchId: number,
    start: any,
    end: any,
  ): Promise<any> {
    // Validate inputs
    if (!dayjs(start).isValid() || !dayjs(end).isValid()) {
      throw new Error('Invalid date format for start or end date');
    }
    if (!Number.isInteger(branchId)) {
      throw new Error(`branchId must be an integer, received: ${branchId}`);
    }

    const startDateTime = dayjs(start).format('YYYY-MM-DD HH:mm:ss');
    const endDateTime = dayjs(end).format('YYYY-MM-DD HH:mm:ss');

    const EPS = 0.01;

    let productPayMentListsQuery = this.productPayMentListRepository
      .createQueryBuilder('ppl')
      .select([
        `CASE
       WHEN COALESCE(ppl.pricePay,0) <= ${EPS}
         THEN 'FAIL_PAIR'

       WHEN COALESCE(ppl.priceDebt,0) <= ${EPS}
            AND COALESCE(ppl.pricePay,0) >= ppl.price - ${EPS}
         THEN 'FULL_PAIR'

       WHEN COALESCE(ppl.priceDebt,0) > ${EPS}
            AND COALESCE(ppl.pricePay,0) >= (ppl.price + COALESCE(ppl.priceDebt,0)) - ${EPS}
         THEN 'FULL_WITH_PENALTY'

       WHEN COALESCE(ppl.priceDebt,0) <= ${EPS}
            AND COALESCE(ppl.pricePay,0) > ${EPS}
            AND COALESCE(ppl.pricePay,0) < ppl.price - ${EPS}
         THEN 'NOT_FULL_PAIR'

       WHEN COALESCE(ppl.priceDebt,0) > ${EPS}
            AND COALESCE(ppl.pricePay,0) > ${EPS}
            AND COALESCE(ppl.pricePay,0) < (ppl.price + COALESCE(ppl.priceDebt,0)) - ${EPS}
         THEN 'PARTIAL_PENALTY_INCOMPLETE'

       ELSE 'ERROR'
     END AS "paymentStatus"`,
        'COUNT(*) AS "recordCount"',
        'SUM(ppl.price) AS "totalPrice"',
        'SUM(COALESCE(ppl.priceDebt,0)) AS "totalPenalty"',
        'SUM(COALESCE(ppl.pricePay,0)) AS "totalPricePay"',
        'SUM(ppl.price + COALESCE(ppl.priceDebt,0)) AS "totalExpected"',
      ])
      .leftJoin('ppl.productSale', 'ps')
      .leftJoin('ps.product', 'p')
      .where('ps."isCancel" = :isCancel', { isCancel: 0 })
      .andWhere('ppl.datePay BETWEEN :startDateTime AND :endDateTime', {
        startDateTime,
        endDateTime,
      });

    // Conditionally add branchId filter
    if (branchId !== 0) {
      productPayMentListsQuery = productPayMentListsQuery.andWhere(
        'ppl."branchId" = :branchId',
        { branchId: branchId },
      );
    }

    const productPayMentLists = await productPayMentListsQuery
      .groupBy('"paymentStatus"')
      .getRawMany();

    let productPaymentImagesQuery = this.productPaymentImageRepository
      .createQueryBuilder('product_payment_image')
      .select([
        'product_payment_image.payType AS "payType"',
        'product_payment_image.bankId AS "bankId"',
        'bank.bankName AS "bankName"',
        'bank.bankNo AS "bankNo"',
        'bank.bankOwner AS "bankOwner"',
        'SUM(product_payment_image.price) AS "totalPrice"',
        'COUNT(product_payment_image.id) AS "recordCount"',
      ])
      .where(
        'product_payment_image.datePay BETWEEN :startDateTime AND :endDateTime',
        {
          startDateTime,
          endDateTime,
        },
      )
      .leftJoin('product_payment_image.bank', 'bank');

    // Conditionally add branchId filter
    if (branchId !== 0) {
      productPaymentImagesQuery = productPaymentImagesQuery.andWhere(
        'product_payment_image."branchId" = :branchId',
        { branchId: branchId },
      );
    }

    const productPaymentImages = await productPaymentImagesQuery
      .groupBy('product_payment_image."payType"')
      .addGroupBy('product_payment_image."bankId"')
      .addGroupBy('bank.bankName')
      .addGroupBy('bank.bankNo')
      .addGroupBy('bank.bankOwner')
      .getRawMany();

    return {
      productPayMentLists: productPayMentLists,
      productPaymentImages: productPaymentImages,
    };
  }

  // async testTelegram(code: string): Promise<any> {
  //   const productSale = await this.productSaleRepository.findOne({
  //     where: { code: code },
  //     relations: ['product', 'branch'],
  //   });

  //   // return productSale;
  //   const messageManageAppleId = `Lock สัญญา: ${productSale.product.imei}
  //   * appId: ${productSale.shopAppID}
  //   * pass: ${productSale.shopPass}
  //   * pin: ${productSale.shopPin}`;
  //   await this.telegramNotificationService.sendTelegramNotify({
  //     botToken: productSale.branch.token_bot,
  //     chatId: productSale.branch.room_id_lockAppleId,
  //     message: messageManageAppleId,
  //   });

  // console.log('productSale', productSale);
  // }

  async update(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;
    const checkProductSale = await this.productSaleRepository.findOne({
      where: { id: id },
      relations: ['productSaleLists', 'product'],
    });

    const { productSaleLists, ...exactProductSale } = checkProductSale;

    const createDate = dayjs(exactProductSale.create_date);
    const currentDate = dayjs();
    if (currentDate.diff(createDate, 'month') > 3) {
      return {
        message_error: `เลขสัญญา ${exactProductSale.code} มากกว่า 3 เดือน ไม่สามารถแก้ไข`,
      };
    }

    const {
      priceTransferCash,
      priceCash,
      bankId,
      payType,
      randomCode,
      code,
      note,
      priceEquipTransferCash,
      priceEquipCash,
      priceReRiderTransferCash,
      priceReRiderCash,
      priceRegAppleIdTransferCash,
      priceRegAppleIdCash,
      create_date,
      caseDate,
      shopAppID,
      shopPass,
      shopPin,
    } = req.body as any;

    const values = {
      shop: note?.value,

      priceTransferCash: Number(priceTransferCash?.value ?? 0),
      priceCash: Number(priceCash?.value ?? 0),

      priceReRiderTransferCash: Number(priceReRiderTransferCash?.value ?? 0),
      priceReRiderCash: Number(priceReRiderCash?.value ?? 0),

      priceRegAppleIdTransferCash: Number(
        priceRegAppleIdTransferCash?.value ?? 0,
      ),
      priceRegAppleIdCash: Number(priceRegAppleIdCash?.value ?? 0),

      bankId: toIntegerOrNull(bankId?.value),
      payType: payType?.value || exactProductSale.payType,
      randomCode: randomCode?.value,
      code: code?.value,
      priceEquipTransferCash: priceEquipTransferCash?.value,
      priceEquipCash: priceEquipCash?.value,
      note: note?.value,
      shopAppID: shopAppID?.value,
      shopPass: shopPass?.value,
      shopPin: shopPin?.value,

      create_date: create_date?.value,
      caseDate: caseDate?.value,
    };

    if (
      dayjs(exactProductSale.caseDate).format('YYYY-MM-DD') !=
      dayjs(values.caseDate).format('YYYY-MM-DD')
    ) {
      const productPayMentLists = Object.keys(req.body).reduce((acc, key) => {
        const match = key.match(/^productPayMentLists\[(\d+)\]\[(\w+)\]$/);
        if (match) {
          const [, index, field] = match;
          acc[index] = acc[index] || {};
          acc[index][field] = req.body[key].value;
        }
        return acc;
      }, []);

      for (let index = 0; index < productPayMentLists.length; index++) {
        const productPayMentList = productPayMentLists[index];

        await this.productPayMentListRepository.update(
          {
            id: productPayMentList.id,
          },
          {
            datePay: productPayMentList.datePay,
          },
        );
      }
    }

    const sum = values.priceCash + values.priceTransferCash;
    if (sum != exactProductSale.priceTotalPaid) {
      return {
        message_error: `การจ่าย ไม่ตรงกับ รวมยอดที่จ่ายก่อนรับ ${exactProductSale.code} `,
      };
    } else {
      if (values.payType == '1') {
        values.bankId = null;
        values.priceCash = exactProductSale.priceTotalPaid;
        values.priceTransferCash = 0;

        values.priceEquipCash = exactProductSale.priceEquipSum;
        values.priceEquipTransferCash = 0;

        values.priceReRiderCash = exactProductSale.priceReRider;
        values.priceReRiderTransferCash = 0;

        values.priceRegAppleIdCash = exactProductSale.priceRegAppleId;
        values.priceRegAppleIdTransferCash = 0;
      } else if (values.payType == '2') {
        values.priceCash = 0;
        values.priceTransferCash = exactProductSale.priceTotalPaid;

        values.priceEquipCash = 0;
        values.priceEquipTransferCash = exactProductSale.priceEquipSum;

        values.priceReRiderCash = 0;
        values.priceReRiderTransferCash = exactProductSale.priceReRider;

        values.priceRegAppleIdCash = 0;
        values.priceRegAppleIdTransferCash = exactProductSale.priceRegAppleId;
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

        if (exactProductSale.priceReRider > 0) {
          if (
            values.priceReRiderCash == 0 &&
            values.priceReRiderTransferCash == 0
          ) {
            return {
              message_error: `เงินสดรับค่าส่ง และ เงินโอนรับค่าส่ง ไม่ตวรเป็น 0 บาท`,
            };
          } else if (
            values.priceReRiderCash < 0 ||
            values.priceReRiderTransferCash < 0
          ) {
            return {
              message_error: `เงินสดรับค่าส่ง หรือ เงินโอนรับค่าส่ง ไม่ตวรติดลบ`,
            };
          }
        }

        if (exactProductSale.priceRegAppleId > 0) {
          if (
            values.priceRegAppleIdCash == 0 &&
            values.priceRegAppleIdTransferCash == 0
          ) {
            return {
              message_error: `เงินสดค่าสมัครอีเมล/AppleID/อื่น ๆ และ เงินโอนค่าสมัครอีเมล/AppleID/อื่น ๆ ไม่ตวรเป็น 0 บาท`,
            };
          } else if (
            values.priceRegAppleIdCash < 0 ||
            values.priceRegAppleIdTransferCash < 0
          ) {
            return {
              message_error: `เงินสดค่าสมัครอีเมล/AppleID/อื่น ๆ หรือ เงินโอนค่าสมัครอีเมล/AppleID/อื่น ๆ ไม่ตวรติดลบ`,
            };
          }
        }

        if (productSaleLists.length > 0) {
          //  if (
          //   values.priceEquipCash == 0 &&
          //   values.priceEquipTransferCash == 0
          // ) {
          //   return {
          //     message_error: `เงินสดอุปกรณ์ และ เงินโอนอุปกรณ์ ไม่ตวรเป็น 0 บาท`,
          //   };
          // } else

          if (values.priceEquipCash < 0 || values.priceEquipTransferCash < 0) {
            return {
              message_error: `เงินสดอุปกรณ์ หรือ เงินโอนอุปกรณ์ ไม่ตวรติดลบ`,
            };
          }
        }
      }
    }

    exactProductSale.priceCash = values.priceCash;
    exactProductSale.priceTransferCash = values.priceTransferCash;
    exactProductSale.bankId = values.bankId;
    exactProductSale.payType = values.payType;
    exactProductSale.code = values.code;
    exactProductSale.randomCode = values.randomCode;
    exactProductSale.priceEquipTransferCash = values.priceEquipTransferCash;
    exactProductSale.priceEquipCash = values.priceEquipCash;

    exactProductSale.priceReRiderTransferCash = values.priceReRiderTransferCash;
    exactProductSale.priceReRiderCash = values.priceReRiderCash;

    exactProductSale.priceRegAppleIdTransferCash =
      values.priceRegAppleIdTransferCash;
    exactProductSale.priceRegAppleIdCash = values.priceRegAppleIdCash;
    exactProductSale.create_date = values.create_date;

    await this.productSaleRepository.update(
      exactProductSale.id,
      exactProductSale,
    );

    const files = await req.saveRequestFiles();
    if (files.length > 0) {
      // Fetch the last image sequence
      const imageCount = await this.productSaleImageRepository.count({
        where: { productSaleId: id },
      });
      let lastImage = imageCount;

      await fs.ensureDir(`${this.uploadsPath}/${exactProductSale.code}`);
      for (let index = 0; index < files.length; index++) {
        const seq = lastImage + 1 + index;
        const file = files[index];
        const buffer = await fs.readFile(file.filepath);
        const randomName = generateRandomString(6);
        const filename = `${randomName}-${seq}.png`; // เช่น s123vas-2.png
        const filePath = path.join(
          `${this.uploadsPath}/${exactProductSale.code}`,
          filename,
        );

        await sharp(buffer)
          .png({ quality: 80, progressive: true })
          .toFile(filePath);

        let imageType = '1';
        if (file.fieldname === 'uploadFileProductSaleCustomer[]') {
          imageType = '2';
        }

        const newProductImage = this.productSaleImageRepository.create({
          name: filePath,
          productSaleId: exactProductSale.id,
          userId: user.id,
          type: imageType,
        });

        await this.productSaleImageRepository.save(newProductImage);
      }
    }

    const branch = await this.branchRepository.findOneBy({
      id: exactProductSale.branchId,
    });

    const existingProduct = await this.productRepository.findOne({
      where: { id: exactProductSale.productId },
      relations: ['productModel', 'productColor', 'productStorage'],
    });

    if (exactProductSale.isMobileSale == '1') {
      if (
        exactProductSale.saleType == '3' ||
        exactProductSale.saleType == '4'
      ) {
        if (exactProductSale.shopAppID != values.shopAppID.trim()) {
          const managelockAppleId = await this.manageAppleIdRepository.findOne({
            where: { appId: values.shopAppID.trim() },
          });

          if (managelockAppleId) {
            managelockAppleId.count = managelockAppleId.count + 1;
            await this.manageAppleIdRepository.update(
              {
                id: managelockAppleId.id,
              },
              {
                count: managelockAppleId.count,
              },
            );

            const messageLockManageAppleId = `เปลื่ยนแปลง icloud Lock สัญญา: ${exactProductSale.code}
                * imei: ${exactProductSale.product.imei}
                * appId: ${exactProductSale.shopAppID}
                * pass: ${exactProductSale.shopPass}
                * pin: ${exactProductSale.shopPin}`;
            await this.telegramNotificationService.sendTelegramNotify({
              botToken: branch.token_bot,
              chatId: branch.room_id_lockAppleId,
              message: messageLockManageAppleId,
            });
          }

          const manageUnlockAppleId =
            await this.manageAppleIdRepository.findOne({
              where: { appId: values.shopAppID.trim() },
            });

          if (manageUnlockAppleId) {
            manageUnlockAppleId.count = manageUnlockAppleId.count - 1;
            await this.manageAppleIdRepository.update(
              {
                id: manageUnlockAppleId.id,
              },
              {
                count: manageUnlockAppleId.count,
              },
            );

            const messageUnlockManageAppleId = `เปลื่ยนแปลง icloud Unlock สัญญา: ${exactProductSale.code}
                * imei: ${exactProductSale.product.imei}
                * appId: ${values.shopAppID.trim()}
                * pass: ${values.shopPass}
                * pin: ${values.shopPin}`;
            await this.telegramNotificationService.sendTelegramNotify({
              botToken: branch.token_bot,
              chatId: branch.room_id_unlockAppleId,
              message: messageUnlockManageAppleId,
            });
          }
        }
      }

      const message = `มีการแก้ไขสัญญา: ${exactProductSale.code}
      ทรัพย์สิน: ${existingProduct.imei}
      รุ่น: ${existingProduct.productModel.name}
      สี: ${existingProduct.productColor.name}
      ความจุ: ${existingProduct.productStorage.name}
      โดย: ${user.name}`;
      await this.telegramNotificationService.sendTelegramNotify({
        botToken: branch.token_bot,
        chatId: branch.room_id_processCases,
        message: message,
      });
    } else {
      const message = `มีการแก้ไข: ${exactProductSale.code}
      โดย: ${user.name}`;
      await this.telegramNotificationService.sendTelegramNotify({
        botToken: branch.token_bot,
        chatId: branch.room_id_processCases,
        message: message,
      });
    }

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }

  async changeStatus(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    const { isCancel, isReturn } = req.body as any;
    const values = {
      isCancel: isCancel.value,
      isReturn: isReturn.value,
    };

    const productSale = await this.productSaleRepository.findOne({
      where: { id },
      relations: ['productSaleLists'],
    });

    if (productSale.isMobileSale == '1') {
      if (productSale.isCancel == '1') {
        return {
          message_error: `มีการยกเลิกหมายเลขสัญญา ${productSale.code} ก่อนหน้าแล้ว`,
        };
      }

      if (values.isCancel == '1') {
        if (values.isReturn == 1) {
          const { productSaleLists } = productSale;

          for (let index = 0; index < productSaleLists.length; index++) {
            const product = await this.productRepository.findOneBy({
              id: productSaleLists[index].productId,
            });

            const productPrice = await this.productPriceRepository.findOneBy({
              productId: productSaleLists[index].productId,
            });

            const existingProductPrice = { ...productPrice };
            existingProductPrice.amount =
              productPrice.amount + productSaleLists[index].amount;

            await this.productPriceRepository.update(
              { id: productPrice.id },
              { amount: existingProductPrice.amount },
            );

            const existingProduct = { ...product };
            existingProduct.amount =
              product.amount + productSaleLists[index].amount;

            existingProduct.amountSale = Number(existingProduct.amountSale);
            existingProduct.amountSale -= Number(
              productSaleLists[index].amount,
            );

            existingProduct.amountRemaining = Number(
              existingProduct.amountRemaining,
            );
            existingProduct.amountRemaining -= Number(
              productSaleLists[index].amount,
            );

            existingProduct.priceSumSale = Number(existingProduct.priceSumSale);
            existingProduct.priceSumSale -= Number(
              productSaleLists[index].priceSale,
            );

            const productLogDto: CreateProductLogDto = {
              productId: existingProduct.id, // ใช้ id จาก product
              action: `คืนสินค้า: ${productSale.code}`,
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
        }

        const product = await this.productRepository.findOne({
          where: { id: productSale.productId },
        });

        const updateProductDto: Product = {
          ...product,
          active: '1',
          amount: 1,
          note: `ยกเลิกสัญญา: ${productSale.code}`,
        };

        const productLogDto: CreateProductLogDto = {
          productId: product.id, // ใช้ id จาก product
          action: 'ยกเลิกสัญญา',
          obj: JSON.stringify({
            before: product,
            after: updateProductDto,
          }),
          branchId: product.branchId,
          userId: product.createByUserId, // ใช้ createByUserId แทน branchId
        };
        await this.productLogService.create(productLogDto);

        const branch = await this.branchRepository.findOneBy({
          id: productSale.branchId,
        });

        const message = `ยกเลิกสัญญา: ${productSale.code}
        โดย: ${user.name}`;
        await this.telegramNotificationService.sendTelegramNotify({
          botToken: branch.token_bot,
          chatId: branch.room_id_processCases,
          message: message,
        });

        await this.productRepository.update(
          productSale.productId,
          updateProductDto,
        );

        const shopAppID = productSale.shopAppID.trim();

        const manageAppleId = await this.manageAppleIdRepository.findOne({
          where: { appId: shopAppID },
        });

        if (productSale.saleType == '3' || productSale.saleType == '4') {
          if (!_.isEmpty(manageAppleId)) {
            manageAppleId.count = Number(manageAppleId.count) - 1;
            await this.manageAppleIdRepository.update(
              {
                id: manageAppleId.id,
              },
              {
                count: manageAppleId.count,
              },
            );
          }

          const messageManageAppleId = `UnLock สัญญา: ${updateProductDto.code}
                * imei: ${updateProductDto.imei}
                * appId: ${shopAppID}
                * pass: ${productSale.shopPass}
                * pin: ${productSale.shopPin}`;
          await this.telegramNotificationService.sendTelegramNotify({
            botToken: branch.token_bot,
            chatId: branch.room_id_unlockAppleId,
            message: messageManageAppleId,
          });
        }
      }

      const { productSaleLists, ...res } = productSale;

      if (_.isNumber(res.productBookId)) {
        await this.productBookRepository.update(
          {
            id: res.productBookId,
          },
          {
            status: '1',
          },
        );

        await this.processBookRepository.delete({
          productBookId: res.productBookId,
        });
      } else if (_.isNumber(res.productSavingId)) {
        await this.productSavingRepository.update(
          {
            id: res.productSavingId,
          },
          {
            status: '1',
          },
        );

        await this.processSavingRepository.delete({
          productSavingId: res.productSavingId,
        });
      }

      await this.productSaleRepository.update(id, {
        ...res,
        isCancel: values.isCancel,
      });

      await this.productPayMentListsRepository.update(
        {
          productSaleId: productSale.id,
        },
        {
          isCaseSuccess: '0',
        },
      );

      return {
        message_success: `${MESSAGE_UPDATE_SUCCESS}`,
      };
    }
  }

  private readonly STYLES = {
    header: { fontSize: 11 },
    numberPage: { fontSize: 11, margin: [0, 5, 20, 0] },
    subheader: { fontSize: process.env.SYSTEM_BY == 'AAA' ? 10 : 11 },
    content: { fontSize: process.env.SYSTEM_BY == 'AAA' ? 9 : 11 },
    choice: { fontSize: process.env.SYSTEM_BY == 'AAA' ? 9 : 11 },
    footer: { fontSize: process.env.SYSTEM_BY == 'AAA' ? 8 : 11 },
  };

  private formatInput(text: string | number) {
    return {
      text: ` ${String(text)} `,
      underlined: true,
    };
  }

  private createClauseParagraph(
    parts: Array<{ text: string; underlined?: boolean }>,
    align: 'left' | 'center' | 'right' = 'left',
  ) {
    const formattedText = [
      { text: '     ', preserveLeadingSpaces: true }, // ย่อหน้า 5 ช่องว่าง
      ...parts.map((item) => ({
        text: item.text,
        decoration: item.underlined ? 'underline' : undefined,
        decorationStyle: item.underlined ? 'dashed' : undefined,
        lineHeight: 1.2, // ลดจาก 1.5 เป็น 1.2 เพื่อให้ระยะห่างสมดุล
      })),
    ];

    return {
      text: formattedText,
      style: 'choice',
      margin: [0, 8, 0, 0], // ปรับจาก 5 เป็น 8 เพื่อให้ระยะห่างระหว่าง paragraph สวยขึ้น
      preserveLeadingSpaces: true,
      alignment: align,
    };
  }

  private createHeader(text: any) {
    return {
      text: text,
      style: 'header',
      alignment: 'center',
      margin: [0, 2, 0, 0],
    };
  }

  private createFooter(parts: Array<{ text: string; underlined?: boolean }>) {
    const formattedText = parts.map((item) => ({
      text: item.text,
      decoration: item.underlined ? 'underline' : undefined,
      decorationStyle: item.underlined ? 'dashed' : undefined,
      lineHeight: item.underlined ? 1.2 : 1,
    }));

    return {
      text: formattedText,
      style: 'footer',
      alignment: 'center', // ใช้ 'justify' เพื่อให้เต็มบรรทัด
      margin: [0, 2, 0, 0],
    };
  }

  private createColumns(
    leftContent:
      | string
      | { text: string; underlined?: boolean }
      | Array<{ text: string; underlined?: boolean }>,
    rightContent:
      | string
      | { text: string; underlined?: boolean }
      | Array<{ text: string; underlined?: boolean }>,
    textLeftAlign: 'left' | 'center' | 'right' = 'left',
    textRightAlign: 'left' | 'center' | 'right' = 'right',
    options: { margin?: number[] } = {},
  ) {
    const formatContent = (content: typeof leftContent) => {
      if (typeof content === 'string') {
        return { text: content };
      } else if (Array.isArray(content)) {
        return content.map((item) => ({
          text: item.text,
          decoration: item.underlined ? 'underline' : undefined,
        }));
      } else {
        return {
          text: content.text,
          decoration: content.underlined ? 'underline' : undefined,
        };
      }
    };

    return {
      columns: [
        {
          text: formatContent(leftContent),
          style: 'subheader',
          alignment: textLeftAlign,
        },
        {
          text: formatContent(rightContent),
          style: 'subheader',
          alignment: textRightAlign,
        },
      ],
      margin: options.margin || [0, 2, 0, 0],
    };
  }

  private createImageColumns(
    leftText: string | any,
    rightText: string | any,
    options: { margin?: number[] } = {},
  ) {
    return {
      columns: [
        leftText, // ไม่ห่อด้วย text เพื่อให้ stack ทำงานได้
        rightText, // ไม่ห่อด้วย text เพื่อให้ stack ทำงานได้
      ],
      margin: options.margin || [0, 2, 0, 0],
    };
  }

  private createColumnsLine(
    leftParts: Array<{ text: string; underlined?: boolean }>,
    rightParts: Array<{ text: string; underlined?: boolean }>,
    textLeftAlign: 'left' | 'center' | 'right' = 'left',
    textRightAlign: 'left' | 'center' | 'right' = 'right',
    options: { margin?: number[] } = {},
  ) {
    const formattedLeft = leftParts.map((item) => ({
      text: item.text,
      decoration: item.underlined ? 'underline' : undefined,
      decorationStyle: item.underlined ? 'dashed' : undefined,
      lineHeight: item.underlined ? 1.2 : 1,
    }));

    const formattedRight = rightParts.map((item) => ({
      text: item.text,
      decoration: item.underlined ? 'underline' : undefined,
      decorationStyle: item.underlined ? 'dashed' : undefined,
      lineHeight: item.underlined ? 1.2 : 1,
    }));

    return {
      columns: [
        { text: formattedLeft, style: 'subheader', alignment: textLeftAlign },
        { text: formattedRight, style: 'subheader', alignment: textRightAlign },
      ],
      margin: options.margin || [0, 2, 0, 0],
    };
  }

  private createColumnThreeLine(
    oneParts: Array<{ text: string; underlined?: boolean }>,
    twoParts: Array<{ text: string; underlined?: boolean }>,
    threeParts: Array<{ text: string; underlined?: boolean }>,
    textLeftAlignOne: 'left' | 'center' | 'right' = 'left',
    textRightAlignTwo: 'left' | 'center' | 'right' = 'right',
    textRightAlignThree: 'left' | 'center' | 'right' = 'right',
    options: { margin?: number[] } = {},
  ) {
    const formattedOne = oneParts.map((item) => ({
      text: item.text,
      decoration: item.underlined ? 'underline' : undefined,
      decorationStyle: item.underlined ? 'dashed' : undefined,
      lineHeight: item.underlined ? 1.2 : 1,
    }));

    const formattedTwo = twoParts.map((item) => ({
      text: item.text,
      decoration: item.underlined ? 'underline' : undefined,
      decorationStyle: item.underlined ? 'dashed' : undefined,
      lineHeight: item.underlined ? 1.2 : 1,
    }));

    const formattedThree = threeParts.map((item) => ({
      text: item.text,
      decoration: item.underlined ? 'underline' : undefined,
      decorationStyle: item.underlined ? 'dashed' : undefined,
      lineHeight: item.underlined ? 1.2 : 1,
    }));

    return {
      columns: [
        { text: formattedOne, style: 'subheader', alignment: textLeftAlignOne },
        {
          text: formattedTwo,
          style: 'subheader',
          alignment: textRightAlignTwo,
        },
        {
          text: formattedThree,
          style: 'subheader',
          alignment: textRightAlignThree,
        },
      ],
      margin: options.margin || [0, 2, 0, 0],
    };
  }

  private createParagraph(
    text: string | Array<{ text: string; underlined?: boolean }>,
  ) {
    if (typeof text === 'string') {
      return {
        text,
        style: 'content',
        margin: [0, 1, 0, 0],
      };
    }

    const formattedText = text.map((item) => ({
      text: item.text,
      decoration: item.underlined ? 'underline' : undefined,
      decorationStyle: item.underlined ? 'dashed' : undefined,
      lineHeight: item.underlined ? 1.5 : 1,
    }));

    return {
      text: formattedText,
      style: 'content',
      margin: [0, 1, 0, 0],
    };
  }

  private createPaymentTable(
    paymentList: Array<{
      id?: number;
      datePay?: Date;
      price?: number;
      productSaleId?: number;
      create_date?: Date;
    }>,
  ) {
    return {
      table: {
        headerRows: 1,
        layout: 'lightHorizontalLines', // optional
        widths: [50, '*', '*', 150],
        body: [
          [
            { text: 'งวดที่', style: 'subheader', alignment: 'right' },
            { text: 'จำนวนเงิน (บาท)', style: 'subheader', alignment: 'right' },
            { text: 'วันที่ชำระ', style: 'subheader', alignment: 'right' },
            { text: 'ผู้รับเงิน', style: 'subheader', alignment: 'center' },
          ],
          // ข้อมูลจาก productPayMentLists
          ...(paymentList.length > 0
            ? paymentList.map((item, index) => [
                { text: String(index + 1), alignment: 'right' },
                {
                  text: item.price ? formatNumberDigit(item.price) : '-',
                  alignment: 'right',
                },
                {
                  text: item.datePay
                    ? formatDateNumberWithoutTime(item.datePay)
                    : '-',
                  alignment: 'right',
                },
                { text: '', alignment: 'center' },
              ])
            : [['-', '-', '-', '-']]),
        ],
      },
      layout: {
        hLineWidth: () => 0.5, // ความหนาของเส้นแนวนอน
        vLineWidth: () => 0.5, // ความหนาของเส้นแนวตั้ง
        hLineColor: () => 'black', // สีเส้นแนวนอน
        vLineColor: () => 'black', // สีเส้นแนวตั้ง
        paddingLeft: () => 4, // ระยะห่างด้านซ้ายในเซลล์
        paddingRight: () => 4, // ระยะห่างด้านขวาในเซลล์
        paddingTop: () => 2, // ระยะห่างด้านบนในเซลล์
        paddingBottom: () => 2, // ระยะห่างด้านล่างในเซลล์
      },
      margin: [0, 10, 0, 0],
    };
  }

  // ฟังก์ชันแปลง path
  private filePath(filePath: string): string {
    return path.join(this.radFilePath, filePath);
  }

  // ฟังก์ชันเช็คว่าไฟล์มีอยู่จริง
  private checkFileExists(filePath: string): boolean {
    const fullPath = this.filePath(filePath);

    return fs.existsSync(fullPath);
  }

  async printContract(
    id: number,
    financeId: number,
    req: FastifyRequest,
  ): Promise<Buffer> {
    const user = (req as any).user;

    let nameFinance = `${user.name} ${user.lastName}`;

    const contract = await this.productSaleRepository.findOne({
      where: _.isNaN(id) ? { processManageFinanceId: financeId } : { id: id },
      relations: [
        'create_by',
        'product',
        'product.productType',
        'product.productModel',
        'product.productBrand',
        'product.productColor',
        'product.productStorage',
        'productSaleLists',
        'productPayMentLists',
        'branch',
        'customer',
        'customer.mDistrict',
        'customer.mSubdistrict',
        'customer.mProvince',
        'customerMirror',
        'customerMirror.mDistrict',
        'customerMirror.mSubdistrict',
        'customerMirror.mProvince',
      ],
      order: {
        productPayMentLists: {
          datePay: 'ASC',
        },
      },
    });

    if (_.isNumber(contract.processManageFinanceId)) {
      const finance = await this.processManageFinanceRepository
        .createQueryBuilder('finance')
        .leftJoin('finance.create_by', 'create_by')
        .select([
          'finance.id',
          'finance.createByUserId',
          'create_by.name',
          'create_by.lastname',
        ]) // Select only the fields you need
        .where('finance.id = :id', { id: contract.processManageFinanceId })
        .getOne();
      nameFinance = `${finance?.create_by?.name || ''} ${finance?.create_by?.lastname || ''}`;
    }

    if (!['3', '4'].includes(contract.saleType) || !contract) {
      throw new BadRequestException(
        `คุณปริ้นเอกสารผิดประเภท: ${contract.code}`,
      );
    }

    // ตรวจสอบข้อมูลผู้ซื้อ
    if (
      contract.customer.customerType == '1' &&
      _.isNull(contract.customer.fileCustomer)
    ) {
      throw new BadRequestException(
        `กรุณาอัพโหลดรูปภาพลูกค้า: ${contract.customer.code}`,
      );
    }

    // ตรวจสอบข้อมูลผู้ซื้อร่วม (ถ้ามี)
    if (
      contract.customerMirror &&
      _.isNull(contract.customerMirror.fileCustomer)
    ) {
      throw new BadRequestException(
        `กรุณาอัพโหลดรูปภาพผู้ซื้อร่วม: ${contract.customerMirror.code}`,
      );
    }

    const productPayMentLists = contract.productPayMentLists;
    let productPayMentListsFirst: any = null;
    if (productPayMentLists) {
      productPayMentListsFirst = productPayMentLists[0];
    }

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

    // รวมเนื้อหาทั้งสองสัญญา
    let docDefinition = {};

    if (process.env.SYSTEM_BY == 'AAA') {
      // ฟังก์ชันช่วยเหลือสำหรับสร้างเนื้อหาสัญญา
      const createContractContent = (buyer: any) => {
        const buyerLabel = 'ผู้เช่า';
        const buyerData = buyer; // customer หรือ customerMirror

        // ข้อตกลงในสัญญา
        const choiceOne = [
          {
            text: `ข้อ 1. "${buyerLabel}" ตกลงเช่าและ "ผู้ให้เช่า" ตกลงให้เช่า `,
          },
          this.formatInput(contract.product?.productType?.name || ''),
          { text: ' ยี่ห้อ ' },
          this.formatInput(contract.product?.productBrand?.name || ''),
          { text: ' รุ่น ' },
          this.formatInput(contract.product?.productModel?.name || ''),
          { text: ' สี ' },
          this.formatInput(contract.product?.productColor?.name || ''),
          { text: ' ความจุตัวเครื่อง ' },
          this.formatInput(contract.product?.productStorage?.name || ''),
          { text: ' \nหมายเลขเครื่อง/หมายเลข IMEI ' },
          this.formatInput(contract.product?.imei || ''),
          { text: ' สุขภาพแบตเตอรี่ ' },
          this.formatInput(`${contract.product?.batteryHealth || ''}%`),
          {
            text: ` ของ "ผู้ให้เช่า" ให้กับ "${buyerLabel}" โดย "${buyerLabel}" ได้ชำระเงิน ค่าเปิดใช้เครื่อง ค่าดำเนินการระบบติดตามระยะไกล และค่าความเสื่อมสภาพขณะใช้งานทรัพย์สิน ให้แก่ "ผู้ให้เช่า" ในวันทำสัญญานี้เป็นเงิน `,
          },
          this.formatInput(
            `${formatNumberDigit2(contract.priceDownPayment)} บาท` || '',
          ),
        ];

        const choiceTwo = [
          {
            text: `ข้อ 2. ${buyerLabel}ตกลงชำระค่าเช่าและค่าบริการดูแลรายเดือน โดยชำระเดือนละ `,
          },
          this.formatInput(
            `${formatNumberDigit2(productPayMentListsFirst?.price || 0)} บาท`,
          ),
          { text: ' เป็นจำนวน ' },
          this.formatInput(formatNumberDigit(contract.valueMonth)),
          { text: ' เดือน ภายในวันที่ ' },
          this.formatInput(
            dayjs(productPayMentListsFirst?.datePay).format('DD'),
          ),
          { text: ' ของทุกๆ เดือน' },
          {
            text: `\n     ข้อ 2.1 เงินที่${buyerLabel}ชำระเข้ามารายเดือน จะเป็นในส่วนของค่าเช่า `,
          },
          this.formatInput('50%'),
          { text: ' และส่วนของค่าบริการดูแล ' },
          this.formatInput('50%'),
          {
            text: ' ของค่าบริการดูแลทั้งหมด ที่กล่าวมาครอบคลุมถึงในกรณีอุปกรณ์ที่เช่าเสียหาย ',
          },
          {
            text: 'ทางผู้ให้เช่ายินดีจะดูแล แก้ไข ซ่อม และเปลี่ยนให้กลับมาสมบูรณ์ ',
          },
          { text: 'ในกรณีที่เครื่องเกิดความเสื่อมเอง อาทิเช่น ' },
          { text: 'ซ่อมเปลี่ยนอะไหล่ฟรี ' },
          {
            text: 'เปลี่ยนแบตเตอรี่ให้ใหม่ ในกรณีแบตเตอรี่มีปัญหา หรือไม่เก็บไฟ ',
          },
          {
            text: 'โดยไม่มีค่าใช้จ่ายอื่นใดเพิ่มเติม หากเครื่องที่ผู้เช่าเกิดมีปัญหาอื่นใด ที่ต้องส่งเคลม',
          },
          {
            text: 'ทางผู้ให้เช่ายินดี ออกเครื่องทดแทนเครื่องที่มีปัญหาให้กับผู้เช่า ใช้งานในระหว่างรอ ',
          },
          {
            text: 'ในกรณีความเสื่อมและเสียหาย ที่เกิดจากการประมาท บกพร่อง รวมถึงการใช้งานไม่ถูกวิธีของผู้เช่า ',
          },
          {
            text: 'กรณีความเสียหายอย่างหนัก ซึ่งเกิดจากความประมาทของผู้เช่า เช่น ตกหล่น โดนน้ำ ',
          },
          {
            text: 'จนทำให้ ทรัพย์สินในสัญญา ฉบับนี้ ไม่สามารถซ่อมแซมให้กลับมาใช้งานได้ ซึ่งผู้เช่านั้น จะต้องนำทรัพย์สินมาส่งคืนตามสภาพที่เกิดเหตุและผู้เช่าจะต้องไม่มียอดค้างชำระในส่วนของค่าเช่าและค่าบริการดูแลรายเดือน นับถึงวันที่ผู้เช่าคืนทรัพย์สิน ผู้เช่าไม่ต้องรับผิดชอบอะไรเลยและถือเป็นการยุติการเช่าและจบสัญญา',
          },
          {
            text: '\n**กรณีทรัพย์สินตามสัญญาฉบับนี้เกิดอุบัติเหตุรุนแรงจากความประมาทและต้องการจบสัญญาจะต้องพิสูจน์ทราบได้ว่าหมายเลขเครื่อง/หมายเลขอีมี่ เป็นของทรัพย์สินตามสัญญาฉบับนี้จริง**',
          },
        ];

        const choiceThree = [
          {
            text: 'ข้อ 3. ทรัพย์สินที่เช่าตามข้อ 1 หากถูกโจรกรรม สูญหาย ถูกอายัด ไม่ว่าด้วยเหตุประการใดก็ตาม ',
          },
          {
            text: `"${buyerLabel}" ยอมรับผิด และจะยอมชำระค่าเช่าและค่าบริการดูแลรายเดือนทั้งหมดจนครบถ้วน `,
          },
          { text: 'เพื่อเป็นการชดใช้ให้แก่ "ผู้ให้เช่า" โดยไม่มีเงื่อนไข' },
        ];

        const choiceFour = [
          { text: `ข้อ 4. ก่อนการชำระค่าเช่าและค่าบริการดูแลครบถ้วน ` },
          {
            text: `"${buyerLabel}" สัญญาว่า จะไม่นำทรัพย์สินที่เช่าตามข้อ 1 ไปทำการขาย ขายฝาก แลกเปลี่ยน จำนำ ให้เช่าช่วง `,
          },
          {
            text: 'ให้ผู้อื่นยืม ฝากไว้ พยายามปลดล็อค หรือจำหน่ายโดยวิธีใดๆ แก่บุคคลอื่นเป็นอันขาด ',
          },
          {
            text: `ถ้าหาก "${buyerLabel}" ฝ่าฝืนสัญญาข้อนี้ "${buyerLabel}" ยอมให้ถือว่าได้ยักยอกทรัพย์ของ "ผู้ให้เช่า" แล้วทันที`,
          },
        ];

        const choiceFive = [
          {
            text: `ข้อ 5. หาก "${buyerLabel}" ผิดนัดชำระค่าเช่าและค่าบริการดูแลรายเดือน (มียอดค้างชำระ) `,
          },
          {
            text: `"${buyerLabel}" ยินยอมให้ "ผู้ให้เช่า" เก็บค่าธรรมเนียม หรือค่าใช้จ่ายใดๆ ดังนี้ `,
          },
          { text: '\n    - ไม่เกิน ' },
          this.formatInput(
            formatNumberDigit(contract.branch?.valueFollowOneMonth || 0),
          ),
          { text: ' บาท ค่อวันหรือต่อรอบการทวงถาม กรณีค้างชำระหนึ่งเดือน ' },
          { text: '\n    - ไม่เกิน ' },
          this.formatInput(
            formatNumberDigit(contract.branch?.valueFollowMoreThanMonth || 0),
          ),
          {
            text: ' บาท ค่อวันหรือต่อรอบการทวงถาม กรณีค้างชำระมากกว่าหนึ่งเดือน',
          },
        ];

        const choiceSix = [
          {
            text: `ข้อ 6. หาก "${buyerLabel}" ผิดนัดชำระค่าเช่าและค่าบริการดูแลรายเดือน (มียอดค้างชำระ) และไม่สามารถติดต่อได้ `,
          },
          { text: 'และไม่มียอดชำระเกิน ' },
          this.formatInput('15 วัน'),
          { text: ' นับจากวันครบกำหนดของทุกๆ เดือนตามที่ลงไว้ในสัญญาฉบับนี้ ' },
          {
            text: `"${buyerLabel}" ยินยอมให้ "ผู้ให้เช่า" เรียกคืนหรือติดตามทรัพย์สินคืนได้ทันที `,
          },
          {
            text: `"${buyerLabel}" ยินยอมให้ "ผู้ให้เช่า" โพสข้อความและรูปถ่ายของ "${buyerLabel}" หรือกล่าวถึง หรือโพสในทำนอง `,
          },
          {
            text: 'ติดตาม ตามหา หรือโพสทวงถามยอดที่ค้างชำระในช่องทางออนไลน์ และหรือ สื่อโซเชียลมีเดียทุกประเภท',
          },
        ];

        const choiceSeven = [
          {
            text: `ข้อ 7. หาก "${buyerLabel}" ไม่ต้องการเช่าต่อและตกลงจะเลิกสัญญา สามารถทำได้โดย `,
          },
          {
            text: `"${buyerLabel}" จะต้องส่งคืนทรัพย์สินของ "ผู้ให้เช่า" โดยสามารถส่งคืนได้ด้วยตนเองโดยตรง `,
          },
          { text: 'หรือทางไปรษณีย์ หรือบริษัทขนส่งพัสดุเอกชน ' },
          {
            text: 'หลังจาก "ผู้ให้เช่า" ได้รับทรัพย์สินของ "ผู้ให้เช่า" แล้ว ทาง "ผู้ให้เช่า" จะพิจารณาและตรวจสอบทรัพย์สิน ',
          },
          { text: '(อาจดำเนินการ ' },
          this.formatInput('1-14 วัน'),
          {
            text: ') และจึงจะคืนในส่วนของเงินค่าเปิดใช้เครื่อง ค่าดำเนินการระบบติดตามระยะไกล และค่าความเสื่อมสภาพขณะใช้งานทรัพย์สิน ',
          },
          { text: `ที่ "${buyerLabel}" ชำระในวันรับเครื่องให้ประมาณ ` },
          this.formatInput('50-70%'),
          {
            text: ' (โดยเงื่อนไขและจำนวนเงินคืน อาจมีการเปลี่ยนแปลงขึ้นอยู่กับทาง "ผู้ให้เช่า" เท่านั้น) และหลังจากนั้นสัญญาจะถูกยกเลิก',
          },
        ];

        const choiceEight = [
          { text: `ข้อ 8. หาก "${buyerLabel}" ผิดสัญญาข้อใดข้อหนึ่ง ` },
          {
            text: 'ยินยอมให้ "ผู้ให้เช่า" บอกเลิกสัญญาเช่าและริบเงินส่วนที่ชำระแล้วทั้งสิน ',
          },
          {
            text: 'อีกทั้งยอมมอบทรัพย์สินตามข้อ 1 คืนให้แก่ "ผู้ให้เช่า" เข้าครอบครองได้ทันที',
          },
        ];

        const footerOne = [
          { text: '*** วิธีการชำระเงิน โอนผ่านบัญชีธนาคาร ' },
          this.formatInput(contract?.ownerBankName || ''),
          { text: ' เลขที่บัญชี ' },
          this.formatInput(contract?.ownerBankNo || ''),
          { text: ' ชื่อบัญชี ' },
          this.formatInput(contract?.ownerBank || ''),
          { text: ' ชำระแล้วกรุณาแจ้งสลิปหลักฐานการโอนทุกครั้ง ***' },
        ];

        const footerTwo = [
          {
            text: `*** กรณี "${buyerLabel}" ต้องการคืนทรัพย์สิน ยินดีรับคืนโดยทาง "${buyerLabel}" จะได้รับเงินส่วนต่างคืน และไม่เป็นการผิดต่อสัญญานี้ ***`,
          },
        ];

        // หน้า 2
        const productInfoOne = [
          { text: 'ทรัพย์สินประเภท ' },
          this.formatInput(contract.product?.productType?.name || ''),
          { text: ' ยี่ห้อ ' },
          this.formatInput(contract.product?.productBrand?.name || ''),
          { text: ' รุ่น ' },
          this.formatInput(contract.product?.productModel?.name || ''),
          { text: ' สี ' },
          this.formatInput(contract.product?.productColor?.name || ''),
          { text: ' ความจุตัวเครื่อง ' },
          this.formatInput(contract.product?.productStorage?.name || ''),
          { text: ' สุขภาพแบตเตอรี่ ' },
          this.formatInput(`${contract.product?.batteryHealth || ''}%`),
        ];

        const productInfoTwo = [
          { text: 'หมายเลขเครื่อง/หมายเลข IMEI ' },
          this.formatInput(contract.product?.imei || ''),
          { text: ' กล่องตัวเครื่อง ' },
          this.formatInput(contract.product?.boxType),
          { text: ' ชุดชาร์จ ' },
          this.formatInput(contract.product?.freeGift),
        ];

        const productPayMent = [
          {
            text: `โดย "${buyerLabel}" ได้ ชําระเงินค่าเปิดใช้ เครื่อง, ค่าดําเนินการระบบติดตามระยะไกล, และค่าความเสือมสภาพขณะใช้ งานทรัพย์สินให้แก่ "ผู้ให้เช่า" ในวันทําสัญญานี้เป็นเงิน `,
          },
          this.formatInput(formatNumberDigit(contract?.priceDownPayment || 0)),
          {
            text: ' บาท \nส่วนค่าเช่าและค่าบริการดูแลรายเดือน ตกลงที่เดือนละ ',
          },
          this.formatInput(
            formatNumberDigit(productPayMentListsFirst?.price || 0),
          ),
          { text: ' บาท เป็นจำนวน ' },
          this.formatInput(contract?.valueMonth || 0),
          { text: ' เดือน ในวันที่ ' },
          this.formatInput(
            dayjs(productPayMentListsFirst?.datePay).format('DD'),
          ),
          { text: ' ของทุกเดือน ' },
        ];

        const cusomterProductInfoOne = [
          { text: 'เอกสารใช้สําหรับเช่า ' },
          this.formatInput(contract.product?.productType?.name || ''),
          { text: ' ยี่ห้อ ' },
          this.formatInput(contract.product?.productBrand?.name || ''),
          { text: ' รุ่น ' },
          this.formatInput(contract.product?.productModel?.name || ''),
          { text: ' สี ' },
          this.formatInput(contract.product?.productColor?.name || ''),
          { text: ' ความจุตัวเครื่อง ' },
          this.formatInput(contract.product?.productStorage?.name || ''),
        ];

        const cusomterProductInfoTwo = [
          { text: 'หมายเลขเครื่อง/หมายเลข IMEI ' },
          this.formatInput(contract.product?.imei || ''),
          { text: ' สุขภาพแบตเตอรี่ ' },
          this.formatInput(`${contract.product?.batteryHealth || ''}%`),
        ];

        const signatureSize = { width: 85, height: 30 };
        const citizenIdCardSize = { width: 240, height: 180 };

        return [
          this.createHeader('หนังสือสัญญาเช่า'),
          this.createColumns(
            [
              { text: `รหัสทรัพย์สิน: ${contract?.product?.code || ''} / ` },
              this.formatInput(contract?.product?.refOldStockNumber || '-'),
            ],
            `วันที่ทำสัญญา: ${formatDateNumberWithoutTime(contract?.create_date)}`,
          ),
          this.createColumns(
            `เลขที่สัญญา: ${contract?.code || ''}`,
            `ทำที่: ${contract?.branch?.name || ''}`,
          ),
          this.createParagraph([
            { text: 'ระหว่าง ข้าพเจ้า ' },
            this.formatInput(contract?.branch?.ownerName || ''),
            { text: ' บัตรประชาชนเลขที่ ' },
            this.formatInput(contract?.branch?.ownerIdCard || ''),
          ]),
          this.createParagraph([
            { text: 'ที่อยู่ตามบัตรประชาชน ' },
            this.formatInput(`${contract?.branch?.ownerAddress || ''}`),
          ]),
          this.createParagraph([
            {
              text: `ซึ่งต่อไปในสัญญานี้เรียกว่า "ผู้ให้เช่า" ฝ่ายหนึ่งกับ ข้าพเจ้า `,
            },
            this.formatInput(
              `${buyerData?.name || ''} ${buyerData?.lastname || ''}`,
            ),
            { text: ' อยู่บ้านเลขที่ ' },
            this.formatInput(buyerData?.address || ''),
          ]),
          this.createParagraph([
            { text: 'ตำบล ' },
            this.formatInput(buyerData?.mSubdistrict?.name || ''),
            { text: ' อำเภอ ' },
            this.formatInput(buyerData?.mDistrict?.name || ''),
            { text: ' จังหวัด ' },
            this.formatInput(buyerData?.mProvince?.name || ''),
            { text: ' รหัสไปรษณีย์ ' },
            this.formatInput(buyerData?.zipCode || ''),
          ]),
          this.createParagraph([
            { text: 'ถือบัตรประชาชนเลขที่ ' },
            this.formatInput(buyerData?.citizenIdCard || ''),
            {
              text: ` ซึ่งในสัญญานี้เรียกว่า "${buyerLabel}" อีกฝ่ายหนึ่งทั้งสองฝ่ายตกลงทำสัญญากันดังมีข้อความต่อไปนี้`,
            },
          ]),
          this.createClauseParagraph(choiceOne),
          this.createClauseParagraph(choiceTwo),
          this.createClauseParagraph(choiceThree),
          this.createClauseParagraph(choiceFour),
          this.createClauseParagraph(choiceFive),
          this.createClauseParagraph(choiceSix),
          this.createClauseParagraph(choiceSeven),
          this.createClauseParagraph(choiceEight),
          this.createHeader(
            'คู่สัญญาได้อ่านและเข้าใจข้อความดีแล้ว จึงได้ลงลายมือชื่อไว้เป็นสําคัญต่อหน้าพยาน',
          ),
          { text: '\n\n' },
          this.createImageColumns(
            {
              stack: [
                {
                  text: `ลงชื่อ ......................................................... ${buyerLabel}\n(${buyerData?.name || ''} ${buyerData?.lastname || ''})`,
                  style: 'subheader',
                  alignment: 'center',
                },
              ],
            },
            {
              stack: [
                ...(contract.branch?.fileSignatureOwner &&
                this.checkFileExists(contract.branch?.fileSignatureOwner)
                  ? [
                      {
                        image: this.filePath(
                          contract.branch?.fileSignatureOwner,
                        ),
                        ...signatureSize,
                        alignment: 'center',
                        relativePosition: { x: 0, y: -20 },
                      },
                    ]
                  : []),
                {
                  text: `ลงชื่อ ......................................................... ผู้ให้เช่า\n(${contract.branch?.ownerName || ''})`,
                  style: 'subheader',
                  alignment: 'center',
                },
              ],
            },
          ),
          { text: '\n' },
          this.createFooter(footerOne),
          this.createFooter(footerTwo),
          { text: '', pageBreak: 'after' },
          this.createColumns(
            [
              { text: `รหัสทรัพย์สิน: ${contract?.product?.code || ''} / ` },
              this.formatInput(contract?.product?.refOldStockNumber || '-'),
            ],
            `เลขที่สัญญา: ${contract?.code || ''}`,
          ),
          this.createParagraph('รายการทรัพย์สินที่เช่า'),
          this.createClauseParagraph(productInfoOne),
          this.createClauseParagraph(productInfoTwo),
          this.createParagraph(`ข้อมูลและเบอร์ติดต่อของ "${buyerLabel}"`),
          this.createColumnsLine(
            [
              { text: 'ข้าพเจ้า ' },
              this.formatInput(buyerData?.name || ''),
              { text: ' ' },
              this.formatInput(buyerData?.lastname || ''),
            ],
            [{ text: 'เบอร์ติดต่อ ' }, this.formatInput(buyerData?.tel || '')],
            'left',
            'left',
          ),
          this.createColumnsLine(
            [
              { text: `ญาติ${buyerLabel} 1 ชื่อ` },
              this.formatInput(buyerData?.nameRefOne || ''),
              { text: ' ' },
              this.formatInput(buyerData?.lastnameRefOne || ''),
            ],
            [
              { text: 'เบอร์ติดต่อ ' },
              this.formatInput(buyerData?.telRefOne || ''),
              { text: ' ความเกี่ยวข้องเป็น ' },
              this.formatInput(buyerData?.relaRefOne || ''),
            ],
            'left',
            'left',
          ),
          this.createColumnsLine(
            [
              { text: `ญาติ${buyerLabel} 2 ชื่อ` },
              this.formatInput(buyerData?.nameRefTwo || ''),
              { text: ' ' },
              this.formatInput(buyerData?.lastnameRefTwo || ''),
            ],
            [
              { text: 'เบอร์ติดต่อ ' },
              this.formatInput(buyerData?.telRefTwo || ''),
              { text: ' ความเกี่ยวข้องเป็น ' },
              this.formatInput(buyerData?.relaRefTwo || ''),
            ],
            'left',
            'left',
          ),
          this.createColumnThreeLine(
            [{ text: `Apple ID "${buyerLabel}" ` }, { text: '' }],
            [{ text: 'รหัสผ่าน ' }, { text: '' }],
            [{ text: 'รหัสล็อคหน้าจอ ' }, { text: '' }],
            'center',
            'center',
            'center',
          ),

          this.createColumnThreeLine(
            [{ text: `` }, this.formatInput(contract.rentAppID || '')],
            [{ text: '' }, this.formatInput(contract.rentPass || '')],
            [{ text: '' }, this.formatInput(contract.rentPin || '')],
            'center',
            'center',
            'center',
          ),

          this.createParagraph(
            'ตารางการชําระค่าเช่าและค่าบริการดูแลรายเดือนของทุกๆ เดือน',
          ),
          this.createClauseParagraph(productPayMent),
          this.createPaymentTable(contract?.productPayMentLists || []),
          this.createParagraph(
            'คู่สัญญาได้อ่านและเข้าใจข้อความดีแล้ว จึงได้ลงลายมือชื่อไว้เป็นสําคัญต่อหน้าพยาน',
          ),
          { text: `   `, margin: [0, 30, 0, 0] },
          this.createImageColumns(
            {
              stack: [
                {
                  text: `ลงชื่อ ......................................................... ${buyerLabel}\n(${buyerData?.name || ''} ${buyerData?.lastname || ''})`,
                  style: 'subheader',
                  alignment: 'center',
                },
              ],
            },
            {
              stack: [
                ...(contract.branch?.fileSignatureOwner &&
                this.checkFileExists(contract.branch?.fileSignatureOwner)
                  ? [
                      {
                        image: this.filePath(
                          contract.branch?.fileSignatureOwner,
                        ),
                        ...signatureSize,
                        alignment: 'center',
                        relativePosition: { x: 0, y: -20 },
                      },
                    ]
                  : []),
                {
                  text: `ลงชื่อ ......................................................... ผู้ให้เช่า\n(${contract.branch?.ownerName || ''})`,
                  style: 'subheader',
                  alignment: 'center',
                },
              ],
            },
          ),
          { text: `   `, margin: [0, 30, 0, 0] },
          this.createImageColumns(
            {
              stack: [
                ...(contract.branch?.fileSignatureRefOne &&
                this.checkFileExists(contract.branch?.fileSignatureRefOne)
                  ? [
                      {
                        image: this.filePath(
                          contract.branch?.fileSignatureRefOne,
                        ),
                        ...signatureSize,
                        alignment: 'center',
                        relativePosition: { x: 0, y: -20 },
                      },
                    ]
                  : []),
                {
                  text: `ลงชื่อ ......................................................... ผู้ให้เช่า\n(${contract.branch?.nameRefOne || ''})`,
                  style: 'subheader',
                  alignment: 'center',
                },
              ],
            },
            {
              stack: [
                ...(contract.branch?.fileSignatureRefTwo &&
                this.checkFileExists(contract.branch?.fileSignatureRefTwo)
                  ? [
                      {
                        image: this.filePath(
                          contract.branch?.fileSignatureRefTwo,
                        ),
                        ...signatureSize,
                        alignment: 'center',
                        relativePosition: { x: 0, y: -20 },
                      },
                    ]
                  : []),
                {
                  text: `ลงชื่อ ......................................................... ผู้ให้เช่า\n(${contract.branch?.nameRefTwo || ''})`,
                  style: 'subheader',
                  alignment: 'center',
                },
              ],
            },
          ),
          { text: `   `, margin: [0, 20, 0, 0] },
          this.createFooter(footerOne),
          this.createFooter(footerTwo),
          { text: '', pageBreak: 'after' },
          { text: `   `, margin: [0, 20, 0, 0] },
          {
            stack: [
              ...(this.checkFileExists(buyerData?.fileCustomer)
                ? [
                    {
                      image: this.filePath(buyerData?.fileCustomer),
                      ...citizenIdCardSize,
                      alignment: 'center',
                      margin: [0, 0, 0, 10],
                    },
                  ]
                : [null]),
            ],
          },
          this.createHeader('สําเนาถูกต้อง'),
          this.createHeader({
            text: `( ......................................................... )\n(${buyerData?.name || ''} ${buyerData?.lastname || ''})`,
            style: 'subheader',
            alignment: 'center',
          }),
          this.createColumnsLine(
            [{ text: '' }],
            [
              { text: 'วันที่ทําสัญญา ' },
              this.formatInput(
                formatDateTHWithOutTime(contract?.create_date) || '',
              ),
            ],
            'left',
            'right',
          ),
          this.createClauseParagraph(cusomterProductInfoOne),
          this.createClauseParagraph(cusomterProductInfoTwo),
          this.createClauseParagraph([
            {
              text: `โดย "${buyerLabel}" ได้ชําระเงินค่าเปิดใช้เครื่อง, ค่าดําเนินการระบบติดตามระยะไกล, และค่าความเสื่อมสภาพ`,
            },
          ]),
          this.createClauseParagraph([
            {
              text: 'ขณะใช้งานทรัพย์สินให้แก่ "ผู้ให้เช่า" ในวันทําสัญญาเป็นเงิน ',
            },
            this.formatInput(formatNumberDigit(contract.priceDownPayment || 0)),
            { text: ' บาท' },
          ]),
          this.createClauseParagraph([
            {
              text: 'ส่วนค่าเช่าและค่าบริการดูแลรายเดือน ตกลงที่เดือนละ ',
            },
            this.formatInput(
              formatNumberDigit(productPayMentListsFirst?.price || 0),
            ),
            { text: ' บาท เป็นจำนวน ' },
            this.formatInput(contract?.valueMonth || 0),
            { text: ' เดือน ในวันที่ ' },
            this.formatInput(
              dayjs(productPayMentListsFirst?.datePay).format('DD'),
            ),
            { text: ' ของทุกเดือน ' },
          ]),
          this.createClauseParagraph(
            [
              { text: `*** หากชําระ ค่าเช่าและค่าบริการดูแลรายเดือนทั้ง ` },
              this.formatInput(formatNumberDigit(contract?.valueMonth || 0)),
              {
                text: ' เดือนแล้ว รวมถึงไม่มียอดค้างทวงถาม หรือค่าใช้จ่ายใดๆ (ถ้ามี) ครบถ้วนแล้ว ***',
              },
            ],
            'center',
          ),
          this.createClauseParagraph(
            [
              {
                text: `*** รายการทรัพย์สินดังกล่าวนี้จึงจะถือว่าเป็นกรรมสิทธิของ${buyerLabel} ***`,
              },
            ],
            'center',
          ),
        ];
      };

      const create_by = contract?.create_by?.name || '';

      // สร้างเนื้อหาสำหรับผู้ซื้อ (customer)
      const customerContent = createContractContent(contract.customer);

      // สร้างเนื้อหาสำหรับผู้ซื้อร่วม (customerMirror) ถ้ามี
      const customerMirrorContent = contract.customerMirror
        ? createContractContent(contract.customerMirror)
        : [];

      docDefinition = {
        pageSize: 'A4',
        pageMargins: [20, 20, 20, 20],
        header: (currentPage: number, pageCount: number) => {
          return {
            text: `หน้า ${currentPage} / ${pageCount}   `,
            style: 'numberPage',
            alignment: 'right',
          };
        },
        info: {
          title: `สัญญาเช่า-${contract?.code || ''}`,
          author: user.name,
          subject: `สร้างเมื่อ-${formatDateTH(dayjs())}`,
          creator: create_by,
          producer: process.env.SERVICE_NAME,
        },
        content: [
          ...customerContent,
          ...(customerMirrorContent.length > 0
            ? [{ text: '', pageBreak: 'before' }, ...customerMirrorContent]
            : []),
        ],
        defaultStyle: {
          font: 'Sarabun',
        },
        styles: this.STYLES,
      };
    } else {
      const createContractContent = (buyer: any) => {
        const buyerLabel = 'ผู้เช่า';
        const buyerData = buyer; // customer หรือ customerMirror

        // ข้อตกลงในสัญญา
        const choiceOne = [
          {
            text: `ข้อ 1. "${buyerLabel}" ตกลงเช่าและ "ผู้ให้เช่า" ตกลงให้เช่า `,
          },
          this.formatInput(contract.product?.productType?.name || ''),
          { text: ' ยี่ห้อ ' },
          this.formatInput(contract.product?.productBrand?.name || ''),
          { text: ' รุ่น ' },
          this.formatInput(contract.product?.productModel?.name || ''),
          { text: ' สี ' },
          this.formatInput(contract.product?.productColor?.name || ''),
          { text: ' ความจุตัวเครื่อง ' },
          this.formatInput(contract.product?.productStorage?.name || ''),
          { text: ' \nหมายเลขเครื่อง/หมายเลข IMEI ' },
          this.formatInput(contract.product?.imei || ''),
          { text: ' สุขภาพแบตเตอรี่ ' },
          this.formatInput(`${contract.product?.batteryHealth || ''}%`),
          {
            text: ` ของ "ผู้ให้เช่า" ให้กับ "${buyerLabel}" โดย "${buyerLabel}" ได้ชำระเงิน ค่าเปิดใช้เครื่อง ค่าดำเนินการระบบติดตามระยะไกล และค่าความเสื่อมสภาพขณะใช้งานทรัพย์สิน ให้แก่ "ผู้ให้เช่า" ในวันทำสัญญานี้เป็นเงิน `,
          },
          this.formatInput(
            `${formatNumberDigit2(contract.priceDownPayment)} บาท` || '',
          ),
        ];

        const choiceTwo = [
          {
            text: `ข้อ 2. ${buyerLabel}ตกลงชำระค่าเช่าและค่าบริการดูแลรายเดือน โดยชำระเดือนละ `,
          },
          this.formatInput(
            `${formatNumberDigit2(productPayMentListsFirst?.price || 0)} บาท`,
          ),
          { text: ' เป็นจำนวน ' },
          this.formatInput(formatNumberDigit(contract.valueMonth)),
          { text: ' เดือน ภายในวันที่ ' },
          this.formatInput(
            dayjs(productPayMentListsFirst?.datePay).format('DD'),
          ),
          { text: ' ของทุกๆ เดือน' },
          {
            text: `\n     ข้อ 2.1 เงินที่${buyerLabel}ชำระเข้ามารายเดือน จะเป็นในส่วนของค่าเช่า `,
          },
          this.formatInput('50%'),
          { text: ' และส่วนของค่าบริการดูแล ' },
          this.formatInput('50%'),
          {
            text: ' ของค่าบริการดูแลทั้งหมด ที่กล่าวมาครอบคลุมถึงในกรณีอุปกรณ์ที่เช่าเสียหาย ',
          },
          {
            text: 'ทางผู้ให้เช่ายินดีจะดูแล แก้ไข ซ่อม และเปลี่ยนให้กลับมาสมบูรณ์ ',
          },
          { text: 'ในกรณีที่เครื่องเกิดความเสื่อมเอง อาทิเช่น ' },
          { text: 'ซ่อมเปลี่ยนอะไหล่ฟรี ' },
          {
            text: 'เปลี่ยนแบตเตอรี่ให้ใหม่ ในกรณีแบตเตอรี่มีปัญหา หรือไม่เก็บไฟ ',
          },
          {
            text: 'โดยไม่มีค่าใช้จ่ายอื่นใดเพิ่มเติม หากเครื่องที่ผู้เช่าเกิดมีปัญหาอื่นใด ที่ต้องส่งเคลม',
          },
          {
            text: 'ทางผู้ให้เช่ายินดี ออกเครื่องทดแทนเครื่องที่มีปัญหาให้กับผู้เช่า ใช้งานในระหว่างรอ ',
          },
          {
            text: 'ในกรณีความเสื่อมและเสียหาย ที่เกิดจากการประมาท บกพร่อง รวมถึงการใช้งานไม่ถูกวิธีของผู้เช่า ',
          },
          {
            text: 'กรณีความเสียหายอย่างหนัก ซึ่งเกิดจากความประมาทของผู้เช่า เช่น ตกหล่น โดนน้ำ ',
          },
          {
            text: 'จนทำให้ ทรัพย์สินในสัญญา ฉบับนี้ ไม่สามารถซ่อมแซมให้กลับมาใช้งานได้ ซึ่งผู้เช่านั้น จะต้องนำทรัพย์สินมาส่งคืนตามสภาพที่เกิดเหตุและผู้เช่าจะต้องไม่มียอดค้างชำระในส่วนของค่าเช่าและค่าบริการดูแลรายเดือน นับถึงวันที่ผู้เช่าคืนทรัพย์สิน ผู้เช่าไม่ต้องรับผิดชอบอะไรเลยและถือเป็นการยุติการเช่าและจบสัญญา',
          },
          {
            text: `\n  ${` **กรณีทรัพย์สินตามสัญญาฉบับนี้เกิดอุบัติเหตุรุนแรงจากความประมาทและต้องการจบสัญญาจะต้องพิสูจน์ทราบได้ว่าหมายเลขเครื่อง/หมายเลขอีมี่ เป็นของทรัพย์สินตามสัญญาฉบับนี้จริง**`}`,
          },
        ];

        const choiceThree = [
          {
            text: ` ${'\u00A0'.repeat(25)} ข้อ 3. ทรัพย์สินที่เช่าตามข้อ 1 หากถูกโจรกรรม สูญหาย ถูกอายัด ไม่ว่าด้วยเหตุประการใดก็ตาม `,
          },
          {
            text: `"${buyerLabel}" ยอมรับผิด และจะยอมชำระค่าเช่าและค่าบริการดูแลรายเดือนทั้งหมดจนครบถ้วน `,
          },
          { text: 'เพื่อเป็นการชดใช้ให้แก่ "ผู้ให้เช่า" โดยไม่มีเงื่อนไข' },
        ];

        const choiceFour = [
          { text: `ข้อ 4. ก่อนการชำระค่าเช่าและค่าบริการดูแลครบถ้วน ` },
          {
            text: `"${buyerLabel}" สัญญาว่า จะไม่นำทรัพย์สินที่เช่าตามข้อ 1 ไปทำการขาย ขายฝาก แลกเปลี่ยน จำนำ ให้เช่าช่วง `,
          },
          {
            text: 'ให้ผู้อื่นยืม ฝากไว้ พยายามปลดล็อค หรือจำหน่ายโดยวิธีใดๆ แก่บุคคลอื่นเป็นอันขาด ',
          },
          {
            text: `ถ้าหาก "${buyerLabel}" ฝ่าฝืนสัญญาข้อนี้ "${buyerLabel}" ยอมให้ถือว่าได้ยักยอกทรัพย์ของ "ผู้ให้เช่า" แล้วทันที`,
          },
        ];

        const choiceFive = [
          {
            text: `ข้อ 5. หาก "${buyerLabel}" ผิดนัดชำระค่าเช่าและค่าบริการดูแลรายเดือน (มียอดค้างชำระ) `,
          },
          {
            text: `"${buyerLabel}" ยินยอมให้ "ผู้ให้เช่า" เก็บค่าธรรมเนียม หรือค่าใช้จ่ายใดๆ ดังนี้ `,
          },
          { text: '\n    - ไม่เกิน ' },
          this.formatInput(
            formatNumberDigit(contract.branch?.valueFollowOneMonth || 0),
          ),
          { text: ' บาท ค่อวันหรือต่อรอบการทวงถาม กรณีค้างชำระหนึ่งเดือน ' },
          { text: '\n    - ไม่เกิน ' },
          this.formatInput(
            formatNumberDigit(contract.branch?.valueFollowMoreThanMonth || 0),
          ),
          {
            text: ' บาท ค่อวันหรือต่อรอบการทวงถาม กรณีค้างชำระมากกว่าหนึ่งเดือน',
          },
        ];

        const choiceSix = [
          {
            text: `ข้อ 6. หาก "${buyerLabel}" ผิดนัดชำระค่าเช่าและค่าบริการดูแลรายเดือน (มียอดค้างชำระ) เกิน`,
          },
          this.formatInput('5 วัน'),
          {
            text: 'จะดำเนินการล็อคเครื่องทันที (การล็อคเครื่องจะทำให้ข้อมูลภายในเครื่องหายทั้งหมด)',
          },
          {
            text: 'หากลูกค้านำเครื่องมาปลดล็อคที่หน้าร้าน คิดค่าปลดล็อค',
          },
          this.formatInput('1,000 บาท'),
          {
            text: 'และไม่สามารถติดต่อได้ และไม่มียอดชำระเกิน',
          },
          this.formatInput('15 วัน'),
          {
            text: 'นับจากวันครบกำหนดของทุก ๆ เดือนตามที่ลงไว้ในสัญญาฉบับนี้',
          },
          {
            text: `"${buyerLabel}" ยินยอมให้ "ผู้ให้เช่า" เรียกคืนหรือติดตามทรัพย์สินคืนได้ทันที`,
          },
          {
            text: 'กรณีออกนอกพื้นที่ติดตาม คิดค่าออกนอกพื้นที่ติดตามครั้งละ',
          },
          this.formatInput('1,000 บาท'),
          {
            text: 'กรณีออกโนติส คิดค่าออกโนติสครั้งละ',
          },
          this.formatInput('500 บาท'),
          {
            text: `และ "${buyerLabel}" ยินยอมให้ "ผู้ให้เช่า" โพสข้อความและรูปถ่ายของ "${buyerLabel}" หรือกล่าวถึง หรือโพสในทำนอง`,
          },
          {
            text: 'ติดตาม ตามหา หรือโพสทวงถามยอดที่ค้างชำระในช่องทางออนไลน์ และ/หรือสื่อโซเชียลมีเดียทุกประเภท',
          },
        ];

        const choiceSeven = [
          {
            text: `ข้อ 7. หาก "${buyerLabel}" ไม่ต้องการเช่าต่อและตกลงจะเลิกสัญญา สามารถทำได้โดย`,
          },
          {
            text: `"${buyerLabel}" จะต้องส่งคืนทรัพย์สินของ "ผู้ให้เช่า" โดยสามารถส่งคืนได้ด้วยตนเองโดยตรง`,
          },
          {
            text: 'หรือทางไปรษณีย์ หรือบริษัทขนส่งพัสดุเอกชน',
          },
          {
            text: 'หลังจาก "ผู้ให้เช่า" ได้รับทรัพย์สินของ "ผู้ให้เช่า" แล้ว ทาง "ผู้ให้เช่า" จะพิจารณาและตรวจสอบทรัพย์สิน',
          },
          {
            text: '(อาจดำเนินการ',
          },
          this.formatInput('1-7 วัน'),
          {
            text: ') และจึงจะคืนในส่วนของเงินค่าเปิดใช้เครื่อง ค่าดำเนินการระบบติดตามระยะไกล และค่าความเสื่อมสภาพขณะใช้งานทรัพย์สิน',
          },
          {
            text: `ที่ "${buyerLabel}" ชำระในวันรับเครื่องให้ประมาณ`,
          },
          this.formatInput('50-70%'),
          {
            text: 'กรณียกเลิกสัญญามีค่าธรรมเนียมการยกเลิก',
          },
          this.formatInput('2,000 บาท'),
          {
            text: '(โดยเงื่อนไขและจำนวนเงินคืน อาจมีการเปลี่ยนแปลงขึ้นอยู่กับทาง "ผู้ให้เช่า" เท่านั้น) และหลังจากนั้นสัญญาจะถูกยกเลิก',
          },
        ];

        const choiceEight = [
          { text: `ข้อ 8. หาก "${buyerLabel}" ผิดสัญญาข้อใดข้อหนึ่ง ` },
          {
            text: 'ยินยอมให้ "ผู้ให้เช่า" บอกเลิกสัญญาเช่าและริบเงินส่วนที่ชำระแล้วทั้งสิน ',
          },
          {
            text: 'อีกทั้งยอมมอบทรัพย์สินตามข้อ 1 คืนให้แก่ "ผู้ให้เช่า" เข้าครอบครองได้ทันที',
          },
        ];

        const footerOne = [
          { text: '*** วิธีการชำระเงิน โอนผ่านบัญชีธนาคาร ' },
          this.formatInput(contract?.ownerBankName || ''),
          { text: ' เลขที่บัญชี ' },
          this.formatInput(contract?.ownerBankNo || ''),
          { text: ' ชื่อบัญชี ' },
          this.formatInput(contract?.ownerBank || ''),
          { text: ' *** ' },
          { text: '\n *** ชำระแล้วกรุณาแจ้งสลิปหลักฐานการโอนทุกครั้ง ***' },
        ];

        const footerTwo = [
          {
            text: `*** กรณี "${buyerLabel}" ต้องการคืนทรัพย์สิน ยินดีรับคืนโดยทาง "${buyerLabel}" จะได้รับเงินส่วนต่างคืน และไม่เป็นการผิดต่อสัญญานี้ ***`,
          },
        ];

        // หน้า 2
        const productInfoOne = [
          { text: 'ทรัพย์สินประเภท ' },
          this.formatInput(contract.product?.productType?.name || ''),
          { text: ' ยี่ห้อ ' },
          this.formatInput(contract.product?.productBrand?.name || ''),
          { text: ' รุ่น ' },
          this.formatInput(contract.product?.productModel?.name || ''),
          { text: ' สี ' },
          this.formatInput(contract.product?.productColor?.name || ''),
          { text: ' ความจุตัวเครื่อง ' },
          this.formatInput(contract.product?.productStorage?.name || ''),
          { text: ' สุขภาพแบตเตอรี่ ' },
          this.formatInput(`${contract.product?.batteryHealth || ''}%`),
        ];

        const productInfoTwo = [
          { text: 'หมายเลขเครื่อง/หมายเลข IMEI ' },
          this.formatInput(contract.product?.imei || ''),
          { text: ' กล่องตัวเครื่อง ' },
          this.formatInput(contract.product?.boxType),
          { text: ' ชุดชาร์จ ' },
          this.formatInput(contract.product?.freeGift),
        ];

        const productPayMent = [
          {
            text: `โดย "${buyerLabel}" ได้ ชําระเงินค่าเปิดใช้ เครื่อง, ค่าดําเนินการระบบติดตามระยะไกล, และค่าความเสือมสภาพขณะใช้ งานทรัพย์สินให้แก่ "ผู้ให้เช่า" ในวันทําสัญญานี้เป็นเงิน `,
          },
          this.formatInput(formatNumberDigit(contract?.priceDownPayment || 0)),
          {
            text: ' บาท \nส่วนค่าเช่าและค่าบริการดูแลรายเดือน ตกลงที่เดือนละ ',
          },
          this.formatInput(
            formatNumberDigit(productPayMentListsFirst?.price || 0),
          ),
          { text: ' บาท เป็นจำนวน ' },
          this.formatInput(contract?.valueMonth || 0),
          { text: ' เดือน ในวันที่ ' },
          this.formatInput(
            dayjs(productPayMentListsFirst?.datePay).format('DD'),
          ),
          { text: ' ของทุกเดือน ' },
        ];

        const cusomterProductInfoOne = [
          { text: 'เอกสารใช้สําหรับเช่า ' },
          this.formatInput(contract.product?.productType?.name || ''),
          { text: ' ยี่ห้อ ' },
          this.formatInput(contract.product?.productBrand?.name || ''),
          { text: ' รุ่น ' },
          this.formatInput(contract.product?.productModel?.name || ''),
          { text: ' สี ' },
          this.formatInput(contract.product?.productColor?.name || ''),
          { text: ' ความจุตัวเครื่อง ' },
          this.formatInput(contract.product?.productStorage?.name || ''),
        ];

        const cusomterProductInfoTwo = [
          { text: 'หมายเลขเครื่อง/หมายเลข IMEI ' },
          this.formatInput(contract.product?.imei || ''),
          { text: ' สุขภาพแบตเตอรี่ ' },
          this.formatInput(`${contract.product?.batteryHealth || ''}%`),
        ];

        const signatureSize = { width: 85, height: 30 };
        const citizenIdCardSize = { width: 240, height: 180 };

        return [
          this.createHeader('หนังสือสัญญาเช่า'),
          this.createColumns(
            ``,
            `วันที่ทำสัญญา: ${formatDateNumberWithoutTime(contract?.create_date)}`,
          ),
          this.createColumns(
            [
              {
                text: `  ${'\u00A0'.repeat(25)} รหัสทรัพย์สิน: ${contract?.product?.code || ''}`,
              },
            ],
            `เลขที่สัญญา: ${contract?.code || ''}`,
          ),

          this.createParagraph(
            `  ${'\u00A0'.repeat(25)} รายการทรัพย์สินที่เช่า`,
          ),
          this.createClauseParagraph(productInfoOne),
          this.createClauseParagraph(productInfoTwo),
          this.createParagraph(`ข้อมูลและเบอร์ติดต่อของ "${buyerLabel}"`),
          this.createColumnsLine(
            [
              { text: 'ข้าพเจ้า ' },
              this.formatInput(buyerData?.name || ''),
              { text: ' ' },
              this.formatInput(buyerData?.lastname || ''),
            ],
            [{ text: 'เบอร์ติดต่อ ' }, this.formatInput(buyerData?.tel || '')],
            'left',
            'left',
          ),
          this.createParagraph([
            { text: ' อยู่บ้านเลขที่ ' },
            this.formatInput(buyerData?.address || ''),
            { text: 'ตำบล ' },
            this.formatInput(buyerData?.mSubdistrict?.name || ''),
            { text: ' อำเภอ ' },
            this.formatInput(buyerData?.mDistrict?.name || ''),
            { text: ' จังหวัด ' },
            this.formatInput(buyerData?.mProvince?.name || ''),
            { text: ' รหัสไปรษณีย์ ' },
            this.formatInput(buyerData?.zipCode || ''),
          ]),

          this.createColumnsLine(
            [
              { text: `ญาติ${buyerLabel} 1 ชื่อ` },
              this.formatInput(buyerData?.nameRefOne || ''),
              { text: ' ' },
              this.formatInput(buyerData?.lastnameRefOne || ''),
            ],
            [
              { text: 'เบอร์ติดต่อ ' },
              this.formatInput(buyerData?.telRefOne || ''),
              { text: ' ความเกี่ยวข้องเป็น ' },
              this.formatInput(buyerData?.relaRefOne || ''),
            ],
            'left',
            'left',
          ),
          this.createColumnsLine(
            [
              { text: `ญาติ${buyerLabel} 2 ชื่อ` },
              this.formatInput(buyerData?.nameRefTwo || ''),
              { text: ' ' },
              this.formatInput(buyerData?.lastnameRefTwo || ''),
            ],
            [
              { text: 'เบอร์ติดต่อ ' },
              this.formatInput(buyerData?.telRefTwo || ''),
              { text: ' ความเกี่ยวข้องเป็น ' },
              this.formatInput(buyerData?.relaRefTwo || ''),
            ],
            'left',
            'left',
          ),
          this.createColumnThreeLine(
            [{ text: `Apple ID "${buyerLabel}" ` }, { text: '' }],
            [{ text: 'รหัสผ่าน ' }, { text: '' }],
            [{ text: 'รหัสล็อคหน้าจอ ' }, { text: '' }],
            'center',
            'center',
            'center',
          ),

          this.createColumnThreeLine(
            [{ text: `` }, this.formatInput(contract.rentAppID || '')],
            [{ text: '' }, this.formatInput(contract.rentPass || '')],
            [{ text: '' }, this.formatInput(contract.rentPin || '')],
            'center',
            'center',
            'center',
          ),

          this.createParagraph(
            'ตารางการชําระค่าเช่าและค่าบริการดูแลรายเดือนของทุกๆ เดือน',
          ),
          this.createClauseParagraph(productPayMent),

          {
            columns: [
              {
                width: '70%',
                ...this.createPaymentTable(contract?.productPayMentLists || []),
              },
              {
                width: '30%',
                stack: [
                  {
                    image: this.filePath(`${this.masterImagePath}/line.png`),
                    width: 120,
                    alignment: 'center',
                    margin: [0, 0, 0, 10],
                  },
                  {
                    text: 'แอด ID Line: @thunder.phone',
                    style: 'subheader',
                    alignment: 'center',
                    margin: [0, 5, 0, 0], // เพิ่มระยะห่างเล็กน้อยจากรูปภาพ
                  },
                ],
              },
            ],
            margin: [0, 10, 0, 10],
          },

          this.createParagraph(
            'คู่สัญญาได้อ่านและเข้าใจข้อความดีแล้ว จึงได้ลงลายมือชื่อไว้เป็นสําคัญต่อหน้าพยาน',
          ),
          { text: `   `, margin: [0, 30, 0, 0] },
          this.createImageColumns(
            {
              stack: [
                {
                  text: `ลงชื่อ ......................................................... ${buyerLabel}\n(${buyerData?.name || ''} ${buyerData?.lastname || ''})`,
                  style: 'subheader',
                  alignment: 'center',
                },
              ],
            },
            {
              stack: [
                ...(contract.branch?.fileSignatureOwner &&
                this.checkFileExists(contract.branch?.fileSignatureOwner)
                  ? [
                      {
                        image: this.filePath(
                          contract.branch?.fileSignatureOwner,
                        ),
                        ...signatureSize,
                        alignment: 'center',
                        relativePosition: { x: 0, y: -20 },
                      },
                    ]
                  : []),
                {
                  text: `ลงชื่อ ......................................................... ผู้ให้เช่า\n(${contract.branch?.ownerName || ''})`,
                  style: 'subheader',
                  alignment: 'center',
                },
              ],
            },
          ),
          { text: `   `, margin: [0, 30, 0, 0] },
          this.createImageColumns(
            {
              stack: [
                ...(contract.branch?.fileSignatureRefOne &&
                this.checkFileExists(contract.branch?.fileSignatureRefOne)
                  ? [
                      {
                        image: this.filePath(
                          contract.branch?.fileSignatureRefOne,
                        ),
                        ...signatureSize,
                        alignment: 'center',
                        relativePosition: { x: 0, y: -20 },
                      },
                    ]
                  : []),
                {
                  // text: `ลงชื่อ ......................................................... ผู้ให้เช่า\n(${contract.branch?.nameRefOne || ''})`,
                  text: `ลงชื่อ ......................................................... พาร์ทเนอร์\n(${_.isNumber(contract.processManageFinanceId) ? nameFinance : ' ......................................................... '})`,
                  style: 'subheader',
                  alignment: 'center',
                },
              ],
            },
            {
              stack: [
                ...(contract.branch?.fileSignatureRefTwo &&
                this.checkFileExists(contract.branch?.fileSignatureRefTwo)
                  ? [
                      {
                        image: this.filePath(
                          contract.branch?.fileSignatureRefTwo,
                        ),
                        ...signatureSize,
                        alignment: 'center',
                        relativePosition: { x: 0, y: -20 },
                      },
                    ]
                  : []),
                {
                  // text: `ลงชื่อ ......................................................... ผู้ให้เช่า\n(${contract.branch?.nameRefTwo || ''})`,
                  text: `ลงชื่อ ......................................................... ผู้ให้เช่า\n(${contract.branch?.nameRefOne || ''})`,
                  style: 'subheader',
                  alignment: 'center',
                },
              ],
            },
          ),
          { text: `   `, margin: [0, 20, 0, 0] },
          // this.createFooter(footerOne),
          // this.createFooter(footerTwo),
          this.createColumns(
            [
              {
                text: ` ${'\u00A0'.repeat(25)} รหัสทรัพย์สิน: ${contract?.product?.code || ''}`,
              },
            ],
            `วันที่ทำสัญญา: ${formatDateNumberWithoutTime(contract?.create_date)}`,
          ),
          this.createColumns(
            ` ${'\u00A0'.repeat(25)} เลขที่สัญญา: ${contract?.code || ''}`,
            `ทำที่: ${contract?.branch?.name || ''}`,
          ),
          { text: '\n\n' },
          this.createParagraph([
            { text: 'ระหว่าง ข้าพเจ้า ' },
            this.formatInput(contract?.branch?.ownerName || ''),
            { text: ' บัตรประชาชนเลขที่ ' },
            this.formatInput(contract?.branch?.ownerIdCard || ''),
          ]),
          this.createParagraph([
            { text: 'ที่อยู่ตามบัตรประชาชน ' },
            this.formatInput(`${contract?.branch?.ownerAddress || ''}`),
          ]),
          this.createParagraph([
            {
              text: `ซึ่งต่อไปในสัญญานี้เรียกว่า "ผู้ให้เช่า" ฝ่ายหนึ่งกับ ข้าพเจ้า `,
            },
            this.formatInput(
              `${buyerData?.name || ''} ${buyerData?.lastname || ''}`,
            ),
            { text: ' อยู่บ้านเลขที่ ' },
            this.formatInput(buyerData?.address || ''),
          ]),
          this.createParagraph([
            { text: 'ตำบล ' },
            this.formatInput(buyerData?.mSubdistrict?.name || ''),
            { text: ' อำเภอ ' },
            this.formatInput(buyerData?.mDistrict?.name || ''),
            { text: ' จังหวัด ' },
            this.formatInput(buyerData?.mProvince?.name || ''),
            { text: ' รหัสไปรษณีย์ ' },
            this.formatInput(buyerData?.zipCode || ''),
          ]),
          this.createParagraph([
            { text: 'ถือบัตรประชาชนเลขที่ ' },
            this.formatInput(buyerData?.citizenIdCard || ''),
            {
              text: ` ซึ่งในสัญญานี้เรียกว่า "${buyerLabel}" อีกฝ่ายหนึ่งทั้งสองฝ่ายตกลงทำสัญญากันดังมีข้อความต่อไปนี้`,
            },
          ]),
          { text: '\n\n' },
          this.createClauseParagraph(choiceOne),
          this.createClauseParagraph(choiceTwo),

          { text: '\n\n' },
          this.createImageColumns(
            {
              stack: [
                {
                  text: ``,
                  style: 'subheader',
                  alignment: 'center',
                },
              ],
            },
            {
              stack: [
                ...(contract.branch?.fileSignatureOwner &&
                this.checkFileExists(contract.branch?.fileSignatureOwner)
                  ? [
                      {
                        image: this.filePath(
                          contract.branch?.fileSignatureOwner,
                        ),
                        ...signatureSize,
                        alignment: 'center',
                        relativePosition: { x: 0, y: -20 },
                      },
                    ]
                  : []),
                {
                  text: `ลงชื่อ ......................................................... ${buyerLabel}\n(${buyerData?.name || ''} ${buyerData?.lastname || ''})`,
                  style: 'subheader',
                  alignment: 'center',
                },
              ],
            },
          ),

          { text: '', pageBreak: 'after' },
          { text: '\n\n' },
          this.createClauseParagraph(choiceThree),
          this.createClauseParagraph(choiceFour),
          this.createClauseParagraph(choiceFive),
          this.createClauseParagraph(choiceSix),
          this.createClauseParagraph(choiceSeven),
          this.createClauseParagraph(choiceEight),
          this.createHeader(
            'คู่สัญญาได้อ่านและเข้าใจข้อความดีแล้ว จึงได้ลงลายมือชื่อไว้เป็นสําคัญต่อหน้าพยาน',
          ),
          { text: '\n\n' },
          this.createImageColumns(
            {
              stack: [
                {
                  text: `ลงชื่อ ......................................................... ${buyerLabel}\n(${buyerData?.name || ''} ${buyerData?.lastname || ''})`,
                  style: 'subheader',
                  alignment: 'center',
                },
              ],
            },
            {
              stack: [
                ...(contract.branch?.fileSignatureOwner &&
                this.checkFileExists(contract.branch?.fileSignatureOwner)
                  ? [
                      {
                        image: this.filePath(
                          contract.branch?.fileSignatureOwner,
                        ),
                        ...signatureSize,
                        alignment: 'center',
                        relativePosition: { x: 0, y: -20 },
                      },
                    ]
                  : []),
                {
                  text: `ลงชื่อ ......................................................... ผู้ให้เช่า\n(${contract.branch?.ownerName || ''})`,
                  style: 'subheader',
                  alignment: 'center',
                },
              ],
            },
          ),
          { text: '\n' },
          this.createFooter(footerOne),
          this.createFooter(footerTwo),
          { text: '', pageBreak: 'after' },
          { text: `   `, margin: [0, 20, 0, 0] },
          this.createHeader('สําเนาถูกต้อง'),
          this.createColumnsLine(
            [{ text: '' }],
            [
              { text: 'วันที่ทําสัญญา ' },
              this.formatInput(
                formatDateTHWithOutTime(contract?.create_date) || '',
              ),
            ],
            'left',
            'right',
          ),
          this.createClauseParagraph(cusomterProductInfoOne),
          this.createClauseParagraph(cusomterProductInfoTwo),
          this.createClauseParagraph([
            {
              text: `โดย "${buyerLabel}" ได้ชําระเงินค่าเปิดใช้เครื่อง, ค่าดําเนินการระบบติดตามระยะไกล, และค่าความเสื่อมสภาพ`,
            },
          ]),
          this.createClauseParagraph([
            {
              text: 'ขณะใช้งานทรัพย์สินให้แก่ "ผู้ให้เช่า" ในวันทําสัญญาเป็นเงิน ',
            },
            this.formatInput(formatNumberDigit(contract.priceDownPayment || 0)),
            { text: ' บาท' },
          ]),
          this.createClauseParagraph([
            {
              text: 'ส่วนค่าเช่าและค่าบริการดูแลรายเดือน ตกลงที่เดือนละ ',
            },
            this.formatInput(
              formatNumberDigit(productPayMentListsFirst?.price || 0),
            ),
            { text: ' บาท เป็นจำนวน ' },
            this.formatInput(contract?.valueMonth || 0),
            { text: ' เดือน ในวันที่ ' },
            this.formatInput(
              dayjs(productPayMentListsFirst?.datePay).format('DD'),
            ),
            { text: ' ของทุกเดือน ' },
          ]),
          this.createClauseParagraph(
            [
              { text: `*** หากชําระ ค่าเช่าและค่าบริการดูแลรายเดือนทั้ง ` },
              this.formatInput(formatNumberDigit(contract?.valueMonth || 0)),
              {
                text: ' เดือนแล้ว รวมถึงไม่มียอดค้างทวงถาม หรือค่าใช้จ่ายใดๆ (ถ้ามี) ครบถ้วนแล้ว ***',
              },
            ],
            'center',
          ),
          this.createClauseParagraph(
            [
              {
                text: `*** รายการทรัพย์สินดังกล่าวนี้จึงจะถือว่าเป็นกรรมสิทธิของ${buyerLabel} ***`,
              },
            ],
            'center',
          ),
          { text: '\n\n' },
          { text: '\n\n' },
          {
            stack: [
              ...(this.checkFileExists(buyerData?.fileCustomer)
                ? [
                    {
                      image: this.filePath(buyerData?.fileCustomer),
                      ...citizenIdCardSize,
                      alignment: 'center',
                      margin: [0, 0, 0, 10],
                    },
                  ]
                : [null]),
            ],
          },
          this.createHeader({
            text: `( ......................................................... )\n(${buyerData?.name || ''} ${buyerData?.lastname || ''})`,
            style: 'subheader',
            alignment: 'center',
          }),
        ];
      };

      const create_by = contract?.create_by?.name || '';

      // สร้างเนื้อหาสำหรับผู้ซื้อ (customer)
      const customerContent = createContractContent(contract.customer);

      // สร้างเนื้อหาสำหรับผู้ซื้อร่วม (customerMirror) ถ้ามี
      const customerMirrorContent = contract.customerMirror
        ? createContractContent(contract.customerMirror)
        : [];

      docDefinition = {
        pageSize: 'A4',
        pageMargins: [20, 20, 20, 20],
        header: (currentPage: number, pageCount: number) => {
          return {
            columns: [
              {
                image: this.filePath(`${this.masterImagePath}/logo.png`),
                width: 60,
                alignment: 'left',
                margin: [20, 10, 0, 0],
              },
              {
                text: `หน้า ${currentPage} / ${pageCount}`,
                style: 'numberPage',
                alignment: 'right',
              },
            ],
          };
        },
        info: {
          title: `สัญญาเช่า-${contract?.code || ''}`,
          author: user.name,
          subject: `สร้างเมื่อ-${formatDateTH(dayjs())}`,
          creator: create_by,
          producer: process.env.SERVICE_NAME,
        },
        content: [
          ...customerContent,
          ...(customerMirrorContent.length > 0
            ? [{ text: '', pageBreak: 'before' }, ...customerMirrorContent]
            : []),
        ],
        defaultStyle: {
          font: 'Sarabun',
        },
        styles: this.STYLES,
      };
    }

    return new Promise((resolve) => {
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk: Buffer<ArrayBufferLike>) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.end();
    });
  }

  async printSlip(id: number, req: FastifyRequest): Promise<Buffer> {
    const user = (req as any).user;

    const contract = await this.productSaleRepository.findOne({
      where: { id },
      relations: [
        'create_by',
        'product',
        'product.productType',
        'product.productModel',
        'product.productBrand',
        'product.productColor',
        'product.productStorage',
        'productSaleLists',
        'productPayMentLists',
        'branch',
      ],
    });

    if (!['1', '2'].includes(contract.saleType) || !contract) {
      throw new BadRequestException(
        `คุณปริ้นเอกสารผิดประเภท: ${contract.code}`,
      );
    }

    // สร้าง PdfPrinter instance
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

    // กำหนด document definition สำหรับ pdfmake
    const docDefinition = {
      pageSize: { width: 226.772, height: 300 }, // 80mm x 80mm (1mm = 2.83465 pt)
      pageMargins: [10, 10, 10, 10],
      info: {
        title: `สลิป-${contract?.code || ''}`,
        author: user.name,
        subject: `สร้างเมื่อ-${formatDateTH(dayjs())}`,
        creator: user.name,
        producer: process.env.SERVICE_NAME,
      },
      content: [
        {
          stack: [
            // ส่วนหัวของสลิป
            {
              columns: [
                {
                  text: `${contract.branch.name}`,
                  style: 'subheader',
                },
                {
                  text: `ใบเสร็จรับเงิน`,
                  decoration: 'underline',
                  style: 'subheader',
                  alignment: 'right',
                },
              ],
              margin: [0, 0, 0, 5],
            },
            // ข้อมูลใบเสร็จ
            { text: `เลขที่: ${contract.code}`, style: 'subheader' },
            {
              columns: [
                {
                  text: `วันที่: ${formatDateTH(contract.create_date)}`,
                  style: 'subheader',
                },
                {
                  text: `โดย: ${contract.create_by.name}`,
                  style: 'subheader',
                  alignment: 'right',
                },
              ],
            },
            // เส้นแบ่ง
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 206.772,
                  y2: 0,
                  lineWidth: 0.5,
                },
              ],
              margin: [0, 5, 0, 5],
            },
            // รายการสินค้า
            {
              text: 'รายการสินค้า',
              style: 'subheader',
              margin: [0, 0, 0, 3],
            },
            ...(contract.product != null
              ? [
                  {
                    columns: [
                      {
                        text: `${contract.product.productBrand.name} ${contract.product.productModel.name} ${contract.product.productStorage.name} ${contract.product.productColor.name} * (1)`,
                        style: 'item',
                        width: '*',
                      },
                      {
                        text: `${formatNumberDigit(contract.priceSale)} บาท`,
                        style: 'item',
                        width: 'auto',
                        alignment: 'right',
                      },
                    ],
                    margin: [0, 0, 0, 2],
                  },
                ]
              : []),
            ...(contract.productSaleLists &&
            contract.productSaleLists.length > 0
              ? contract.productSaleLists.map((item) => ({
                  columns: [
                    {
                      text: `${item.productName} * (${formatNumberDigit(item.amount)})`,
                      style: 'item',
                      width: '*',
                    },
                    {
                      text: `${formatNumberDigit(item.priceSumSale)} บาท`,
                      style: 'item',
                      width: 'auto',
                      alignment: 'right',
                    },
                  ],
                  margin: [0, 0, 0, 2],
                }))
              : []),
            // เส้นแบ่งก่อนราคารวม
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 206.772,
                  y2: 0,
                  lineWidth: 0.5,
                },
              ],
              margin: [0, 5, 0, 5],
            },
            // เพิ่ม Spacer เพื่อผลักราคารวมไปด้านล่าง
            {
              text: '',
              margin: [0, 0, 0, 0], // ช่องว่างเปล่า
              fontSize: 0,
              height: 'auto', // ปรับให้ยืดหยุ่น
            },
          ],
          // ทำให้ stack นี้อยู่ด้านบน
          unbreakable: true,
        },
        // ราคารวม (วางแยกไว้นอก stack เพื่อให้อยู่ด้านล่างสุด)
        {
          columns: [
            {
              text: '',
              width: '*',
            },
            {
              text: `ราคารวม ${formatNumberDigit(contract.priceTotalPaid)} บาท`,
              style: 'subheader',
              width: 'auto',
              alignment: 'right',
            },
          ],
          // ใช้ absolutePosition เพื่อวางห่างจากขอบล่าง 20 มม.
          absolutePosition: { x: 10, y: 270 }, // y = 290.0 - 56.7 = 233.3
        },
      ],
      styles: {
        header: { fontSize: 10 },
        subheader: { fontSize: 8 },
        item: { fontSize: 7 },
      },
      defaultStyle: {
        font: 'Sarabun',
        lineHeight: 1.1,
      },
    };

    // สร้าง PDF และแปลงเป็น Buffer
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const buffers: Buffer[] = [];

    pdfDoc.on('data', (chunk) => buffers.push(chunk));
    pdfDoc.on('end', () => {});

    pdfDoc.end();

    return new Promise((resolve) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }

  async delete(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;
    const productSale = await this.productSaleRepository.findOne({
      where: { id: id },
      relations: ['productSaleLists'],
    });

    if (productSale.priceSumPayInvoices > 0) {
      return {
        message_error: `คุณไม่สามารถลบ ${productSale.code} เนื่องจากมีการจ่ายค่าดูแลรายเดือนแล้ว`,
      };
    }

    if (productSale.isMobileSale == '1') {
      const product = await this.productRepository.findOne({
        where: { id: productSale.productId },
      });

      if (product) {
        const savedProduct = { ...product };
        savedProduct.active = '1';
        savedProduct.amount = 1;

        await this.productRepository.update(
          {
            id: productSale.productId,
          },
          {
            active: '1',
            amount: 1,
          },
        );

        const productLogDto: CreateProductLogDto = {
          productId: productSale.productId,
          action: `ลบสัญญา: ${productSale.code}`,
          obj: JSON.stringify({
            before: product,
            after: savedProduct,
          }),
          branchId: productSale.branchId,
          userId: user.id,
        };
        await this.productLogService.create(productLogDto);
        // return { message_error: `คุณไม่สามารถลบ ${productSale.code}` };
      }
    }

    const { productSaleLists } = productSale;

    for (let index = 0; index < productSaleLists.length; index++) {
      const product = await this.productRepository.findOneBy({
        id: productSaleLists[index].productId,
      });

      const productPrice = await this.productPriceRepository.findOneBy({
        productId: productSaleLists[index].productId,
      });

      const existingProductPrice = { ...productPrice };
      existingProductPrice.amount =
        productPrice.amount + productSaleLists[index].amount;

      await this.productPriceRepository.update(
        { id: productPrice.id },
        { amount: existingProductPrice.amount },
      );

      const existingProduct = { ...product };
      existingProduct.amount = product.amount + productSaleLists[index].amount;
      existingProduct.amountSale = Number(existingProduct.amountSale);
      existingProduct.amountSale -= Number(productSaleLists[index].amount);

      existingProduct.amountRemaining = Number(existingProduct.amountRemaining);
      existingProduct.amountRemaining -= Number(productSaleLists[index].amount);

      existingProduct.priceSumSale = Number(existingProduct.priceSumSale);
      existingProduct.priceSumSale -= Number(productSaleLists[index].priceSale);

      const productLogDto: CreateProductLogDto = {
        productId: existingProduct.id, // ใช้ id จาก product
        action: `คืนสินค้า: ${productSale.code}`,
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

    // Construct folder path
    const folderPath = path.join(this.uploadsPath, productSale.code);

    // Check if folder exists and delete
    if (await fs.pathExists(folderPath)) {
      await fs.remove(folderPath);
    }

    // Delete product sale record
    await this.productSaleRepository.delete({ id });
    await this.productPayMentListsRepository.delete({ productSaleId: id });
    await this.productSaleListsRepository.delete({ productSaleId: id });

    return {
      message_success: `${MESSAGE_DELETE_SUCCESS}: ${productSale.code}`,
    };
  }

  // async deleteAll(id: number): Promise<any> {
  //   const productSale = await this.productSaleRepository.findOneBy({ id });

  //   // Construct folder path
  //   const folderPath = path.join(this.uploadsPath, productSale.code);

  //   // Check if folder exists and delete
  //   if (await fs.pathExists(folderPath)) {
  //     await fs.remove(folderPath);
  //   }

  //   // Delete product sale record
  //   await this.productSaleRepository.delete({ id });
  //   await this.productPayMentListsRepository.delete({ productSaleId: id });
  //   await this.productSaleListsRepository.delete({ productSaleId: id });
  //   await this.productRepository.update(
  //     {
  //       id: productSale.productId,
  //     },
  //     {
  //       active: '1',
  //       amount: 1,
  //     },
  //   );

  //   return folderPath;
  // }

  // async returnAcc(): Promise<any> {
  //   const products = await this.productRepository.find({
  //     where: { catalog: 'อุปกรณ์เสริม' },
  //   });

  //   for (let index = 0; index < products.length; index++) {
  //     await this.productPriceRepository.update(
  //       { productId: products[index].id },
  //       { amount: products[index].amount },
  //     );
  //   }

  //   const productSales = await this.productSaleRepository.find({
  //     where: {
  //       isCancel: '0',
  //     },
  //     relations: ['productSaleLists'],
  //   });

  //   for (let index = 0; index < productSales.length; index++) {
  //     const { productSaleLists, ...res } = productSales[index];

  //     let priceEquipSum = 0;

  //     for (let index = 0; index < productSaleLists.length; index++) {
  //       priceEquipSum += Number(productSaleLists[index].priceSale);
  //     }

  //     await this.productSaleRepository.update(
  //       { id: res.id },
  //       { priceEquipSum: priceEquipSum },
  //     );
  //   }
  //   return productSales;
  // }
}
