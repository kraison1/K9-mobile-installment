import { PartialType } from '@nestjs/swagger';
import { CreateBranchTransferPriceDto } from './create-branch-transfer-price.dto';

export class UpdateBranchTransferPriceDto extends PartialType(CreateBranchTransferPriceDto) {}
