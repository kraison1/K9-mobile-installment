import { PickType } from '@nestjs/swagger';
import { ChangeProductPrice } from '../entities/change-product-price.entity';

export class CreateChangeProductPriceDto extends PickType(ChangeProductPrice, [
  'productModelId',
  'productStorageId',
  'priceDownPayment',
  'priceDownPaymentPercent',
  'valueMonth',
  'payPerMonth',
  'priceSale',
  'priceWholeSale',
  'hand',
  'createByUserId',
  'branchId',
  'code',
] as const) {}
