import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProductImageDto } from './dto/update-product-image-table.dto';
import { ProductImage } from './entities/product-image.entity';
import { Product } from '../product/entities/product.entity';
import * as path from 'path';
import { unlink, access } from 'fs/promises';
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_DELETE_SUCCESS,
} from 'src/helper/constanc';

@Injectable()
export class ProductImageService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async updateSeq(
    updateProductImageDto: UpdateProductImageDto[],
  ): Promise<any> {
    try {
      const productId = updateProductImageDto[0]?.productId;
      await this.productImageRepository.manager.transaction(
        async (entityManager) => {
          for (const imageUpdate of updateProductImageDto) {
            await entityManager.update(
              ProductImage,
              { id: imageUpdate.id },
              { seq: imageUpdate.seq },
            );
          }
        },
      );

      const productImage = await this.productImageRepository
        .createQueryBuilder('productImage')
        .where('productImage.productId = :productId', { productId })
        .andWhere('productImage.isProductBuy = :isProductBuy', {
          isProductBuy: updateProductImageDto[0].isProductBuy,
        })
        .orderBy('productImage.seq', 'ASC')
        .getOne();

      const product = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (product) {
        await this.productRepository.update(product.id, {
          ...product,
          fileProduct: productImage.name,
        });
      }

      return {
        message_success: MESSAGE_SAVE_SUCCESS,
      };
    } catch (error) {
      return {
        message_error: error?.message || 'เกิดข้อผิดพลาดในการลบรูปภาพ',
      };
    }
  }

  async delete(id: number): Promise<any> {
    try {
      const findImage = await this.productImageRepository.findOne({
        where: { id },
      });

      const filePath = path.join(findImage.name);
      await access(filePath).then(() => unlink(filePath));
      await this.productImageRepository.delete({ id });

      return {
        message_success: MESSAGE_DELETE_SUCCESS,
      };
    } catch (error) {
      return {
        message_error: error?.message || 'เกิดข้อผิดพลาดในการลบรูปภาพ',
      };
    }
  }
}
