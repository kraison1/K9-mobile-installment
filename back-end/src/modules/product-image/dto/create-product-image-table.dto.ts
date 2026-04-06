import { PickType } from '@nestjs/swagger';
import { ProductImage } from '../entities/product-image.entity';

export class CreateProductImageDto extends PickType(ProductImage, [
  'name',
  'productId',
  'isProductBuy',
  'userId',
  'seq',
] as const) {}
