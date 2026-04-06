import { PickType } from '@nestjs/swagger';
import { ProcessManageFinance } from '../entities/process-manage-finance.entity';

export class CreateProcessManageFinanceDto extends PickType(
  ProcessManageFinance,
  [
    'code',
    'priceBranchService',
    'priceReceive',
    'priceDown',
    'priceCommission',
    'productId',
    'isPromotions',
    'customerId',
    'createByUserId',
    'note',
    'status',
    'branchId',
  ] as const,
) {}
