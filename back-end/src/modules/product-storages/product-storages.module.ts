import { Module } from '@nestjs/common';
import { ProductStoragesService } from './product-storages.service';
import { ProductStoragesController } from './product-storages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductStorage } from './entities/product-storage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductStorage])],
  controllers: [ProductStoragesController],
  providers: [ProductStoragesService],
})
export class ProductStoragesModule {}
