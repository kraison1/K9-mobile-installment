import { Module } from '@nestjs/common';
import { ProcessSavingsService } from './process-savings.service';
import { ProcessSavingsController } from './process-savings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessSaving } from './entities/process-saving.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { ProductSaving } from '../product-saving/entities/product-saving.entity';
import { Product } from '../product/entities/product.entity';
import { ProductLog } from '../product-log/entities/product-log.entity';
import { ProcessSavingImage } from '../process-saving-images/entities/process-saving-image.entity';
import { Branch } from '../branchs/entities/branch.entity';
import { HttpModule } from '@nestjs/axios';
import { ProductLogService } from '../product-log/product-log.service';
import { TelegramNotificationService } from '../telegram-notification/telegram-notification.service';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { TelegramNotificationModule } from '../telegram-notification/telegram-notification.module';

@Module({
  imports: [
    TelegramNotificationModule,
    HttpModule,
    TypeOrmModule.forFeature([
      ProductSale,
      ProductSaving,
      ProcessSaving,
      Product,
      ProductLog,
      ProcessSavingImage,
      Branch,
      ProductPayMentList,
    ]),
  ],
  controllers: [ProcessSavingsController],
  providers: [
    ProcessSavingsService,
    ProductLogService,
    TelegramNotificationService,
  ],
})
export class ProcessSavingsModule {}
