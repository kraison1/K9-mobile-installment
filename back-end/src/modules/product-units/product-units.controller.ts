import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProductUnitsService } from './product-units.service';
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';
import { ProductUnitSearchDto } from 'src/helper/search.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ProductUnit')
@Controller('product-units')
@UseGuards(JwtAuthGuard)
export class ProductUnitsController {
  constructor(private readonly productUnitsService: ProductUnitsService) {}

  @Permissions('settings-product-unit')
  @Post()
  create(@Body() createProductUnitDto: CreateProductUnitDto) {
    return this.productUnitsService.create(createProductUnitDto);
  }

  @Permissions('settings-product-unit')
  @Post('search')
  async findAll(@Body() searchProductUnitDto: ProductUnitSearchDto) {
    return await this.productUnitsService.findAll(searchProductUnitDto);
  }

  @Get('/select')
  getSelect() {
    return this.productUnitsService.getSelect();
  }

  @Permissions('settings-product-unit')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productUnitsService.findOne(+id);
  }

  @Permissions('settings-product-unit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductUnitDto: UpdateProductUnitDto,
  ) {
    return this.productUnitsService.update(+id, updateProductUnitDto);
  }
}
