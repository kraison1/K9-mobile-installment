import { Module } from '@nestjs/common';
import { ProductTypeService } from './product-types.service';
import { ProductTypeController } from './product-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from './entities/product-type.entity';
import { ProductModel } from '../product-model/entities/product-model.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductType, ProductModel, Product])],
  controllers: [ProductTypeController],
  providers: [ProductTypeService],
})
export class ProductTypeModule {}
