import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import {
  CustomerPaymentSearchDto,
  LatestNewsSearchDto,
} from 'src/helper/search.dto';
import { LatestNewsService } from '../latest-news/latest-news.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';

import { FastifyRequest } from 'fastify';
import { ProductSaleService } from '../product-sale/product-sale.service';
import { UserService } from '../users/users.service';
import { ProductSavingService } from '../product-saving/product-saving.service';
import { CustomerPaymentListsService } from '../customer-payment-lists/customer-payment-lists.service';
import { CustomerPaymentList } from '../customer-payment-lists/entities/customer-payment-list.entity';

@Controller('customer-third-party')
export class CustomerThirdPartyController {
  constructor(
    private readonly latestNewsService: LatestNewsService,
    private readonly productSaleService: ProductSaleService,
    private readonly productSavingService: ProductSavingService,
    private readonly userService: UserService,
    private readonly customerPaymentListsService: CustomerPaymentListsService,
  ) {}

  @Post('latest-news/search')
  async findLatestNews(@Body() searchLatestNewsDto: LatestNewsSearchDto) {
    return await this.latestNewsService.findAll(searchLatestNewsDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('findRental/search')
  async findRental(@Req() req: FastifyRequest) {
    return await this.productSaleService.findRental(req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getPayDown/:code')
  getPayDown(@Param('code') code: string, @Req() req: FastifyRequest) {
    return this.productSaleService.getCustomerPayDown(code, req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('findSaving/search')
  async findSaving(@Req() req: FastifyRequest) {
    return await this.productSavingService.findSaving(req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getPaySaving/:code')
  getPaySaving(@Param('code') code: string, @Req() req: FastifyRequest) {
    return this.productSavingService.getPaySaving(code, req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('findInfo')
  async findUser(@Req() req: FastifyRequest) {
    return await this.userService.findUser(req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('addPayment')
  async addPayment(@Req() req: FastifyRequest) {
    return await this.customerPaymentListsService.create(req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('fetchPayment/search')
  async fetchPayment(
    @Body() searchCustomerPaymentDto: CustomerPaymentSearchDto,
    @Req() req: FastifyRequest,
  ) {
    return await this.customerPaymentListsService.findAll(
      searchCustomerPaymentDto,
      req,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('saveTokenFirebase')
  saveTokenFirebase(@Req() req: FastifyRequest) {
    return this.userService.saveTokenFirebase(req);
  }
}
