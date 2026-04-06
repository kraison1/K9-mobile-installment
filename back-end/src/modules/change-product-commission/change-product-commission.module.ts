import { Product } from 'src/modules/product/entities/product.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeProductCommissionService } from './change-product-commission.service';
import { ChangeProductCommissionController } from './change-product-commission.controller';
import { ChangeProductCommission } from './entities/change-product-commission.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { ProductLog } from '../product-log/entities/product-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChangeProductCommission, Product, ProductLog]),
  ],
  controllers: [ChangeProductCommissionController],
  providers: [ChangeProductCommissionService, ProductLogService],
})
export class ChangeProductCommissionModule {}
