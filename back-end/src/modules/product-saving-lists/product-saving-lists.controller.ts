import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductSavingListsService } from './product-saving-lists.service';
import { CreateProductSavingListDto } from './dto/create-product-saving-list.dto';
import { UpdateProductSavingListDto } from './dto/update-product-saving-list.dto';

@Controller('product-saving-lists')
export class ProductSavingListsController {
  constructor(private readonly productSavingListsService: ProductSavingListsService) {}

  @Post()
  create(@Body() createProductSavingListDto: CreateProductSavingListDto) {
    return this.productSavingListsService.create(createProductSavingListDto);
  }

  @Get()
  findAll() {
    return this.productSavingListsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productSavingListsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductSavingListDto: UpdateProductSavingListDto) {
    return this.productSavingListsService.update(+id, updateProductSavingListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productSavingListsService.remove(+id);
  }
}
