import { Module } from '@nestjs/common';
import { ProductSaleImagesService } from './product-sale-images.service';
import { ProductSaleImagesController } from './product-sale-images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImage } from '../product-image/entities/product-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductImage])],
  controllers: [ProductSaleImagesController],
  providers: [ProductSaleImagesService],
})
export class ProductSaleImagesModule {}
