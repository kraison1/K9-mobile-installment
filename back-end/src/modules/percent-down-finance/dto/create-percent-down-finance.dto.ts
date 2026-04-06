import { PickType } from '@nestjs/swagger';
import { PercentDownFinance } from '../entities/percent-down-finance.entity';

export class CreatePercentDownFinanceDto extends PickType(PercentDownFinance, [
  'productModelId',
  'productStorageId',
  'percentDown',
  'priceDownPayment',
  'payPerMonth',
  'priceCommission',
  'priceHandOne',
  'priceStartHandTwo',
  'priceEndHandTwo',
  'isPromotions',
  'active',
] as const) {}
