import { Module } from '@nestjs/common';
import { ProcessBookImagesService } from './process-book-images.service';
import { ProcessBookImagesController } from './process-book-images.controller';
import { ProcessBookImage } from './entities/process-book-image.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessBookImage])],
  controllers: [ProcessBookImagesController],
  providers: [ProcessBookImagesService],
})
export class ProcessBookImagesModule {}
