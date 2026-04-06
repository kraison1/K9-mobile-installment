import { PartialType } from '@nestjs/swagger';
import { CreateCustomerThirdPartyDto } from './create-customer-third-party.dto';

export class UpdateCustomerThirdPartyDto extends PartialType(CreateCustomerThirdPartyDto) {}
