import { Module } from '@nestjs/common';
import { ProcessCasesService } from './process-cases.service';
import { ProcessCasesController } from './process-cases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessCase } from './entities/process-case.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { Product } from '../product/entities/product.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { ProductLog } from '../product-log/entities/product-log.entity';
import { ProcessCaseImage } from '../process-case-images/entities/process-case-image.entity';
import { Branch } from '../branchs/entities/branch.entity';
import { TelegramNotificationService } from '../telegram-notification/telegram-notification.service';
import { HttpModule } from '@nestjs/axios';
import { ManageAppleId } from '../manage-apple-id/entities/manage-apple-id.entity';
import { ProductPaymentImage } from '../product-payment-images/entities/product-payment-image.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      ProcessCase,
      ProductSale,
      ProductPayMentList,
      ProductPaymentImage,
      Product,
      ProductLog,
      ProcessCaseImage,
      Branch,
      ManageAppleId,
    ]),
  ],
  controllers: [ProcessCasesController],
  providers: [
    ProcessCasesService,
    ProductLogService,
    TelegramNotificationService,
  ],
})
export class ProcessCasesModule {}
