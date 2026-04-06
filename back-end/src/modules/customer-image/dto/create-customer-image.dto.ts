import { PickType } from '@nestjs/swagger';
import { CustomerImage } from '../entities/customer-image.entity';

export class CreateCustomerImageDto extends PickType(CustomerImage, [
  'name',
  'customerId',
  'userId',
  'seq',
] as const) {}
