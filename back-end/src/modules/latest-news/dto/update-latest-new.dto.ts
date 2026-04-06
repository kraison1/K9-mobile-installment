import { PartialType } from '@nestjs/swagger';
import { CreateLatestNewDto } from './create-latest-new.dto';

export class UpdateLatestNewDto extends PartialType(CreateLatestNewDto) {}
