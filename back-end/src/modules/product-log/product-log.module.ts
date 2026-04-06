import { Module } from '@nestjs/common';
import { ProductLogService } from './product-log.service';
import { ProductLogController } from './product-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductLog } from './entities/product-log.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductLog, Product])],
  // imports: [TypeOrmModule.forFeature([ProductLog])],
  controllers: [ProductLogController],
  providers: [ProductLogService],
})
export class ProductLogModule {}
