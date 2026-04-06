import { PickType } from '@nestjs/swagger';
import { ExpenseImage } from '../entities/expense-image.entity';

export class CreateExpenseImageDto extends PickType(ExpenseImage, [
  'name',
  'expenseId',
  'userId',
  'seq',
] as const) {}
