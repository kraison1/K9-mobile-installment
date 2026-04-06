import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RateFinanceService } from './rate-finance.service';
import { CreateRateFinanceDto } from './dto/create-rate-finance.dto';
import { UpdateRateFinanceDto } from './dto/update-rate-finance.dto';
import { RateFinanceSearchDto } from 'src/helper/search.dto'; // Assuming you use a similar SearchDto
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('RateFinance')
@Controller('rate-finance')
@UseGuards(JwtAuthGuard)
export class RateFinanceController {
  constructor(private readonly rateFinanceService: RateFinanceService) {}

  @Permissions('settings-finance-rate-rent')
  @Post()
  create(@Body() createRateFinanceDto: CreateRateFinanceDto) {
    return this.rateFinanceService.create(createRateFinanceDto);
  }

  @Permissions('settings-finance-rate-rent')
  @Post('search')
  async findAll(@Body() searchDto: RateFinanceSearchDto) {
    return await this.rateFinanceService.findAll(searchDto);
  }

  @Get('/select')
  getSelect() {
    return this.rateFinanceService.getSelect();
  }

  @Permissions('settings-finance-rate-rent')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rateFinanceService.findOne(+id);
  }

  @Permissions('settings-finance-rate-rent')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRateFinanceDto: UpdateRateFinanceDto,
  ) {
    return this.rateFinanceService.update(+id, updateRateFinanceDto);
  }
}
