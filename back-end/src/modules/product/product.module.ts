import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Branch } from '../branchs/entities/branch.entity';
import { ProductLog } from '../product-log/entities/product-log.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { ProductBrand } from '../product-brands/entities/product-brand.entity';
import { ProductImage } from '../product-image/entities/product-image.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { ProductBook } from '../product-book/entities/product-book.entity';
import { ProductSaving } from '../product-saving/entities/product-saving.entity';
import { ProductPrice } from '../product-price/entities/product-price.entity';
import { TelegramNotificationService } from '../telegram-notification/telegram-notification.service';
import { HttpModule } from '@nestjs/axios';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { ProductPaymentImage } from '../product-payment-images/entities/product-payment-image.entity';
import { Customer } from '../customer/entities/customer.entity';
import { User } from '../users/entities/user.entity';
import { ProductModel } from '../product-model/entities/product-model.entity';
import { ProductRepairList } from '../product-repair-lists/entities/product-repair-list.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductBrand,
      ProductSale,
      ProductRepairList,
      ProductBook,
      ProductSaving,
      Branch,
      ProductLog,
      ProductImage,
      ProductPrice,
      ProductPayMentList, // เพิ่ม entity
      ProductPaymentImage, // เพิ่ม entity
      Customer,
      ProductModel,
      User,
    ]),
    HttpModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductLogService, TelegramNotificationService],
  exports: [ProductService],
})
export class ProductModule {}
