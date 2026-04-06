import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateManageAppleIdDto } from './dto/create-manage-apple-id.dto';
import { UpdateManageAppleIdDto } from './dto/update-manage-apple-id.dto';
import { ApiTags } from '@nestjs/swagger';
import { ManageAppleIdSearchDto } from 'src/helper/search.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ManageAppleIdService } from './manage-apple-id.service';
import { FastifyRequest } from 'fastify';

@ApiTags('ManageAppleId')
@Controller('manage-apple-id')
@UseGuards(JwtAuthGuard)
@Permissions('settings-appleid')
export class ManageAppleIdController {
  constructor(private readonly manageAppleIdService: ManageAppleIdService) {}

  @Post()
  create(
    @Body() createManageAppleIdDto: CreateManageAppleIdDto,
    @Req() req: FastifyRequest,
  ) {
    createManageAppleIdDto.appId = createManageAppleIdDto.appId.trim();
    createManageAppleIdDto.pass = createManageAppleIdDto.pass.trim();

    return this.manageAppleIdService.create(createManageAppleIdDto, req);
  }

  @Post('search')
  async findAll(@Body() searchManageAppleIdDto: ManageAppleIdSearchDto) {
    return await this.manageAppleIdService.findAll(searchManageAppleIdDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.manageAppleIdService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateManageAppleIdDto: UpdateManageAppleIdDto,
  ) {
    return this.manageAppleIdService.update(+id, updateManageAppleIdDto);
  }
}
