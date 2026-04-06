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
import { ProcessCasesService } from './process-cases.service';
import { ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { ProcessCaseSearchDto } from 'src/helper/search.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ProcessCases')
@Controller('process-cases')
@UseGuards(JwtAuthGuard)
export class ProcessCasesController {
  constructor(private readonly processCasesService: ProcessCasesService) {}

  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.processCasesService.create(req);
  }

  @Permissions('booking-process')
  @Post('search')
  async findAll(@Body() searchProcessCaseSearchDto: ProcessCaseSearchDto) {
    return await this.processCasesService.findAll(searchProcessCaseSearchDto);
  }

  @Permissions('booking-process')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.processCasesService.findOne(+id);
  }

  @Permissions('booking-process')
  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.processCasesService.update(+id, req);
  }
}
