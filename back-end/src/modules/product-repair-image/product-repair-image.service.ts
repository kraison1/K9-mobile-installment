import { Injectable } from '@nestjs/common';
import { CreateProductRepairImageDto } from './dto/create-product-repair-image.dto';
import { UpdateProductRepairImageDto } from './dto/update-product-repair-image.dto';

@Injectable()
export class ProductRepairImageService {
  create(createProductRepairImageDto: CreateProductRepairImageDto) {
    return 'This action adds a new productRepairImage';
  }

  findAll() {
    return `This action returns all productRepairImage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productRepairImage`;
  }

  update(id: number, updateProductRepairImageDto: UpdateProductRepairImageDto) {
    return `This action updates a #${id} productRepairImage`;
  }

  remove(id: number) {
    return `This action removes a #${id} productRepairImage`;
  }
}
