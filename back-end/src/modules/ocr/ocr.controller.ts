import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BankSearchDto } from 'src/helper/search.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { FastifyRequest } from 'fastify';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { OcrService } from './ocr.service';

@ApiTags('Ocr')
@Controller('ocr')
@UseGuards(JwtAuthGuard)
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.ocrService.create(req);
  }

  @Post('search')
  async findAll(@Body() searchBankDto: BankSearchDto) {
    return await this.ocrService.findAll(searchBankDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ocrService.findOne(+id);
  }

  @Patch(':code')
  update(@Param('code') code: string, @Req() req: FastifyRequest) {
    return this.ocrService.update(code, req);
  }
}
