import { PartialType } from '@nestjs/swagger';
import { CreateProductBookImageDto } from './create-product-book-image.dto';

export class UpdateProductBookImageDto extends PartialType(CreateProductBookImageDto) {}
