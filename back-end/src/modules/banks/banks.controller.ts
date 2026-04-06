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
import { BankService } from './banks.service';
import { ApiTags } from '@nestjs/swagger';
import { BankSearchDto } from 'src/helper/search.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { FastifyRequest } from 'fastify';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Bank')
@Controller('banks')
@UseGuards(JwtAuthGuard)
export class BankController {
  constructor(private readonly banksService: BankService) {}

  @Permissions('settings-bank')
  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.banksService.create(req);
  }

  @Permissions('settings-bank')
  @Post('search')
  async findAll(@Body() searchBankDto: BankSearchDto) {
    return await this.banksService.findAll(searchBankDto);
  }

  @Get('/select/:bookType')
  getSelect(@Param('bookType') bookType: string, @Req() req: FastifyRequest) {
    return this.banksService.getSelect(bookType, req);
  }

  @Permissions('settings-bank')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.banksService.findOne(+id);
  }

  @Permissions('settings-bank')
  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.banksService.update(+id, req);
  }
}
