import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CustomerImageService } from './customer-image.service';
import { UpdateCustomerImageDto } from './dto/update-customer-image.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Customer')
@Controller('customer-images')
@UseGuards(JwtAuthGuard)
@Permissions('customer')
export class CustomerImageController {
  constructor(private readonly customerImageService: CustomerImageService) {}

  @Post('/updateSeq')
  updateSeq(@Body() updateCustomerImageDto: UpdateCustomerImageDto[]) {
    return this.customerImageService.updateSeq(updateCustomerImageDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.customerImageService.delete(+id);
  }
}
