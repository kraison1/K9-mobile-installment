import { PickType } from '@nestjs/swagger';
import { ExpenseType } from '../entities/expense-type.entity';

export class CreateExpenseTypeDto extends PickType(ExpenseType, [
  'code',
  'name',
  'type',
  'active',
] as const) {}
