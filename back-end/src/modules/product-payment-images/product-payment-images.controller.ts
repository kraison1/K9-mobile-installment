import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Delete,
  Param,
  Get,
  Patch,
} from '@nestjs/common';
import { ProductPaymentImagesService } from './product-payment-images.service';
import { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { ProductSalePayMentImageSearchDto } from 'src/helper/search.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ProductPayMentImages')
@Controller('product-payment-images')
@UseGuards(JwtAuthGuard)
export class ProductPaymentImagesController {
  constructor(
    private readonly productPayMentImagesService: ProductPaymentImagesService,
  ) {}

  @Permissions('service-monthly-collect', 'contracts-list')
  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.productPayMentImagesService.create(req);
  }

  @Permissions('edit-image-payment')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productPayMentImagesService.findOne(+id);
  }

  @Permissions('service-monthly-collect', 'contracts-list')
  @Post('search')
  async findAll(@Body() searchDto: ProductSalePayMentImageSearchDto) {
    return await this.productPayMentImagesService.findAll(searchDto);
  }

  @Permissions('can-deleted')
  @Delete(':id')
  async delete(@Param('id') id: number, @Req() req: FastifyRequest) {
    return await this.productPayMentImagesService.delete(id, req);
  }

  @Permissions('edit-image-payment')
  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.productPayMentImagesService.update(+id, req);
  }
}
