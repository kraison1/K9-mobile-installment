import { PickType } from '@nestjs/swagger';
import { TransferProductBranchList } from '../entities/transfer-product-branch-list.entity';

export class CreateTransferProductBranchListDto extends PickType(
  TransferProductBranchList,
  ['amount', 'productId', 'transferProductBranchId'] as const,
) {}
