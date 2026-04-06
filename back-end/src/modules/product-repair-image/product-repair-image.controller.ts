import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductRepairImageService } from './product-repair-image.service';
import { CreateProductRepairImageDto } from './dto/create-product-repair-image.dto';
import { UpdateProductRepairImageDto } from './dto/update-product-repair-image.dto';

@Controller('product-repair-image')
export class ProductRepairImageController {
  constructor(private readonly productRepairImageService: ProductRepairImageService) {}

  @Post()
  create(@Body() createProductRepairImageDto: CreateProductRepairImageDto) {
    return this.productRepairImageService.create(createProductRepairImageDto);
  }

  @Get()
  findAll() {
    return this.productRepairImageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productRepairImageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductRepairImageDto: UpdateProductRepairImageDto) {
    return this.productRepairImageService.update(+id, updateProductRepairImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productRepairImageService.remove(+id);
  }
}
