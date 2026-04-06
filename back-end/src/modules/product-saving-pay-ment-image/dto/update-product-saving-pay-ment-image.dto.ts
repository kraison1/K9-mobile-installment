import { PartialType } from '@nestjs/swagger';
import { CreateProductSavingPayMentImageDto } from './create-product-saving-pay-ment-image.dto';

export class UpdateProductSavingPayMentImageDto extends PartialType(CreateProductSavingPayMentImageDto) {}
