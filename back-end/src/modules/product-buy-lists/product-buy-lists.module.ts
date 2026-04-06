import { Module } from '@nestjs/common';
import { ProductBuyListsService } from './product-buy-lists.service';
import { ProductBuyListsController } from './product-buy-lists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductBuyLists } from './entities/product-buy-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductBuyLists])],
  controllers: [ProductBuyListsController],
  providers: [ProductBuyListsService],
})
export class ProductBuyListsModule {}
