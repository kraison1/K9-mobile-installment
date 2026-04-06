import { ApiProperty, OmitType } from '@nestjs/swagger';
class SearchDto {
  @ApiProperty({ example: '', required: false })
  search: string;

  @ApiProperty({ example: '1', required: true })
  active: string;

  @ApiProperty({ example: '1', required: true })
  catalog: string;

  @ApiProperty({ example: 1, required: true })
  page: number;

  @ApiProperty({ example: 50, required: true })
  pageSize: number;
}

class NotificationDto {
  @ApiProperty({ example: 'your-bot-token', required: false })
  botToken: string;

  @ApiProperty({ example: '1', required: true })
  chatId: string | string[] = '';

  @ApiProperty({ example: 'Hello from NestJS!', required: true })
  message?: string;
}

class UserSearchDto extends OmitType(SearchDto, ['catalog'] as const) {}

class ManageProcessManageFinanceDto extends OmitType(SearchDto, [
  'catalog',
] as const) {
  @ApiProperty({ example: 1, required: true })
  status: string;
  @ApiProperty({ example: '1', required: true })
  branchId: Number;

  @ApiProperty({ required: false, example: '2025-03-24T00:00:00.000Z' })
  endDate?: string;

  @ApiProperty({ required: false, example: '2025-03-24T23:59:59.999Z' })
  startDate?: string;
}

class ClaimSearchDto extends OmitType(SearchDto, ['active'] as const) {
  @ApiProperty({ example: 1, required: true })
  status: string;

  @ApiProperty({ required: false, example: '2025-03-24T00:00:00.000Z' })
  endDate?: string;

  @ApiProperty({ required: false, example: '2025-03-24T23:59:59.999Z' })
  startDate?: string;

  @ApiProperty({ example: '1', required: true })
  branchId: Number;
}

class PercentDownFinanceSearchDto extends OmitType(SearchDto, [
  'catalog',
] as const) {}

class RatePurchaseSearchDto extends OmitType(SearchDto, ['catalog'] as const) {}

class WithdrawSumPriceSaleSearchDto extends OmitType(SearchDto, [
  'catalog',
] as const) {
  @ApiProperty({ example: 1, required: true })
  status: string;
  @ApiProperty({ example: '1', required: true })
  branchId: Number;

  @ApiProperty({ required: false, example: '2025-03-24T00:00:00.000Z' })
  endDate?: string;

  @ApiProperty({ required: false, example: '2025-03-24T23:59:59.999Z' })
  startDate?: string;
}

class PercentMonthFinanceSearchDto extends OmitType(SearchDto, [
  'catalog',
] as const) {}

class ManageAppleIdSearchDto extends OmitType(SearchDto, ['catalog'] as const) {
  @ApiProperty({ example: '1', required: true })
  branchId: Number;
}

class UserGroupSearchDto extends SearchDto {}

class BranchSearchDto extends OmitType(SearchDto, ['catalog'] as const) {
  @ApiProperty({ example: '1', required: true })
  online: string;
  @ApiProperty({ example: '1', required: true })
  branchId: Number;
}

class BankSearchDto extends SearchDto {
  @ApiProperty({ example: '1', required: true })
  online: string;

  @ApiProperty({ example: 1, required: true })
  branchId: Number;
}

class LatestNewsSearchDto extends OmitType(SearchDto, [
  'catalog',
  'search',
] as const) {}

class ExpenseTypeSearchDto extends SearchDto {
  @ApiProperty({ example: '1', required: true })
  type: string;
}

class ShopInsuranceSearchDto extends OmitType(SearchDto, [
  'catalog',
] as const) {}

class ExpenseSearchDto extends SearchDto {
  @ApiProperty({ example: 1, required: true })
  branchId: number;

  @ApiProperty({ required: false, example: '2025-03-24T00:00:00.000Z' })
  endDate?: string;

  @ApiProperty({ required: false, example: '2025-03-24T23:59:59.999Z' })
  startDate?: string;
}

class BranchTransferPriceSearchDto extends OmitType(SearchDto, [
  'catalog',
] as const) {
  @ApiProperty({ example: 1, required: true })
  branchId: number;

  @ApiProperty({ example: 1, required: true })
  status: string;
}

class ProductTypeSearchDto extends SearchDto {}
class ProductUnitSearchDto extends SearchDto {}
class ProductBrandSearchDto extends SearchDto {}
class ProductModelSearchDto extends SearchDto {}
class ProductColorSearchDto extends SearchDto {}
class ProductStorageSearchDto extends SearchDto {}
class MProvinceSearchDto extends SearchDto {}
class MDistrictSearchDto extends SearchDto {}
class MSubdistrictSearchDto extends SearchDto {}
class CustomerSearchDto extends SearchDto {
  @ApiProperty({ example: 6, required: true })
  branchId: number;

  @ApiProperty({ example: 6, required: true })
  customerType: string;
}

class CustomerPaymentSearchDto extends OmitType(SearchDto, [
  'catalog',
  'active',
]) {
  @ApiProperty({ example: 6, required: true })
  branchId: number;

  @ApiProperty({ example: null, required: false })
  type: string;

  @ApiProperty({ example: null, required: false })
  status: string;

  @ApiProperty({ required: false, example: '2025-03-24T00:00:00.000Z' })
  endDate?: string;

  @ApiProperty({ required: false, example: '2025-03-24T23:59:59.999Z' })
  startDate?: string;
}

class MCostExtraSearchDto extends SearchDto {}
class MFinanceSearchDto extends SearchDto {}
class MFinanceRateSearchDto extends SearchDto {}
class ProductSearchDto extends SearchDto {
  @ApiProperty({ example: 'มือถือ', required: true })
  catalog: string;
  @ApiProperty({ example: 1, required: true })
  branchId: number;
  @ApiProperty({ example: 0, required: true })
  productBrandId: number;
  @ApiProperty({ example: 0, required: true })
  productModelId: number;
  @ApiProperty({ example: 0, required: true })
  productTypeId: number;
}

class ProductFinanceTableSearchDto extends SearchDto {}
class ProductImageSearchDto extends SearchDto {}
class ProductLogSearchDto extends SearchDto {
  @ApiProperty({ example: null, required: false })
  branchId: number;

  @ApiProperty({ example: null, required: false })
  productId: number;

  @ApiProperty({ example: null, required: false })
  actionType: string;

  @ApiProperty({ required: false, example: '2025-03-24T00:00:00.000Z' })
  startDate?: string;

  @ApiProperty({ required: false, example: '2025-03-24T23:59:59.999Z' })
  endDate?: string;
}

class DefaultProductPriceSearchDto extends OmitType(SearchDto, [
  'catalog',
] as const) {}

class TransferProductBranchSearchDto extends OmitType(SearchDto, [
  'active',
] as const) {
  @ApiProperty({ example: null, required: false })
  catalog: string;

  @ApiProperty({ example: null, required: false })
  branchId: number;

  @ApiProperty({ example: null, required: false })
  toBranchId: number;

  @ApiProperty({ example: null, required: false })
  status: number;
}

class ProductBuySearchDto extends OmitType(SearchDto, ['active'] as const) {
  @ApiProperty({ example: null, required: false })
  branchId: number;

  @ApiProperty({ example: null, required: false })
  status: string;

  @ApiProperty({ example: null, required: false })
  catalog: string;

  @ApiProperty({ required: false, example: '2025-03-24T00:00:00.000Z' })
  endDate?: string;

  @ApiProperty({ required: false, example: '2025-03-24T23:59:59.999Z' })
  startDate?: string;
}

class ChangeProductCommissionSearchDto extends SearchDto {}
class ChangeProductPriceSearchDto extends SearchDto {}

class TransportSearchDto extends SearchDto {}
class RateFinanceSearchDto extends SearchDto {
  @ApiProperty({ example: null, required: false })
  branchId: number;
}

class ProductRepairSearchDto extends OmitType(SearchDto, ['catalog'] as const) {
  @ApiProperty({ example: null, required: false })
  branchId: number;

  @ApiProperty({ example: '1', required: false })
  typeRepair: string;

  @ApiProperty({ required: false, example: '2025-03-24T00:00:00.000Z' })
  endDate?: string;

  @ApiProperty({ required: false, example: '2025-03-24T23:59:59.999Z' })
  startDate?: string;
}

class ProcessCaseSearchDto extends OmitType(SearchDto, [
  'catalog',
  'active',
] as const) {
  @ApiProperty({ example: '1', required: false })
  searchType: string;

  @ApiProperty({ example: null, required: false })
  branchId: number;

  @ApiProperty({ example: null, required: false })
  status: string;

  @ApiProperty({ required: false, example: '2025-03-24T00:00:00.000Z' })
  endDate?: string;

  @ApiProperty({ required: false, example: '2025-03-24T23:59:59.999Z' })
  startDate?: string;
}

class ProcessBookSearchDto extends OmitType(SearchDto, [
  'catalog',
  'active',
] as const) {
  @ApiProperty({ example: '1', required: false })
  searchType: string;

  @ApiProperty({ example: null, required: false })
  branchId: number;

  @ApiProperty({ example: null, required: false })
  status: string;

  @ApiProperty({ required: false, example: '2025-03-24T00:00:00.000Z' })
  endDate?: string;

  @ApiProperty({ required: false, example: '2025-03-24T23:59:59.999Z' })
  startDate?: string;
}

class ProcessSavingSearchDto extends OmitType(SearchDto, [
  'catalog',
  'active',
] as const) {
  @ApiProperty({ example: '1', required: false })
  searchType: string;

  @ApiProperty({ example: null, required: false })
  branchId: number;

  @ApiProperty({ example: null, required: false })
  status: string;

  @ApiProperty({ required: false, example: '2025-03-24T00:00:00.000Z' })
  endDate?: string;

  @ApiProperty({ required: false, example: '2025-03-24T23:59:59.999Z' })
  startDate?: string;
}

class ProductBookSearchDto extends OmitType(SearchDto, [
  'catalog',
  'active',
] as const) {
  @ApiProperty({ example: '1', required: false })
  searchType: string;

  @ApiProperty({ example: null, required: false })
  status: string;

  @ApiProperty({ example: null, required: false })
  branchId: number;

  @ApiProperty({ required: false, example: '2025-03-24T00:00:00.000Z' })
  endDate?: string;

  @ApiProperty({ required: false, example: '2025-03-24T23:59:59.999Z' })
  startDate?: string;
}

class ProductSavingSearchDto extends OmitType(SearchDto, [
  'catalog',
  'active',
] as const) {
  @ApiProperty({ example: '1', required: false })
  searchType: string;

  @ApiProperty({ example: null, required: false })
  status: string;

  @ApiProperty({ example: null, required: false })
  branchId: number;

  @ApiProperty({ required: false, example: '2025-03-24T00:00:00.000Z' })
  endDate?: string;

  @ApiProperty({ required: false, example: '2025-03-24T23:59:59.999Z' })
  startDate?: string;
}

class ProductSaleSearchDto extends OmitType(SearchDto, ['active'] as const) {
  @ApiProperty({ example: null, required: false })
  branchId: number;

  @ApiProperty({ example: null, required: false })
  saleType: string;

  @ApiProperty({ example: null, required: false })
  isPaySuccess: string;

  @ApiProperty({ example: null, required: false })
  isMobileSale: string;

  @ApiProperty({ example: '0', required: false })
  searchBy: string;

  @ApiProperty({ example: '1', required: false })
  isCash: string;

  @ApiProperty({ example: '1', required: false })
  isCancel: string;

  @ApiProperty({ example: '1', required: false })
  searchType: string;

  @ApiProperty({ required: false, example: '2025-03-24T00:00:00.000Z' })
  startDate?: string;

  @ApiProperty({ required: false, example: '2025-03-24T23:59:59.999Z' })
  endDate?: string;

  @ApiProperty({ example: 0, required: true })
  productBrandId: number;
  @ApiProperty({ example: 0, required: true })
  productModelId: number;
  @ApiProperty({ example: 0, required: true })
  productTypeId: number;
}

class ProductSalePayMentListSearchDto extends OmitType(SearchDto, [
  'active',
  'catalog',
] as const) {}

class ProductSalePayMentImageSearchDto extends OmitType(SearchDto, [
  'catalog',
] as const) {}

export {
  NotificationDto,
  SearchDto,
  UserSearchDto,
  UserGroupSearchDto,
  BranchSearchDto,
  BankSearchDto,
  ExpenseTypeSearchDto,
  ExpenseSearchDto,
  BranchTransferPriceSearchDto,
  ProductTypeSearchDto,
  ProductUnitSearchDto,
  ProductBrandSearchDto,
  ProductModelSearchDto,
  ProductColorSearchDto,
  ProductStorageSearchDto,
  MProvinceSearchDto,
  MDistrictSearchDto,
  MSubdistrictSearchDto,
  CustomerSearchDto,
  MCostExtraSearchDto,
  MFinanceSearchDto,
  MFinanceRateSearchDto,
  ProductSearchDto,
  ProductFinanceTableSearchDto,
  ProductImageSearchDto,
  ProductLogSearchDto,
  ProductBuySearchDto,
  TransferProductBranchSearchDto,
  ChangeProductCommissionSearchDto,
  ChangeProductPriceSearchDto,
  TransportSearchDto,
  RateFinanceSearchDto,
  ProductRepairSearchDto,
  ProductBookSearchDto,
  ProductSavingSearchDto,
  ProductSaleSearchDto,
  DefaultProductPriceSearchDto,
  ProductSalePayMentListSearchDto,
  ProductSalePayMentImageSearchDto,
  ProcessCaseSearchDto,
  ProcessBookSearchDto,
  ProcessSavingSearchDto,
  ManageAppleIdSearchDto,
  ManageProcessManageFinanceDto,
  PercentDownFinanceSearchDto,
  RatePurchaseSearchDto,
  PercentMonthFinanceSearchDto,
  WithdrawSumPriceSaleSearchDto,
  LatestNewsSearchDto,
  CustomerPaymentSearchDto,
  ClaimSearchDto,
  ShopInsuranceSearchDto,
};
