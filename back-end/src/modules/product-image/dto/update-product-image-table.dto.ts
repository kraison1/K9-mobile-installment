import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductImageDto } from './create-product-image-table.dto';

export class UpdateProductImageDto extends PartialType(CreateProductImageDto) {
  @ApiProperty({ default: 1 })
  id: number;
}
