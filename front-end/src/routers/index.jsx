import {
  MdAssignmentAdd,
  MdOutlineSettings,
  MdOutlineStore,
  MdOutlineEmojiPeople,
  MdOutlineChangeCircle,
  MdChat,
  MdOutlinePayment,
  MdAccountBalanceWallet,
  MdLogin,
  MdAssignment,
  MdOutlineSavings,
  MdMenuBook,
  MdCached,
  MdPointOfSale,
  MdOutlineCreditCard,
  MdMenuOpen,
  MdBuild,
} from "react-icons/md";

import Book from "src/pages/books";
import Saving from "src/pages/savings";

import Downs from "src/pages/downs";
import ProductSaleMobile from "src/pages/productSaleMoile";
import PayDown from "src/pages/payDown";
import PaySaving from "src/pages/paySaving";
import ProductSale from "src/pages/productSale";
import Profit from "src/pages/profit";
import ChatPage from "src/pages/chat";
import Customer from "src/pages/customers";
import TransferProduct from "src/pages/transferProducts";
import TransferProductAccessibility from "src/pages/transferProducts/indexAccessibility";
import TransferProductRepair from "src/pages/transferProducts/indexRepair";
import ListMenus from "src/pages/listMenus";

import CustomerPaymentList from "src/pages/customerPaymentList";
import CommissionProducts from "src/pages/commissionProducts";
import PriceProducts from "src/pages/priceProducts";
import ProductInstoreRepairs from "src/pages/productRepairs/instore";
import ProductOutsourcedRepairs from "src/pages/productRepairs/outsourced";
import ProductWalkinRepairs from "src/pages/productRepairs/walkin";
import ProductWholesaleRepairs from "src/pages/productRepairs/wholesale";

import ProductClaimAccessory from "src/pages/productClaim/accessory";
import ProductClaimRepair from "src/pages/productClaim/repair";

import ReportExpense from "src/pages/reports/expense";
import BranchTransferPrice from "src/pages/branchTransferPrice";
import ReportProduct from "src/pages/reports/product";
import ProductMobileBuy from "src/pages/productBuy/mobile";
import ProductBuy from "src/pages/productBuy";
import ProcessBooks from "src/pages/processBooks";
import ProcessSavings from "src/pages/processSavings";
import ProcessCases from "src/pages/processCases";
import SummaryPaymentlist from "src/pages/summaryPaymentlist";
import StockProduct from "src/pages/stocks/product";
import StockProductAccessibility from "src/pages/stocks/productAccessibility";
import StockProductRepair from "src/pages/stocks/productRepair";
import StockProductBrand from "src/pages/stocks/productBrand";
import StockProductColor from "src/pages/stocks/productColor";
import StockProductModel from "src/pages/stocks/productModel";
import DefaultProductPrice from "src/pages/stocks/defaultProductPrice";
import StockProductStorage from "src/pages/stocks/productStorage";
import StockProductType from "src/pages/stocks/productType";
import StockProductUnit from "src/pages/stocks/productUnit";
import SettingExpenseType from "src/pages/settings/expenseType";
import SettingTransport from "src/pages/settings/transport";
import SettingRateFinance from "src/pages/settings/rateFinance";
import SettingLatestNews from "src/pages/settings/latestNews";

import SettingRateFinanceDown from "src/pages/settings/rateFinanceDown";
import SettingRatePurchase from "src/pages/settings/ratePurchase";
import SettingshopInsurance from "src/pages/settings/shopInsurance";

import SettingManageAppleId from "src/pages/settings/manageAppleId";
import SettingBranch from "src/pages/settings/branch";
import SettingBank from "src/pages/settings/bank";
import SettingUserGroup from "src/pages/settings/userGroup";
import SettingUser from "src/pages/settings/user";
import LoginPage from "src/pages/auth/login";
import ManageFinancial from "src/pages/manageFinancial";
import ManageFinancialList from "src/pages/manageFinancial/manageFinancialList";
import WithdrawSumPriceSale from "src/pages/withdrawSumPriceSale";

const AllRouters = [
  // ---------------- AUTH ----------------
  {
    icon: MdLogin,
    label: `เข้าสู่ระบบ`,
    id: "auth-login",
    legacyIds: ["login"],
    authRequired: false,
    path: "/login",
    element: LoginPage,
    children: [],
  },

  // ---------------- HOME / LIST MENUS ----------------
  {
    icon: MdMenuOpen,
    label: `รายการเมนู`,
    id: "home-menu",
    legacyIds: ["listMenus"],
    authRequired: true,
    path: "/",
    element: ListMenus,
    children: [],
  },

  // ---------------- CHAT ----------------
  {
    icon: MdChat,
    label: `แชท`,
    id: "chat",
    legacyIds: ["chat"],
    authRequired: true,
    path: "/chat",
    element: ChatPage,
    children: [],
  },

  // ---------------- PURCHASE ----------------
  {
    icon: MdOutlineStore,
    label: `ซื้อเข้า`,
    id: "purchase",
    legacyIds: ["products"], // กลุ่มเดิมอยู่ใต้ products
    authRequired: true,
    path: "/purchase",
    children: [
      {
        label: `มือถือ/แท็บเล็ต`,
        id: "purchase-mobile",
        legacyIds: ["products-mobile-buy"],
        path: "/purchase/mobile",
        authRequired: true,
        element: ProductMobileBuy,
      },
      {
        label: `อุปกรณ์เสริม/อะไหล่`,
        id: "purchase-accessory",
        legacyIds: ["products-buy"],
        path: "/purchase/accessory",
        authRequired: true,
        element: ProductBuy,
      },
    ],
  },

  // ---------------- SALES ----------------
  {
    icon: MdPointOfSale,
    label: "ขายสด",
    id: "sales",
    legacyIds: [], // ✅ อย่าใส่ซ้ำกับลูก
    authRequired: true,
    path: "/sales",
    children: [
      {
        label: "มือถือ/แท็บเล็ต",
        id: "sales-mobile",
        legacyIds: ["sales-mobile"], // ✅ legacy เดิมของ route เดี่ยว
        path: "/sales/mobile",
        authRequired: true,
        element: ProductSaleMobile,
      },
      {
        label: "อุปกรณ์เสริม",
        id: "sales-accessory",
        legacyIds: ["products-sale"], // ✅ legacy เดิม
        path: "/sales/accessory",
        authRequired: true,
        element: ProductSale,
      },
    ],
  },

  {
    icon: MdBuild,
    label: "งานซ่อม",
    id: "sales-repair",
    legacyIds: [], // ✅ ห้ามใส่ "productRepair" ซ้ำทุกตัว
    authRequired: true,
    path: "/repairs",
    children: [
      {
        label: "เครื่องหน้าร้าน",
        id: "repair-instore",
        legacyIds: ["repair-instore-legacy"], // ✅ สร้าง legacy ใหม่ให้ไม่ชน
        path: "/repairs/instore",
        authRequired: true,
        element: ProductInstoreRepairs,
      },
      {
        label: "ลูกค้าหน้าร้าน",
        id: "repair-walkin",
        legacyIds: ["repair-walkin-legacy"], // ✅ ไม่ซ้ำกัน
        path: "/repairs/walkin",
        authRequired: true,
        element: ProductWalkinRepairs,
      },
      {
        label: "ร้านค้าส่งซ่อม",
        id: "repair-wholesale",
        legacyIds: ["repair-wholesale-legacy"], // ✅ ไม่ซ้ำกัน
        path: "/repairs/wholesale",
        authRequired: true,
        element: ProductWholesaleRepairs,
      },
      {
        label: "ส่งซ่อมร้านนอก",
        id: "repair-outsourced",
        legacyIds: ["productRepair"], // ✅ legacy เดิมมีแค่อันเดียว ก็ผูกไว้ “อันเดียว”
        path: "/repairs/outsourced",
        authRequired: true,
        element: ProductOutsourcedRepairs,
      },
    ],
  },

  // ---------------- FINANCE ----------------
  {
    icon: MdOutlineCreditCard,
    label: `ไฟแนนซ์`,
    id: "finance",
    legacyIds: ["manageFinancial", "manageFinancialList"], // เดิมเป็นเมนูเดี่ยว 2 ตัว
    authRequired: true,
    path: "/finance",
    children: [
      {
        label: `ขอสินเชื่อ`,
        id: "finance-loan-new",
        legacyIds: ["manageFinancial"],
        path: "/finance/loan/new",
        authRequired: true,
        element: ManageFinancial,
      },
      {
        label: `รายการสินเชื่อ`,
        id: "finance-loan-list",
        legacyIds: ["manageFinancialList"],
        path: "/finance/loan/list",
        authRequired: true,
        element: ManageFinancialList,
      },
      {
        label: `ราคากลาง (เปิดใช้เครื่อง)`,
        id: "finance-rate-activate",
        legacyIds: ["settings-rateFinance-down"],
        path: "/finance/rate/activate",
        authRequired: true,
        element: SettingRateFinanceDown,
      },
      {
        label: `เรทเช่า (รายเดือน)`,
        id: "finance-rate-rent",
        legacyIds: ["settings-rateFinance"],
        path: "/finance/rate/rent",
        authRequired: true,
        element: SettingRateFinance,
      },
    ],
  },

  // ---------------- CONTRACTS ----------------
  {
    icon: MdAssignmentAdd,
    label: `เพิ่มรายการสัญญาเช่า`,
    id: "contracts",
    legacyIds: ["contacts-down", "changeCommission"],
    authRequired: true,
    path: "/contracts",
    children: [
      {
        label: `เพิ่ม/รายการ สัญญา`,
        id: "contracts-list",
        legacyIds: ["contacts-down"],
        path: "/contracts/list",
        authRequired: true,
        element: Downs,
      },
      {
        label: `ปรับราคาเรทเช่า`,
        id: "contracts-rent-adjust",
        legacyIds: ["changeCommission"],
        path: "/contracts/rent/adjust",
        authRequired: true,
        element: CommissionProducts,
      },
    ],
  },

  // ---------------- SERVICE (MONTHLY) ----------------
  {
    icon: MdOutlinePayment,
    label: `ค่าบริการดูแลรายเดือน`,
    id: "service-monthly",
    legacyIds: [
      "contacts-payDown",
      "contacts-processCases",
      "summary-paymentlist",
      "customer-payment-lists",
    ],
    authRequired: true,
    path: "/service/monthly",
    children: [
      {
        label: `เก็บค่างวด`,
        id: "service-monthly-collect",
        legacyIds: ["contacts-payDown"],
        path: "/service/monthly/collect",
        authRequired: true,
        element: PayDown,
      },
      {
        label: `การดำเนินการสัญญา`,
        id: "service-monthly-process",
        legacyIds: ["contacts-processCases"],
        path: "/service/monthly/process",
        authRequired: true,
        element: ProcessCases,
      },
      {
        label: `สรุปค่าบริการดูแลรายเดือน`,
        id: "service-monthly-summary",
        legacyIds: ["summary-paymentlist"],
        path: "/service/monthly/summary",
        authRequired: true,
        element: SummaryPaymentlist,
      },
      {
        label: `รายการชำระเงินลูกค้า`,
        id: "service-monthly-payments",
        legacyIds: ["customer-payment-lists"],
        path: "/service/monthly/payments",
        authRequired: true,
        element: CustomerPaymentList,
      },
    ],
  },

  // ---------------- ACCOUNTING ----------------
  {
    icon: MdAccountBalanceWallet,
    label: `การเงิน`,
    id: "accounting",
    legacyIds: [
      "expenses",
      "branch-transfer-price",
      "profit",
      "withdrawSumPriceSale",
    ],
    authRequired: true,
    path: "/accounting",
    children: [
      {
        label: `ค่าใช้จ่าย`,
        id: "accounting-expense",
        legacyIds: ["expenses"],
        path: "/accounting/expense",
        authRequired: true,
        children: [
          {
            label: `ประเภทค่าใช้จ่าย`,
            id: "accounting-expense-type",
            legacyIds: ["expenses-type"],
            path: "/accounting/expense/type",
            authRequired: true,
            element: SettingExpenseType,
          },
          {
            label: `เพิ่มค่าใช้จ่าย`,
            id: "accounting-expense-list",
            legacyIds: ["expenses-lists"],
            path: "/accounting/expense/list",
            authRequired: true,
            element: ReportExpense,
          },
        ],
      },
      {
        label: `รับเงินต่างสาขา`,
        id: "accounting-branch-transfer",
        legacyIds: ["branch-transfer-price"],
        path: "/accounting/branch-transfer",
        authRequired: true,
        element: BranchTransferPrice,
      },
      {
        label: `กำไร/ขาดทุน`,
        id: "accounting-profit",
        legacyIds: ["profit"],
        path: "/accounting/profit",
        authRequired: true,
        element: Profit,
      },
      {
        label: `รายการเบิกค่าสินค้า`,
        id: "accounting-withdraw",
        legacyIds: ["withdrawSumPriceSale"],
        path: "/accounting/withdraw",
        authRequired: true,
        element: WithdrawSumPriceSale,
      },
    ],
  },

  // ---------------- BOOKING ----------------
  {
    icon: MdMenuBook,
    label: `จองเครื่อง`,
    id: "booking",
    legacyIds: ["books"],
    authRequired: true,
    path: "/booking",
    children: [
      {
        label: `เพิ่ม/รายการ จอง`,
        id: "booking-list",
        legacyIds: ["books-lists"],
        authRequired: true,
        path: "/booking/list",
        element: Book,
      },
      {
        label: `การดำเนินการ จอง`,
        id: "booking-process",
        legacyIds: ["books-processBook"],
        authRequired: true,
        path: "/booking/process",
        element: ProcessBooks,
      },
    ],
  },

  // ---------------- SAVING ----------------
  {
    icon: MdOutlineSavings,
    label: `ออมเครื่อง`,
    id: "saving",
    legacyIds: ["savings"],
    authRequired: true,
    path: "/saving",
    children: [
      {
        label: `เพิ่ม/รายการ ออม`,
        id: "saving-list",
        legacyIds: ["savings-lists"],
        authRequired: true,
        path: "/saving/list",
        element: Saving,
      },
      {
        label: `ชำระออม`,
        id: "saving-pay",
        legacyIds: ["savings-paySaving"],
        authRequired: true,
        path: "/saving/pay",
        element: PaySaving,
      },
      {
        label: `การดำเนินการ ออม`,
        id: "saving-process",
        legacyIds: ["savings-processSaving"],
        authRequired: true,
        path: "/saving/process",
        element: ProcessSavings,
      },
    ],
  },

  // ---------------- TRANSFER ----------------
  {
    icon: MdOutlineChangeCircle,
    label: `ย้ายสินค้า`,
    id: "transfer",
    legacyIds: [
      "transferProduct",
      "transferProductAccessibility",
      "transferProductRepair",
    ],
    authRequired: true,
    path: "/transfer",
    children: [
      {
        label: `ย้ายมือถือ/แท็บเล็ต`,
        id: "transfer-mobile",
        legacyIds: ["transferProduct"],
        path: "/transfer/mobile",
        authRequired: true,
        element: TransferProduct,
      },
      {
        label: `ย้ายอุปกรณ์เสริม`,
        id: "transfer-accessory",
        legacyIds: ["transferProductAccessibility"],
        path: "/transfer/accessory",
        authRequired: true,
        element: TransferProductAccessibility,
      },
      {
        label: `ย้ายอะไหล่ซ่อม`,
        id: "transfer-repair",
        legacyIds: ["transferProductRepair"],
        path: "/transfer/repair",
        authRequired: true,
        element: TransferProductRepair,
      },
    ],
  },

  // ---------------- CLAIM ----------------
  {
    icon: MdCached,
    label: `เคลมสินค้า`,
    id: "claim",
    legacyIds: ["product-claim"],
    authRequired: true,
    path: "/claim",
    children: [
      {
        label: `เคลมอุปกรณ์เสริม`,
        id: "claim-accessory",
        legacyIds: ["product-claim"],
        path: "/claim/accessory",
        authRequired: true,
        element: ProductClaimAccessory,
      },
      {
        label: `เคลมอะไหล่ซ่อม`,
        id: "claim-repair",
        legacyIds: ["product-claim"],
        path: "/claim/repair",
        authRequired: true,
        element: ProductClaimRepair,
      },
    ],
  },

  // ---------------- CUSTOMERS ----------------
  {
    icon: MdOutlineEmojiPeople,
    label: `ลูกค้า/ร้านค้า`,
    id: "customers",
    legacyIds: ["customer"],
    authRequired: true,
    path: "/customers",
    element: Customer,
    children: [],
  },

  // ---------------- REPORTS ----------------
  {
    icon: MdAssignment,
    label: `รายงาน`,
    id: "reports",
    legacyIds: ["reports"],
    path: "/reports",
    authRequired: true,
    children: [
      {
        label: "สินค้า",
        id: "reports-product",
        legacyIds: ["reports-products"],
        path: "/reports/product",
        authRequired: true,
        element: ReportProduct,
      },
    ],
  },

  // ---------------- INVENTORY ----------------
  {
    icon: MdOutlineStore,
    label: `คลังสินค้า`,
    id: "inventory",
    legacyIds: ["stocks"],
    path: "/inventory",
    authRequired: true,
    children: [
      {
        label: "มือถือ/แท็บเล็ต",
        id: "inventory-mobile",
        legacyIds: ["stocks-products"],
        path: "/inventory/mobile",
        authRequired: true,
        element: StockProduct,
      },
      {
        label: "อุปกรณ์เสริม",
        id: "inventory-accessory",
        legacyIds: ["stocks-accessibility-products"],
        path: "/inventory/accessory",
        authRequired: true,
        element: StockProductAccessibility,
      },
      {
        label: "อะไหล่ซ่อม",
        id: "inventory-repair",
        legacyIds: ["stocks-repair-products"],
        path: "/inventory/repair",
        authRequired: true,
        element: StockProductRepair,
      },
    ],
  },

  // ---------------- SETTINGS ----------------
  {
    icon: MdOutlineSettings,
    label: `ตั้งค่า`,
    id: "settings",
    legacyIds: ["settings"],
    path: "/settings",
    authRequired: true,
    children: [
      {
        label: "ข่าวสาร",
        id: "settings-news",
        legacyIds: ["settings-latest-news"],
        path: "/settings/news",
        authRequired: true,
        element: SettingLatestNews,
      },

      // โครงสร้างสินค้า (เดิมอยู่ stocks-xxx)
      {
        label: "หน่วย",
        id: "settings-product-unit",
        legacyIds: ["stocks-units"],
        path: "/settings/product/unit",
        authRequired: true,
        element: StockProductUnit,
      },
      {
        label: "ประเภท",
        id: "settings-product-type",
        legacyIds: ["stocks-types"],
        path: "/settings/product/type",
        authRequired: true,
        element: StockProductType,
      },
      {
        label: "แบรนด์",
        id: "settings-product-brand",
        legacyIds: ["stocks-brands"],
        path: "/settings/product/brand",
        authRequired: true,
        element: StockProductBrand,
      },
      {
        label: "รุ่น",
        id: "settings-product-model",
        legacyIds: ["stocks-model"],
        path: "/settings/product/model",
        authRequired: true,
        element: StockProductModel,
      },
      {
        label: "สี",
        id: "settings-product-color",
        legacyIds: ["stocks-colors"],
        path: "/settings/product/color",
        authRequired: true,
        element: StockProductColor,
      },
      {
        label: "ความจุ",
        id: "settings-product-storage",
        legacyIds: ["stocks-storages"],
        path: "/settings/product/storage",
        authRequired: true,
        element: StockProductStorage,
      },
      {
        label: "ประกันร้าน",
        id: "shop-insurance",
        legacyIds: ["shop-insurance"],
        path: "/settings/shop-insurance",
        authRequired: true,
        element: SettingshopInsurance,
      },

      {
        label: "ราคาเริ่มต้นอุปกรณ์เสริม",
        id: "settings-product-default-price",
        legacyIds: ["stocks-default-product-price"],
        path: "/settings/product/default-price",
        authRequired: true,
        element: DefaultProductPrice,
      },
      {
        label: "ราคากลาง (รับซื้อ)",
        id: "settings-finance-rate-purchase",
        legacyIds: ["settings-ratePurchase"],
        path: "/settings/finance/rate-purchase",
        authRequired: true,
        element: SettingRatePurchase,
      },

      // ปรับราคา (เดิม changePrice)
      {
        label: "ปรับราคามือถือใหม่",
        id: "settings-price-adjust",
        legacyIds: ["changePrice"],
        path: "/settings/price/adjust",
        authRequired: true,
        element: PriceProducts,
      },

      // โลจิสติกส์/การเงิน/ระบบ
      {
        label: "ขนส่ง",
        id: "settings-transport",
        legacyIds: ["settings-transport"],
        path: "/settings/transport",
        authRequired: true,
        element: SettingTransport,
      },
      {
        label: "ธนาคาร",
        id: "settings-bank",
        legacyIds: ["settings-banks"],
        path: "/settings/bank",
        authRequired: true,
        element: SettingBank,
      },
      {
        label: "จัดการ AppleID",
        id: "settings-appleid",
        legacyIds: ["settings-manage-apple-id"],
        path: "/settings/appleid",
        authRequired: true,
        element: SettingManageAppleId,
      },

      // องค์กร/ผู้ใช้
      {
        label: "สาขา",
        id: "settings-branch",
        legacyIds: ["settings-branchs"],
        path: "/settings/branch",
        authRequired: true,
        element: SettingBranch,
      },
      {
        label: "ตำแหน่งผู้ใช้งาน",
        id: "settings-user-group",
        legacyIds: ["settings-userGroups"],
        path: "/settings/user-group",
        authRequired: true,
        element: SettingUserGroup,
      },
      {
        label: "ผู้ใช้งาน",
        id: "settings-user",
        legacyIds: ["settings-users"],
        path: "/settings/user",
        authRequired: true,
        element: SettingUser,
      },
    ],
  },
];

export { AllRouters };
