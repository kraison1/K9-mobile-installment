import { Module } from '@nestjs/common';
import { ProductClaimService } from './product-claim.service';
import { ProductClaimController } from './product-claim.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductClaim } from './entities/product-claim.entity';
import { Branch } from '../branchs/entities/branch.entity';
import { Product } from '../product/entities/product.entity';
import { ProductPrice } from '../product-price/entities/product-price.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { ProductLog } from '../product-log/entities/product-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductClaim,
      Branch,
      Product,
      ProductPrice,
      ProductLog,
    ]),
  ],
  controllers: [ProductClaimController],
  providers: [ProductClaimService, ProductLogService],
})
export class ProductClaimModule {}
