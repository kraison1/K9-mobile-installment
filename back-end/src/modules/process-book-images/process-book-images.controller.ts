import { Controller } from '@nestjs/common';
import { ProcessBookImagesService } from './process-book-images.service';

@Controller('process-book-images')
export class ProcessBookImagesController {
  constructor(
    private readonly processBookImagesService: ProcessBookImagesService,
  ) {}
}
