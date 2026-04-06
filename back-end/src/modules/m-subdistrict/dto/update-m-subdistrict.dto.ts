
import { PartialType } from '@nestjs/swagger';
import { CreateMSubdistrictDto } from './create-m-subdistrict.dto';

export class UpdateMSubdistrictDto extends PartialType(CreateMSubdistrictDto) {}

