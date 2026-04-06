import { Injectable } from '@nestjs/common';
import { CreateProductSaleImageDto } from './dto/create-product-sale-image.dto';
import { UpdateProductSaleImageDto } from './dto/update-product-sale-image.dto';

@Injectable()
export class ProductSaleImagesService {
  create(createProductSaleImageDto: CreateProductSaleImageDto) {
    return 'This action adds a new productSaleImage';
  }

  findAll() {
    return `This action returns all productSaleImages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productSaleImage`;
  }

  update(id: number, updateProductSaleImageDto: UpdateProductSaleImageDto) {
    return `This action updates a #${id} productSaleImage`;
  }

  remove(id: number) {
    return `This action removes a #${id} productSaleImage`;
  }
}
