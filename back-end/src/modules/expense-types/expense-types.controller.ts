import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ExpenseTypeService } from './expense-types.service';
import { CreateExpenseTypeDto } from './dto/create-expense-type.dto';
import { UpdateExpenseTypeDto } from './dto/update-expense-type.dto';
import { ApiTags } from '@nestjs/swagger';
import { ExpenseTypeSearchDto } from 'src/helper/search.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ExpenseType')
@Controller('expense-types')
@UseGuards(JwtAuthGuard)
export class ExpenseTypeController {
  constructor(private readonly expenseTypesService: ExpenseTypeService) {}

  @Permissions('accounting-expense-type')
  @Post()
  create(@Body() createExpenseTypeDto: CreateExpenseTypeDto) {
    return this.expenseTypesService.create(createExpenseTypeDto);
  }

  @Permissions('accounting-expense-type')
  @Post('search')
  async findAll(@Body() searchExpenseTypeDto: ExpenseTypeSearchDto) {
    return await this.expenseTypesService.findAll(searchExpenseTypeDto);
  }

  @Get('/select')
  getSelect() {
    return this.expenseTypesService.getSelect();
  }

  @Permissions('accounting-expense-type')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseTypesService.findOne(+id);
  }

  @Permissions('accounting-expense-type')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseTypeDto: UpdateExpenseTypeDto,
  ) {
    return this.expenseTypesService.update(+id, updateExpenseTypeDto);
  }
}
