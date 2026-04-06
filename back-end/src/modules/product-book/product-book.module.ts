import { Module } from '@nestjs/common';
import { ProductBookService } from './product-book.service';
import { ProductBookController } from './product-book.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductBook } from './entities/product-book.entity';
import { Product } from '../product/entities/product.entity';
import { ProductLog } from '../product-log/entities/product-log.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { Branch } from '../branchs/entities/branch.entity';
import { ProductBookImage } from 'src/modules/product-book-image/entities/product-book-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductBook,
      ProductBookImage,
      Product,
      Branch,
      Product,
      ProductLog,
    ]),
  ],
  controllers: [ProductBookController],
  providers: [ProductBookService, ProductLogService],
})
export class ProductBookModule {}
