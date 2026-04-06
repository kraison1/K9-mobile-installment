import { PickType } from '@nestjs/swagger';
import { Transport } from '../entities/transport.entity';

export class CreateTransportDto extends PickType(Transport, [
  'name',
  'active',
] as const) {}
