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
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ApiTags } from '@nestjs/swagger';
import { CustomerSearchDto } from 'src/helper/search.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { FastifyRequest } from 'fastify';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Customer')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@Permissions('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(@Req() req: FastifyRequest) {
    return await this.customerService.create(req);
  }

  @Post('search')
  async findAll(
    @Body() searchCustomerDto: CustomerSearchDto,
    @Req() req: FastifyRequest,
  ) {
    return await this.customerService.findAll(searchCustomerDto, req);
  }

  @Get('select/:branchId/:customerType/:search')
  async getSelect(
    @Param('branchId') branchId: number,
    @Param('customerType') customerType: string,
    @Param('search') search: string,
    @Req() req: FastifyRequest,
  ) {
    return this.customerService.getSelect(branchId, customerType, search, req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @Get('citizenIdCard/:number')
  searchCitizenIdCard(@Param('number') search: string) {
    return this.customerService.searchCitizenIdCard(search);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.customerService.update(+id, req);
  }

  // update(
  //   @Param('id') id: string,
  //   @Body() updateCustomerDto: UpdateCustomerDto,
  // ) {
  //   return this.customerService.update(+id, updateCustomerDto);
  // }

  @Permissions('can-deleted')
  @Delete(':id')
  async delete(@Param('id') id: number, @Req() req: FastifyRequest) {
    return await this.customerService.delete(id, req);
  }
}
