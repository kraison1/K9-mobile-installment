import { Module } from '@nestjs/common';
import { BankService } from './banks.service';
import { BankController } from './banks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bank } from './entities/bank.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bank])],
  controllers: [BankController],
  providers: [BankService],
})
export class BanksModule {}
