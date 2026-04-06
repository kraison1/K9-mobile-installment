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
import { LatestNewsService } from './latest-news.service';
import { ApiTags } from '@nestjs/swagger';
import { LatestNewsSearchDto } from 'src/helper/search.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { FastifyRequest } from 'fastify';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('LatestNews')
@Controller('latest-news')
@UseGuards(JwtAuthGuard)
@Permissions('settings-news')
export class LatestNewsController {
  constructor(private readonly latestNewsService: LatestNewsService) {}

  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.latestNewsService.create(req);
  }

  @Post('search')
  async findAll(@Body() searchLatestNewsDto: LatestNewsSearchDto) {
    return await this.latestNewsService.findAll(searchLatestNewsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.latestNewsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.latestNewsService.update(+id, req);
  }
}
