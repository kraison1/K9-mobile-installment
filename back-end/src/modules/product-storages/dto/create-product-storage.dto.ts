import { PickType } from '@nestjs/swagger';
import { ProductStorage } from '../entities/product-storage.entity';

export class CreateProductStorageDto extends PickType(ProductStorage, [
  'name',
  'active',
] as const) {}
