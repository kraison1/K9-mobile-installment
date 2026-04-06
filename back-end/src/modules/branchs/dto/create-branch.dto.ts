import { PickType } from '@nestjs/swagger';
import { Branch } from '../entities/branch.entity';

export class CreateBranchDto extends PickType(Branch, [
  'name',
  'nameRefOne',
  'nameRefTwo',
  'valueFollowOneMonth',
  'valueFollowMoreThanMonth',
  'ownerBank',
  'ownerBankName',
  'ownerBankNo',
  'ownerName',
  'ownerIdCard',
  'ownerAddress',
  'code',
  'online',
  'active',
  'fileBranch',
] as const) {}
