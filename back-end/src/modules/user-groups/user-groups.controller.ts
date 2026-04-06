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
import { UserGroupsService } from './user-groups.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { ApiTags } from '@nestjs/swagger';
import { SearchDto } from 'src/helper/search.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { FastifyRequest } from 'fastify';

@ApiTags('UserGroups')
@Controller('user-groups')
@UseGuards(JwtAuthGuard)
export class UserGroupsController {
  constructor(private readonly userGroupsService: UserGroupsService) {}

  @Permissions('settings-user-group')
  @Post()
  create(@Body() createUserGroupDto: CreateUserGroupDto) {
    return this.userGroupsService.create(createUserGroupDto);
  }

  @Permissions('settings-user-group')
  @Post('search')
  async findAll(@Body() searchUserGroupDto: SearchDto) {
    return await this.userGroupsService.findAll(searchUserGroupDto);
  }

  @Get('/select')
  getSelect(@Req() req: FastifyRequest) {
    return this.userGroupsService.getSelect(req);
  }

  @Permissions('settings-user-group')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userGroupsService.findOne(+id);
  }

  @Permissions('settings-user-group')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserGroupDto: UpdateUserGroupDto,
  ) {
    return this.userGroupsService.update(+id, updateUserGroupDto);
  }
}
