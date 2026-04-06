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
import { ProductLogService } from './product-log.service';
import { CreateProductLogDto } from './dto/create-product-log.dto';
import { UpdateProductLogDto } from './dto/update-product-log.dto';
import { ProductLogSearchDto } from 'src/helper/search.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { FastifyRequest, FastifyReply } from 'fastify';

@ApiTags('ProductLog')
@Controller('product-logs')
@UseGuards(JwtAuthGuard)
@Permissions('purchase', 'reports-product')
export class ProductLogController {
  constructor(private readonly productLogService: ProductLogService) {}

  @Post()
  create(@Body() createProductLogDto: CreateProductLogDto) {
    return this.productLogService.create(createProductLogDto);
  }

  @Post('search')
  async findAll(@Body() searchProductLogDto: ProductLogSearchDto) {
    return await this.productLogService.findAll(searchProductLogDto);
  }

  @Post('/reportListBuy')
  async reportListBuy(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    try {
      const pdfBuffer = await this.productLogService.reportListBuy({
        req,
      });

      res
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="buy-lists.pdf"`)
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
    return this.productLogService.findOne(+id);
  }

  @Get('/findByProductId/:id')
  findByProductId(@Param('id') id: string) {
    return this.productLogService.findByProductId(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductLogDto: UpdateProductLogDto,
  ) {
    return this.productLogService.update(+id, updateProductLogDto);
  }
}
