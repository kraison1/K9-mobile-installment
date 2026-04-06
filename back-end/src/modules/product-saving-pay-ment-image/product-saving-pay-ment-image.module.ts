import { Module } from '@nestjs/common';
import { ProductSavingPayMentImageService } from './product-saving-pay-ment-image.service';
import { ProductSavingPayMentImageController } from './product-saving-pay-ment-image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSavingPayMentImage } from './entities/product-saving-pay-ment-image.entity';
import { Product } from '../product/entities/product.entity';
import { ProductLog } from '../product-log/entities/product-log.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { ProductSaving } from '../product-saving/entities/product-saving.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductSaving,
      ProductSavingPayMentImage,
      Product,
      ProductLog,
    ]),
  ],
  controllers: [ProductSavingPayMentImageController],
  providers: [ProductSavingPayMentImageService, ProductLogService],
})
export class ProductSavingPayMentImageModule {}
