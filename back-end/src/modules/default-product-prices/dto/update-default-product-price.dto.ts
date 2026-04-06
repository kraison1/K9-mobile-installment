import { PartialType } from '@nestjs/swagger';
import { CreateDefaultProductPriceDto } from './create-default-product-price.dto';

export class UpdateDefaultProductPriceDto extends PartialType(CreateDefaultProductPriceDto) {}
