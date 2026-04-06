import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PercentDownFinanceSearchDto } from 'src/helper/search.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { PercentDownFinanceService } from './percent-down-finance.service';
import { CreatePercentDownFinanceDto } from './dto/create-percent-down-finance.dto';
import { UpdatePercentDownFinanceDto } from './dto/update-percent-down-finance.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('PercentDownFinance')
@Controller('percent-down-finance')
@UseGuards(JwtAuthGuard)
export class PercentDownFinanceController {
  constructor(
    private readonly percentDownFinanceService: PercentDownFinanceService,
  ) {}

  @Permissions('finance-rate-activate')
  @Post()
  create(@Body() createPercentDownFinanceDto: CreatePercentDownFinanceDto) {
    return this.percentDownFinanceService.create(createPercentDownFinanceDto);
  }

  @Permissions('finance-rate-activate')
  @Post('search')
  async findAll(
    @Body() searchPercentDownFinanceDto: PercentDownFinanceSearchDto,
  ) {
    return await this.percentDownFinanceService.findAll(
      searchPercentDownFinanceDto,
    );
  }

  @Permissions('finance-rate-activate')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.percentDownFinanceService.findOne(+id);
  }

  @Get('findPrice/:productModelId/:productStorageId/:hand')
  findPrice(
    @Param('productModelId') productModelId: string,
    @Param('productStorageId') productStorageId: string,
    @Param('hand') hand: string,
  ) {
    return this.percentDownFinanceService.findPrice(
      +productModelId,
      +productStorageId,
      hand,
    );
  }

  @Permissions('finance-rate-activate')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePercentDownFinanceDto: UpdatePercentDownFinanceDto,
  ) {
    return this.percentDownFinanceService.update(
      +id,
      updatePercentDownFinanceDto,
    );
  }
}
