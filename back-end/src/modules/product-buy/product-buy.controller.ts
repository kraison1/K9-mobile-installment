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
} from '@nestjs/common';
import { ProductBuyService } from './product-buy.service';
import { CreateProductBuyDto } from './dto/create-product-buy.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { ProductBuySearchDto } from 'src/helper/search.dto';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ProductBuy')
@Controller('product-buy')
@UseGuards(JwtAuthGuard)
@Permissions('purchase-mobile', 'purchase-accessory')
export class ProductBuyController {
  constructor(private readonly productBuyService: ProductBuyService) {}

  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.productBuyService.create(req);
  }

  @Post('search')
  async findAll(@Body() searchDto: ProductBuySearchDto) {
    return await this.productBuyService.findAll(searchDto);
  }

  @Get('/reportListBuy/:status/:branchId/:startDate/:endDate')
  async reportListBuy(
    @Param('status') status: string,
    @Param('branchId') branchId: number,
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    try {
      const pdfBuffer = await this.productBuyService.reportListBuy({
        status,
        branchId,
        startDate,
        endDate,
        req,
      });

      res
        .header('Content-Type', 'application/pdf')
        .header(
          'Content-Disposition',
          `attachment; filename="buy-lists-${branchId}-${status}.pdf"`,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productBuyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.productBuyService.update(+id, req);
  }
}
