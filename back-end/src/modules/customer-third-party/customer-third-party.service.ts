import { Injectable } from '@nestjs/common';
import { CreateCustomerThirdPartyDto } from './dto/create-customer-third-party.dto';
import { UpdateCustomerThirdPartyDto } from './dto/update-customer-third-party.dto';

@Injectable()
export class CustomerThirdPartyService {
  create(createCustomerThirdPartyDto: CreateCustomerThirdPartyDto) {
    return 'This action adds a new customerThirdParty';
  }

  findAll() {
    return `This action returns all customerThirdParty`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customerThirdParty`;
  }

  update(id: number, updateCustomerThirdPartyDto: UpdateCustomerThirdPartyDto) {
    return `This action updates a #${id} customerThirdParty`;
  }

  remove(id: number) {
    return `This action removes a #${id} customerThirdParty`;
  }
}
