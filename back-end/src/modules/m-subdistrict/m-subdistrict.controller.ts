import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MSubdistrictService } from './m-subdistrict.service';
import { CreateMSubdistrictDto } from './dto/create-m-subdistrict.dto';
import { UpdateMSubdistrictDto } from './dto/update-m-subdistrict.dto';
import { MSubdistrictSearchDto } from 'src/helper/search.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('MSubdistrict')
@Controller('m-subdistricts')
@UseGuards(JwtAuthGuard)
export class MSubdistrictController {
  constructor(private readonly mSubdistrictService: MSubdistrictService) {}

  @Permissions('subdistricts')
  @Post()
  create(@Body() createMSubdistrictDto: CreateMSubdistrictDto) {
    return this.mSubdistrictService.create(createMSubdistrictDto);
  }

  @Permissions('subdistricts')
  @Post('search')
  async findAll(@Body() searchMSubdistrictDto: MSubdistrictSearchDto) {
    return await this.mSubdistrictService.findAll(searchMSubdistrictDto);
  }

  @Get('/select/:districtId')
  getSelect(@Param('districtId') districtId: number) {
    return this.mSubdistrictService.getSelect(+districtId);
  }

  @Permissions('subdistricts')
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.mSubdistrictService.findOne(+id);
  }

  @Permissions('subdistricts')
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateMSubdistrictDto: UpdateMSubdistrictDto,
  ) {
    return this.mSubdistrictService.update(+id, updateMSubdistrictDto);
  }
}
