import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { ProcessBooksService } from './process-books.service';
import { ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { ProcessBookSearchDto } from 'src/helper/search.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ProcessBooks')
@Controller('process-books')
@UseGuards(JwtAuthGuard)
export class ProcessBooksController {
  constructor(private readonly processBooksService: ProcessBooksService) {}

  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.processBooksService.create(req);
  }

  @Permissions('booking-list')
  @Post('search')
  async findAll(@Body() searchProcessBookSearchDto: ProcessBookSearchDto) {
    return await this.processBooksService.findAll(searchProcessBookSearchDto);
  }

  @Permissions('booking-list')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.processBooksService.findOne(+id);
  }

  @Permissions('booking-list')
  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.processBooksService.update(+id, req);
  }
}
