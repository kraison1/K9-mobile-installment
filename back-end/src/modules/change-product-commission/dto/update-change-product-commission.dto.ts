import { PartialType } from '@nestjs/swagger';
import { CreateChangeProductCommissionDto } from './create-change-product-commission.dto';

export class UpdateChangeProductCommissionDto extends PartialType(
  CreateChangeProductCommissionDto,
) {}
