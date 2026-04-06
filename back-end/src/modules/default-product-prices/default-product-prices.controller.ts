import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DefaultProductPricesService } from './default-product-prices.service';
import { CreateDefaultProductPriceDto } from './dto/create-default-product-price.dto';
import { UpdateDefaultProductPriceDto } from './dto/update-default-product-price.dto';
import { DefaultProductPriceSearchDto } from 'src/helper/search.dto';

import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
@ApiTags('DefaultProductPrices')
@Controller('default-product-prices')
@UseGuards(JwtAuthGuard)
export class DefaultProductPricesController {
  constructor(
    private readonly defaultProductPriceService: DefaultProductPricesService,
  ) {}

  @Permissions('settings-product-default-price')
  @Post()
  create(@Body() createDefaultProductPricesDto: CreateDefaultProductPriceDto) {
    return this.defaultProductPriceService.create(
      createDefaultProductPricesDto,
    );
  }

  @Permissions('settings-product-default-price')
  @Post('search')
  async findAll(
    @Body() searchDefaultProductPricesDto: DefaultProductPriceSearchDto,
  ) {
    return await this.defaultProductPriceService.findAll(
      searchDefaultProductPricesDto,
    );
  }

  @Get('/select')
  getSelect() {
    return this.defaultProductPriceService.getSelect();
  }

  @Permissions('settings-product-default-price')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.defaultProductPriceService.findOne(+id);
  }

  @Permissions('settings-product-default-price')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDefaultProductPricesDto: UpdateDefaultProductPriceDto,
  ) {
    return this.defaultProductPriceService.update(
      +id,
      updateDefaultProductPricesDto,
    );
  }
}
