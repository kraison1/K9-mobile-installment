import { PickType } from '@nestjs/swagger';
import { Bank } from '../entities/bank.entity';

export class CreateBankDto extends PickType(Bank, [
  'bankName',
  'bankNo',
  'bankOwner',
  'priceAll',
  'branchId',
  'priceLimit',
  'priceCurrent',
  'isFirstTransfer',
  'active',
  'fileBank',
] as const) {}
