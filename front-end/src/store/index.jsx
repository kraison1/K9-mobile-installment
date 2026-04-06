import { combineReducers, configureStore } from "@reduxjs/toolkit";
import user from "src/store/user";
import customer from "src/store/customer";
import userGroup from "src/store/userGroup";
import branch from "src/store/branch";
import bank from "src/store/bank";
import expenseType from "src/store/expenseType";
import transport from "src/store/transport";
import rateFinance from "src/store/rateFinance";
import rateFinanceDown from "src/store/rateFinanceDown";
import expenses from "src/store/expenses";
import ocr from "src/store/ocr";
import chat from "src/store/chat";

import withdrawSumPriceSale from "src/store/withdrawSumPriceSale";
import branchTransferPrice from "src/store/branchTransferPrice";
import processBook from "src/store/processBook";
import processCase from "src/store/processCase";
import processSaving from "src/store/processSaving";
import manageAppleId from "src/store/manageAppleId";
import manageFinancial from "src/store/manageFinancial";
import product from "src/store/product";
import productPayMentList from "src/store/productPayMentList";
import productPayMentImage from "src/store/productPayMentImage";
import productSavingPayMentImage from "src/store/productSavingPayMentImage";
import productLog from "src/store/productLog";
import productType from "src/store/productType";
import productUnit from "src/store/productUnit";
import productBrand from "src/store/productBrand";
import productModel from "src/store/productModel";
import productColor from "src/store/productColor";
import productStorage from "src/store/productStorage";
import productBuy from "src/store/productBuy";
import productSale from "src/store/productSale";
import productBook from "src/store/productBook";
import productSaving from "src/store/productSaving";
import latestNews from "src/store/latestNews";

import transferProduct from "src/store/transferProduct";
import commissionProduct from "src/store/commissionProduct";
import priceProduct from "src/store/priceProduct";
import productRepair from "src/store/productRepair";
import productClaim from "src/store/productClaim";

import province from "src/store/province";
import district from "src/store/district";
import subdistrict from "src/store/subdistrict";
import defaultProductPrice from "src/store/defaultProductPrice";
import ratePurchase from "src/store/ratePurchase";
import customerPaymentList from "src/store/customerPaymentList";
import shopInsurance from "src/store/shopInsurance";

// รวม reducers ทั้งหมดเข้าไปใน appReducer
const appReducer = combineReducers({
  user,
  customer,
  userGroup,
  branch,
  bank,
  processBook,
  processCase,
  processSaving,
  expenseType,
  transport,
  rateFinance,
  expenses,
  branchTransferPrice,
  product,
  productPayMentList,
  productPayMentImage,
  productSavingPayMentImage,
  productLog,
  productType,
  productUnit,
  productBrand,
  productModel,
  productColor,
  productStorage,
  productBuy,
  productClaim,
  productSale,
  productBook,
  productSaving,
  transferProduct,
  commissionProduct,
  priceProduct,
  productRepair,
  defaultProductPrice,
  province,
  district,
  subdistrict,
  manageAppleId,
  ocr,
  manageFinancial,
  rateFinanceDown,
  withdrawSumPriceSale,
  latestNews,
  ratePurchase,
  chat,
  customerPaymentList,
  shopInsurance,
});

// สร้าง rootReducer ที่จะรีเซ็ต state ทั้งหมดเมื่อ action 'RESET_APP' ถูก dispatch
const rootReducer = (state, action) => {
  if (action.type === "RESET_APP") {
    state = undefined; // รีเซ็ต state ทั้งหมดใน store
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
