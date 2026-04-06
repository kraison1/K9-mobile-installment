import { PartialType } from '@nestjs/swagger';
import { CreateProductStorageDto } from './create-product-storage.dto';

export class UpdateProductStorageDto extends PartialType(CreateProductStorageDto) {}
