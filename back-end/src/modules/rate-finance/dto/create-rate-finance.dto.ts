import { PickType } from '@nestjs/swagger';
import { RateFinance } from '../entities/rate-finance.entity';

export class CreateRateFinanceDto extends PickType(RateFinance, [
  'name',
  'valueMonth',
  'valueEqual',
  'maximumRental',
  'percentCommission',
  'active',
] as const) {}
