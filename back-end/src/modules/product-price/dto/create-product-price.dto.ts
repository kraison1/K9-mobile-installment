import { PickType } from '@nestjs/swagger';
import { ProductPrice } from '../entities/product-price.entity';

export class CreateProductPriceDto extends PickType(ProductPrice, [
  'amount',
  'productId',
  'branchId',
] as const) {}
