import { PartialType, OmitType, ApiProperty } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['createByUserId'] as const),
) {
  @ApiProperty({ default: 1 })
  updateByUserId?: number;
}
