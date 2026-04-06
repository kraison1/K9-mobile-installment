import { PartialType } from '@nestjs/swagger';
import { CreateProcessSavingImageDto } from './create-process-saving-image.dto';

export class UpdateProcessSavingImageDto extends PartialType(CreateProcessSavingImageDto) {}
