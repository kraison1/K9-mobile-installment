import { Module } from '@nestjs/common';
import { ProcessManageFinanceService } from './process-manage-finance.service';
import { ProcessManageFinanceController } from './process-manage-finance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessManageFinance } from './entities/process-manage-finance.entity';
import { Branch } from '../branchs/entities/branch.entity';
import { Product } from '../product/entities/product.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { PercentDownFinance } from '../percent-down-finance/entities/percent-down-finance.entity';
import { RateFinance } from '../rate-finance/entities/rate-finance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProcessManageFinance,
      Branch,
      Product,
      ProductSale,
      PercentDownFinance,
      RateFinance,
    ]),
  ],
  controllers: [ProcessManageFinanceController],
  providers: [ProcessManageFinanceService],
})
export class ProcessManageFinanceModule {}
