import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { ProductSalePayMentImageSearchDto } from 'src/helper/search.dto';
import { ProductPaymentImage } from './entities/product-payment-image.entity';
import { Product } from '../product/entities/product.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { CreateProductLogDto } from '../product-log/dto/create-product-log.dto';
import dayjs from 'src/configs/dayjs-config';
import { formatNumberDigit2 } from 'src/helper/formatNumber';
import {
  MESSAGE_DELETE_SUCCESS,
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { generateRandomString } from 'src/helper/generateRandomString';
import { TelegramNotificationService } from '../telegram-notification/telegram-notification.service';
import { Branch } from '../branchs/entities/branch.entity';
import { ManageAppleId } from '../manage-apple-id/entities/manage-apple-id.entity';
import * as _ from 'lodash';
import { ProductService } from '../product/product.service';

@Injectable()
export class ProductPaymentImagesService {
  constructor(
    @InjectRepository(ProductPaymentImage)
    private readonly productPaymentImageRepository: Repository<ProductPaymentImage>,

    @InjectRepository(ProductPayMentList)
    private readonly productPayMentListRepository: Repository<ProductPayMentList>,

    @InjectRepository(ProductSale)
    private readonly productSaleRepository: Repository<ProductSale>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    @InjectRepository(ManageAppleId)
    private readonly manageAppleIdRepository: Repository<ManageAppleId>,

    private readonly productLogService: ProductLogService,
    private readonly productService: ProductService,
    private readonly telegramNotificationService: TelegramNotificationService,
  ) {}

  private readonly uploadsPath = path.join('uploads/product-payment-lists');

  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    const files = await req.saveRequestFiles();
    const {
      productSaleId: { value: productSaleId },
      productSaleCode: { value: productSaleCode },
      bankId: { value: bankId } = { value: null },
      payType: { value: payType },
      price: { value: price },
      datePay: { value: datePay },
    } = req.body as any;

    const createPayMentImageDto = {
      productSaleId,
      price,
      datePay,
      createByUserId: user.id,
      bankId,
      branchId: user.branchId,
      payType,
    };

    if (process.env.SYSTEM_BY == 'THUNDER') {
      const branchDown = await this.branchRepository.findOneBy({
        isBranchDown: '1',
      });
      createPayMentImageDto.branchId = branchDown.id;
    }

    const productSale = await this.productSaleRepository.findOne({
      select: ['id', 'code', 'isCancel'],
      where: { id: productSaleId, code: productSaleCode },
    });

    if (!productSale) {
      return { message_error: `ไม่พบหมายเลขสัญญา ${productSaleCode} ในระบบ` };
    }

    if (productSale.isCancel == '1') {
      return { message_error: `สัญญาถูกยกเลิกไม่สามารถอัพโหลดหลักฐานชำระ` };
    }

    await this.processPayment(
      productSaleId,
      price,
      productSaleCode,
      files,
      createPayMentImageDto,
    );

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async processPayment(
    productSaleId: number,
    paymentAmount: number,
    productSaleCode: string,
    files: any,
    createPayMentImageDto: any,
  ): Promise<any> {
    const isThunder = process.env.SYSTEM_BY === 'THUNDER';
    // ตรวจสอบยอดที่ต้องชำระทั้งหมดก่อน
    const totalDueQuery = this.productPayMentListRepository
      .createQueryBuilder('payment')
      .where('payment.productSaleId = :productSaleId', { productSaleId })
      .andWhere('payment.isCaseSuccess = :caseStatus', { caseStatus: '1' });

    if (isThunder) {
      totalDueQuery.select(
        'SUM(payment.price + payment.priceDebt - payment.pricePay)',
        'totalRemaining',
      );
    } else {
      totalDueQuery.select(
        'SUM(payment.price - payment.pricePay)',
        'totalRemaining',
      );
    }
    const totalDue = await totalDueQuery.getRawOne();

    const totalRemaining = Number(totalDue.totalRemaining) || 0;

    // คำนวณส่วนเกิน (ถ้ามี)
    const overPayment =
      paymentAmount > totalRemaining ? paymentAmount - totalRemaining : 0;

    // ตั้งค่าเริ่มต้น
    createPayMentImageDto.originalAmount = paymentAmount; // บันทึกยอดที่จ่ายมาเต็มจำนวน
    let remainingPayment = paymentAmount; // ใช้ยอดที่จ่ายมาทั้งหมด

    const productSale = await this.productSaleRepository.findOne({
      where: { id: productSaleId, code: productSaleCode, isCancel: '0' },
    });

    productSale.priceSumPayInvoices = Number(
      productSale.priceSumPayInvoices || 0,
    );

    if (!productSale) {
      return { message_error: `ไม่พบข้อมูลสัญญา ${productSaleCode}` };
    }

    // ดึงรายการงวดทั้งหมดที่ยังไม่ชำระครบ
    const paymentsQuery = this.productPayMentListRepository
      .createQueryBuilder('payment')
      .where('payment.productSaleId = :productSaleId', { productSaleId })
      .andWhere('payment.isPaySuccess != :payStatus', { payStatus: '1' })
      .andWhere('payment.isCaseSuccess = :caseStatus', { caseStatus: '1' });

    if (isThunder) {
      paymentsQuery.andWhere(
        'payment.pricePay < payment.price + payment.priceDebt',
      );
    } else {
      paymentsQuery.andWhere('payment.pricePay < payment.price');
    }

    const payments = await paymentsQuery
      .orderBy('payment.payNo', 'ASC')
      .getMany();

    if (!payments || payments.length === 0) {
      return { message_error: 'ไม่พบงวดที่ต้องชำระ' };
    }

    // วนลูปผ่านงวดที่ต้องชำระ
    for (let i = 0; i < payments.length && remainingPayment > 0; i++) {
      const currentPayment = payments[i];
      const currentPrice = Number(currentPayment.price);
      const currentPricePay = Number(currentPayment.pricePay) || 0;
      const currentPriceDebt = Number(currentPayment.priceDebt) || 0;

      const totalInstallmentPrice = isThunder
        ? currentPrice + currentPriceDebt
        : currentPrice;
      const remainingCapacity = totalInstallmentPrice - currentPricePay;

      // ถ้าเป็นงวดสุดท้าย
      const isLastPayment = i === payments.length - 1;
      let paymentToApply;

      if (isLastPayment) {
        // งวดสุดท้าย: บันทึกยอดที่เหลือทั้งหมด
        paymentToApply = remainingPayment;
      } else {
        // งวดปกติ: ชำระตามยอดที่เหลือหรือยอดที่ต้องชำระ
        paymentToApply = Math.min(remainingPayment, remainingCapacity);
      }

      createPayMentImageDto.price = paymentToApply; // ตั้งค่า price สำหรับบันทึกภาพ

      const newPricePay = currentPricePay + paymentToApply;

      const isFullyPaid = newPricePay >= totalInstallmentPrice;

      // อัปเดตยอดชำระในงวด
      await this.productPayMentListRepository.update(
        { id: currentPayment.id },
        {
          pricePay: newPricePay,
          ...(isFullyPaid && { isPaySuccess: '1' }), // ตั้ง isPaySuccess ถ้าชำระครบหรือเกิน
        },
      );

      // อัปเดตยอดรวมใน productSale
      productSale.isPaySuccess = isFullyPaid ? '4' : productSale.isPaySuccess;

      productSale.priceProfit =
        Number(productSale.priceProfit || 0) + Number(paymentToApply);
      productSale.priceSumPayInvoices += Number(paymentToApply);
      await this.productSaleRepository.save(productSale);

      // บันทึก log การชำระเงิน
      const productLogDto: CreateProductLogDto = {
        productId: productSale.productId,
        action: `ชำระเงินงวด: ${paymentToApply} บ.`, // ระบุยอดเงินที่ชำระใน action
        obj: JSON.stringify({
          before: {
            productSaleCode: productSaleCode,
            payNo: currentPayment.payNo,
            amount: paymentToApply,
            totalRemaining: totalRemaining,
            paymentAmount: paymentAmount,
            catalog: 'มือถือ',
            overPayment: isLastPayment && overPayment > 0 ? overPayment : 0,
            userId: createPayMentImageDto.createByUserId,
            branchId: createPayMentImageDto.branchId,
          },
        }),
        branchId: createPayMentImageDto.branchId,
        userId: createPayMentImageDto.createByUserId,
      };
      await this.productLogService.create(productLogDto);

      // บันทึกภาพหลักฐานการชำระ
      await this.processSaveImage(
        currentPayment,
        files,
        productSaleCode,
        createPayMentImageDto,
      );

      remainingPayment -= paymentToApply;
    }

    // ตรวจสอบการชำระครบ
    const totalDueCheck = await this.productPayMentListRepository
      .createQueryBuilder('payment')
      .where('payment.productSaleId = :productSaleId', { productSaleId })
      .andWhere('payment.isCaseSuccess = :caseStatus', { caseStatus: '1' })
      .select('SUM(payment.price)', 'totalPrice')
      .addSelect('SUM(payment.pricePay)', 'totalPricePay')
      .getRawOne();

    const totalPrice = Number(totalDueCheck.totalPrice) || 0;
    const totalPricePay = Number(totalDueCheck.totalPricePay) || 0;

    if (totalPrice > 0 && totalPricePay >= totalPrice) {
      const product = await this.productRepository.findOne({
        where: { id: productSale.productId },
      });

      const updateProductDto: Product = {
        ...product,
        active: '4',
        note: `จบสัญญา: ${productSale.code}`,
      };

      const productLogDto: CreateProductLogDto = {
        productId: product.id,
        action: 'จบสัญญา',
        obj: JSON.stringify({
          before: product,
          after: updateProductDto,
        }),
        branchId: product.branchId,
        userId: createPayMentImageDto.createByUserId,
      };
      await this.productLogService.create(productLogDto);

      await this.productRepository.update(
        productSale.productId,
        updateProductDto,
      );
      await this.productSaleRepository.update(
        { id: productSaleId },
        { isPaySuccess: '7' },
      );
      const branch = await this.branchRepository.findOneBy({
        id: productSale.branchId,
      });

      const messageManageAppleId = `UnLock สัญญา: ${updateProductDto.code}
                * imei: ${updateProductDto.imei}
                * appId: ${productSale.shopAppID}
                * pass: ${productSale.shopPass}
                * pin: ${productSale.shopPin}`;
      await this.telegramNotificationService.sendTelegramNotify({
        botToken: branch.token_bot,
        chatId: branch.room_id_unlockAppleId,
        message: messageManageAppleId,
      });

      const manageAppleId = await this.manageAppleIdRepository.findOne({
        where: { appId: productSale.shopAppID },
      });

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
    }
  }

  async processSaveImage(
    currentPayment: any,
    files: any,
    productSaleCode: any,
    createPayMentImageDto: any,
  ) {
    const countPayMent = await this.productPaymentImageRepository.count({
      where: {
        productPayMentListId: currentPayment.id,
      },
    });

    let filePath = '';
    let filePayMent = '';
    if (files.length > 0) {
      await fs.ensureDir(`${this.uploadsPath}/${productSaleCode}`);
      const file = files[0];
      const buffer = await fs.readFile(file.filepath);
      const randomName = generateRandomString(6);
      const filename = `${randomName}-${currentPayment.payNo}-${countPayMent + 1}.png`;
      filePath = path.join(this.uploadsPath, productSaleCode, filename);
      filePayMent = filePath;
      await sharp(buffer)
        .png({ quality: 80, progressive: true })
        .toFile(filePath);
    }

    createPayMentImageDto.payNo = currentPayment.payNo;
    createPayMentImageDto.productPayMentListId = currentPayment.id;
    createPayMentImageDto.filePayMent = filePayMent;
    const newPayMentImage = this.productPaymentImageRepository.create(
      createPayMentImageDto,
    );
    return await this.productPaymentImageRepository.save(newPayMentImage);
  }

  async findAll(searchProductDto: ProductSalePayMentImageSearchDto): Promise<{
    data: ProductPaymentImage[]; // เปลี่ยน type เป็น ProductPaymentImage
    total: number;
    page: number;
    pageSize: number;
  }> {
    // ค้นหา productSale ตาม code
    const productSale = await this.productSaleRepository.findOne({
      select: ['id'],
      where: { code: searchProductDto.search, isCancel: '0' },
    });

    // ถ้าไม่มี productSale
    if (!productSale) {
      return {
        data: [],
        total: 0,
        page: searchProductDto.page || 1,
        pageSize: searchProductDto.pageSize || 10,
      };
    }

    // ใช้ productPaymentImageRepository แทน
    const queryBuilder = this.productPaymentImageRepository
      .createQueryBuilder('product_payment_image')
      .select([
        'product_payment_image',
        'create_by.id',
        'create_by.name',
        'bank.bankOwner',
        'bank.bankName',
        'bank.bankNo',
      ])
      .where('product_payment_image.productSaleId = :id', {
        id: productSale.id,
      })
      .leftJoin('product_payment_image.bank', 'bank')
      .leftJoin('product_payment_image.create_by', 'create_by')
      .orderBy('product_payment_image.payNo', 'DESC')
      .skip((searchProductDto.page - 1) * searchProductDto.pageSize)
      .take(searchProductDto.pageSize);

    // ดึงข้อมูลและนับจำนวน
    const productPaymentImages = await queryBuilder.getMany();
    const total = await queryBuilder.getCount();

    return {
      data: productPaymentImages,
      total,
      page: searchProductDto.page,
      pageSize: searchProductDto.pageSize,
    };
  }

  async findOne(id: number): Promise<any> {
    return await this.productPaymentImageRepository.findOneBy({ id });
  }

  async delete(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    // ดึงข้อมูล ProductPaymentImage
    const paymentImage = await this.productPaymentImageRepository.findOne({
      where: { id },
      relations: ['productSale'],
    });

    if (!paymentImage) {
      return { message_error: `ไม่พบรายการชำระเงิน ID ${id}` };
    }

    const permissions = await this.productService.fetchPermission(user);

    if (!permissions.includes('edit-image-payment')) {
      const createDate = dayjs(paymentImage.create_date);
      const threeDaysAgo = dayjs().subtract(3, 'day');
      if (createDate.isBefore(threeDaysAgo, 'day')) {
        return { message_error: `ไม่สามารถลบ สลิปเลย 3 วัน` };
      }
    }

    const productSale = await this.productSaleRepository.findOne({
      where: { id: paymentImage.productSaleId },
    });

    if (!productSale) {
      return { message_error: `ไม่พบสัญญา ID ${paymentImage.productSaleId}` };
    }

    // ดึง ProductPayMentList ที่เกี่ยวข้อง
    const paymentList = await this.productPayMentListRepository.findOne({
      where: { id: paymentImage.productPayMentListId },
    });

    if (!paymentList) {
      return {
        message_error: `ไม่พบงวดชำระ ID ${paymentImage.productPayMentListId}`,
      };
    }

    // ตรวจสอบว่ามีการชำระงวดถัดไปหรือไม่
    const laterPayments = await this.productPaymentImageRepository.findOne({
      where: {
        productSaleId: paymentImage.productSaleId,
        payNo: MoreThan(paymentImage.payNo),
      },
    });

    if (laterPayments) {
      return {
        message_error: `ต้องลบการชำระงวดถัดไป (งวด ${laterPayments.payNo} หรือสูงกว่า) ก่อน`,
      };
    }

    // คำนวณยอดที่ต้องชำระทั้งหมดก่อนลบ (เพื่อใช้ใน log)
    const totalDue = await this.productPayMentListRepository
      .createQueryBuilder('payment')
      .where('payment.productSaleId = :productSaleId', {
        productSaleId: paymentImage.productSaleId,
      })
      .andWhere('payment.isCaseSuccess = :caseStatus', { caseStatus: '1' })
      .select('SUM(payment.price - payment.pricePay)', 'totalRemaining')
      .getRawOne();

    const totalRemaining = Number(totalDue.totalRemaining) || 0;
    const paymentImagePrice = Number(paymentImage.price) || 0;

    // ตรวจสอบ datePay เพื่อกำหนด isPaySuccess
    let isPaySuccess = '4'; // ค่าเริ่มต้น: ยังไม่ถึงเวลาจ่ายค่างวด
    if (paymentImage.datePay) {
      const datePay = dayjs(paymentList.datePay);
      const today = dayjs();
      if (datePay.isSame(today, 'day')) {
        isPaySuccess = '2'; // ถึงเวลาชำระ
      } else if (datePay.isBefore(today, 'day')) {
        isPaySuccess = '3'; // มียอดค้างชำระ
      } else if (datePay.isAfter(today, 'day')) {
        isPaySuccess = '4'; // ยังไม่ถึงเวลาจ่ายค่างวด
      }
    }

    // ลบไฟล์ภาพและจัดการโฟลเดอร์ (ใช้แนวคิดจาก processSaveImage)
    if (paymentImage.filePayMent) {
      try {
        // ตรวจสอบว่าไฟล์มีอยู่จริง
        const fileExists = await fs.pathExists(paymentImage.filePayMent);
        if (fileExists) {
          await fs.remove(paymentImage.filePayMent);
        }

        // ตรวจสอบโฟลเดอร์ productSaleCode
        const productSaleCode = productSale.code;
        const folderPath = path.join(this.uploadsPath, productSaleCode);
        const folderExists = await fs.pathExists(folderPath);
        if (folderExists) {
          // ตรวจสอบว่าโฟลเดอร์ว่างหรือไม่
          const files = await fs.readdir(folderPath);
          if (files.length === 0) {
            await fs.remove(folderPath); // ลบโฟลเดอร์ถ้าว่าง
          }
        }
      } catch (error) {}
    }

    // คืนยอดใน ProductPayMentList
    const currentPricePay = Number(paymentList.pricePay) || 0;
    const newPricePay = Math.max(0, currentPricePay - paymentImagePrice);

    await this.productPayMentListRepository.update(
      { id: paymentList.id },
      {
        pricePay: newPricePay,
        isPaySuccess: isPaySuccess,
      },
    );

    // คืนยอดใน ProductSale
    productSale.priceSumPayInvoices =
      Number(productSale.priceSumPayInvoices || 0) - paymentImagePrice;
    productSale.priceProfit =
      Number(productSale.priceProfit || 0) - paymentImagePrice;
    productSale.isPaySuccess = isPaySuccess;
    await this.productSaleRepository.save(productSale);

    // บันทึก log การลบ ProductPaymentImage
    const productLogDto: CreateProductLogDto = {
      productId: productSale.productId,
      action: `ลบการชำระเงิน: ${formatNumberDigit2(paymentImagePrice)} บ.`, // ระบุยอดเงินที่ถูกลบ
      obj: JSON.stringify({
        before: {
          paymentImageId: id,
          productSaleCode: productSale.code,
          productSaleId: paymentImage.productSaleId,
          productPayMentListId: paymentImage.productPayMentListId,
          payNo: paymentImage.payNo,
          amount: paymentImagePrice,
          totalRemaining: totalRemaining,
          catalog: 'มือถือ',
          isPaySuccess: isPaySuccess,
          userId: user.id,
          branchId: user.branchId,
        },
      }),
      branchId: user.branchId,
      userId: user.id,
    };
    await this.productLogService.create(productLogDto);

    // ลบ ProductPaymentImage
    await this.productPaymentImageRepository.delete(id);

    if (
      Number(productSale.priceSumInvoices) >
      Number(productSale.priceSumPayInvoices)
    ) {
      const product = await this.productRepository.findOne({
        where: { id: productSale.productId, active: '4' },
      });

      if (product) {
        const updateProductDto: Product = {
          ...product,
          active: '3',
        };

        await this.productRepository.update(
          productSale.productId,
          updateProductDto,
        );
      }
    }

    return {
      message_success: `${MESSAGE_DELETE_SUCCESS}`,
    };
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    const {
      bankId: { value: bankId } = { value: null },
      payType: { value: payType },
      price: { value: price },
      datePay: { value: datePay },
    } = req.body as any;

    const updatePayMentImageDto = {
      price,
      datePay,
      createByUserId: user.id,
      bankId,
      payType,
    };

    await this.productPaymentImageRepository.update(id, updatePayMentImageDto);

    return {
      message_success: `${MESSAGE_UPDATE_SUCCESS}`,
    };
  }
}
