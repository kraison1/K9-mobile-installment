import { Controller } from '@nestjs/common';
import { ProductBuyListsService } from './product-buy-lists.service';

@Controller('product-buy-lists')
export class ProductBuyListsController {
  constructor(
    private readonly productBuyListsService: ProductBuyListsService,
  ) {}
}
