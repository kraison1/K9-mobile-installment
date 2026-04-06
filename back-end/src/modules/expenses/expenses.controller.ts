import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Delete,
  Res,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { ExpenseSearchDto } from 'src/helper/search.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { FastifyRequest, FastifyReply } from 'fastify';

@ApiTags('Expenses')
@Controller('expenses')
@UseGuards(JwtAuthGuard)
@Permissions('accounting-expense-list')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.expensesService.create(req);
  }

  @Post('search')
  async findAll(@Body() searchExpenseSearchDto: ExpenseSearchDto) {
    return await this.expensesService.findAll(searchExpenseSearchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(+id);
  }

  @Permissions('can-deleted')
  @Delete(':id')
  async delete(@Param('id') id: number, @Req() req: FastifyRequest) {
    return await this.expensesService.delete(id, req);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.expensesService.update(+id, req);
  }

  @Post('/printExpensesPdf')
  async printExpensesPdf(@Res() res: FastifyReply, @Req() req: FastifyRequest) {
    try {
      const pdfBuffer = await this.expensesService.printExpensesPdf(req);
      res
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="Expenses.pdf"`)
        .header('Content-Length', pdfBuffer.length.toString())
        .send(pdfBuffer);
    } catch (error) {
      res.status(error.status || 500).send({
        statusCode: 200,
        message: error.message,
        error: error.name || 'Internal Server Error',
      });
    }
  }
}
