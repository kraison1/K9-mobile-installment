import { PickType } from '@nestjs/swagger';
import { TransferProductBranch } from '../entities/transfer-product-branch.entity';
import { TransferProductBranchList } from 'src/modules/transfer-product-branch-lists/entities/transfer-product-branch-list.entity';

export class CreateTransferProductBranchDto extends PickType(
  TransferProductBranch,
  [
    'code',
    'catalog',
    'refOldStockNumber',
    'branchId',
    'toBranchId',
    'status',
    'create_date',
    'createByUserId',
    'updateByUserId',
    'tackingNumber',
    'transportId',
  ] as const,
) {
  transferProductBranchLists: TransferProductBranchList[];
}
