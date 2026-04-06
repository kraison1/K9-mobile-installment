import { Module } from '@nestjs/common';
import { RatePurchaseService } from './rate-purchase.service';
import { RatePurchaseController } from './rate-purchase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatePurchase } from './entities/rate-purchase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RatePurchase])],
  controllers: [RatePurchaseController],
  providers: [RatePurchaseService],
})
export class RatePurchaseModule {}
