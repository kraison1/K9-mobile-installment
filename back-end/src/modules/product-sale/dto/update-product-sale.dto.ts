import { PartialType } from '@nestjs/swagger';
import { CreateProductSaleDto } from './create-product-sale.dto';

export class UpdateProductSaleDto extends PartialType(CreateProductSaleDto) {}
