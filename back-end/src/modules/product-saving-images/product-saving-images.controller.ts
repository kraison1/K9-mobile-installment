import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductSavingImagesService } from './product-saving-images.service';
import { CreateProductSavingImageDto } from './dto/create-product-saving-image.dto';
import { UpdateProductSavingImageDto } from './dto/update-product-saving-image.dto';

@Controller('product-saving-images')
export class ProductSavingImagesController {
  constructor(private readonly productSavingImagesService: ProductSavingImagesService) {}

  @Post()
  create(@Body() createProductSavingImageDto: CreateProductSavingImageDto) {
    return this.productSavingImagesService.create(createProductSavingImageDto);
  }

  @Get()
  findAll() {
    return this.productSavingImagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productSavingImagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductSavingImageDto: UpdateProductSavingImageDto) {
    return this.productSavingImagesService.update(+id, updateProductSavingImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productSavingImagesService.remove(+id);
  }
}
