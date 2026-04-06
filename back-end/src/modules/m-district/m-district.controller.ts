import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MDistrictService } from './m-district.service';
import { CreateMDistrictDto } from './dto/create-m-district.dto';
import { UpdateMDistrictDto } from './dto/update-m-district.dto';
import { MDistrictSearchDto } from 'src/helper/search.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('MDistrict')
@Controller('m-districts')
@UseGuards(JwtAuthGuard)
export class MDistrictController {
  constructor(private readonly mDistrictService: MDistrictService) {}

  @Permissions('districts')
  @Post()
  create(@Body() createMDistrictDto: CreateMDistrictDto) {
    return this.mDistrictService.create(createMDistrictDto);
  }

  @Permissions('districts')
  @Post('search')
  async findAll(@Body() searchMDistrictDto: MDistrictSearchDto) {
    return await this.mDistrictService.findAll(searchMDistrictDto);
  }

  @Get('/select/:provinceId')
  getSelect(@Param('provinceId') provinceId: number) {
    return this.mDistrictService.getSelect(+provinceId);
  }

  @Permissions('districts')
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.mDistrictService.findOne(+id);
  }

  @Permissions('districts')
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateMDistrictDto: UpdateMDistrictDto,
  ) {
    return this.mDistrictService.update(+id, updateMDistrictDto);
  }
}
