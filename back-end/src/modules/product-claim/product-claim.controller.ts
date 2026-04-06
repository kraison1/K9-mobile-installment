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
import { ProductClaimService } from './product-claim.service';
import { CreateProductClaimDto } from './dto/create-product-claim.dto';
import { UpdateProductClaimDto } from './dto/update-product-claim.dto';

import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { ClaimSearchDto } from 'src/helper/search.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { FastifyRequest, FastifyReply } from 'fastify';

@ApiTags('ProductClaim')
@Controller('product-claim')
@UseGuards(JwtAuthGuard)
@Permissions('claim-mobile')
export class ProductClaimController {
  constructor(private readonly productClaimService: ProductClaimService) {}

  @Post('search')
  async findAll(@Body() searchClaimSearchDto: ClaimSearchDto) {
    return await this.productClaimService.findAll(searchClaimSearchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productClaimService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.productClaimService.update(+id, req);
  }

  @Post('/printClaimsPdf')
  async printClaimsPdf(@Res() res: FastifyReply, @Req() req: FastifyRequest) {
    try {
      const pdfBuffer = await this.productClaimService.printClaimsPdf(req);
      res
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="Claim.pdf"`)
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
}
