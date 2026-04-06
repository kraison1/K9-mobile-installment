import { Injectable } from '@nestjs/common';
import { CreateProductSavingImageDto } from './dto/create-product-saving-image.dto';
import { UpdateProductSavingImageDto } from './dto/update-product-saving-image.dto';

@Injectable()
export class ProductSavingImagesService {
  create(createProductSavingImageDto: CreateProductSavingImageDto) {
    return 'This action adds a new productSavingImage';
  }

  findAll() {
    return `This action returns all productSavingImages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productSavingImage`;
  }

  update(id: number, updateProductSavingImageDto: UpdateProductSavingImageDto) {
    return `This action updates a #${id} productSavingImage`;
  }

  remove(id: number) {
    return `This action removes a #${id} productSavingImage`;
  }
}
