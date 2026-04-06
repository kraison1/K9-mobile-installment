import { PickType } from '@nestjs/swagger';
import { ProductModel } from '../entities/product-model.entity';

export class CreateProductModelDto extends PickType(ProductModel, [
  'name',
  'catalog',
  'active',
] as const) {}
