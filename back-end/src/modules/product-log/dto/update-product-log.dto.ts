import { PartialType } from '@nestjs/swagger';
import { CreateProductLogDto } from './create-product-log.dto';

export class UpdateProductLogDto extends PartialType(CreateProductLogDto) {}
