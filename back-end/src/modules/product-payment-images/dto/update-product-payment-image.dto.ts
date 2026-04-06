import { PartialType } from '@nestjs/swagger';
import { CreateProductPaymentImageDto } from './create-product-payment-image.dto';

export class UpdateProductPaymentImageDto extends PartialType(CreateProductPaymentImageDto) {}
