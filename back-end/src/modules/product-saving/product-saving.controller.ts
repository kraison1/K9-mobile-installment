import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ProductSavingService } from './product-saving.service';
import { ApiTags } from '@nestjs/swagger';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductSavingSearchDto } from 'src/helper/search.dto'; // Assuming you use a similar SearchDto

@ApiTags('productSaving')
@Controller('product-saving')
@UseGuards(JwtAuthGuard)
@Permissions('saving-list')
export class ProductSavingController {
  constructor(private readonly productSavingService: ProductSavingService) {}

  @Post()
  async create(@Req() req: FastifyRequest) {
    return this.productSavingService.create(req);
  }

  @Get('/getPaySaving/:code')
  getPaySaving(@Param('code') code: string, @Req() req: FastifyRequest) {
    return this.productSavingService.getPaySaving(code, req);
  }

  @Post('search')
  async findAll(@Body() searchDto: ProductSavingSearchDto) {
    return await this.productSavingService.findAll(searchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productSavingService.findOne(+id);
  }
}
