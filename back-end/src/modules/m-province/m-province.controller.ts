import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MProvinceService } from './m-province.service';
import { CreateMProvinceDto } from './dto/create-m-province.dto';
import { UpdateMProvinceDto } from './dto/update-m-province.dto';
import { MProvinceSearchDto } from 'src/helper/search.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('MProvince')
@Controller('m-provinces')
@UseGuards(JwtAuthGuard)
export class MProvinceController {
  constructor(private readonly mProvinceService: MProvinceService) {}

  @Permissions('provinces')
  @Post()
  create(@Body() createMProvinceDto: CreateMProvinceDto) {
    return this.mProvinceService.create(createMProvinceDto);
  }

  @Permissions('provinces')
  @Post('search')
  async findAll(@Body() searchMProvinceDto: MProvinceSearchDto) {
    return await this.mProvinceService.findAll(searchMProvinceDto);
  }

  @Get('/select')
  getSelect() {
    return this.mProvinceService.getSelect();
  }

  @Permissions('provinces')
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.mProvinceService.findOne(+id);
  }

  @Permissions('provinces')
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateMProvinceDto: UpdateMProvinceDto,
  ) {
    return this.mProvinceService.update(+id, updateMProvinceDto);
  }
}
