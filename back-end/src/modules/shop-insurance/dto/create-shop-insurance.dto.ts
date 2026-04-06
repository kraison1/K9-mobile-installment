import { PickType } from '@nestjs/swagger';
import { ShopInsurance } from '../entities/shop-insurance.entity';

export class CreateShopInsuranceDto extends PickType(ShopInsurance, [
  'name',
  'active',
] as const) {}
