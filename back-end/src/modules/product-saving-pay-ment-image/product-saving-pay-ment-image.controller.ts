import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Delete,
  Param,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { ProductSalePayMentImageSearchDto } from 'src/helper/search.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ProductSavingPayMentImageService } from './product-saving-pay-ment-image.service';

@ApiTags('ProductSavingPayMentImages')
@Controller('product-saving-pay-ment-image')
@UseGuards(JwtAuthGuard)
export class ProductSavingPayMentImageController {
  constructor(
    private readonly productPayMentImagesService: ProductSavingPayMentImageService,
  ) {}

  @Permissions('savings')
  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.productPayMentImagesService.create(req);
  }

  @Permissions('savings')
  @Post('search')
  async findAll(@Body() searchDto: ProductSalePayMentImageSearchDto) {
    return await this.productPayMentImagesService.findAll(searchDto);
  }

  @Permissions('can-deleted')
  @Delete(':id')
  async delete(@Param('id') id: number, @Req() req: FastifyRequest) {
    return await this.productPayMentImagesService.delete(id, req);
  }
}
