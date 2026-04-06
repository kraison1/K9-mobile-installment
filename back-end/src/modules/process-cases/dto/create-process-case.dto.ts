import { PickType } from '@nestjs/swagger';
import { ProcessCase } from '../entities/process-case.entity';

export class CreateProcessCaseDto extends PickType(ProcessCase, [
  'oldProductId',
  'newProductId',
  'sumPrice',
  'sumPricePay',
  'sumPriceDebt',
  'priceDiscount',
  'priceDebt',
  'priceRemaining',
  'priceEndCase',
  'priceCostBuy',
  'priceDownPayment',
  'priceNewCostBuy',
  'priceReturnCustomer',
  'useCostType',
  'status',
] as const) {}
