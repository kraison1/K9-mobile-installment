import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrController } from './ocr.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ocr } from './entities/ocr.entity';
import { Product } from '../product/entities/product.entity';
import { HttpModule } from '@nestjs/axios';
import { Branch } from '../branchs/entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ocr, Product, Branch]), HttpModule],
  controllers: [OcrController],
  providers: [OcrService],
})
export class OcrModule {}
