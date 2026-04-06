import { Module } from '@nestjs/common';
import { ProcessCaseImagesService } from './process-case-images.service';
import { ProcessCaseImagesController } from './process-case-images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessCaseImage } from './entities/process-case-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessCaseImage])],
  controllers: [ProcessCaseImagesController],
  providers: [ProcessCaseImagesService],
})
export class ProcessCaseImagesModule {}
