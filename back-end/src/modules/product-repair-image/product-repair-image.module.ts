import { Module } from '@nestjs/common';
import { ProductRepairImageService } from './product-repair-image.service';
import { ProductRepairImageController } from './product-repair-image.controller';

@Module({
  controllers: [ProductRepairImageController],
  providers: [ProductRepairImageService],
})
export class ProductRepairImageModule {}
