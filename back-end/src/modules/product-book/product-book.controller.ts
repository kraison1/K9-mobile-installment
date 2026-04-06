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
import { ProductBookService } from './product-book.service';
import { CreateProductBookDto } from './dto/create-product-book.dto';
import { UpdateProductBookDto } from './dto/update-product-book.dto';
import { ProductBookSearchDto } from 'src/helper/search.dto'; // Assuming you use a similar SearchDto
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ProductBook')
@Controller('product-book')
@UseGuards(JwtAuthGuard)
@Permissions('books-lists')
export class ProductBookController {
  constructor(private readonly productBookService: ProductBookService) {}

  @Post()
  async create(@Req() req: FastifyRequest) {
    return this.productBookService.create(req);
  }

  @Post('search')
  async findAll(
    @Body() searchDto: ProductBookSearchDto,
    @Req() req: FastifyRequest,
  ) {
    return await this.productBookService.findAll(searchDto, req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productBookService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.productBookService.update(+id, req);
  }
}
