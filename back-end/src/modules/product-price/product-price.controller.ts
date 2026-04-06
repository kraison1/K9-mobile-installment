import { Controller } from '@nestjs/common';
import { ProductPriceService } from './product-price.service';

@Controller('product-price')
export class ProductPriceController {
  constructor(private readonly productPriceService: ProductPriceService) {}
}
