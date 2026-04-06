import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserGroupsModule } from 'src/modules/user-groups/user-groups.module';
import { UserModule } from 'src/modules/users/users.module';
import { BranchModule } from 'src/modules/branchs/branchs.module';
import { ExpenseTypeModule } from 'src/modules/expense-types/expense-types.module';
import { ProductTypeModule } from './modules/product-types/product-types.module';
import { ProductUnitsModule } from './modules/product-units/product-units.module';
import { ProductBrandsModule } from './modules/product-brands/product-brands.module';
import { ProductColorsModule } from './modules/product-colors/product-colors.module';
import { ProductStoragesModule } from './modules/product-storages/product-storages.module';
import { MProvinceModule } from './modules/m-province/m-province.module';
import { MDistrictModule } from './modules/m-district/m-district.module';
import { MSubdistrictModule } from './modules/m-subdistrict/m-subdistrict.module';
import { ProductModelModule } from './modules/product-model/product-model.module';
import { ProductModule } from './modules/product/product.module';
import { ProductLogModule } from './modules/product-log/product-log.module';
import { ProductImageModule } from './modules/product-image/product-image.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { CustomerModule } from './modules/customer/customer.module';
import { TransferProductBranchModule } from './modules/transfer-product-branch/transfer-product-branch.module';
import { TransferProductBranchListsModule } from './modules/transfer-product-branch-lists/transfer-product-branch-lists.module';
import { ChangeProductCommissionModule } from './modules/change-product-commission/change-product-commission.module';
import { TransportModule } from './modules/transport/transport.module';
import { ProductRepairModule } from './modules/product-repair/product-repair.module';
import { ProductSaleModule } from './modules/product-sale/product-sale.module';
import { CustomerImageModule } from './modules/customer-image/customer-image.module';
import { ChangeProductPriceModule } from './modules/change-product-price/change-product-price.module';
import { BanksModule } from './modules/banks/banks.module';
import { RateFinanceModule } from './modules/rate-finance/rate-finance.module';
import { ProductBuyModule } from './modules/product-buy/product-buy.module';
import { ProductBuyListsModule } from './modules/product-buy-lists/product-buy-lists.module';
import { ProductPriceModule } from './modules/product-price/product-price.module';
import { ProductSaleListsModule } from './modules/product-sale-lists/product-sale-lists.module';
import { ProductPayMentListsModule } from './modules/product-pay-ment-lists/product-pay-ment-lists.module';
import { DefaultProductPricesModule } from './modules/default-product-prices/default-product-prices.module';
import { ProductPaymentImagesModule } from './modules/product-payment-images/product-payment-images.module';
import { ProcessCasesModule } from './modules/process-cases/process-cases.module';
import { AuthService } from './modules/auth/auth.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductSaleImagesModule } from './modules/product-sale-images/product-sale-images.module';
import { ProductBookModule } from './modules/product-book/product-book.module';
import { ProductBookImageModule } from './modules/product-book-image/product-book-image.module';
import { ProcessCaseImagesModule } from './modules/process-case-images/process-case-images.module';
import { ProcessBooksModule } from './modules/process-books/process-books.module';
import { ProcessBookImagesModule } from './modules/process-book-images/process-book-images.module';
import { TelegramNotificationModule } from './modules/telegram-notification/telegram-notification.module';
import { ProductSavingModule } from './modules/product-saving/product-saving.module';
import { ProductSavingListsModule } from './modules/product-saving-lists/product-saving-lists.module';
import { ProductSavingImagesModule } from './modules/product-saving-images/product-saving-images.module';
import { ProcessSavingsModule } from './modules/process-savings/process-savings.module';
import { ProcessSavingImagesModule } from './modules/process-saving-images/process-saving-images.module';
import { ProductSavingPayMentImageModule } from './modules/product-saving-pay-ment-image/product-saving-pay-ment-image.module';
import { ManageAppleIdModule } from './modules/manage-apple-id/manage-apple-id.module';
import { BranchTransferPriceModule } from './modules/branch-transfer-price/branch-transfer-price.module';
import { OcrModule } from './modules/ocr/ocr.module';
import { ProcessManageFinanceModule } from './modules/process-manage-finance/process-manage-finance.module';
import { PercentDownFinanceModule } from './modules/percent-down-finance/percent-down-finance.module';
import { WithdrawSumPriceSaleModule } from './modules/withdraw-sum-price-sale/withdraw-sum-price-sale.module';
import { LatestNewsModule } from './modules/latest-news/latest-news.module';
import { CustomerThirdPartyModule } from './modules/customer-third-party/customer-third-party.module';
import { RatePurchaseModule } from './modules/rate-purchase/rate-purchase.module';
import { ProductRepairListsModule } from './modules/product-repair-lists/product-repair-lists.module';
import { ProductRepairImageModule } from './modules/product-repair-image/product-repair-image.module';
import { ExpenseImagesModule } from './modules/expense-images/expense-images.module';
import { ChatModule } from './modules/chat/chat.module';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { CustomerPaymentListsModule } from './modules/customer-payment-lists/customer-payment-lists.module';
import { ProductClaimModule } from './modules/product-claim/product-claim.module';
import { ShopInsuranceModule } from './modules/shop-insurance/shop-insurance.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      logging: false,
      poolSize: 10,
      extra: {
        max: 20,
        connectionTimeoutMillis: 5000,
      },
    }),
    AuthModule,
    UserGroupsModule,
    UserModule,
    BranchModule,
    ExpenseTypeModule,
    ProductTypeModule,
    ProductUnitsModule,
    ProductBrandsModule,
    ProductColorsModule,
    ProductStoragesModule,
    CustomerModule,
    MProvinceModule,
    MDistrictModule,
    MSubdistrictModule,
    ProductModelModule,
    ProductModule,
    ProductLogModule,
    ProductImageModule,
    ExpensesModule,
    ExpenseImagesModule,
    TransferProductBranchModule,
    TransferProductBranchListsModule,
    ChangeProductCommissionModule,
    TransportModule,
    ProductRepairModule,
    ProductSaleModule,
    CustomerImageModule,
    ChangeProductPriceModule,
    BanksModule,
    RateFinanceModule,
    ProductBuyModule,
    ProductBuyListsModule,
    ProductPriceModule,
    ProductSaleListsModule,
    ProductPayMentListsModule,
    DefaultProductPricesModule,
    ProductPaymentImagesModule,
    ProcessCasesModule,
    ProductSaleImagesModule,
    ProductBookModule,
    ProductBookImageModule,
    ProcessCaseImagesModule,
    ProcessBooksModule,
    ProcessBookImagesModule,
    TelegramNotificationModule,
    ProductSavingModule,
    ProductSavingListsModule,
    ProductSavingImagesModule,
    ProcessSavingsModule,
    ProcessSavingImagesModule,
    ProductSavingPayMentImageModule,
    ManageAppleIdModule,
    BranchTransferPriceModule,
    OcrModule,
    ProcessManageFinanceModule,
    PercentDownFinanceModule,
    WithdrawSumPriceSaleModule,
    LatestNewsModule,
    CustomerThirdPartyModule,
    RatePurchaseModule,
    ProductRepairListsModule,
    ProductRepairImageModule,
    ChatModule,
    FirebaseModule,
    CustomerPaymentListsModule,
    ProductClaimModule,
    ShopInsuranceModule,
  ],
  controllers: [],
  providers: [AuthService],
  exports: [AuthService],
})
export class AppModule {}
