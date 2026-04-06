
import { PartialType } from '@nestjs/swagger';
import { CreateMDistrictDto } from './create-m-district.dto';

export class UpdateMDistrictDto extends PartialType(CreateMDistrictDto) {}
