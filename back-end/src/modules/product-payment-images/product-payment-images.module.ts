import { Module } from '@nestjs/common';
import { ProductPaymentImagesService } from './product-payment-images.service';
import { ProductPaymentImagesController } from './product-payment-images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPaymentImage } from './entities/product-payment-image.entity';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { Product } from '../product/entities/product.entity';
import { ProductLog } from '../product-log/entities/product-log.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { HttpModule } from '@nestjs/axios';
import { TelegramNotificationService } from '../telegram-notification/telegram-notification.service';
import { Branch } from '../branchs/entities/branch.entity';
import { ManageAppleId } from '../manage-apple-id/entities/manage-apple-id.entity';
import { ProductModule } from '../product/product.module'; // 👈 import the module, not the service

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      ProductPayMentList,
      ProductSale,
      Product,
      ProductPaymentImage,
      ProductLog,
      Branch,
      ManageAppleId,
    ]),
    ProductModule,
  ],
  controllers: [ProductPaymentImagesController],
  providers: [
    ProductPaymentImagesService,
    ProductLogService,
    TelegramNotificationService,
  ],
})
export class ProductPaymentImagesModule {}
