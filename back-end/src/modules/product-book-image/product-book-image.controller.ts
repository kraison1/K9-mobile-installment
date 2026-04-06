import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductBookImageService } from './product-book-image.service';
import { CreateProductBookImageDto } from './dto/create-product-book-image.dto';
import { UpdateProductBookImageDto } from './dto/update-product-book-image.dto';

@Controller('product-book-image')
export class ProductBookImageController {
  constructor(private readonly productBookImageService: ProductBookImageService) {}

  @Post()
  create(@Body() createProductBookImageDto: CreateProductBookImageDto) {
    return this.productBookImageService.create(createProductBookImageDto);
  }

  @Get()
  findAll() {
    return this.productBookImageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productBookImageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductBookImageDto: UpdateProductBookImageDto) {
    return this.productBookImageService.update(+id, updateProductBookImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productBookImageService.remove(+id);
  }
}
