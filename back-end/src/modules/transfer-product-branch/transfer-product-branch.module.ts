import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferProductBranchService } from './transfer-product-branch.service';
import { TransferProductBranchController } from './transfer-product-branch.controller';
import { TransferProductBranch } from './entities/transfer-product-branch.entity';
import { Branch } from '../branchs/entities/branch.entity';
import { ProductLogService } from '../product-log/product-log.service';
import { ProductLog } from '../product-log/entities/product-log.entity';
import { TransferProductBranchList } from '../transfer-product-branch-lists/entities/transfer-product-branch-list.entity';
import { Product } from '../product/entities/product.entity';
import { ProductPrice } from '../product-price/entities/product-price.entity';
import { ProductImage } from '../product-image/entities/product-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransferProductBranch,
      TransferProductBranchList,
      Branch,
      ProductLog,
      Product,
      ProductPrice,
      ProductImage,
    ]),
  ],
  controllers: [TransferProductBranchController],
  providers: [TransferProductBranchService, ProductLogService],
})
export class TransferProductBranchModule {}
