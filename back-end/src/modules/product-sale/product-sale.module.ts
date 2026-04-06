import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSaleService } from './product-sale.service';
import { ProductSaleController } from './product-sale.controller';
import { ProductSale } from './entities/product-sale.entity';
import { Product } from '../product/entities/product.entity';
import { ProductLog } from '../product-log/entities/product-log.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { Branch } from '../branchs/entities/branch.entity';
import { ProductSaleList } from '../product-sale-lists/entities/product-sale-list.entity';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { ProductPrice } from '../product-price/entities/product-price.entity';
import { ProductPaymentImage } from '../product-payment-images/entities/product-payment-image.entity';
import { ProductSaleImage } from '../product-sale-images/entities/product-sale-image.entity';
import { ProductBook } from '../product-book/entities/product-book.entity';
import { ProcessBook } from '../process-books/entities/process-book.entity';
import { Customer } from '../customer/entities/customer.entity';
import { TelegramNotificationService } from '../telegram-notification/telegram-notification.service';
import { HttpModule } from '@nestjs/axios';
import { ProcessSaving } from '../process-savings/entities/process-saving.entity';
import { ProductSaving } from '../product-saving/entities/product-saving.entity';
import { ManageAppleId } from '../manage-apple-id/entities/manage-apple-id.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { BranchTransferPrice } from '../branch-transfer-price/entities/branch-transfer-price.entity';
import { ProductModule } from '../product/product.module'; // Import ProductModule
import { ProductRepair } from '../product-repair/entities/product-repair.entity';
import { ProcessManageFinance } from '../process-manage-finance/entities/process-manage-finance.entity';
import { WithdrawSumPriceSale } from '../withdraw-sum-price-sale/entities/withdraw-sum-price-sale.entity';
import { ProductClaim } from '../product-claim/entities/product-claim.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      ManageAppleId,
      Product,
      Customer,
      ProductSale,
      ProductBook,
      ProcessBook,
      ProductSaving,
      ProcessSaving,
      ProductSaleImage,
      ProductSaleList,
      ProductPayMentList,
      ProductPaymentImage,
      ProductPrice,
      Branch,
      Product,
      ProductLog,
      Expense,
      BranchTransferPrice,
      ProductRepair,
      ProcessManageFinance,
      WithdrawSumPriceSale,
      ProductClaim,
    ]),
    ProductModule,
  ],
  controllers: [ProductSaleController],
  providers: [
    ProductSaleService,
    ProductLogService,
    TelegramNotificationService,
  ],
  exports: [ProductSaleService],
})
export class ProductSaleModule {}
