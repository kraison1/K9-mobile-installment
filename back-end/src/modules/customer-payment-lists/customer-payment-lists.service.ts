import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
} from 'src/helper/constanc';
import { CustomerPaymentList } from './entities/customer-payment-list.entity';
import { CustomerPaymentSearchDto } from 'src/helper/search.dto';
import { Branch } from '../branchs/entities/branch.entity';
import { ChatService } from '../chat/chat.service';
import { ChatGateway } from '../chat/chat.gateway';
import { CreateMessageDto } from '../chat/dto/create-chat.dto';
import { MessageType } from '../chat/entities/message.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { ProductPaymentImage } from '../product-payment-images/entities/product-payment-image.entity';
import { ProductSaving } from '../product-saving/entities/product-saving.entity';
import { ProductSavingPayMentImage } from '../product-saving-pay-ment-image/entities/product-saving-pay-ment-image.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class CustomerPaymentListsService {
  private readonly uploadsPath = path.join('uploads/customer-payment-lists');

  constructor(
    @InjectRepository(CustomerPaymentList)
    private readonly customerPaymentListRepository: Repository<CustomerPaymentList>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(ProductSale)
    private readonly productSaleRepository: Repository<ProductSale>,
    @InjectRepository(ProductPayMentList)
    private readonly productPayMentListRepository: Repository<ProductPayMentList>,
    @InjectRepository(ProductPaymentImage)
    private readonly productPaymentImageRepository: Repository<ProductPaymentImage>,
    @InjectRepository(ProductSaving)
    private readonly productSavingRepository: Repository<ProductSaving>,
    @InjectRepository(ProductSavingPayMentImage)
    private readonly productSavingPayMentImageRepository: Repository<ProductSavingPayMentImage>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    const latestPayment = await this.customerPaymentListRepository.findOne({
      where: {
        code: Raw((alias) => `${alias} ILIKE :prefix`, {
          prefix: `${datePrefix}%`,
        }),
      },
      order: { code: 'DESC' },
    });

    let newRunningNumber = 1;
    if (latestPayment) {
      const lastRunningNumber = parseInt(latestPayment.code.slice(8), 10);
      newRunningNumber = lastRunningNumber + 1;
    }

    const runningNumberStr = newRunningNumber.toString().padStart(5, '0');
    return `${datePrefix}${runningNumberStr}`;
  }

  async create(req: FastifyRequest): Promise<any> {
    const user = (req as any).user;

    await fs.ensureDir(this.uploadsPath);
    const files = await req.saveRequestFiles();

    const { productSaleId, productSavingId, customerId, type } =
      req.body as any;

    const checkStatus = await this.customerPaymentListRepository.findOne({
      where: { customerId: customerId.value, status: '0' },
      order: { create_date: 'DESC' },
    });

    if (checkStatus) {
      return {
        message_error: `มีรายการที่รอตรวจสอบ: ${checkStatus.code}`,
      };
    }

    let branchIdValue = user.branchId;

    if (process.env.SYSTEM_BY == 'THUNDER') {
      const branchDown = await this.branchRepository.findOneBy({
        isBranchDown: '1',
      });

      if (branchDown) {
        branchIdValue = branchDown.id;
      }
    }

    const newCode = await this.generateCode();
    const dateFolder = newCode.slice(0, 8);
    const dailyUploadsPath = path.join(this.uploadsPath, dateFolder);
    await fs.ensureDir(dailyUploadsPath);

    let filePaymentPath = '';
    if (files.length > 0) {
      const file = files[0];
      const buffer = await fs.readFile(file.filepath);
      const filename = `${newCode}.png`;
      filePaymentPath = path.join(dailyUploadsPath, filename);

      await sharp(buffer)
        .png({ quality: 80, progressive: true })
        .toFile(filePaymentPath);
    }

    const createDto: Partial<CustomerPaymentList> = {
      code: newCode,
      productSaleId: productSaleId?.value
        ? parseInt(productSaleId.value, 10)
        : null,
      productSavingId: productSavingId?.value
        ? parseInt(productSavingId.value, 10)
        : null,
      customerId: customerId?.value ? parseInt(customerId.value, 10) : null,
      filePayment: filePaymentPath,
      branchId: branchIdValue,
      type: type?.value ?? '1',
      status: '0',
    };

    const newPaymentList = this.customerPaymentListRepository.create(createDto);
    await this.customerPaymentListRepository.save(newPaymentList);

    if (createDto.customerId) {
      const chatMessageDto: CreateMessageDto = {
        senderId: user.id,
        conversationId: newPaymentList.customerId,
        content: `ผู้เช่าชำระ: ${
          newPaymentList.type === '1' ? 'ค่าดูแล' : 'ออม'
        } ${newPaymentList.code}`,
        type: MessageType.TEXT,
      };
      const savedMessage = await this.chatService.createMessage(chatMessageDto);

      this.chatGateway.server
        .to(`conversation_${savedMessage.conversation.id}`)
        .emit('recMessage', savedMessage);
    }

    return {
      message_success: `${MESSAGE_SAVE_SUCCESS}: ${newPaymentList.code}`,
    };
  }

  async findAll(
    searchDto: CustomerPaymentSearchDto,
    req: FastifyRequest,
  ): Promise<{
    data: CustomerPaymentList[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const user = (req as any).user;

    const queryBuilder =
      this.customerPaymentListRepository.createQueryBuilder('cpl');

    queryBuilder
      .select([
        'cpl',
        'customer.id',
        'customer.code',
        'customer.name',
        'customer.lastname',
        'user.id',
        'user.name',
        'user.lastname',
        'productSale.id',
        'productSale.code',
        'productSaving.id',
        'productSaving.code',
      ])
      .leftJoin('cpl.customer', 'customer')
      .leftJoin('cpl.user', 'user')
      .leftJoin('cpl.productSale', 'productSale')
      .leftJoin('cpl.productSaving', 'productSaving');
    if (
      !['พนักงาน', 'ผู้ดูแลระบบ', 'ไฟแนนซ์', 'admin-external'].includes(
        user.type,
      )
    ) {
      queryBuilder.where('cpl.customerId = :customerId', {
        customerId: user.customerId,
      });
    } else {
      if (searchDto.branchId && searchDto.branchId !== 0) {
        queryBuilder.where('cpl.branchId = :branchId', {
          branchId: searchDto.branchId,
        });
      }
    }

    if (searchDto.search) {
      queryBuilder.andWhere(
        '(cpl.code ILIKE :search OR customer.name ILIKE :search OR customer.lastname ILIKE :search)',
        { search: `%${searchDto.search}%` },
      );
    }

    if (searchDto.status && searchDto.status != null) {
      queryBuilder.andWhere('cpl.status = :status', {
        status: searchDto.status,
      });
    }

    if (searchDto.startDate && searchDto.endDate) {
      queryBuilder.andWhere('cpl.create_date BETWEEN :startDate AND :endDate', {
        startDate: new Date(searchDto.startDate),
        endDate: new Date(searchDto.endDate),
      });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('cpl.create_date', 'DESC')
      .skip((searchDto.page - 1) * searchDto.pageSize)
      .take(searchDto.pageSize);

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page: searchDto.page,
      pageSize: searchDto.pageSize,
    };
  }

  async getSelect(
    type: string,
    req: FastifyRequest,
  ): Promise<Pick<CustomerPaymentList, 'id' | 'code' | 'branchId'>[]> {
    const user = (req as any).user;
    if (!user?.branchId) {
      return [];
    }

    const whereClause: any = {
      status: '0', // Assuming '0' is an active status
      branchId: user.branchId,
    };

    if (type) {
      whereClause.type = type;
    }

    return this.customerPaymentListRepository.find({
      where: whereClause,
      select: ['id', 'code', 'branchId'],
    });
  }

  async findOne(id: number): Promise<CustomerPaymentList> {
    const paymentList = await this.customerPaymentListRepository.findOne({
      where: { id },
      relations: ['customer', 'user', 'productSale', 'productSaving', 'branch'],
    });
    if (!paymentList) {
      throw new NotFoundException(
        `CustomerPaymentList with ID ${id} not found`,
      );
    }
    return paymentList;
  }

  async update(id: number, req: FastifyRequest): Promise<any> {
    const user = (req as any).user;
    const { status, price, bankId, approve_date } = req.body as any;

    const paymentList = await this.customerPaymentListRepository.findOne({
      where: { id },
    });

    if (!paymentList) {
      throw new NotFoundException(
        `CustomerPaymentList with ID ${id} not found`,
      );
    }

    const oldStatus = paymentList.status;
    const newStatus = status?.value;
    const newPrice =
      price?.value !== undefined ? Number(price.value) : paymentList.price;
    const newBankId = bankId?.value ? parseInt(bankId.value, 10) : null;
    paymentList.userId = user.id;
    paymentList.bankId = newBankId;
    paymentList.approve_date = approve_date?.value;

    // Case 1: Reverting a confirmed payment to cancelled
    if (oldStatus === '1' && newStatus === '2') {
      if (paymentList.type === '1' && paymentList.productSaleId) {
        await this.reverseSalePayment(paymentList);
      } else if (paymentList.type === '2' && paymentList.productSavingId) {
        await this.reverseSavingPayment(paymentList);
      }

      await this.customerPaymentListRepository.update(id, {
        status: '2',
        userId: user.id,
        bankId: newBankId,
        approve_date: paymentList.approve_date,
      });

      const message = `แอดมินได้ทำการ *ยกเลิก* รายการชำระเงิน ${paymentList.code} ของคุณ`;
      await this.sendChatNotification(user.id, paymentList.customerId, message);

      return {
        message_success: 'ยกเลิกรายการชำระเงินเรียบร้อยแล้ว',
      };
    }

    // Case 2: Payment is already processed or cancelled (and not being reversed)
    if (oldStatus !== '0') {
      throw new BadRequestException(
        'This payment has already been processed or cancelled.',
      );
    }

    // Case 3: Processing a pending payment
    if (newStatus === '2') {
      // Cancel pending payment
      await this.customerPaymentListRepository.update(id, {
        status: '2',
        userId: user.id,
        bankId: null,
      });

      const message = `แอดมินได้ทำการ *ยกเลิก* รายการชำระเงิน ${paymentList.code} ของคุณ`;
      await this.sendChatNotification(user.id, paymentList.customerId, message);

      return { message_success: MESSAGE_UPDATE_SUCCESS };
    }

    if (newStatus === '1') {
      // Confirm pending payment
      await this.customerPaymentListRepository.update(id, {
        status: '1',
        price: newPrice,
        userId: user.id,
        bankId: newBankId,
        approve_date: paymentList.approve_date,
      });

      try {
        if (paymentList.type === '1' && paymentList.productSaleId) {
          await this.processSalePayment(paymentList, newPrice);
        } else if (paymentList.type === '2' && paymentList.productSavingId) {
          await this.processSavingPayment(paymentList, newPrice);
        } else {
          throw new BadRequestException(
            'Payment list is missing required contract ID.',
          );
        }
      } catch (error) {
        // Rollback status if processing fails
        await this.customerPaymentListRepository.update(id, { status: '0' });
        throw error;
      }

      const message = `เราได้ *ยืนยัน* รายการชำระเงิน ${paymentList.code} ของคุณแล้ว ยอด ${newPrice} บาท`;
      await this.sendChatNotification(user.id, paymentList.customerId, message);

      return { message_success: MESSAGE_UPDATE_SUCCESS };
    }

    // Case 4: Only updating the price of a pending payment
    if (price?.value !== undefined) {
      await this.customerPaymentListRepository.update(id, { price: newPrice });
      return { message_success: MESSAGE_UPDATE_SUCCESS };
    }

    throw new BadRequestException('Invalid update parameters.');
  }

  private async sendChatNotification(
    senderId: number,
    customerId: number,
    messageContent: string,
  ) {
    if (!customerId) {
      console.warn('Attempted to send chat notification without a customerId.');
      return;
    }

    try {
      const chatMessageDto: CreateMessageDto = {
        senderId,
        conversationId: customerId,
        content: messageContent,
        type: MessageType.TEXT,
      };
      const savedMessage = await this.chatService.createMessage(chatMessageDto);

      this.chatGateway.server
        .to(`conversation_${savedMessage.conversation.id}`)
        .emit('recMessage', savedMessage);
    } catch (error) {
      console.error(
        `Failed to send chat notification to customer ${customerId}:`,
        error,
      );
    }
  }

  private async processSalePayment(
    paymentList: CustomerPaymentList,
    amount: number,
  ) {
    const productSale = await this.productSaleRepository.findOneBy({
      id: paymentList.productSaleId,
    });

    if (!productSale || productSale.isCancel === '1') {
      throw new BadRequestException(
        'Contract for this payment is invalid or cancelled.',
      );
    }

    // ดึงรายการงวดที่ยังไม่ชำระครบ (รวมยอด + หนี้)
    const installments = await this.productPayMentListRepository
      .createQueryBuilder('payment')
      .where('payment.productSaleId = :productSaleId', {
        productSaleId: paymentList.productSaleId,
      })
      .andWhere('payment.isPaySuccess != :payStatus', { payStatus: '1' })
      .andWhere('payment.isCaseSuccess = :caseStatus', { caseStatus: '1' })
      .andWhere(
        'payment.pricePay < payment.price + COALESCE(payment.priceDebt, 0)',
      )
      .orderBy('payment.payNo', 'ASC')
      .getMany();

    let remainingPayment = amount;
    for (const installment of installments) {
      if (remainingPayment <= 0) break;

      const currentPrice = Number(installment.price) || 0;
      const currentPriceDebt = Number(installment.priceDebt) || 0;
      const alreadyPaid = Number(installment.pricePay) || 0;

      const totalInstallmentPrice = currentPrice + currentPriceDebt;
      const remainingOnInstallment = totalInstallmentPrice - alreadyPaid;
      if (remainingOnInstallment <= 0) continue;

      const paymentForThisInstallment = Math.min(
        remainingPayment,
        remainingOnInstallment,
      );

      const newPricePay = alreadyPaid + paymentForThisInstallment;
      const isFullyPaid = newPricePay >= totalInstallmentPrice;

      await this.productPayMentListRepository.update(installment.id, {
        pricePay: newPricePay,
        ...(isFullyPaid && { isPaySuccess: '1' }),
      });

      const paymentImage = this.productPaymentImageRepository.create({
        productSaleId: productSale.id,
        productPayMentListId: installment.id,
        price: paymentForThisInstallment,
        datePay: paymentList.approve_date,
        payNo: installment.payNo,
        filePayMent: paymentList.filePayment,
        createByUserId: paymentList.userId,
        branchId: paymentList.branchId,
        create_date: paymentList.approve_date,
        payType: '2',
        bankId: paymentList.bankId,
      });
      await this.productPaymentImageRepository.save(paymentImage);

      remainingPayment -= paymentForThisInstallment;
    }

    // update ยอดรวมที่จ่ายแล้ว
    productSale.priceSumPayInvoices =
      Number(productSale.priceSumPayInvoices || 0) + amount;

    // check ว่าจ่ายครบทั้งสัญญาหรือยัง
    const totalDueCheck = await this.productPayMentListRepository
      .createQueryBuilder('payment')
      .where('payment.productSaleId = :productSaleId', {
        productSaleId: productSale.id,
      })
      .andWhere('payment.isCaseSuccess = :caseStatus', { caseStatus: '1' })
      .select(
        'SUM(payment.price + COALESCE(payment.priceDebt, 0))',
        'totalPrice',
      )
      .addSelect('SUM(payment.pricePay)', 'totalPricePay')
      .getRawOne();

    const totalPrice = Number(totalDueCheck.totalPrice) || 0;
    const totalPricePay = Number(totalDueCheck.totalPricePay) || 0;

    if (totalPrice > 0 && totalPricePay >= totalPrice) {
      productSale.isPaySuccess = '1';
      const product = await this.productRepository.findOne({
        where: { id: productSale.productId },
      });
      if (product) {
        await this.productRepository.update(productSale.productId, {
          active: '4',
          note: `จบสัญญา: ${productSale.code}`,
        });
      }
    }

    await this.productSaleRepository.save(productSale);
  }

  private async processSavingPayment(
    paymentList: CustomerPaymentList,
    amount: number,
  ) {
    const productSaving = await this.productSavingRepository.findOneBy({
      id: paymentList.productSavingId,
    });
    if (!productSaving) {
      throw new BadRequestException('Saving contract not found.');
    }

    productSaving.priceSumPay = Number(productSaving.priceSumPay || 0) + amount;
    await this.productSavingRepository.save(productSaving);

    const savingPaymentImage = this.productSavingPayMentImageRepository.create({
      productSavingId: productSaving.id,
      price: amount,
      fileSavingPayMent: paymentList.filePayment,
      createByUserId: paymentList.userId,
      branchId: paymentList.branchId,
      payType: '2',
      create_date: paymentList.approve_date,
      bankId: paymentList.bankId,
    });
    await this.productSavingPayMentImageRepository.save(savingPaymentImage);
  }

  private async reverseSalePayment(paymentList: CustomerPaymentList) {
    const paymentImages = await this.productPaymentImageRepository.find({
      where: {
        productSaleId: paymentList.productSaleId,
        filePayMent: paymentList.filePayment,
      },
    });

    if (paymentImages.length === 0) {
      return;
    }

    let totalReversedAmount = 0;

    for (const image of paymentImages) {
      const amountToReverse = Number(image.price);
      totalReversedAmount += amountToReverse;

      const installment = await this.productPayMentListRepository.findOneBy({
        id: image.productPayMentListId,
      });
      if (installment) {
        const newPricePay = Math.max(
          0,
          Number(installment.pricePay) - amountToReverse,
        );
        await this.productPayMentListRepository.update(installment.id, {
          pricePay: newPricePay,
          isPaySuccess: '0',
        });
      }
      await this.productPaymentImageRepository.remove(image);
    }

    const productSale = await this.productSaleRepository.findOneBy({
      id: paymentList.productSaleId,
    });
    if (productSale) {
      productSale.priceSumPayInvoices = Math.max(
        0,
        Number(productSale.priceSumPayInvoices) - totalReversedAmount,
      );

      const isThunder = process.env.SYSTEM_BY === 'THUNDER';
      const totalDueCheckQuery = this.productPayMentListRepository
        .createQueryBuilder('payment')
        .where('payment.productSaleId = :productSaleId', {
          productSaleId: productSale.id,
        })
        .andWhere('payment.isCaseSuccess = :caseStatus', { caseStatus: '1' });

      if (isThunder) {
        totalDueCheckQuery.select(
          'SUM(payment.price + COALESCE(payment.priceDebt, 0))',
          'totalPrice',
        );
      } else {
        totalDueCheckQuery.select('SUM(payment.price)', 'totalPrice');
      }

      const totalDueCheck = await totalDueCheckQuery
        .addSelect('SUM(payment.pricePay)', 'totalPricePay')
        .getRawOne();

      productSale.isPaySuccess =
        Number(totalDueCheck.totalPricePay) >= Number(totalDueCheck.totalPrice)
          ? '1'
          : '4';
      await this.productSaleRepository.save(productSale);
    }
  }

  private async reverseSavingPayment(paymentList: CustomerPaymentList) {
    const savingPaymentImages =
      await this.productSavingPayMentImageRepository.find({
        where: {
          productSavingId: paymentList.productSavingId,
          fileSavingPayMent: paymentList.filePayment,
        },
      });

    if (savingPaymentImages.length === 0) {
      return;
    }

    let totalReversedAmount = 0;
    for (const image of savingPaymentImages) {
      totalReversedAmount += Number(image.price);
      await this.productSavingPayMentImageRepository.remove(image);
    }

    const productSaving = await this.productSavingRepository.findOneBy({
      id: paymentList.productSavingId,
    });
    if (productSaving) {
      productSaving.priceSumPay = Math.max(
        0,
        Number(productSaving.priceSumPay) - totalReversedAmount,
      );
      await this.productSavingRepository.save(productSaving);
    }
  }
}
