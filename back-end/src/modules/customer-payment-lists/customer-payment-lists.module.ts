import { Module } from '@nestjs/common';
import { CustomerPaymentListsService } from './customer-payment-lists.service';
import { CustomerPaymentListsController } from './customer-payment-lists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerPaymentList } from './entities/customer-payment-list.entity';
import { Branch } from '../branchs/entities/branch.entity';
import { ChatModule } from '../chat/chat.module';
import { ProductSale } from '../product-sale/entities/product-sale.entity';
import { ProductPayMentList } from '../product-pay-ment-lists/entities/product-pay-ment-list.entity';
import { ProductPaymentImage } from '../product-payment-images/entities/product-payment-image.entity';
import { ProductSaving } from '../product-saving/entities/product-saving.entity';
import { ProductSavingPayMentImage } from '../product-saving-pay-ment-image/entities/product-saving-pay-ment-image.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerPaymentList,
      Branch,
      ProductSale,
      ProductPayMentList,
      ProductPaymentImage,
      ProductSaving,
      ProductSavingPayMentImage,
      Product,
    ]),
    ChatModule,
  ],
  controllers: [CustomerPaymentListsController],
  providers: [CustomerPaymentListsService],
  exports: [CustomerPaymentListsService],
})
export class CustomerPaymentListsModule {}
