import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCustomerImageDto } from './create-customer-image.dto';

export class UpdateCustomerImageDto extends PartialType(
  CreateCustomerImageDto,
) {
  @ApiProperty({ default: 1 })
  id: number;
}
