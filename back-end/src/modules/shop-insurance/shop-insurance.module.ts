import { Module } from '@nestjs/common';
import { ShopInsuranceService } from './shop-insurance.service';
import { ShopInsuranceController } from './shop-insurance.controller';
import { ShopInsurance } from './entities/shop-insurance.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([ShopInsurance])],
  controllers: [ShopInsuranceController],
  providers: [ShopInsuranceService],
})
export class ShopInsuranceModule {}
