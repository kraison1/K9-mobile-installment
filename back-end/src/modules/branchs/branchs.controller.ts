import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BranchService } from './branchs.service';
import { ApiTags } from '@nestjs/swagger';
import { BranchSearchDto } from 'src/helper/search.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { FastifyRequest } from 'fastify';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Branch')
@Controller('branchs')
@UseGuards(JwtAuthGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Permissions('settings-branch')
  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.branchService.create(req);
  }

  @Permissions('settings-branch')
  @Post('search')
  async findAll(@Body() searchBranchDto: BranchSearchDto) {
    return await this.branchService.findAll(searchBranchDto);
  }

  @Get('/select')
  getSelect() {
    return this.branchService.getSelect();
  }

  @Permissions('settings-branch')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(+id);
  }

  @Permissions('settings-branch')
  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.branchService.update(+id, req);
  }

  // @Get('download/:id')
  // async downloadFile(
  //   @Param('id') id: string,
  //   @Res() res: FastifyReply,
  // ): Promise<void> {
  //   await this.branchService.downloadFile(+id, res);
  // }
}
