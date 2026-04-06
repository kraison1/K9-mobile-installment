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
import { ApiTags } from '@nestjs/swagger';
import { RatePurchaseSearchDto } from 'src/helper/search.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateRatePurchaseDto } from './dto/create-rate-purchase.dto';
import { UpdateRatePurchaseDto } from './dto/update-rate-purchase.dto';
import { RatePurchaseService } from './rate-purchase.service';
import { FastifyRequest, FastifyReply } from 'fastify';

@ApiTags('RatePurchase')
@Controller('rate-purchase')
@UseGuards(JwtAuthGuard)
@Permissions('settings-finance-rate-purchase')
export class RatePurchaseController {
  constructor(private readonly ratePurchaseService: RatePurchaseService) {}

  @Post()
  create(@Body() createRatePurchaseDto: CreateRatePurchaseDto) {
    return this.ratePurchaseService.create(createRatePurchaseDto);
  }

  @Post('search')
  async findAll(@Body() searchRatePurchaseDto: RatePurchaseSearchDto) {
    return await this.ratePurchaseService.findAll(searchRatePurchaseDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ratePurchaseService.findOne(+id);
  }

  @Get('/pefRatePurchase')
  async printRatePurchase(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    try {
      const pdfBuffer = await this.ratePurchaseService.printRatePurchase({
        req,
      });

      res
        .header('Content-Type', 'application/pdf')
        .header(
          'Content-Disposition',
          `attachment; filename="RatePurchase.pdf"`,
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

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRatePurchaseDto: UpdateRatePurchaseDto,
  ) {
    return this.ratePurchaseService.update(+id, updateRatePurchaseDto);
  }
}
