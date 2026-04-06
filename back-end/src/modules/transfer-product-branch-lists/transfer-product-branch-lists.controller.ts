import { Controller, UseGuards } from '@nestjs/common';
import { TransferProductBranchListsService } from './transfer-product-branch-lists.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('TransferProductBranchLists')
@Controller('transfer-product-branch-lists')
@UseGuards(JwtAuthGuard)
@Permissions('transferProduct')
export class TransferProductBranchListsController {
  constructor(
    private readonly transferProductBranchListsService: TransferProductBranchListsService,
  ) {}
}
