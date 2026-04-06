import { PickType } from '@nestjs/swagger';
import { ProductType } from '../entities/product-type.entity';

export class CreateProductTypeDto extends PickType(ProductType, [
  'name',
  'catalog',
  'productUnitId',
  'active',
] as const) {}
