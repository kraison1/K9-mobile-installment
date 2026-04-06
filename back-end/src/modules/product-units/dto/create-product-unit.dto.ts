import { PickType } from '@nestjs/swagger';
import { ProductUnit } from '../entities/product-unit.entity';

export class CreateProductUnitDto extends PickType(ProductUnit, [
  'name',
  'active',
] as const) {}
