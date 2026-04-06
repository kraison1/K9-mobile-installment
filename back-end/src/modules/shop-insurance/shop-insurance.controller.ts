import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ShopInsuranceService } from './shop-insurance.service';
import { CreateShopInsuranceDto } from './dto/create-shop-insurance.dto';
import { UpdateShopInsuranceDto } from './dto/update-shop-insurance.dto';
import { ApiTags } from '@nestjs/swagger';
import { ShopInsuranceSearchDto } from 'src/helper/search.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ShopInsurance')
@Controller('shop-insurance')
@UseGuards(JwtAuthGuard)
export class ShopInsuranceController {
  constructor(private readonly shopInsuranceService: ShopInsuranceService) {}

  @Permissions('shop-insurance')
  @Post()
  create(@Body() createExpenseTypeDto: CreateShopInsuranceDto) {
    return this.shopInsuranceService.create(createExpenseTypeDto);
  }

  @Permissions('shop-insurance')
  @Post('search')
  async findAll(@Body() searchShopInsurance: ShopInsuranceSearchDto) {
    return await this.shopInsuranceService.findAll(searchShopInsurance);
  }

  @Get('/select')
  getSelect() {
    return this.shopInsuranceService.getSelect();
  }

  @Permissions('shop-insurance')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shopInsuranceService.findOne(+id);
  }

  @Permissions('shop-insurance')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseTypeDto: UpdateShopInsuranceDto,
  ) {
    return this.shopInsuranceService.update(+id, updateExpenseTypeDto);
  }
}
