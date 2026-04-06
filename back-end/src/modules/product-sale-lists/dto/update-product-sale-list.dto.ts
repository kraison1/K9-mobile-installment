import { PartialType } from '@nestjs/swagger';
import { CreateProductSaleListDto } from './create-product-sale-list.dto';

export class UpdateProductSaleListDto extends PartialType(CreateProductSaleListDto) {}
