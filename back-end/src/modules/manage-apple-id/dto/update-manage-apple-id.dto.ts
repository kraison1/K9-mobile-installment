import { PartialType } from '@nestjs/swagger';
import { CreateManageAppleIdDto } from './create-manage-apple-id.dto';

export class UpdateManageAppleIdDto extends PartialType(CreateManageAppleIdDto) {}
