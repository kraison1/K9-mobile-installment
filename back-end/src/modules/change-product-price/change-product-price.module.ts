import { Module } from '@nestjs/common';
import { ChangeProductPriceService } from './change-product-price.service';
import { ChangeProductPriceController } from './change-product-price.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeProductPrice } from './entities/change-product-price.entity';
import { Product } from '../product/entities/product.entity';
import { ProductLog } from '../product-log/entities/product-log.entity';
import { ProductLogService } from '../product-log/product-log.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChangeProductPrice, Product, ProductLog]),
  ],
  controllers: [ChangeProductPriceController],
  providers: [ChangeProductPriceService, ProductLogService],
})
export class ChangeProductPriceModule {}
