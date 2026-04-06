import { PickType } from '@nestjs/swagger';
import { RatePurchase } from '../entities/rate-purchase.entity';

export class CreateRatePurchaseDto extends PickType(RatePurchase, [
  'productModelId',
  'productStorageId',
  'priceHandOne',
  'priceStartHandTwo',
  'priceEndHandTwo',
  'active',
] as const) {}
