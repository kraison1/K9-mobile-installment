import { PickType } from '@nestjs/swagger';
import { ProductBrand } from '../entities/product-brand.entity';

export class CreateProductBrandDto extends PickType(ProductBrand, [
  'code',
  'catalog',
  'name',
  'showStock',
  'active',
] as const) {}
