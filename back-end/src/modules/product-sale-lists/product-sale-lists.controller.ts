import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductSaleListsService } from './product-sale-lists.service';
import { CreateProductSaleListDto } from './dto/create-product-sale-list.dto';
import { UpdateProductSaleListDto } from './dto/update-product-sale-list.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('product-sale-lists')
@Permissions('productSale')
export class ProductSaleListsController {
  constructor(private readonly productSaleListsService: ProductSaleListsService) {}

  @Post()
  create(@Body() createProductSaleListDto: CreateProductSaleListDto) {
    return this.productSaleListsService.create(createProductSaleListDto);
  }

  @Get()
  findAll() {
    return this.productSaleListsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productSaleListsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductSaleListDto: UpdateProductSaleListDto) {
    return this.productSaleListsService.update(+id, updateProductSaleListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productSaleListsService.remove(+id);
  }
}
