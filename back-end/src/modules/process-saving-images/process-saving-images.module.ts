import { Module } from '@nestjs/common';
import { ProcessSavingImagesService } from './process-saving-images.service';
import { ProcessSavingImagesController } from './process-saving-images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessSavingImage } from './entities/process-saving-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessSavingImage])],
  controllers: [ProcessSavingImagesController],
  providers: [ProcessSavingImagesService],
})
export class ProcessSavingImagesModule {}
