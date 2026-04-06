import { PartialType } from '@nestjs/swagger';
import { CreateRatePurchaseDto } from './create-rate-purchase.dto';

export class UpdateRatePurchaseDto extends PartialType(CreateRatePurchaseDto) {}
