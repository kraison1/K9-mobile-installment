import { PickType } from '@nestjs/swagger';
import { ProductBuyLists } from 'src/modules/product-buy-lists/entities/product-buy-list.entity';
import { ProductBuy } from '../entities/product-buy.entity';

export class CreateProductBuyDto extends PickType(ProductBuy, [
  'code',
  'branchId',
  'catalog',
  'status',
  'create_date',
  'createByUserId',
  'updateByUserId',
  'tackingNumber',
  'transportId',
] as const) {
  productBuyLists: ProductBuyLists[];
}
