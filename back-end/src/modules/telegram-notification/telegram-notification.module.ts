import { forwardRef, Module } from '@nestjs/common';
import { TelegramNotificationService } from './telegram-notification.service';
import { TelegramNotificationController } from './telegram-notification.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from '../branchs/entities/branch.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { Product } from '../product/entities/product.entity';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { ProcessBook } from '../process-books/entities/process-book.entity';
import { ProductPaymentImage } from '../product-payment-images/entities/product-payment-image.entity';
import { ProductBookModule } from '../product-book/product-book.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Branch,
      Product,
      ProductSale,
      ProductPayMentList,
      ProductPaymentImage,
      ProcessBook,
    ]),
  ],
  controllers: [TelegramNotificationController],
  providers: [TelegramNotificationService],
  exports: [TelegramNotificationService, TypeOrmModule], // Export TypeOrmModule
})
export class TelegramNotificationModule {}
