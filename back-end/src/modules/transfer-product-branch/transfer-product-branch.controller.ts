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
import { TransferProductBranchService } from './transfer-product-branch.service';
import { CreateTransferProductBranchDto } from './dto/create-transfer-product-branch.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { TransferProductBranchSearchDto } from 'src/helper/search.dto';
import { FastifyRequest } from 'fastify';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('TransferProductBranch')
@Controller('transfer-product-branch')
@UseGuards(JwtAuthGuard)
@Permissions(
  'transferProduct',
  'transferProductAccessibility',
  'transferProductRepair',
)
export class TransferProductBranchController {
  constructor(
    private readonly transferProductBranchService: TransferProductBranchService,
  ) {}

  @Post()
  create(
    @Body() createTransferProductBranchDto: CreateTransferProductBranchDto,
  ) {
    return this.transferProductBranchService.create(
      createTransferProductBranchDto,
    );
  }

  @Post('search')
  async findAll(@Body() searchDto: TransferProductBranchSearchDto) {
    return await this.transferProductBranchService.findAll(searchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transferProductBranchService.findOne(+id);
  }

  @Get('/transferProductBranchId/:transferProductBranchId')
  findByTransferProductBranchId(
    @Param('transferProductBranchId') transferProductBranchId: string,
  ) {
    return this.transferProductBranchService.findByTransferProductBranchId(
      +transferProductBranchId,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.transferProductBranchService.update(+id, req);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateTransferProductBranchDto: UpdateTransferProductBranchDto,
  // ) {
  //   return this.transferProductBranchService.update(
  //     +id,
  //     updateTransferProductBranchDto,
  //   );
  // }
}
