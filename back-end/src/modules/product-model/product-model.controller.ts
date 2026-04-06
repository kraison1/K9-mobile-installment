import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProductModelService } from './product-model.service';
import { CreateProductModelDto } from './dto/create-product-model.dto';
import { UpdateProductModelDto } from './dto/update-product-model.dto';
import { ProductModelSearchDto } from 'src/helper/search.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ProductModel')
@Controller('product-model')
@UseGuards(JwtAuthGuard)
export class ProductModelController {
  constructor(private readonly productModelService: ProductModelService) {}

  @Permissions('settings-product-model')
  @Post()
  create(@Body() createProductModelDto: CreateProductModelDto) {
    return this.productModelService.create(createProductModelDto);
  }

  @Permissions('settings-product-model')
  @Post('search')
  async findAll(@Body() searchProductModelDto: ProductModelSearchDto) {
    return await this.productModelService.findAll(searchProductModelDto);
  }

  @Get('select/:catalogs')
  getSelectByCatalog(@Param('catalogs') catalogsRaw: string) {
    let catalogs: string[];

    try {
      // รองรับรูปแบบ: ["มือถือ","อุปกรณ์เสริม"]
      catalogs = JSON.parse(decodeURIComponent(catalogsRaw));
    } catch {
      // fallback เผื่อเรียกแบบ มือถือ,อุปกรณ์เสริม
      catalogs = catalogsRaw.split(',').map((s) => s.trim());
    }

    return this.productModelService.getSelectByCatalog(catalogs);
  }

  @Permissions('settings-product-model')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productModelService.findOne(+id);
  }

  @Permissions('settings-product-model')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductModelDto: UpdateProductModelDto,
  ) {
    return this.productModelService.update(+id, updateProductModelDto);
  }
}
