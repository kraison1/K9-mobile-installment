import { PickType } from '@nestjs/swagger';
import { Auth } from '../entities/auth.entity';

export class AuthPayloadDto extends PickType(Auth, [
  'username',
  'password',
  'deviceType',
] as const) {}
