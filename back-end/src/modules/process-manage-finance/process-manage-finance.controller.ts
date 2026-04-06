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
import { ProcessManageFinanceService } from './process-manage-finance.service';
import { CreateProcessManageFinanceDto } from './dto/create-process-manage-finance.dto';
import { UpdateProcessManageFinanceDto } from './dto/update-process-manage-finance.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ManageProcessManageFinanceDto } from 'src/helper/search.dto';
import { FastifyRequest } from 'fastify';

@Controller('process-manage-finance')
@UseGuards(JwtAuthGuard)
@Permissions('finance-loan-list')
export class ProcessManageFinanceController {
  constructor(
    private readonly processManageFinanceService: ProcessManageFinanceService,
  ) {}

  @Post()
  create(
    @Body() createProcessManageFinanceDto: CreateProcessManageFinanceDto,
    @Req() req: FastifyRequest,
  ) {
    return this.processManageFinanceService.create(
      createProcessManageFinanceDto,
      req,
    );
  }

  @Post('search')
  async findAll(
    @Body() manageProcessManageFinance: ManageProcessManageFinanceDto,
    @Req() req: FastifyRequest,
  ) {
    return await this.processManageFinanceService.findAll(
      manageProcessManageFinance,
      req,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.processManageFinanceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.processManageFinanceService.update(+id, req);
  }
}
