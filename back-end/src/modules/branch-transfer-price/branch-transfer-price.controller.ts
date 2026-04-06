import { FastifyRequest } from 'fastify';
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
import { BranchTransferPriceService } from './branch-transfer-price.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { BranchTransferPriceSearchDto } from 'src/helper/search.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('BranchTransferPrice')
@Controller('branch-transfer-price')
@UseGuards(JwtAuthGuard)
@Permissions('branch-transfer-price')
export class BranchTransferPriceController {
  constructor(
    private readonly branchTransferPriceService: BranchTransferPriceService,
  ) {}

  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.branchTransferPriceService.create(req);
  }

  @Post('search')
  async findAll(@Body() searchExpenseSearchDto: BranchTransferPriceSearchDto) {
    return await this.branchTransferPriceService.findAll(
      searchExpenseSearchDto,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.branchTransferPriceService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return await this.branchTransferPriceService.update(+id, req);
  }

  @Permissions('can-deleted')
  @Delete(':id')
  async delete(@Param('id') id: number, @Req() req: FastifyRequest) {
    return await this.branchTransferPriceService.delete(id, req);
  }
}
