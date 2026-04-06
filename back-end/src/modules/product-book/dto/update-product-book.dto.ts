import { PartialType } from '@nestjs/swagger';
import { CreateProductBookDto } from './create-product-book.dto';

export class UpdateProductBookDto extends PartialType(CreateProductBookDto) {}
