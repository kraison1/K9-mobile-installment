import { Module } from '@nestjs/common';
import { WithdrawSumPriceSaleService } from './withdraw-sum-price-sale.service';
import { WithdrawSumPriceSaleController } from './withdraw-sum-price-sale.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawSumPriceSale } from './entities/withdraw-sum-price-sale.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WithdrawSumPriceSale, Product])],
  controllers: [WithdrawSumPriceSaleController],
  providers: [WithdrawSumPriceSaleService],
})
export class WithdrawSumPriceSaleModule {}
