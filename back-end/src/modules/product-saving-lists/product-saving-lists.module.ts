import { Module } from '@nestjs/common';
import { ProductSavingListsService } from './product-saving-lists.service';
import { ProductSavingListsController } from './product-saving-lists.controller';

@Module({
  controllers: [ProductSavingListsController],
  providers: [ProductSavingListsService],
})
export class ProductSavingListsModule {}
