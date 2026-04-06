import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Res,
  Delete,
} from '@nestjs/common';
import { ProductSaleService } from './product-sale.service';
import { ProductSaleSearchDto } from 'src/helper/search.dto'; // Assuming you use a similar SearchDto
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ProductSale')
@Controller('product-sale')
@UseGuards(JwtAuthGuard)
@Permissions('summary-paymentlist', 'contacts-payDown', 'sales')
export class ProductSaleController {
  constructor(private readonly productSaleService: ProductSaleService) {}

  @Post()
  // create(@Body() createProductSaleDto: CreateProductSaleDto) {
  async create(@Req() req: FastifyRequest) {
    return this.productSaleService.create(req);
  }

  @Post('search')
  async findAll(@Body() searchDto: ProductSaleSearchDto) {
    return await this.productSaleService.findAll(searchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productSaleService.findOne(+id);
  }

  @Get('notifyContact/:id/:type')
  notifyContact(@Param('id') id: string, @Param('type') type: string) {
    return this.productSaleService.notifyContact(+id, type);
  }

  @Get('/reportProductById/:id')
  async reportProductById(
    @Param('id') id: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    // return this.productSaleService.reportProductById(+id);
    try {
      const pdfBuffer = await this.productSaleService.reportProductById(
        +id,
        req,
      );

      res
        .header('Content-Type', 'application/pdf')
        .header(
          'Content-Disposition',
          `attachment; filename="report-product-${id}.pdf"`,
        )
        .header('Content-Length', pdfBuffer.length.toString())
        .send(pdfBuffer);
    } catch (error) {
      res.status(error.status || 500).send({
        statusCode: error.status || 500,
        message: error.message,
        error: error.name || 'Internal Server Error',
      });
    }
  }

  @Get('/getPayDown/:code')
  getPayDown(@Param('code') code: string, @Req() req: FastifyRequest) {
    return this.productSaleService.getPayDown(code, req);
  }

  @Get('/printPaymentList/:branchId/:startDate/:endDate/:paymentStatus')
  async printPaymentList(
    @Param('branchId') branchId: number,
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string,
    @Param('paymentStatus') paymentStatus: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    try {
      const pdfBuffer = await this.productSaleService.printPaymentList({
        branchId,
        startDate,
        endDate,
        paymentStatus,
        req,
      });

      res
        .header('Content-Type', 'application/pdf')
        .header(
          'Content-Disposition',
          `attachment; filename="payment-list-${branchId}-${paymentStatus}.pdf"`,
        )
        .header('Content-Length', pdfBuffer.length.toString())
        .send(pdfBuffer);
    } catch (error) {
      res.status(error.status || 500).send({
        statusCode: error.status || 500,
        message: error.message,
        error: error.name || 'Internal Server Error',
      });
    }
  }

  // @Get('/printAccessibilityList/:branchId/:startDate/:endDate/:paymentStatus')
  @Get('/printAccessibilityList/:branchId/:startDate/:endDate')
  async printAccessibilityList(
    @Param('branchId') branchId: number,
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string,
    // @Param('paymentStatus') paymentStatus: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    try {
      const pdfBuffer = await this.productSaleService.printAccessibilityList({
        branchId,
        startDate,
        endDate,
        // paymentStatus,
        req,
      });

      res
        .header('Content-Type', 'application/pdf')
        .header(
          'Content-Disposition',
          // `attachment; filename="payment-list-${branchId}-${paymentStatus}.pdf"`,
          `attachment; filename="payment-list-${branchId}.pdf"`,
        )
        .header('Content-Length', pdfBuffer.length.toString())
        .send(pdfBuffer);
    } catch (error) {
      res.status(error.status || 500).send({
        statusCode: error.status || 500,
        message: error.message,
        error: error.name || 'Internal Server Error',
      });
    }
  }

  @Permissions('profit')
  @Post('/getProfit')
  async getProfit(@Req() req: FastifyRequest) {
    return await this.productSaleService.getProfit(req);
  }

  @Permissions('summary-paymentlist')
  @Post('/getSummaryProfit')
  async getSummaryProfit(@Req() req: FastifyRequest) {
    return await this.productSaleService.getSummaryProfit(req);
  }

  @Get('/printContract/:id/:financeId')
  async printContract(
    @Param('id') id: string,
    @Param('financeId') financeId: string,

    @Res() res: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    try {
      const pdfBuffer = await this.productSaleService.printContract(
        +id,
        +financeId,
        req,
      );
      res
        .header('Content-Type', 'application/pdf')
        .header(
          'Content-Disposition',
          `attachment; filename="contract-${id}.pdf"`,
        )
        .header('Content-Length', pdfBuffer.length.toString())
        .send(pdfBuffer);
    } catch (error) {
      res.status(error.status || 500).send({
        statusCode: 200,
        message: error.message,
        error: error.name || 'Internal Server Error',
      });
    }
  }

  @Get('/printSlip/:id')
  async printSlip(
    @Param('id') id: string,
    @Res() res: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    try {
      const pdfBuffer = await this.productSaleService.printSlip(+id, req);
      res
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="slip-${id}.pdf"`)
        .header('Content-Length', pdfBuffer.length.toString())
        .send(pdfBuffer);
    } catch (error) {
      res.status(error.status || 500).send({
        statusCode: 200,
        message: error.message,
        error: error.name || 'Internal Server Error',
      });
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.productSaleService.update(+id, req);
  }

  @Patch('/changeStatus/:id')
  changeStatus(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.productSaleService.changeStatus(+id, req);
  }

  @Permissions('can-deleted')
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.productSaleService.delete(+id, req);
  }

  // @Get('/testTelegram/:code')
  // testTelegram(@Param('code') code: string) {
  //   return this.productSaleService.testTelegram(code);
  // }

  // @Get('/returnAcc')
  // returnAcc() {
  //   return this.productSaleService.returnAcc();
  // }
}
