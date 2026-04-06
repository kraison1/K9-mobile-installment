import { PartialType } from '@nestjs/swagger';
import { CreateCustomerPaymentListDto } from './create-customer-payment-list.dto';

export class UpdateCustomerPaymentListDto extends PartialType(CreateCustomerPaymentListDto) {}
