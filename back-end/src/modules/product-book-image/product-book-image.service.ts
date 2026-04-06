import { Injectable } from '@nestjs/common';
import { CreateProductBookImageDto } from './dto/create-product-book-image.dto';
import { UpdateProductBookImageDto } from './dto/update-product-book-image.dto';

@Injectable()
export class ProductBookImageService {
  create(createProductBookImageDto: CreateProductBookImageDto) {
    return 'This action adds a new productBookImage';
  }

  findAll() {
    return `This action returns all productBookImage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productBookImage`;
  }

  update(id: number, updateProductBookImageDto: UpdateProductBookImageDto) {
    return `This action updates a #${id} productBookImage`;
  }

  remove(id: number) {
    return `This action removes a #${id} productBookImage`;
  }
}
