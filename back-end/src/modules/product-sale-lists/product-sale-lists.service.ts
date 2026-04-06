import { Injectable } from '@nestjs/common';
import { CreateProductSaleListDto } from './dto/create-product-sale-list.dto';
import { UpdateProductSaleListDto } from './dto/update-product-sale-list.dto';

@Injectable()
export class ProductSaleListsService {
  create(createProductSaleListDto: CreateProductSaleListDto) {
    return 'This action adds a new productSaleList';
  }

  findAll() {
    return `This action returns all productSaleLists`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productSaleList`;
  }

  update(id: number, updateProductSaleListDto: UpdateProductSaleListDto) {
    return `This action updates a #${id} productSaleList`;
  }

  remove(id: number) {
    return `This action removes a #${id} productSaleList`;
  }
}
