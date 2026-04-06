import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
  Delete,
} from '@nestjs/common';
import { WithdrawSumPriceSaleService } from './withdraw-sum-price-sale.service';
import { ApiTags } from '@nestjs/swagger';
import { WithdrawSumPriceSaleSearchDto } from 'src/helper/search.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { FastifyRequest } from 'fastify';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('WithdrawSumPriceSale')
@Controller('withdrawSumPriceSale')
@UseGuards(JwtAuthGuard)
@Permissions('accounting-withdraw')
export class WithdrawSumPriceSaleController {
  constructor(
    private readonly withdrawSumPriceSaleService: WithdrawSumPriceSaleService,
  ) {}

  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.withdrawSumPriceSaleService.create(req);
  }

  @Post('search')
  async findAll(
    @Body() searchWithdrawSumPriceSaleDto: WithdrawSumPriceSaleSearchDto,
  ) {
    return await this.withdrawSumPriceSaleService.findAll(
      searchWithdrawSumPriceSaleDto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.withdrawSumPriceSaleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.withdrawSumPriceSaleService.update(+id, req);
  }

  @Permissions('can-deleted')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.withdrawSumPriceSaleService.delete(+id);
  }
}
