
import { PartialType } from '@nestjs/swagger';
import { CreateMProvinceDto } from './create-m-province.dto';

export class UpdateMProvinceDto extends PartialType(CreateMProvinceDto) {}
