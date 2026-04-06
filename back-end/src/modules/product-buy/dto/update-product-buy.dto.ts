import { PartialType } from '@nestjs/swagger';
import { CreateProductBuyDto } from './create-product-buy.dto';

export class UpdateProductBuyDto extends PartialType(CreateProductBuyDto) {}
