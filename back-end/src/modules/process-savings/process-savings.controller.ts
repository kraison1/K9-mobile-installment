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
import { ProcessSavingsService } from './process-savings.service';
import { ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { ProcessSavingSearchDto } from 'src/helper/search.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ProcessSavings')
@Controller('process-savings')
@UseGuards(JwtAuthGuard)
export class ProcessSavingsController {
  constructor(private readonly processSavingsService: ProcessSavingsService) {}

  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.processSavingsService.create(req);
  }

  @Permissions('saving-process')
  @Post('search')
  async findAll(@Body() searchProcessSavingSearchDto: ProcessSavingSearchDto) {
    return await this.processSavingsService.findAll(
      searchProcessSavingSearchDto,
    );
  }

  @Permissions('saving-process')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.processSavingsService.findOne(+id);
  }

  @Permissions('saving-process')
  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.processSavingsService.update(+id, req);
  }
}
