import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Param,
  Req,
} from '@nestjs/common';
import { ProductPayMentListsService } from './product-pay-ment-lists.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { ProductSalePayMentListSearchDto } from 'src/helper/search.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FastifyRequest } from 'fastify';

@ApiTags('ProductPayMentLists')
@Controller('product-pay-ment-lists')
export class ProductPayMentListsController {
  constructor(
    private readonly productPayMentListsService: ProductPayMentListsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Permissions('service-monthly-collect', 'contracts-list')
  @Post('search')
  async findAll(@Body() searchDto: ProductSalePayMentListSearchDto) {
    return await this.productPayMentListsService.findAll(searchDto);
  }

  @UseGuards(JwtAuthGuard)
  @Permissions('can-update-payment')
  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.productPayMentListsService.update(+id, req);
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    timeZone: 'Asia/Bangkok',
  })
  @Get('/checkPayMent')
  async checkPayMent() {
    setImmediate(async () => {
      return await this.productPayMentListsService.checkPayMent();
    });
    return { message: 'Payment check started in background' };
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM, {
    timeZone: 'Asia/Bangkok',
  })
  @Get('/checkPayMentFollow')
  async checkPayMentFollow() {
    setImmediate(async () => {
      return await this.productPayMentListsService.checkPayMentFollow();
    });
    return { message: 'Payment check started in background' };
  }
}
