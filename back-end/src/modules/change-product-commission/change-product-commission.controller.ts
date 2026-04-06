import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChangeProductCommissionService } from './change-product-commission.service';
import { CreateChangeProductCommissionDto } from './dto/create-change-product-commission.dto';
import { ChangeProductCommissionSearchDto } from 'src/helper/search.dto'; // ใช้ SearchDto เดียวกัน
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard'; // Assuming you use JWT Guard as well
import { UseGuards } from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ChangeProductCommission')
@Controller('change-product-commission')
@UseGuards(JwtAuthGuard)
@Permissions('contracts-rent-adjust')
export class ChangeProductCommissionController {
  constructor(
    private readonly changeProductCommissionService: ChangeProductCommissionService,
  ) {}

  @Post()
  create(
    @Body() createChangeProductCommissionDto: CreateChangeProductCommissionDto,
  ) {
    return this.changeProductCommissionService.create(
      createChangeProductCommissionDto,
    );
  }

  @Post('search')
  async findAll(@Body() searchDto: ChangeProductCommissionSearchDto) {
    return await this.changeProductCommissionService.findAll(searchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.changeProductCommissionService.findOne(+id);
  }
}
