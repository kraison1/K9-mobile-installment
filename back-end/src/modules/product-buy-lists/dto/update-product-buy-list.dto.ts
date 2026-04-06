import { PartialType } from '@nestjs/swagger';
import { CreateProductBuyListDto } from './create-product-buy-list.dto';

export class UpdateProductBuyListDto extends PartialType(CreateProductBuyListDto) {}
