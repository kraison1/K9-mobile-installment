import { PickType } from '@nestjs/swagger';
import { UserGroup } from '../entities/user-group.entity';

export class CreateUserGroupDto extends PickType(UserGroup, [
  'name',
  'type',
  'permissions',
  'active',
] as const) {}
