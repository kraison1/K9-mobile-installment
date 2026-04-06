import { Injectable } from '@nestjs/common';
import { CreateProductRepairListDto } from './dto/create-product-repair-list.dto';
import { UpdateProductRepairListDto } from './dto/update-product-repair-list.dto';

@Injectable()
export class ProductRepairListsService {
  create(createProductRepairListDto: CreateProductRepairListDto) {
    return 'This action adds a new productRepairList';
  }

  findAll() {
    return `This action returns all productRepairLists`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productRepairList`;
  }

  update(id: number, updateProductRepairListDto: UpdateProductRepairListDto) {
    return `This action updates a #${id} productRepairList`;
  }

  remove(id: number) {
    return `This action removes a #${id} productRepairList`;
  }
}
