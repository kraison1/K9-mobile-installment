import { PartialType } from '@nestjs/swagger';
import { CreateTransferProductBranchDto } from './create-transfer-product-branch.dto';

export class UpdateTransferProductBranchDto extends PartialType(
  CreateTransferProductBranchDto,
) {
  'id';
}
