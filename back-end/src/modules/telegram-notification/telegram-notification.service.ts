import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { NotificationDto } from 'src/helper/search.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../branchs/entities/branch.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { Product } from '../product/entities/product.entity';
import dayjs from 'src/configs/dayjs-config';
import { formatNumberDigit } from 'src/helper/formatNumber';
import { buildSaleMessage } from 'src/helper/buildSaleMessage';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { formatDateNumberWithoutTime } from 'src/helper/formatDate';
import { ProductPaymentImage } from '../product-payment-images/entities/product-payment-image.entity';

@Injectable()
export class TelegramNotificationService {
  private readonly logger = new Logger(TelegramNotificationService.name);

  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,

    @InjectRepository(ProductSale)
    private readonly productSaleRepository: Repository<ProductSale>,

    @InjectRepository(ProductPayMentList)
    private readonly productPayMentListRepository: Repository<ProductPayMentList>,

    @InjectRepository(ProductPaymentImage)
    private readonly productPaymentImageRepository: Repository<ProductPaymentImage>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly httpService: HttpService,
  ) {}

  private splitMessage(message: string, maxLength = 4096): string[] {
    const parts: string[] = [];

    while (message.length > 0) {
      let part = message.slice(0, maxLength);

      // ตัดตรงบรรทัดสุดท้าย เพื่อไม่ให้ตัดกลางข้อความ
      const lastNewLine = part.lastIndexOf('\n');
      if (lastNewLine > 0 && message.length > maxLength) {
        part = message.slice(0, lastNewLine + 1);
      }

      parts.push(part);
      message = message.slice(part.length);
    }

    return parts;
  }

  async sendTelegramNotify(
    notification: NotificationDto,
  ): Promise<{ success: boolean; error?: string }> {
    const { botToken, chatId, message } = notification;

    if (!botToken || !message) {
      const errorMsg = 'Missing botToken or message';
      this.logger.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    const chatIds = Array.isArray(chatId) ? chatId : [chatId];

    for (const id of chatIds) {
      if (!id) {
        this.logger.warn(`Skipping empty chatId`);
        continue;
      }

      // Retry สูงสุด 3 ครั้ง
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
          const data = { chat_id: id, text: message };

          const response = await this.httpService
            .post(url, data, {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false,
              }),
            })
            .toPromise();

          const result = response?.data;
          if (!result?.ok) {
            const errorMsg = `Telegram API error: ${result.description}`;
            this.logger.error(
              `Attempt ${attempt} failed for chat ${id}: ${errorMsg}`,
            );
            if (result.description.includes('429')) {
              // รอ 2 วินาทีถ้าเจอ 429 Too Many Requests
              await new Promise((resolve) => setTimeout(resolve, 2000));
              continue;
            }
            return { success: false, error: errorMsg };
          }

          // this.logger.log(`Successfully sent message to chat ${id}`);
          return { success: true };
        } catch (error) {
          const errorMsg = `Attempt ${attempt} failed for chat ${id}: ${error.message}`;
          this.logger.error(errorMsg);
          if (attempt < 3) {
            // รอ 2 วินาทีก่อนลองใหม่
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } else {
            return { success: false, error: errorMsg };
          }
        }
      }
    }

    // ถ้าไม่มี chatId ที่ถูกต้อง
    const errorMsg = 'No valid chatIds provided';
    this.logger.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  async fetchProductDaylily(): Promise<any> {
    const branches = await this.branchRepository.find({
      order: { id: 'ASC' },
    });

    for (const branch of branches) {
      const { token_bot, room_id_daylily_mobile, id, name } = branch;

      if (token_bot && room_id_daylily_mobile) {
        // Query สำหรับมือหนึ่งและมือสอง
        const products = await this.productRepository
          .createQueryBuilder('product')
          .select([
            'product.productStorageId AS productStorageId',
            'product_storage.name AS "productStorageName"',
            'product.productModelId AS productModelId',
            'product_model.name AS "productModelName"', // แปลงเป็นตัวพิมพ์เล็ก
            'product.hand AS hand',
            'COUNT(*) AS count',
          ])
          .leftJoin('product.productModel', 'product_model')
          .leftJoin('product.productStorage', 'product_storage')
          .where('product.branchId = :branchId', { branchId: id })
          .andWhere('product.active = :active', { active: '1' })
          .andWhere('product.catalog = :catalog', { catalog: 'มือถือ' })
          .groupBy('product.productModelId')
          .addGroupBy('product.productStorageId')
          .addGroupBy('product_model.name')
          .addGroupBy('product_storage.name')
          .addGroupBy('product.hand')
          .orderBy('product_model.name', 'ASC')
          .getRawMany();

        // แยกข้อมูลตามมือ
        const handOneProducts = products.filter((p) => p.hand === 'มือหนึ่ง');
        const handTwoProducts = products.filter((p) => p.hand === 'มือสอง');

        // สร้างข้อความสำหรับมือหนึ่ง
        let message_products = `สินค้าคงคลัง สาขา: ${name}\n------------------------------\n`;
        message_products += `มือหนึ่ง\n------------------------------\n`;

        for (const product of handOneProducts) {
          message_products += `รุ่น: ${product.productModelName}\nความจุ: ${product.productStorageName} | จำนวน: ${formatNumberDigit(product.count)}\n------------------------------\n`;
        }

        const countHandOne = handOneProducts.reduce(
          (sum, p) => sum + Number(p.count || 0),
          0,
        );
        message_products += `รวมมือหนึ่ง: ${formatNumberDigit(countHandOne)}\n------------------------------\n`;

        // สร้างข้อความสำหรับมือสอง
        message_products += `มือสอง\n------------------------------\n`;

        for (const product of handTwoProducts) {
          message_products += `รุ่น: ${product.productModelName}\nความจุ: ${product.productStorageName} | จำนวน: ${formatNumberDigit(product.count)}\n------------------------------\n`;
        }

        const countHandTwo = handTwoProducts.reduce(
          (sum, p) => sum + Number(p.count || 0),
          0,
        );
        message_products += `รวมมือสอง: ${formatNumberDigit(countHandTwo)}\n------------------------------\n`;

        const totalCount = countHandOne + countHandTwo;
        message_products += `รวมสินค้าคงคลังทั้งหมด: ${formatNumberDigit(totalCount)}\n------------------------------\n`;

        // แบ่งข้อความก่อนส่ง
        const messageParts = this.splitMessage(message_products);

        for (const part of messageParts) {
          await this.sendTelegramNotify({
            botToken: token_bot,
            chatId: room_id_daylily_mobile,
            message: part,
          });

          // ใส่ delay 500ms ป้องกัน spam
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    }
  }

  async fetchProductAccessibilityDaylily(): Promise<any> {
    const branches = await this.branchRepository.find({
      order: { id: 'ASC' },
    });

    for (const branch of branches) {
      const { token_bot, room_id_daylily_accessibility, id, name } = branch;

      if (token_bot && room_id_daylily_accessibility) {
        const products = await this.productRepository
          .createQueryBuilder('product')
          .select([
            'product.productModelId AS productModelId',
            'product_model.name AS "productModelName"',
            'SUM(product.amount) AS "amount"',
          ])
          .leftJoin('product.productModel', 'product_model')
          .leftJoin('product.productStorage', 'product_storage')
          .where('product.branchId = :branchId', { branchId: id })
          .andWhere('product.active = :active', { active: '1' })
          .andWhere('product.catalog = :catalog', { catalog: 'อุปกรณ์เสริม' })
          .groupBy('product.productModelId')
          .addGroupBy('product.productStorageId')
          .addGroupBy('product_model.name')
          .addGroupBy('product_storage.name')
          .orderBy('product_model.name', 'ASC')
          .getRawMany();

        let message_products = `อุปกรณ์เสริมคงคลัง สาขา: ${name}\n------------------------------\n`;

        for (const product of products) {
          message_products += `รุ่น: ${product.productModelName}\nจำนวน: ${product.amount}\n------------------------------\n`;
        }

        // แบ่งข้อความก่อนส่ง
        const messageParts = this.splitMessage(message_products);
        for (const part of messageParts) {
          await this.sendTelegramNotify({
            botToken: token_bot,
            chatId: room_id_daylily_accessibility,
            message: part,
          });

          // ใส่ delay 500ms ป้องกัน spam
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }
  }

  async fetchProductSaleDaylily(isMobileSale: '1' | '0'): Promise<any> {
    const startDate = dayjs().subtract(1, 'day').startOf('day').toDate();
    const endDate = dayjs().subtract(1, 'day').endOf('day').toDate();

    const branches = await this.branchRepository.find({
      order: { id: 'ASC' },
    });

    for (const branch of branches) {
      const {
        token_bot,
        room_id_sale_daylily_mobile,
        room_id_sale_daylily_accessibility,
        id,
        name,
      } = branch;

      const chatId =
        isMobileSale === '1'
          ? room_id_sale_daylily_mobile
          : room_id_sale_daylily_accessibility;

      if (token_bot && chatId) {
        // Query ยอดขาย
        const productSales = await this.productSaleRepository
          .createQueryBuilder('product_sale')
          .select([
            'product_sale."isCancel" AS "isCancel"',
            'product_sale."payType" AS "payType"',
            'bank.bankNo AS "bankNo"',
            'bank.bankOwner AS "bankOwner"',
            'bank.bankName AS "bankName"',
            'SUM(product_sale."priceCash") AS "sumCash"',
            'SUM(product_sale."priceTransferCash") AS "sumTransfer"',
            'COUNT(*) AS "count"',
          ])
          .where('product_sale.create_date BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
          })
          .andWhere('product_sale."branchId" = :branchId', { branchId: id })
          .andWhere('product_sale."isMobileSale" = :isMobileSale', {
            isMobileSale,
          })
          .leftJoin('product_sale.bank', 'bank')
          .groupBy('product_sale."isCancel"')
          .addGroupBy('product_sale."payType"')
          .addGroupBy('product_sale.bankId')
          .addGroupBy('bank.bankNo')
          .addGroupBy('bank.bankOwner')
          .addGroupBy('bank.bankName')
          .getRawMany();

        // คำนวณยอดรวม
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
            (sum, p) =>
              sum + Number(p.sumCash || 0) + Number(p.sumTransfer || 0),
            0,
          );

        // สร้างข้อความสรุปยอดขาย
        const typeLabel = isMobileSale === '1' ? '(มือถือ)' : '(อุปกรณ์)';
        const message = await buildSaleMessage({
          branchName: name,
          date: startDate,
          typeLabel,
          productSales,
          totalCount,
          contractCount,
          contractTotalPaid,
        });

        // แบ่งข้อความก่อนส่ง
        const messageParts = this.splitMessage(message);
        for (const part of messageParts) {
          await this.sendTelegramNotify({
            botToken: token_bot,
            chatId: chatId,
            message: part,
          });

          // ใส่ delay 500ms ป้องกัน spam
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }
  }

  async fetchProductPayMent(): Promise<any> {
    const startDate = dayjs().subtract(2, 'day').format('YYYY-MM-DD');
    const branches = await this.branchRepository.find({ order: { id: 'ASC' } });

    // mapping ชื่อสถานะ, ลำดับการแสดง, และ payType
    const statusTranslations: Record<string, string> = {
      FAIL_PAIR: 'ยังไม่ชำระ',
      FULL_PAIR: 'ชำระครบ (ไม่มีค่าปรับ)',
      FULL_WITH_PENALTY: 'ชำระครบ (มีค่าปรับ)',
      NOT_FULL_PAIR: 'ชำระไม่ครบ (ไม่มีค่าปรับ)',
      PARTIAL_PENALTY_INCOMPLETE: 'ชำระไม่ครบ (ค่าปรับไม่ครบ)',
      ERROR: 'ข้อมูลผิดพลาด',
    };

    const STATUS_ORDER: Record<string, number> = {
      FULL_PAIR: 1,
      FULL_WITH_PENALTY: 2,
      NOT_FULL_PAIR: 3,
      PARTIAL_PENALTY_INCOMPLETE: 4,
      FAIL_PAIR: 5,
      ERROR: 6,
    };

    const statusPayType: Record<string | number, string> = {
      1: 'เงินสด',
      2: 'เงินโอน',
    };

    const EPS = 0.01;

    for (const branch of branches) {
      const { id, name, token_bot, room_id_paymentDown } = branch;

      if (!token_bot || !room_id_paymentDown) continue;

      let message = `ค่าบริการดูแลรายเดือน สาขา: ${name}\n`;
      message += `ประจำวันที่ ${formatDateNumberWithoutTime(startDate)} \n------------------------------\n`;

      // ---------------------------
      // 1) Query สรุปสถานะการชำระ (มีค่าปรับ)
      // ---------------------------
      const productPayMentLists = await this.productPayMentListRepository
        .createQueryBuilder('ppl')
        .select([
          `CASE
           WHEN COALESCE(ppl.pricePay,0) <= :eps
             THEN 'FAIL_PAIR'

           WHEN COALESCE(ppl.priceDebt,0) <= :eps
                AND COALESCE(ppl.pricePay,0) >= ppl.price - :eps
             THEN 'FULL_PAIR'

           WHEN COALESCE(ppl.priceDebt,0) > :eps
                AND COALESCE(ppl.pricePay,0) >= (ppl.price + COALESCE(ppl.priceDebt,0)) - :eps
             THEN 'FULL_WITH_PENALTY'

           WHEN COALESCE(ppl.priceDebt,0) <= :eps
                AND COALESCE(ppl.pricePay,0) > :eps
                AND COALESCE(ppl.pricePay,0) < ppl.price - :eps
             THEN 'NOT_FULL_PAIR'

           WHEN COALESCE(ppl.priceDebt,0) > :eps
                AND COALESCE(ppl.pricePay,0) > :eps
                AND COALESCE(ppl.pricePay,0) < (ppl.price + COALESCE(ppl.priceDebt,0)) - :eps
             THEN 'PARTIAL_PENALTY_INCOMPLETE'

           ELSE 'ERROR'
         END AS "paymentStatus"`,
          'COUNT(*) AS "recordCount"',
          'SUM(ppl.price) AS "totalPrice"', // ยอดหลักรวม
          'SUM(COALESCE(ppl.priceDebt,0)) AS "totalPenalty"', // ค่าปรับรวม
          'SUM(COALESCE(ppl.pricePay,0)) AS "totalPricePay"', // ชำระแล้วรวม
          'SUM(ppl.price + COALESCE(ppl.priceDebt,0)) AS "totalExpected"', // ยอดต้องชำระรวม
        ])
        .leftJoin('ppl.productSale', 'ps')
        .leftJoin('ps.product', 'product')
        .where('ppl."datePay" = :datePay', { datePay: startDate })
        .andWhere('ppl."branchId" = :branchId', { branchId: id })
        .groupBy('"paymentStatus"')
        .setParameter('eps', EPS)
        .getRawMany();

      // เรียงลำดับสถานะตามที่ต้องการ
      const sortedStatusRows = [...productPayMentLists].sort((a, b) => {
        const oa = STATUS_ORDER[a.paymentStatus] ?? 999;
        const ob = STATUS_ORDER[b.paymentStatus] ?? 999;
        return oa - ob;
      });

      // สรุปยอดรวมทั้งหมดจากทุกสถานะ (เพื่อสรุปท้าย block)
      const totals = sortedStatusRows.reduce(
        (acc, e) => {
          acc.items += parseInt(e.recordCount ?? 0, 10);
          acc.price += parseFloat(e.totalPrice ?? 0);
          acc.penalty += parseFloat(e.totalPenalty ?? 0);
          acc.expected += parseFloat(e.totalExpected ?? 0);
          acc.paid += parseFloat(e.totalPricePay ?? 0);
          return acc;
        },
        { items: 0, price: 0, penalty: 0, expected: 0, paid: 0 },
      );

      // เขียนข้อความรายสถานะ
      sortedStatusRows.forEach((e) => {
        const statusText =
          statusTranslations[e.paymentStatus] || e.paymentStatus;
        message += `${statusText} (${formatNumberDigit(e.recordCount)} รายการ)\n`;
        message += `ยอดหลัก: ${formatNumberDigit(e.totalPrice)} บาท\n`;
        message += `ค่าปรับ: ${formatNumberDigit(e.totalPenalty)} บาท\n`;
        message += `ยอดต้องชำระ: ${formatNumberDigit(e.totalExpected)} บาท\n`;
        message += `ชำระแล้ว: ${formatNumberDigit(e.totalPricePay)} บาท\n`;
        message += `------------------------------\n`;
      });

      // รวมยอดท้ายบล็อกสถานะ
      message += `รวมทั้งหมด (${formatNumberDigit(totals.items)} รายการ)\n`;
      message += `ยอดหลักรวม: ${formatNumberDigit(totals.price)} บาท\n`;
      message += `ค่าปรับรวม: ${formatNumberDigit(totals.penalty)} บาท\n`;
      message += `ยอดต้องชำระรวม: ${formatNumberDigit(totals.expected)} บาท\n`;
      message += `ชำระแล้วรวม: ${formatNumberDigit(totals.paid)} บาท\n`;
      message += `==============================\n`;

      // ---------------------------
      // 2) Query ช่องทางการชำระ (payType)
      // ---------------------------
      const productPaymentImages = await this.productPaymentImageRepository
        .createQueryBuilder('ppi')
        .select([
          'ppi.payType AS "payType"',
          'ppi.bankId AS "bankId"',
          'bank.bankName AS "bankName"',
          'bank.bankNo AS "bankNo"',
          'bank.bankOwner AS "bankOwner"',
          'SUM(ppi.price) AS "totalPrice"',
          'COUNT(ppi.id) AS "recordCount"',
        ])
        .where('ppi."datePay" = :datePay', { datePay: startDate })
        .andWhere('ppi."branchId" = :branchId', { branchId: id })
        .leftJoin('ppi.bank', 'bank')
        .groupBy('ppi."payType"')
        .addGroupBy('ppi."bankId"')
        .addGroupBy('bank.bankName')
        .addGroupBy('bank.bankNo')
        .addGroupBy('bank.bankOwner')
        .getRawMany();

      // เขียนข้อความช่องทางการชำระ
      productPaymentImages.forEach((e) => {
        const payTypeText = statusPayType[e.payType] || `${e.payType}`;
        message += `${payTypeText} (${formatNumberDigit(e.recordCount)} รายการ)\n`;
        if (`${e.payType}` === '2') {
          message += `ธนาคาร: ${e.bankOwner}\n`;
          message += `ชื่อบัญชี: ${e.bankName}\n`;
          message += `เลขบัญชี: ${e.bankNo}\n`;
        }
        message += `ยอด: ${formatNumberDigit(e.totalPrice)} บาท\n`;
        message += `------------------------------\n`;
      });

      // 3) ส่งข้อความ (แบ่งเป็นพาร์ตถ้ายาว)
      const messageParts = this.splitMessage(message);
      for (const part of messageParts) {
        await this.sendTelegramNotify({
          botToken: token_bot,
          chatId: room_id_paymentDown,
          message: part,
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
}
