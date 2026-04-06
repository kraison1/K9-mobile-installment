import { Module } from '@nestjs/common';
import { PercentDownFinanceService } from './percent-down-finance.service';
import { PercentDownFinanceController } from './percent-down-finance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PercentDownFinance } from './entities/percent-down-finance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PercentDownFinance])],
  controllers: [PercentDownFinanceController],
  providers: [PercentDownFinanceService],
})
export class PercentDownFinanceModule {}
