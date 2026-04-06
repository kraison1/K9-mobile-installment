import { PickType } from '@nestjs/swagger';
import { ProductLog } from '../entities/product-log.entity';

export class CreateProductLogDto extends PickType(ProductLog, [
  'action',
  'obj',
  'productId',
  'branchId',
  'userId',
  'create_date',
] as const) {}
