import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductBrandsService } from './product-brands.service';
import { CreateProductBrandDto } from './dto/create-product-brand.dto';
import { UpdateProductBrandDto } from './dto/update-product-brand.dto';
import { ProductBrandSearchDto } from 'src/helper/search.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { FastifyRequest } from 'fastify';

@ApiTags('ProductBrand')
@Controller('product-brands')
@UseGuards(JwtAuthGuard)
export class ProductBrandsController {
  constructor(private readonly productBrandsService: ProductBrandsService) {}

  @Permissions('settings-product-brand')
  @Post()
  create(@Req() req: FastifyRequest) {
    return this.productBrandsService.create(req);
  }

  @Permissions('settings-product-brand')
  @Post('search')
  async findAll(@Body() searchProductBrandDto: ProductBrandSearchDto) {
    return await this.productBrandsService.findAll(searchProductBrandDto);
  }

  @Get('/select')
  getSelect() {
    return this.productBrandsService.getSelect();
  }

  @Get('selectBy/:catalogs')
  getSelectBy(@Param('catalogs') catalogsRaw: string) {
    let catalogs: string[];

    try {
      // รองรับรูปแบบ: ["มือถือ","อุปกรณ์เสริม"]
      catalogs = JSON.parse(decodeURIComponent(catalogsRaw));
    } catch {
      // fallback เผื่อเรียกแบบ มือถือ,อุปกรณ์เสริม
      catalogs = catalogsRaw.split(',').map((s) => s.trim());
    }

    return this.productBrandsService.getSelectByCatalog(catalogs);
  }
  
  @Permissions('settings-product-brand')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productBrandsService.findOne(+id);
  }

  @Permissions('settings-product-brand')
  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.productBrandsService.update(+id, req);
  }
}
