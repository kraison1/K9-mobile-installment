import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ProcessCaseSearchDto } from 'src/helper/search.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, MoreThan, Not, Repository } from 'typeorm';
import { ProcessCase } from './entities/process-case.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { isEmpty } from 'lodash';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { Product } from '../product/entities/product.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { CreateProductLogDto } from '../product-log/dto/create-product-log.dto';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { ProcessCaseImage } from '../process-case-images/entities/process-case-image.entity';
import { TelegramNotificationService } from '../telegram-notification/telegram-notification.service';
import { Branch } from '../branchs/entities/branch.entity';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { generateRandomString } from 'src/helper/generateRandomString';
import { ManageAppleId } from '../manage-apple-id/entities/manage-apple-id.entity';

@Injectable()
export class ProcessCasesService {
  private readonly uploadsPath = path.join('uploads/process-cases');

  constructor(
    @InjectRepository(ProcessCase)
    private readonly processCaseRepository: Repository<ProcessCase>,

    @InjectRepository(ManageAppleId)
    private readonly manageAppleIdRepository: Repository<ManageAppleId>,

    @InjectRepository(ProductSale)
    private readonly productSaleRepository: Repository<ProductSale>,

    @InjectRepository(ProcessCaseImage)
    private readonly processCaseImageRepository: Repository<ProcessCaseImage>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductPayMentList)
    private readonly productPayMentListRepository: Repository<ProductPayMentList>,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    private readonly productLogService: ProductLogService,
    private readonly telegramNotificationService: TelegramNotificationService,
  ) {}

  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    const { id, caseType, newProductId, oldProductId } = req.body as any;
    const values = {
      productSaleId: id.value,
      createByUserId: user.id,
      branchId: user.branchId,
      status: '1',
      valueMonth: 0,
      valueDebtMonth: 0,
      sumPrice: 0,
      sumPriceDebt: 0,
      sumPricePay: 0,
      priceRemaining: 0,
      priceCostBuy: 0,
      priceDownPayment: 0,
      priceReRider: 0,
      priceEquipSum: 0,
      newProductId: newProductId?.value || null,
      oldProductId: oldProductId?.value || null,
      caseStatus: '',
      caseType: caseType?.value || 1,
      note: '',
    };

    const processCase = await this.processCaseRepository.findOne({
      where: { productSaleId: values.productSaleId, status: '1' },
    });

    if (!isEmpty(processCase)) {
      return { message_error: 'เลขสัญญานี้กำลังรอดำนเนิการ' };
    }

    const fetchProductSale = await this.productSaleRepository.findOne({
      where: { id: values.productSaleId },
      relations: ['productPayMentLists', 'product'],
    });
    values.branchId = fetchProductSale.branchId;

    if (isEmpty(fetchProductSale)) {
      return { message_error: 'ไม่พบหมายเลขสัญญานี้' };
    }

    const { productPayMentLists, ...res } = fetchProductSale;

    const sumPricePay = productPayMentLists.reduce(
      (a, b) => a + +b.pricePay,
      0,
    );

    const sumPriceDebt = productPayMentLists.reduce(
      (a, b) => a + +b.priceDebt,
      0,
    );

    const sumPrice = productPayMentLists.reduce((a, b) => a + +b.price, 0);

    const checkCase = productPayMentLists.find((e) => e.isPaySuccess !== '1');

    const pendingPayments = productPayMentLists.filter(
      (e) => e.isPaySuccess !== '1',
    );

    values.valueDebtMonth = pendingPayments.length;

    if (values.caseType == 1) {
      if (isEmpty(checkCase)) {
        values.caseType = 1;
        values.caseStatus = 'จบสัญญาแบบไม่มียอดค้าง';
      } else {
        values.caseType = 2;
        values.caseStatus = 'จบสัญญาแบบมียอดค้าง';
      }
    } else if (values.caseType == 3) {
      values.caseStatus = 'คืนสัญญา';
    } else if (values.caseType == 4) {
      values.caseStatus = 'ยึดสัญญา';
    } else if (values.caseType == 5) {
      values.caseStatus = 'เครมเครื่อง';
    } else if (values.caseType == 6) {
      values.caseStatus = 'หนี้เสีย';
    }

    const branch = await this.branchRepository.findOneBy({
      id: values.branchId,
    });

    const message = `${values.caseStatus}: ${fetchProductSale.code}
    โดย: ${user.name}`;
    await this.telegramNotificationService.sendTelegramNotify({
      botToken: branch.token_bot,
      chatId: branch.room_id_processCases,
      message: message,
    });

    values.sumPricePay = sumPricePay;
    values.priceCostBuy = res.product.priceCostBuy;
    values.priceDownPayment = res.priceDownPayment;
    values.priceReRider = res.priceReRider;
    values.priceEquipSum = res.priceEquipSum;

    values.note = fetchProductSale.note;
    values.sumPricePay = sumPricePay;
    values.sumPrice = sumPrice;
    values.sumPriceDebt = sumPriceDebt;
    values.valueMonth = fetchProductSale.valueMonth;

    values.priceRemaining = sumPrice - sumPricePay;

    const createProcessCase = this.processCaseRepository.create(values);
    await this.processCaseRepository.save(createProcessCase);

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(searchProcessCaseSearchDto: ProcessCaseSearchDto): Promise<{
    data: ProcessCase[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder =
      this.processCaseRepository.createQueryBuilder('process_case');

    queryBuilder
      .select([
        'process_case.id',
        'process_case.priceRemaining',
        'process_case.valueDebtMonth',
        'process_case.createByUserId',
        'process_case.productSaleId',
        'process_case.create_date',
        'process_case.caseType',
        'process_case.useCostType',
        'process_case.priceDownPayment',
        'process_case.newProductId',
        'process_case.oldProductId',
        'process_case.note',
        'process_case.pricePayRider',
        'process_case.priceReturnCustomer',
        'process_case.priceNewCostBuy',
        'process_case.sumPriceDebt',
        'process_case.priceEndCase',
        'process_case.caseStatus',
        'process_case.status',
        'productSale.id',
        'productSale.code',
        'productSale.productId',
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
      .leftJoin('process_case.productSale', 'productSale')
      .leftJoin('productSale.product', 'product')
      .leftJoin('product.productModel', 'product_model')
      .leftJoin('product.productColor', 'product_color')
      .leftJoin('product.productStorage', 'product_storage')
      .leftJoin('productSale.customer', 'customer')
      .leftJoin('process_case.create_by', 'user');

    if (searchProcessCaseSearchDto.searchType == '1') {
      queryBuilder.andWhere(
        'process_case.create_date BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(searchProcessCaseSearchDto.startDate),
          endDate: new Date(searchProcessCaseSearchDto.endDate),
        },
      );
    }

    if (searchProcessCaseSearchDto.status !== '0') {
      queryBuilder.andWhere('process_case.status = :status', {
        status: searchProcessCaseSearchDto.status,
      });
    }

    if (searchProcessCaseSearchDto.branchId !== 0) {
      queryBuilder.andWhere('process_case."branchId" = :branchId', {
        branchId: searchProcessCaseSearchDto.branchId,
      });
    }

    if (searchProcessCaseSearchDto.search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('productSale.code ILIKE :search', {
            search: `%${searchProcessCaseSearchDto.search}%`,
          })
            .orWhere('customer.name ILIKE :search', {
              search: `%${searchProcessCaseSearchDto.search}%`,
            })
            .orWhere('customer.lastname ILIKE :search', {
              search: `%${searchProcessCaseSearchDto.search}%`,
            })
            .orWhere('customer.tel ILIKE :search', {
              search: `%${searchProcessCaseSearchDto.search}%`,
            })
            .orWhere('product.code ILIKE :search', {
              search: `%${searchProcessCaseSearchDto.search}%`,
            })
            .orWhere('product.imei ILIKE :search', {
              search: `%${searchProcessCaseSearchDto.search}%`,
            });
        }),
      );
    }

    queryBuilder.orderBy('process_case.create_date', 'DESC');

    const total = await queryBuilder.getCount();

    queryBuilder
      .skip(
        (searchProcessCaseSearchDto.page - 1) *
          searchProcessCaseSearchDto.pageSize,
      )
      .take(searchProcessCaseSearchDto.pageSize);

    const processCase = await queryBuilder.getMany();

    return {
      data: processCase,
      total,
      page: searchProcessCaseSearchDto.page,
      pageSize: searchProcessCaseSearchDto.pageSize,
    };
  }

  async findOne(id: number): Promise<ProcessCase | null> {
    return this.processCaseRepository.findOne({
      where: { id },
      relations: ['processCaseImages'],
    });
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;
    await fs.ensureDir(this.uploadsPath);
    const files = await req.saveRequestFiles();

    const {
      sumPrice,
      sumPricePay,
      sumPriceDebt,
      priceDiscount,
      priceDebt,
      priceRemaining,
      priceEndCase,
      priceCostBuy,
      priceDownPayment,
      priceNewCostBuy,
      priceReturnCustomer,
      useCostType,
      payType,
      status,
      note,
    } = req.body as any;

    const updateProcessDto = {
      priceCostBuy: priceCostBuy?.value ?? 0,
      priceDownPayment: priceDownPayment?.value ?? 0,
      sumPrice: sumPrice?.value ?? 0,
      sumPricePay: sumPricePay?.value ?? 0,
      sumPriceDebt: sumPriceDebt?.value ?? 0,
      priceDiscount: priceDiscount?.value ?? 0,
      priceDebt: priceDebt?.value ?? 0,
      priceRemaining: priceRemaining?.value ?? 0,
      priceEndCase: priceEndCase?.value ?? 0,
      priceNewCostBuy: priceNewCostBuy?.value ?? 0,
      priceReturnCustomer: priceReturnCustomer?.value ?? 0,
      useCostType: useCostType?.value ?? '',
      status: status?.value ?? '',
      payType: payType?.value ?? '1',
      note: note?.value ?? '',
    };

    const getProcessCase = await this.processCaseRepository.findOne({
      where: { id },
      relations: [
        'productSale',
        'productSale.customer',
        'productSale.create_by',
        'productSale.create_by.branch',
        'productSale.processManageFinance',
        'productSale.processManageFinance.create_by',
      ],
    });

    const { productSale, ...processCase } = getProcessCase;
    await fs.ensureDir(`${this.uploadsPath}/${productSale.code}`);
    for (let index = 0; index < files.length; index++) {
      const seq = index;
      const file = files[index];
      const buffer = await fs.readFile(file.filepath);
      const randomName = generateRandomString(6);
      const filename = `${randomName}-${seq}.png`;
      const filePath = path.join(
        `${this.uploadsPath}/${productSale.code}`,
        filename,
      );

      await sharp(buffer)
        .png({ quality: 80, progressive: true })
        .toFile(filePath);

      const newProductImage = this.processCaseImageRepository.create({
        name: filePath,
        processCaseId: id,
        userId: user.id,
        seq: seq,
      });

      await this.processCaseImageRepository.save(newProductImage);
    }

    if (processCase.status == '2' || processCase.status == '3') {
      return { message_error: 'การดำเนินการไม่ถูกต้อง' };
    }

    if (updateProcessDto.status == '2') {
      processCase.priceDiscount = updateProcessDto.priceDiscount;
      processCase.priceDebt = updateProcessDto.priceDebt;
      processCase.priceEndCase = updateProcessDto.priceEndCase;
      processCase.status = updateProcessDto.status;
      processCase.priceNewCostBuy = updateProcessDto.priceNewCostBuy;
      processCase.useCostType = updateProcessDto.useCostType;
      processCase.priceReturnCustomer = updateProcessDto.priceReturnCustomer;
      processCase.payType = updateProcessDto.payType;
      processCase.note = updateProcessDto.note;

      // บันทึกการเปลี่ยนแปลง (ถ้าต้องการ)
      const productSale = await this.productSaleRepository.findOne({
        where: {
          id: processCase.productSaleId,
        },
      });

      const priceEndCase = processCase.priceEndCase;

      if (processCase.caseType == 1) {
        await this.productSaleRepository.update(
          { id: processCase.productSaleId },
          { isPaySuccess: '1' },
        );
        await this.productPayMentListRepository.update(
          { productSaleId: processCase.productSaleId },
          { isPaySuccess: '1' },
        );
      } else if (processCase.caseType == 2) {
        if (priceEndCase == 0) {
          await this.productSaleRepository.update(
            { id: processCase.productSaleId },
            { isPaySuccess: '1' },
          );

          await this.productPayMentListRepository.update(
            { productSaleId: processCase.productSaleId },
            { isPaySuccess: '1' },
          );
        } else {
          // คำนวณ priceSomeProfit
          productSale.priceSomeProfit =
            priceEndCase -
            (productSale.priceCostBuy - productSale.priceDownPayment);

          // คำนวณ priceProfit
          productSale.priceProfit =
            priceEndCase * -1 + productSale.priceSomeProfit;

          await this.processCaseRepository.save(productSale);

          const totalRemainingPrice = await this.productPayMentListRepository
            .createQueryBuilder('payment')
            .select(
              'SUM(payment.price - payment.pricePay)',
              'totalRemainingPrice',
            )
            .where('payment.productSaleId = :productSaleId', {
              productSaleId: processCase.productSaleId,
            })
            .andWhere('payment.pricePay != 0')
            .getRawOne();

          const productPayMentLists = await this.productPayMentListRepository
            .createQueryBuilder('payment')
            .where('payment.productSaleId = :productSaleId', {
              productSaleId: processCase.productSaleId,
            })
            .andWhere('payment.pricePay = 0')
            .orderBy('payment.payNo', 'ASC')
            .getOne();

          productPayMentLists.price =
            Number(priceEndCase) -
            Number(totalRemainingPrice.totalRemainingPrice);
          productPayMentLists.priceDebt = processCase.priceDebt;

          await this.productPayMentListRepository.save(productPayMentLists);
          await this.productPayMentListRepository.delete({
            productSaleId: processCase.productSaleId,
            id: MoreThan(productPayMentLists.id),
          });
        }
      } else if (processCase.caseType == 3 || processCase.caseType == 4) {
        const product = await this.productRepository.findOne({
          where: { id: productSale.productId },
        });

        if (product) {
          const branchDown = await this.branchRepository.findOneBy({
            isBranchDown: '1',
          });

          const savedProduct = { ...product };
          savedProduct.active = '1';
          savedProduct.priceCostBuy =
            processCase.useCostType == '2'
              ? processCase.priceNewCostBuy
              : product.priceCostBuy;
          savedProduct.amount = 1;
          savedProduct.branchId = branchDown.id;

          // สร้าง product log
          const productLogDto: CreateProductLogDto = {
            productId: productSale.productId,
            action:
              processCase.caseType == 3
                ? `คืนสัญญา: ${productSale.code}`
                : `ยึดสัญญา: ${productSale.code}`,
            obj: JSON.stringify({
              before: product,
              after: savedProduct,
            }),
            branchId: productSale.branchId,
            userId: processCase.createByUserId,
          };
          await this.productLogService.create(productLogDto);

          // อัปเดต productRepository
          await this.productRepository.update(
            { id: savedProduct.id },
            {
              active: savedProduct.active,
              priceCostBuy: savedProduct.priceCostBuy,
              amount: savedProduct.amount,
              branchId: savedProduct.branchId,
            },
          );
        }

        // อัปเดต productSaleRepository
        await this.productSaleRepository.update(
          { id: processCase.productSaleId },
          {
            isPaySuccess: processCase.caseType == 3 ? '5' : '6',
            priceTotalPaid:
              productSale.priceTotalPaid - processCase.priceReturnCustomer,
          },
        );

        // อัปเดต productPayMentListRepository
        await this.productPayMentListRepository.update(
          { productSaleId: productSale.id },
          { isCaseSuccess: '0' },
        );
      } else if (processCase.caseType == 5) {
        const oldProduct = await this.productRepository.findOne({
          where: { id: processCase.oldProductId },
        });

        const updateOldProduct = {
          ...oldProduct,
          active: '1',
          amount: 1,
          branchId: processCase.branchId,
        };

        await this.productRepository.update(
          {
            id: oldProduct.id,
          },
          {
            ...updateOldProduct,
          },
        );

        await this.saveLogClaim(
          'old',
          productSale.code,
          oldProduct.id,
          productSale.branchId,
          processCase.createByUserId,
          oldProduct,
          updateOldProduct,
        );

        const newProduct = await this.productRepository.findOne({
          where: { id: processCase.newProductId },
        });

        const updateNewProduct = {
          ...newProduct,
          active: '3',
          amount: 0,
          branchId: processCase.branchId,
        };

        await this.productRepository.update(
          {
            id: newProduct.id,
          },
          {
            ...updateNewProduct,
          },
        );

        await this.saveLogClaim(
          'new',
          productSale.code,
          newProduct.id,
          productSale.branchId,
          processCase.createByUserId,
          newProduct,
          updateNewProduct,
        );

        let newProductProfit =
          Number(oldProduct.priceWholeSale) - Number(newProduct.priceWholeSale);

        newProductProfit =
          Number(newProductProfit) - Number(productSale.priceRepair);

        productSale.priceProfit =
          Number(productSale.priceProfit) + Number(newProductProfit);
        productSale.priceSomeProfit =
          Number(productSale.priceSomeProfit) + Number(newProductProfit);

        await this.productSaleRepository.update(
          {
            id: processCase.productSaleId,
          },
          {
            ...productSale,
            productId: processCase.newProductId,
            priceRepair: 0,
          },
        );
      } else if (processCase.caseType == 6) {
        await this.productSaleRepository.update(
          { id: processCase.productSaleId },
          { isPaySuccess: '9' },
        );
        await this.productPayMentListRepository.update(
          { productSaleId: processCase.productSaleId },
          { isPaySuccess: '9' },
        );
      }

      const branch = await this.branchRepository.findOneBy({
        id: processCase.branchId,
      });

      const message = `ยืนยันการดำเนินการสัญญา: ${productSale.code}
      โดย: ${user.name}`;

      await this.telegramNotificationService.sendTelegramNotify({
        botToken: branch.token_bot,
        chatId: branch.room_id_processCases,
        message: message,
      });

      if (productSale.isMobileSale == '1') {
        const existingProduct = await this.productRepository.findOne({
          where: {
            id:
              processCase.caseType == 5
                ? processCase.oldProductId
                : productSale.productId,
          },
        });

        if (processCase.caseType == 3 || processCase.caseType == 4) {
          const { processManageFinance, ...res } = getProcessCase.productSale;

          if (productSale.processManageFinanceId !== null) {
            await this.productRepository.update(
              {
                id: res.productId,
              },
              {
                active: processCase.caseType == 3 ? '10' : '11',
                returnShopForm: `${processManageFinance.create_by?.username}`,
                returnCustomerForm: `${res.customer.name} ${res.customer.lastname}`,
                // branchId: res.branchId,
              },
            );
          } else {
            await this.productRepository.update(
              {
                id: res.productId,
              },
              {
                active: processCase.caseType == 3 ? '10' : '11',
                returnShopForm: `${res.create_by?.branch?.name}`,
                returnCustomerForm: `${res.customer.name} ${res.customer.lastname}`,
                // branchId: res.branchId,
              },
            );
          }
        }

        const shopAppID = productSale.shopAppID.trim();

        const manageAppleId = await this.manageAppleIdRepository.findOne({
          where: { appId: shopAppID },
        });

        if (!isEmpty(manageAppleId)) {
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

        const messageManageAppleId = `UnLock imei: ${existingProduct.imei}
        * appId: ${shopAppID}
        * pass: ${productSale.shopPass}
        * pin: ${productSale.shopPin}`;
        await this.telegramNotificationService.sendTelegramNotify({
          botToken: branch.token_bot,
          chatId: branch.room_id_unlockAppleId,
          message: messageManageAppleId,
        });

        if (processCase.caseType == 5) {
          const existingProduct = await this.productRepository.findOne({
            where: {
              id: processCase.newProductId,
            },
          });

          const messageManageAppleId = `Lock imei: ${existingProduct.imei}
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

      await this.processCaseRepository.save(processCase);

      return {
        message_success: `${MESSAGE_UPDATE_SUCCESS}`,
      };
    } else {
      await this.processCaseRepository.update(
        {
          id: getProcessCase.id,
        },
        { status: updateProcessDto.status },
      );
    }
  }

  async saveLogClaim(
    type: string,
    code: string,
    productId: number,
    branchId: number,
    userId: number,
    before: object,
    after: object,
  ): Promise<any> {
    const productLogDto: CreateProductLogDto = {
      productId: productId,
      action: `${type == 'old' ? 'คืน' : ''}เครมเครื่องสัญญา: ${code}`,
      obj: JSON.stringify({
        before: before,
        after: after,
      }),
      branchId: branchId,
      userId: userId,
    };

    await this.productLogService.create(productLogDto);
  }
}
