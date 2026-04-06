import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateExpenseImageDto } from './create-expense-image.dto';

export class UpdateExpenseImageDto extends PartialType(CreateExpenseImageDto) {
  @ApiProperty({ default: 1 })
  id: number;
}
