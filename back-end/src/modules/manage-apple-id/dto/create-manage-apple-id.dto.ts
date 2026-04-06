import { PickType } from '@nestjs/swagger';
import { ManageAppleId } from '../entities/manage-apple-id.entity';

export class CreateManageAppleIdDto extends PickType(ManageAppleId, [
  'appId',
  'pass',
  'count',
  'note',
  'branchId',
  'createByUserId',
  'active',
] as const) {}
