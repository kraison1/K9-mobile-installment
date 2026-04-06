import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductBuyLists } from './entities/product-buy-list.entity';

@Injectable()
export class ProductBuyListsService {
  constructor(
    @InjectRepository(ProductBuyLists)
    private readonly productBuyListsRepository: Repository<ProductBuyLists>,
  ) {}
}
