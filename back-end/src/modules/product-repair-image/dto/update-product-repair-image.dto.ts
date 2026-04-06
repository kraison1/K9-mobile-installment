import { PartialType } from '@nestjs/swagger';
import { CreateProductRepairImageDto } from './create-product-repair-image.dto';

export class UpdateProductRepairImageDto extends PartialType(CreateProductRepairImageDto) {}
