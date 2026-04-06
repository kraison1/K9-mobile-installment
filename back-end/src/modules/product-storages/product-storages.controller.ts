import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProductStoragesService } from './product-storages.service';
import { CreateProductStorageDto } from './dto/create-product-storage.dto';
import { UpdateProductStorageDto } from './dto/update-product-storage.dto';
import { ProductStorageSearchDto } from 'src/helper/search.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ProductStorage')
@Controller('product-storages')
@UseGuards(JwtAuthGuard)
export class ProductStoragesController {
  constructor(
    private readonly productStoragesService: ProductStoragesService,
  ) {}

  @Permissions('settings-product-storage')
  @Post()
  create(@Body() createProductStorageDto: CreateProductStorageDto) {
    return this.productStoragesService.create(createProductStorageDto);
  }

  @Permissions('settings-product-storage')
  @Post('search')
  async findAll(@Body() searchProductStorageDto: ProductStorageSearchDto) {
    return await this.productStoragesService.findAll(searchProductStorageDto);
  }

  @Get('/select')
  getSelect() {
    return this.productStoragesService.getSelect();
  }

  @Permissions('settings-product-storage')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productStoragesService.findOne(+id);
  }

  @Permissions('settings-product-storage')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductStorageDto: UpdateProductStorageDto,
  ) {
    return this.productStoragesService.update(+id, updateProductStorageDto);
  }
}
