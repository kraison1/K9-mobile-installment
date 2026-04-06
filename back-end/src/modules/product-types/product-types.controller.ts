import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProductTypeService } from './product-types.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { ProductTypeSearchDto } from 'src/helper/search.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ProductType')
@Controller('product-types')
@UseGuards(JwtAuthGuard)
export class ProductTypeController {
  constructor(private readonly productTypesService: ProductTypeService) {}

  @Permissions('settings-product-type')
  @Post()
  create(@Body() createProductTypeDto: CreateProductTypeDto) {
    return this.productTypesService.create(createProductTypeDto);
  }

  @Permissions('settings-product-type')
  @Post('search')
  async findAll(@Body() searchProductTypeDto: ProductTypeSearchDto) {
    return await this.productTypesService.findAll(searchProductTypeDto);
  }

  @Get('/select/:catalog')
  getSelect(@Param('catalog') catalog: string) {
    return this.productTypesService.getSelect(catalog);
  }

  @Permissions('settings-product-type')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productTypesService.findOne(+id);
  }

  @Get('findByUnit/:productUnitId')
  findByUnit(@Param('productUnitId') productUnitId: string) {
    return this.productTypesService.findByUnit(+productUnitId);
  }

  @Permissions('settings-product-type')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductTypeDto: UpdateProductTypeDto,
  ) {
    return this.productTypesService.update(+id, updateProductTypeDto);
  }
}
