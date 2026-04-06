import { PartialType } from '@nestjs/swagger';
import { CreateTransferProductBranchListDto } from './create-transfer-product-branch-list.dto';

export class UpdateTransferProductBranchListDto extends PartialType(CreateTransferProductBranchListDto) {}
