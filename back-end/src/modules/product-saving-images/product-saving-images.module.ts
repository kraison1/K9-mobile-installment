import { Module } from '@nestjs/common';
import { ProductSavingImagesService } from './product-saving-images.service';
import { ProductSavingImagesController } from './product-saving-images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSaving } from '../product-saving/entities/product-saving.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSaving])],
  controllers: [ProductSavingImagesController],
  providers: [ProductSavingImagesService],
})
export class ProductSavingImagesModule {}
