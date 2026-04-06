import { PickType } from '@nestjs/swagger';
import { Expense } from '../entities/expense.entity';

export class CreateExpenseDto extends PickType(Expense, [
  'code',
  'price',
  'type',
  'expenseTypeId',
  'branchId',
  'createByUserId',
  'active',
] as const) {}
