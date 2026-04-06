import { Injectable } from '@nestjs/common';
import { CreateProductSavingListDto } from './dto/create-product-saving-list.dto';
import { UpdateProductSavingListDto } from './dto/update-product-saving-list.dto';

@Injectable()
export class ProductSavingListsService {
  create(createProductSavingListDto: CreateProductSavingListDto) {
    return 'This action adds a new productSavingList';
  }

  findAll() {
    return `This action returns all productSavingLists`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productSavingList`;
  }

  update(id: number, updateProductSavingListDto: UpdateProductSavingListDto) {
    return `This action updates a #${id} productSavingList`;
  }

  remove(id: number) {
    return `This action removes a #${id} productSavingList`;
  }
}
