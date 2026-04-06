import { Controller } from '@nestjs/common';
import { ProcessSavingImagesService } from './process-saving-images.service';

@Controller('process-saving-images')
export class ProcessSavingImagesController {
  constructor(
    private readonly processSavingImagesService: ProcessSavingImagesService,
  ) {}
}
