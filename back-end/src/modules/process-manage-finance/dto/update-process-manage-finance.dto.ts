import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProcessManageFinanceDto } from './create-process-manage-finance.dto';

export class UpdateProcessManageFinanceDto extends PartialType(
  CreateProcessManageFinanceDto,
) {
  @ApiProperty({ default: 1 })
  id: number;
}
