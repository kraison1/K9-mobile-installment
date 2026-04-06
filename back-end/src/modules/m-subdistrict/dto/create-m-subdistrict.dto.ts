import { PickType } from '@nestjs/swagger';
import { MSubdistrict } from '../entities/m-subdistrict.entity';

export class CreateMSubdistrictDto extends PickType(MSubdistrict, [
  'id',
  'name',
  'districtId',
  'postcode',
] as const) {}
