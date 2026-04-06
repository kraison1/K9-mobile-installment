import { Module } from '@nestjs/common';
import { CustomerThirdPartyService } from './customer-third-party.service';
import { CustomerThirdPartyController } from './customer-third-party.controller';
import { LatestNewsModule } from '../latest-news/latest-news.module';
import { ProductSaleModule } from '../product-sale/product-sale.module';
import { UserModule } from '../users/users.module';
import { ProductSavingModule } from '../product-saving/product-saving.module';
import { CustomerPaymentListsModule } from '../customer-payment-lists/customer-payment-lists.module';

@Module({
  imports: [
    LatestNewsModule,
    ProductSaleModule,
    ProductSavingModule,
    UserModule,
    CustomerPaymentListsModule,
  ],
  controllers: [CustomerThirdPartyController],
  providers: [CustomerThirdPartyService],
})
export class CustomerThirdPartyModule {}
