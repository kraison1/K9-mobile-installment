import { PickType } from '@nestjs/swagger';
import { ChangeProductCommission } from '../entities/change-product-commission.entity';

export class CreateChangeProductCommissionDto extends PickType(
  ChangeProductCommission,
  [
    'productModelId',
    'productStorageId',
    'priceCommission',
    'hand',
    'createByUserId',
    'branchId',
    'code',
  ] as const,
) {}
