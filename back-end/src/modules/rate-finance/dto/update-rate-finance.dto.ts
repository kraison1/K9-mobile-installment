import { PartialType } from '@nestjs/swagger';
import { CreateRateFinanceDto } from './create-rate-finance.dto';

export class UpdateRateFinanceDto extends PartialType(CreateRateFinanceDto) {}
