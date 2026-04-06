import { Module } from '@nestjs/common';
import { ProductSaleListsService } from './product-sale-lists.service';
import { ProductSaleListsController } from './product-sale-lists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSaleList } from './entities/product-sale-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSaleList])],
  controllers: [ProductSaleListsController],
  providers: [ProductSaleListsService],
})
export class ProductSaleListsModule {}
