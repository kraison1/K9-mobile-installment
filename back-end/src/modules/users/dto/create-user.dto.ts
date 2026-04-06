import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class CreateUserDto extends PickType(User, [
  'username',
  'password',
  'name',
  'customerId',
  'lastname',
  'refreshToken',
  'tel',
  'bookno',
  'bookbank',
  'bookname',
  'type',
  'userGroupId',
  'branchId',
  'deviceType',
  'active',
] as const) {}
