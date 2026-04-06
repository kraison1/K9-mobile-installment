import { PartialType } from '@nestjs/swagger';
import { CreateChangeProductPriceDto } from './create-change-product-price.dto';

export class UpdateChangeProductPriceDto extends PartialType(CreateChangeProductPriceDto) {}
