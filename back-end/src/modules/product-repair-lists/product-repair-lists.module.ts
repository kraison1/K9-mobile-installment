import { Module } from '@nestjs/common';
import { ProductRepairListsService } from './product-repair-lists.service';
import { ProductRepairListsController } from './product-repair-lists.controller';

@Module({
  controllers: [ProductRepairListsController],
  providers: [ProductRepairListsService],
})
export class ProductRepairListsModule {}
