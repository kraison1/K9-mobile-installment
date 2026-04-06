import { PartialType } from '@nestjs/swagger';
import { CreateProductRepairListDto } from './create-product-repair-list.dto';

export class UpdateProductRepairListDto extends PartialType(CreateProductRepairListDto) {}
