import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { ProductSalePayMentImageSearchDto } from 'src/helper/search.dto';
import { ProductSavingPayMentImage } from './entities/product-saving-pay-ment-image.entity';
import { Product } from '../product/entities/product.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { CreateProductLogDto } from '../product-log/dto/create-product-log.dto';
import dayjs from 'src/configs/dayjs-config';
import { formatNumberDigit2 } from 'src/helper/formatNumber';
import {
  MESSAGE_DELETE_SUCCESS,
  MESSAGE_SAVE_SUCCESS,
} from 'src/helper/constanc';
import { generateRandomString } from 'src/helper/generateRandomString';
import { ProductSaving } from '../product-saving/entities/product-saving.entity';

@Injectable()
export class ProductSavingPayMentImageService {
  constructor(
    @InjectRepository(ProductSavingPayMentImage)
    private readonly productSavingPayMentImageRepository: Repository<ProductSavingPayMentImage>,
    @InjectRepository(ProductSaving)
    private readonly productSavingRepository: Repository<ProductSaving>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productLogService: ProductLogService,
  ) {}

  private readonly uploadsPath = path.join(
    'uploads/product-saving-payment-lists',
  );

  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    const files = await req.saveRequestFiles();
    const {
      productSavingId: { value: productSavingId },
      productSavingCode: { value: productSavingCode },
      bankId: { value: bankId } = { value: null },
      payType: { value: payType },
      price: { value: price } = { value: 0 },
      datePay: { value: create_date },
    } = req.body as any;

    const createPaySavingMentImageDto = {
      productSavingId,
      price,
      create_date,
      createByUserId: user.id,
      bankId,
      branchId: user.branchId,
      payType,
      fileSavingPayMent: '',
    };

    const productSaving = await this.productSavingRepository.findOne({
      select: ['id', 'code', 'isCancel', 'priceSumPay'],
      where: { id: productSavingId, code: productSavingCode },
    });

    if (!productSaving) {
      return { message_error: `ไม่พบหมายเลขสัญญา ${productSavingCode} ในระบบ` };
    }

    if (productSaving.isCancel == '1') {
      return { message_error: `สัญญาถูกยกเลิกไม่สามารถอัพโหลดหลักฐานชำระ` };
    }

    let filePath = '';
    if (files.length > 0) {
      await fs.ensureDir(`${this.uploadsPath}/${productSavingCode}`);
      const file = files[0];
      const buffer = await fs.readFile(file.filepath);
      const randomName = generateRandomString(6);
      const filename = `${randomName}.png`;
      filePath = path.join(this.uploadsPath, productSavingCode, filename);
      createPaySavingMentImageDto.fileSavingPayMent = filePath;
      await sharp(buffer).png({ quality: 80, progressive: true  }).toFile(filePath);
    }

    await this.productSavingPayMentImageRepository.save(
      createPaySavingMentImageDto,
    );

    const priceSumPay =
      Number(productSaving.priceSumPay) +
      Number(createPaySavingMentImageDto.price);

    await this.productSavingRepository.update(
      {
        id: productSaving.id,
      },
      {
        priceSumPay: priceSumPay,
      },
    );

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}`,
    };
  }

  async findAll(searchProductDto: ProductSalePayMentImageSearchDto): Promise<{
    data: ProductSavingPayMentImage[]; // เปลี่ยน type เป็น ProductSavingPayMentImage
    total: number;
    page: number;
    pageSize: number;
  }> {
    // ค้นหา productSaving ตาม code
    const productSaving = await this.productSavingRepository.findOne({
      select: ['id'],
      where: { code: searchProductDto.search },
    });

    // ถ้าไม่มี productSaving
    if (!productSaving) {
      return {
        data: [],
        total: 0,
        page: searchProductDto.page || 1,
        pageSize: searchProductDto.pageSize || 10,
      };
    }

    // ใช้ productSavingPayMentImageRepository แทน
    const queryBuilder = this.productSavingPayMentImageRepository
      .createQueryBuilder('product_saving_pay_ment_image')
      .select([
        'product_saving_pay_ment_image',
        'create_by.id',
        'create_by.name',
      ])
      .where('product_saving_pay_ment_image.productSavingId = :id', {
        id: productSaving.id,
      })
      .leftJoin('product_saving_pay_ment_image.create_by', 'create_by')
      .orderBy('product_saving_pay_ment_image.create_date', 'DESC')
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

  async delete(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    // // ดึงข้อมูล ProductSavingPayMentImage
    // const paymentImage = await this.productSavingPayMentImageRepository.findOne({
    //   where: { id },
    //   relations: ['productSaving'],
    // });

    // if (!paymentImage) {
    //   return { message_error: `ไม่พบรายการชำระเงิน ID ${id}` };
    // }

    // const createDate = dayjs(paymentImage.create_date);
    // const threeDaysAgo = dayjs().subtract(3, 'day');
    // if (createDate.isBefore(threeDaysAgo, 'day')) {
    //   return { message_error: `ไม่สามารถลบ สลิปเลย 3 วัน` };
    // }

    // const productSaving = await this.productSavingRepository.findOne({
    //   where: { id: paymentImage.productSavingId },
    // });

    // if (!productSaving) {
    //   return { message_error: `ไม่พบสัญญา ID ${paymentImage.productSavingId}` };
    // }

    // // ดึง ProductPayMentList ที่เกี่ยวข้อง
    // const paymentList = await this.productPayMentListRepository.findOne({
    //   where: { id: paymentImage.productPayMentListId },
    // });

    // if (!paymentList) {
    //   return {
    //     message_error: `ไม่พบงวดชำระ ID ${paymentImage.productPayMentListId}`,
    //   };
    // }

    // // ตรวจสอบว่ามีการชำระงวดถัดไปหรือไม่
    // const laterPayments = await this.productSavingPayMentImageRepository.findOne({
    //   where: {
    //     productSavingId: paymentImage.productSavingId,
    //     payNo: MoreThan(paymentImage.payNo),
    //   },
    // });

    // if (laterPayments) {
    //   return {
    //     message_error: `ต้องลบการชำระงวดถัดไป (งวด ${laterPayments.payNo} หรือสูงกว่า) ก่อน`,
    //   };
    // }

    // // คำนวณยอดที่ต้องชำระทั้งหมดก่อนลบ (เพื่อใช้ใน log)
    // const totalDue = await this.productPayMentListRepository
    //   .createQueryBuilder('payment')
    //   .where('payment.productSavingId = :productSavingId', {
    //     productSavingId: paymentImage.productSavingId,
    //   })
    //   .andWhere('payment.isCaseSuccess = :caseStatus', { caseStatus: '1' })
    //   .select('SUM(payment.price - payment.pricePay)', 'totalRemaining')
    //   .getRawOne();

    // const totalRemaining = Number(totalDue.totalRemaining) || 0;
    // const paymentImagePrice = Number(paymentImage.price) || 0;

    // // ตรวจสอบ datePay เพื่อกำหนด isPaySuccess
    // let isPaySuccess = '4'; // ค่าเริ่มต้น: ยังไม่ถึงเวลาจ่ายค่างวด
    // if (paymentImage.datePay) {
    //   const datePay = dayjs(paymentList.datePay);
    //   const today = dayjs();
    //   if (datePay.isSame(today, 'day')) {
    //     isPaySuccess = '2'; // ถึงเวลาชำระ
    //   } else if (datePay.isBefore(today, 'day')) {
    //     isPaySuccess = '3'; // มียอดค้างชำระ
    //   } else if (datePay.isAfter(today, 'day')) {
    //     isPaySuccess = '4'; // ยังไม่ถึงเวลาจ่ายค่างวด
    //   }
    // }

    // // ลบไฟล์ภาพและจัดการโฟลเดอร์ (ใช้แนวคิดจาก processSaveImage)
    // if (paymentImage.fileSavingPayMent) {
    //   try {
    //     // ตรวจสอบว่าไฟล์มีอยู่จริง
    //     const fileExists = await fs.pathExists(paymentImage.fileSavingPayMent);
    //     if (fileExists) {
    //       await fs.remove(paymentImage.fileSavingPayMent);
    //     }

    //     // ตรวจสอบโฟลเดอร์ productSaleCode
    //     const productSaleCode = productSaving.code;
    //     const folderPath = path.join(this.uploadsPath, productSaleCode);
    //     const folderExists = await fs.pathExists(folderPath);
    //     if (folderExists) {
    //       // ตรวจสอบว่าโฟลเดอร์ว่างหรือไม่
    //       const files = await fs.readdir(folderPath);
    //       if (files.length === 0) {
    //         await fs.remove(folderPath); // ลบโฟลเดอร์ถ้าว่าง
    //       }
    //     }
    //   } catch (error) {}
    // }

    // // คืนยอดใน ProductPayMentList
    // const currentPricePay = Number(paymentList.pricePay) || 0;
    // const newPricePay = Math.max(0, currentPricePay - paymentImagePrice);

    // await this.productPayMentListRepository.update(
    //   { id: paymentList.id },
    //   {
    //     pricePay: newPricePay,
    //     isPaySuccess: isPaySuccess,
    //   },
    // );

    // // คืนยอดใน ProductSale
    // productSaving.priceSumPayInvoices =
    //   Number(productSaving.priceSumPayInvoices || 0) - paymentImagePrice;
    // productSaving.priceProfit =
    //   Number(productSaving.priceProfit || 0) - paymentImagePrice;
    // productSaving.isPaySuccess = isPaySuccess;
    // await this.productSavingRepository.save(productSaving);

    // // บันทึก log การลบ ProductSavingPayMentImage
    // const productLogDto: CreateProductLogDto = {
    //   productId: productSaving.productId,
    //   action: `ลบการชำระเงิน: ${formatNumberDigit2(paymentImagePrice)} บ.`, // ระบุยอดเงินที่ถูกลบ
    //   obj: JSON.stringify({
    //     before: {
    //       paymentImageId: id,
    //       productSaleCode: productSaving.code,
    //       productSavingId: paymentImage.productSavingId,
    //       productPayMentListId: paymentImage.productPayMentListId,
    //       payNo: paymentImage.payNo,
    //       amount: paymentImagePrice,
    //       totalRemaining: totalRemaining,
    //       catalog: 'มือถือ',
    //       isPaySuccess: isPaySuccess,
    //       userId: user.id,
    //       branchId: user.branchId,
    //     },
    //   }),
    //   branchId: user.branchId,
    //   userId: user.id,
    // };
    // await this.productLogService.create(productLogDto);

    // // ลบ ProductSavingPayMentImage
    // await this.productSavingPayMentImageRepository.delete(id);

    // if (
    //   Number(productSaving.priceSumInvoices) >
    //   Number(productSaving.priceSumPayInvoices)
    // ) {
    //   const product = await this.productRepository.findOne({
    //     where: { id: productSaving.productId, active: '4' },
    //   });

    //   if (product) {
    //     const updateProductDto: Product = {
    //       ...product,
    //       active: '3',
    //     };

    //     await this.productRepository.update(
    //       productSaving.productId,
    //       updateProductDto,
    //     );
    //   }
    // }

    // return {
    //   message_success: `${MESSAGE_DELETE_SUCCESS}`,
    // };
  }
}
