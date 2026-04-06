import { Module } from '@nestjs/common';
import { ProductRepairService } from './product-repair.service';
import { ProductRepairController } from './product-repair.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepair } from './entities/product-repair.entity';
import { Product } from '../product/entities/product.entity';
import { ProductLog } from '../product-log/entities/product-log.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { Branch } from '../branchs/entities/branch.entity';
import { ProductPrice } from '../product-price/entities/product-price.entity';
import { ProductRepairImage } from '../product-repair-image/entities/product-repair-image.entity';
import { ProductRepairList } from '../product-repair-lists/entities/product-repair-list.entity';
import { ProductClaim } from '../product-claim/entities/product-claim.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductRepair,
      Branch,
      Product,
      ProductLog,
      ProductPrice,
      ProductRepairList,
      ProductRepairImage,
      ProductClaim,
      ProductSale
    ]),
  ],
  controllers: [ProductRepairController],
  providers: [ProductRepairService, ProductLogService],
})
export class ProductRepairModule {}
