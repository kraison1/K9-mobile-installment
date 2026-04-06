import { PartialType } from '@nestjs/swagger';
import { CreateWithdrawSumPriceSaleDto } from './create-withdraw-sum-price-sale.dto';

export class UpdateWithdrawSumPriceSaleDto extends PartialType(CreateWithdrawSumPriceSaleDto) {}
