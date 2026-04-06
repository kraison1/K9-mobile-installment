import { PartialType } from '@nestjs/swagger';
import { CreateProductRepairDto } from './create-product-repair.dto';

export class UpdateProductRepairDto extends PartialType(
  CreateProductRepairDto,
) {}
