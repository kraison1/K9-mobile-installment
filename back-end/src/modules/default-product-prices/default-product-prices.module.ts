import { Module } from '@nestjs/common';
import { DefaultProductPricesService } from './default-product-prices.service';
import { DefaultProductPricesController } from './default-product-prices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultProductPrice } from './entities/default-product-price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DefaultProductPrice])],
  controllers: [DefaultProductPricesController],
  providers: [DefaultProductPricesService],
})
export class DefaultProductPricesModule {}
