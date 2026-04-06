import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModelService } from './product-model.service';
import { ProductModelController } from './product-model.controller';
import { ProductModel } from './entities/product-model.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductModel, Product])],
  controllers: [ProductModelController],
  providers: [ProductModelService],
})
export class ProductModelModule {}
