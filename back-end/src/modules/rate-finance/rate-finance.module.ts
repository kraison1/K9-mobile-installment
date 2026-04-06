import { Module } from '@nestjs/common';
import { RateFinanceService } from './rate-finance.service';
import { RateFinanceController } from './rate-finance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateFinance } from './entities/rate-finance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RateFinance])],
  controllers: [RateFinanceController],
  providers: [RateFinanceService],
})
export class RateFinanceModule {}
