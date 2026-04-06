import { PartialType } from '@nestjs/swagger';
import { CreateProcessCaseDto } from './create-process-case.dto';

export class UpdateProcessCaseDto extends PartialType(CreateProcessCaseDto) {}
