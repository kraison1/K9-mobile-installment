import { Module } from '@nestjs/common';
import { ProcessBooksService } from './process-books.service';
import { ProcessBooksController } from './process-books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessBook } from './entities/process-book.entity';
import { Product } from '../product/entities/product.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { ProductLog } from '../product-log/entities/product-log.entity';
import { ProcessBookImage } from '../process-book-images/entities/process-book-image.entity';
import { ProductBook } from '../product-book/entities/product-book.entity';
import { HttpModule } from '@nestjs/axios';
import { TelegramNotificationService } from '../telegram-notification/telegram-notification.service';
import { Branch } from '../branchs/entities/branch.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { TelegramNotificationModule } from '../telegram-notification/telegram-notification.module';

@Module({
  imports: [
    HttpModule,
    TelegramNotificationModule,
    TypeOrmModule.forFeature([
      ProductSale,
      ProductBook,
      ProcessBook,
      Product,
      ProductLog,
      ProcessBookImage,
      Branch,
      ProductPayMentList,
    ]),
  ],

  controllers: [ProcessBooksController],
  providers: [
    ProcessBooksService,
    ProductLogService,
    TelegramNotificationService,
  ],
})
export class ProcessBooksModule {}
