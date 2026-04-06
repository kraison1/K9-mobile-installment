import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPrice } from './entities/product-price.entity';

@Injectable()
export class ProductPriceService {
  constructor(
    @InjectRepository(ProductPrice)
    private readonly productBuyListsRepository: Repository<ProductPrice>,
  ) {}
}
