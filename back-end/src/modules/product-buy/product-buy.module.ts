import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from '../branchs/entities/branch.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { ProductLog } from '../product-log/entities/product-log.entity';
import { Product } from '../product/entities/product.entity';
import { ProductBuy } from './entities/product-buy.entity';
import { ProductBuyLists } from '../product-buy-lists/entities/product-buy-list.entity';
import { ProductBuyController } from './product-buy.controller';
import { ProductBuyService } from './product-buy.service';
import { ProductPrice } from '../product-price/entities/product-price.entity';
import { TelegramNotificationService } from '../telegram-notification/telegram-notification.service';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { ProductPaymentImage } from '../product-payment-images/entities/product-payment-image.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      ProductBuy,
      ProductBuyLists,
      Branch,
      ProductLog,
      ProductPrice,
      Product,
      ProductSale,
      ProductPayMentList, // เพิ่ม entity
      ProductPaymentImage, // เพิ่ม entity
    ]),
  ],
  controllers: [ProductBuyController],
  providers: [
    ProductBuyService,
    ProductLogService,
    TelegramNotificationService,
  ],
})
export class ProductBuyModule {}
