import { PartialType } from '@nestjs/swagger';
import { CreateProcessBookDto } from './create-process-book.dto';

export class UpdateProcessBookDto extends PartialType(CreateProcessBookDto) {}
