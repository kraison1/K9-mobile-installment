import { PartialType } from '@nestjs/swagger';
import { CreatePercentDownFinanceDto } from './create-percent-down-finance.dto';

export class UpdatePercentDownFinanceDto extends PartialType(CreatePercentDownFinanceDto) {}
