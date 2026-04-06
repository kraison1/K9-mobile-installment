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
  Res,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductSaleSearchDto, ProductSearchDto } from 'src/helper/search.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { FastifyRequest, FastifyReply } from 'fastify';

@ApiTags('Product')
@Controller('products')
@UseGuards(JwtAuthGuard)
@Permissions('inventory-mobile', 'inventory-accessory', 'inventory-repair')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.productService.create(req);
  }

  @Post('/createMultiple')
  createMultiple(@Body() createProductDto: CreateProductDto[]) {
    return this.productService.createMultiple(createProductDto);
  }

  @Post('search')
  async findAll(
    @Body() searchProductDto: ProductSearchDto,
    @Req() req: FastifyRequest,
  ) {
    return await this.productService.findAll(searchProductDto, req);
  }

  @Post('searchSales')
  async findAllSales(
    @Body() searchDto: ProductSaleSearchDto,
    @Req() req: FastifyRequest,
  ) {
    return await this.productService.findAllSales(searchDto, req);
  }

  @Post('selectBy')
  getSelectBy(@Body() body: { catalogsRaw: string; brandIds: string[] }) {
    return this.productService.getSelectByCatalog(body);
  }

  @Get('/select/:branchId/:catalog/:search/:active')
  getSelect(
    @Param('branchId') branchId: number,
    @Param('catalog') catalog: string,
    @Param('search') search: string,
    @Param('active') active: string,
    @Req() req: FastifyRequest,
  ) {
    return this.productService.getSelect(
      branchId,
      catalog,
      search,
      active,
      req,
    );
  }

  @Get('/printStock/:branchId/:catalog')
  async printStock(
    @Param('branchId') branchId: number,
    @Param('catalog') catalog: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    try {
      const pdfBuffer = await this.productService.printStock({
        branchId,
        catalog,
        req,
      });

      res
        .header('Content-Type', 'application/pdf')
        .header(
          'Content-Disposition',
          `attachment; filename="stocks-lists-${branchId}.pdf"`,
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

  @Get('/scanProduct/:branchId/:catalog/:search/:active')
  getScan(
    @Param('branchId') branchId: number,
    @Param('catalog') catalog: string,
    @Param('search') search: string,
    @Param('active') active: string,
    @Req() req: FastifyRequest,
  ) {
    return this.productService.getScan(branchId, catalog, search, active, req);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productService.findOne(+id);
  }

  @Post('findAccessibilityByProductId/:id')
  findAccessibilityByProductId(
    @Param('id') id: number,
    @Req() req: FastifyRequest,
  ) {
    return this.productService.findAccessibilityByProductId(+id, req);
  }

  @Patch(':id')
  // update(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto) {
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.productService.update(+id, req);
  }

  @Post('updateProductBuy/:id')
  updateProductBuy(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.productService.updateProductBuy(+id, req);
  }

  @Permissions('can-deleted')
  @Delete(':id')
  async delete(@Param('id') id: number, @Req() req: FastifyRequest) {
    return await this.productService.delete(id, req);
  }
}
