import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductRepairListsService } from './product-repair-lists.service';
import { CreateProductRepairListDto } from './dto/create-product-repair-list.dto';
import { UpdateProductRepairListDto } from './dto/update-product-repair-list.dto';

@Controller('product-repair-lists')
export class ProductRepairListsController {
  constructor(private readonly productRepairListsService: ProductRepairListsService) {}

  @Post()
  create(@Body() createProductRepairListDto: CreateProductRepairListDto) {
    return this.productRepairListsService.create(createProductRepairListDto);
  }

  @Get()
  findAll() {
    return this.productRepairListsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productRepairListsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductRepairListDto: UpdateProductRepairListDto) {
    return this.productRepairListsService.update(+id, updateProductRepairListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productRepairListsService.remove(+id);
  }
}
