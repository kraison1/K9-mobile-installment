import { Module } from '@nestjs/common';
import { ExpenseTypeService } from './expense-types.service';
import { ExpenseTypeController } from './expense-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseType } from './entities/expense-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseType])],
  controllers: [ExpenseTypeController],
  providers: [ExpenseTypeService],
})
export class ExpenseTypeModule {}
