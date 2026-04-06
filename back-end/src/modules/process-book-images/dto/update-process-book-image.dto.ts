import { PartialType } from '@nestjs/swagger';
import { CreateProcessBookImageDto } from './create-process-book-image.dto';

export class UpdateProcessBookImageDto extends PartialType(CreateProcessBookImageDto) {}
