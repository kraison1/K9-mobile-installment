import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { UpdateProductImageDto } from './dto/update-product-image-table.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ProductImage')
@Controller('product-images')
@UseGuards(JwtAuthGuard)
@Permissions(
  'inventory-mobile',
  'inventory-accessory',
  'inventory-repair',
)
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) {}

  @Post('/updateSeq')
  updateSeq(@Body() updateProductImageDto: UpdateProductImageDto[]) {
    return this.productImageService.updateSeq(updateProductImageDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.productImageService.delete(+id);
  }
}
