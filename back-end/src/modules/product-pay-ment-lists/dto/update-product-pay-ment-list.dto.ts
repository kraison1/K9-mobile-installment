import { PartialType } from '@nestjs/swagger';
import { CreateProductPayMentListDto } from './create-product-pay-ment-list.dto';

export class UpdateProductPayMentListDto extends PartialType(CreateProductPayMentListDto) {}
