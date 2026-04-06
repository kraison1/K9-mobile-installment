import { PartialType } from '@nestjs/swagger';
import { CreateProductSaleImageDto } from './create-product-sale-image.dto';

export class UpdateProductSaleImageDto extends PartialType(CreateProductSaleImageDto) {}
