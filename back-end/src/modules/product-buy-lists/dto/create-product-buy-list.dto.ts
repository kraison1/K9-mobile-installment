import { PickType } from '@nestjs/swagger';
import { ProductBuyLists } from '../entities/product-buy-list.entity';

export class CreateProductBuyListDto extends PickType(ProductBuyLists, [
  'amount',
  'productId',
  'productBuyId',
] as const) {}
