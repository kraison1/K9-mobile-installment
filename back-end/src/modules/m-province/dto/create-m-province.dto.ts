import { PickType } from '@nestjs/swagger';
import { MProvince } from '../entities/m-province.entity';

export class CreateMProvinceDto extends PickType(MProvince, [
  'id',
  'name',
] as const) {}
