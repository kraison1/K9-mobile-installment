import { PickType } from '@nestjs/swagger';
import { DefaultProductPrice } from '../entities/default-product-price.entity';

export class CreateDefaultProductPriceDto extends PickType(
  DefaultProductPrice,
  ['label', 'value', 'active'] as const,
) {}
