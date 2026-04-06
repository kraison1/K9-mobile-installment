import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ExpenseImagesService } from './expense-images.service';
import { CreateExpenseImageDto } from './dto/create-expense-image.dto';
import { UpdateExpenseImageDto } from './dto/update-expense-image.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Expense')
@Controller('expense-images')
@UseGuards(JwtAuthGuard)
@Permissions('accounting-expense-list')
export class ExpenseImagesController {
  constructor(private readonly expenseImagesService: ExpenseImagesService) {}

  @Post('/updateSeq')
  updateSeq(@Body() updateExpenseImageDto: UpdateExpenseImageDto[]) {
    return this.expenseImagesService.updateSeq(updateExpenseImageDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.expenseImagesService.delete(+id);
  }
}
