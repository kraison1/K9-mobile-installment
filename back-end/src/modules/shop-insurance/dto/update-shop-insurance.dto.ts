import { PartialType } from '@nestjs/swagger';
import { CreateShopInsuranceDto } from './create-shop-insurance.dto';

export class UpdateShopInsuranceDto extends PartialType(CreateShopInsuranceDto) {}
