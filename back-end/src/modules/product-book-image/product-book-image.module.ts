import { Module } from '@nestjs/common';
import { ProductBookImageService } from './product-book-image.service';
import { ProductBookImageController } from './product-book-image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductBookImage } from './entities/product-book-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductBookImage])],
  controllers: [ProductBookImageController],
  providers: [ProductBookImageService],
})
export class ProductBookImageModule {}
