import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { ExpenseType } from '../expense-types/entities/expense-type.entity';
import { Branch } from '../branchs/entities/branch.entity';
import { ExpenseImage } from '../expense-images/entities/expense-image.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, ExpenseType, ExpenseImage, Branch]),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
