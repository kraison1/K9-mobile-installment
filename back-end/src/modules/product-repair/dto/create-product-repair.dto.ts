import { PickType } from '@nestjs/swagger';
import { ProductRepair } from '../entities/product-repair.entity';

export class CreateProductRepairDto extends PickType(ProductRepair, [
  'code',
  'productId',
  'priceRepair',
  'pricePredict',
  'productTypeId',
  'productBrandId',
  'productModelId',
  'createByUserId',
  'typeRepair',
  'branchId',
  'note',
  'shopName',
  'active',
] as const) {}
