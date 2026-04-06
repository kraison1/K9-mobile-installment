import { PartialType } from '@nestjs/swagger';
import { CreateProcessSavingDto } from './create-process-saving.dto';

export class UpdateProcessSavingDto extends PartialType(CreateProcessSavingDto) {}
