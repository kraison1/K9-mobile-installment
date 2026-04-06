import { PartialType } from '@nestjs/swagger';
import { CreateProductSavingDto } from './create-product-saving.dto';

export class UpdateProductSavingDto extends PartialType(CreateProductSavingDto) {}
