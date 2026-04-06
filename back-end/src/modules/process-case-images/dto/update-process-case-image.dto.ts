import { PartialType } from '@nestjs/swagger';
import { CreateProcessCaseImageDto } from './create-process-case-image.dto';

export class UpdateProcessCaseImageDto extends PartialType(CreateProcessCaseImageDto) {}
