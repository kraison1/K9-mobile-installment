import { PickType } from '@nestjs/swagger';
import { ProductSale } from '../entities/product-sale.entity';

export class CreateProductSaleDto extends PickType(ProductSale, [
  'code',
  'payType',
  'isPaySuccess',
  'priceSale',
  'priceDownPayment',
  'priceReRider',
  'priceRegAppleId',
  'priceETC',
  'priceEquipCost',
  'productId',
  'customerId',
  'createByUserId',
  'branchId',
  'saleType',
] as const) {}
