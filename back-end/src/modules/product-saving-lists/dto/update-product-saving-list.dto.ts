import { PartialType } from '@nestjs/swagger';
import { CreateProductSavingListDto } from './create-product-saving-list.dto';

export class UpdateProductSavingListDto extends PartialType(CreateProductSavingListDto) {}
