import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Delete,
} from '@nestjs/common';
import { ProductRepairService } from './product-repair.service';
import { CreateProductRepairDto } from './dto/create-product-repair.dto';
import { UpdateProductRepairDto } from './dto/update-product-repair.dto';
import { ProductRepairSearchDto } from 'src/helper/search.dto'; // Assuming you use a similar SearchDto
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { FastifyRequest } from 'fastify';

@ApiTags('ProductRepair')
@Controller('product-repair')
@UseGuards(JwtAuthGuard)
@Permissions('sales-repair')
export class ProductRepairController {
  constructor(private readonly productRepairService: ProductRepairService) {}

  @Post()
  // create(@Body() createProductRepairDto: CreateProductRepairDto) {
  async create(@Req() req: FastifyRequest) {
    return this.productRepairService.create(req);
  }

  @Post('search')
  async findAll(@Body() searchDto: ProductRepairSearchDto) {
    return await this.productRepairService.findAll(searchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productRepairService.findOne(+id);
  }

  @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateProductRepairDto: UpdateProductRepairDto,
  // ) {
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.productRepairService.update(+id, req);
  }

  @Permissions('can-deleted')
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.productRepairService.delete(+id, req);
  }
}
