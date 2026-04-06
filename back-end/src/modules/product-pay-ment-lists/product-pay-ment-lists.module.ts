import { Module } from '@nestjs/common';
import { ProductPayMentListsService } from './product-pay-ment-lists.service';
import { ProductPayMentListsController } from './product-pay-ment-lists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPayMentList } from './entities/product-pay-ment-list.entity';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { Branch } from '../branchs/entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPayMentList, ProductSale])],
  controllers: [ProductPayMentListsController],
  providers: [ProductPayMentListsService],
})
export class ProductPayMentListsModule {}
