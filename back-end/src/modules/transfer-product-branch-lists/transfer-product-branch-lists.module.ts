import { Module } from '@nestjs/common';
import { TransferProductBranchListsService } from './transfer-product-branch-lists.service';
import { TransferProductBranchListsController } from './transfer-product-branch-lists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferProductBranchList } from './entities/transfer-product-branch-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransferProductBranchList])],
  controllers: [TransferProductBranchListsController],
  providers: [TransferProductBranchListsService],
})
export class TransferProductBranchListsModule {}
