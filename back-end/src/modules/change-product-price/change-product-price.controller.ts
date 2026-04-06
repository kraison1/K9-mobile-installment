import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChangeProductPriceService } from './change-product-price.service';
import { CreateChangeProductPriceDto } from './dto/create-change-product-price.dto';

import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard'; // Assuming you use JWT Guard as well
import { UseGuards } from '@nestjs/common';
import { ChangeProductPriceSearchDto } from 'src/helper/search.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ChangeProductPrice')
@Controller('change-product-price')
@UseGuards(JwtAuthGuard)
@Permissions('settings-price-adjust')
export class ChangeProductPriceController {
  constructor(
    private readonly changeProductPriceService: ChangeProductPriceService,
  ) {}

  @Post()
  create(@Body() createChangeProductPriceDto: CreateChangeProductPriceDto) {
    return this.changeProductPriceService.create(createChangeProductPriceDto);
  }

  @Post('search')
  async findAll(@Body() searchDto: ChangeProductPriceSearchDto) {
    return await this.changeProductPriceService.findAll(searchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.changeProductPriceService.findOne(+id);
  }
}
