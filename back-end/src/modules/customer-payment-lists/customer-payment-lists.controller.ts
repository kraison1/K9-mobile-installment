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
import { ApiTags } from '@nestjs/swagger';
import { CustomerPaymentSearchDto } from 'src/helper/search.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { FastifyRequest } from 'fastify';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CustomerPaymentListsService } from './customer-payment-lists.service';
import { UpdateCustomerPaymentListDto } from './dto/update-customer-payment-list.dto';

@ApiTags('CustomerPaymentLists')
@Controller('customer-payment-lists')
@UseGuards(JwtAuthGuard)
@Permissions('service-monthly-payments')
export class CustomerPaymentListsController {
  constructor(
    private readonly customerPaymentListsService: CustomerPaymentListsService,
  ) {}

  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.customerPaymentListsService.create(req);
  }

  @Post('search')
  async findAll(
    @Body() searchCustomerPaymentDto: CustomerPaymentSearchDto,
    @Req() req: FastifyRequest,
  ) {
    return await this.customerPaymentListsService.findAll(
      searchCustomerPaymentDto,
      req,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerPaymentListsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.customerPaymentListsService.update(+id, req);
  }
}
