import { PickType } from '@nestjs/swagger';
import { MDistrict } from '../entities/m-district.entity';

export class CreateMDistrictDto extends PickType(MDistrict, [
  'id',
  'name',
  'provinceId',
] as const) {}
