import { PickType } from '@nestjs/swagger';
import { Auth } from '../entities/auth.entity';

export class RefreshTokenDto extends PickType(Auth, [
  'refreshToken',
  'deviceType',
] as const) {}
