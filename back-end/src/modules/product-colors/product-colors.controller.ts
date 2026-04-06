import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProductColorsService } from './product-colors.service';
import { CreateProductColorDto } from './dto/create-product-color.dto';
import { UpdateProductColorDto } from './dto/update-product-color.dto';
import { ProductColorSearchDto } from 'src/helper/search.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ProductColor')
@Controller('product-colors')
@UseGuards(JwtAuthGuard)
export class ProductColorsController {
  constructor(private readonly productColorsService: ProductColorsService) {}

  @Permissions('settings-product-color')
  @Post()
  create(@Body() createProductColorDto: CreateProductColorDto) {
    return this.productColorsService.create(createProductColorDto);
  }

  @Permissions('settings-product-color')
  @Post('search')
  async findAll(@Body() searchProductColorDto: ProductColorSearchDto) {
    return await this.productColorsService.findAll(searchProductColorDto);
  }

  @Get('/select')
  getSelect() {
    return this.productColorsService.getSelect();
  }

  @Permissions('settings-product-color')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productColorsService.findOne(+id);
  }

  @Permissions('settings-product-color')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductColorDto: UpdateProductColorDto,
  ) {
    return this.productColorsService.update(+id, updateProductColorDto);
  }
}
