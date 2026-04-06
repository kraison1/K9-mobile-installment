import { Module } from '@nestjs/common';
import { BranchTransferPriceService } from './branch-transfer-price.service';
import { BranchTransferPriceController } from './branch-transfer-price.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchTransferPrice } from './entities/branch-transfer-price.entity';
import { Branch } from '../branchs/entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BranchTransferPrice, Branch])],
  controllers: [BranchTransferPriceController],
  providers: [BranchTransferPriceService],
})
export class BranchTransferPriceModule {}
