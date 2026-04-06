import { Module } from '@nestjs/common';
import { ProductSavingService } from './product-saving.service';
import { ProductSavingController } from './product-saving.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { ProductLog } from '../product-log/entities/product-log.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { Branch } from '../branchs/entities/branch.entity';
import { ProductSavingImage } from '../product-saving-images/entities/product-saving-image.entity';
import { ProductSavingList } from '../product-saving-lists/entities/product-saving-list.entity';
import { ProductSaving } from './entities/product-saving.entity';
import { ProductBook } from '../product-book/entities/product-book.entity';
import { ProcessBook } from '../process-books/entities/process-book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductSaving,
      ProductSavingList,
      ProductSavingImage,
      ProductBook,
      ProcessBook,
      Product,
      Branch,
      Product,
      ProductLog,
    ]),
  ],
  controllers: [ProductSavingController],
  providers: [ProductSavingService, ProductLogService],
  exports: [ProductSavingService],
})
export class ProductSavingModule {}
