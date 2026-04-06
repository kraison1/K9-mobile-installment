import { PartialType } from '@nestjs/swagger';
import { CreateProductSavingImageDto } from './create-product-saving-image.dto';

export class UpdateProductSavingImageDto extends PartialType(CreateProductSavingImageDto) {}
