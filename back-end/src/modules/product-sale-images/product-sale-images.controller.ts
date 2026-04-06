import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductSaleImagesService } from './product-sale-images.service';
import { CreateProductSaleImageDto } from './dto/create-product-sale-image.dto';
import { UpdateProductSaleImageDto } from './dto/update-product-sale-image.dto';

@Controller('product-sale-images')
export class ProductSaleImagesController {
  constructor(private readonly productSaleImagesService: ProductSaleImagesService) {}

  @Post()
  create(@Body() createProductSaleImageDto: CreateProductSaleImageDto) {
    return this.productSaleImagesService.create(createProductSaleImageDto);
  }

  @Get()
  findAll() {
    return this.productSaleImagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productSaleImagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductSaleImageDto: UpdateProductSaleImageDto) {
    return this.productSaleImagesService.update(+id, updateProductSaleImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productSaleImagesService.remove(+id);
  }
}
