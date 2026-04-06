/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import dayjs from "src/helpers/dayjsConfig";
import { th } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfit } from "src/store/productSale";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { isEmpty } from "lodash";
import { fetchSelectBranch } from "src/store/branch";
import { useAuth } from "src/hooks/authContext";
import ProductSaleMobile from "./productSaleMobile";
import ProductSaleAccessibility from "./productSaleAccessibility";
import ProductSaleReRider from "./productSaleReRider";
import ProductSaleRegAppleId from "./productSaleRegAppleId";

import ProductPayMentLists from "./productPayMentLists";
import ProductBooks from "./productBooks";
import ProductRepair from "./productRepair";

import Expenses from "./expenses";
import ProductPaymentImages from "./productPaymentImages";
import BranchTransferPrice from "./branchTransferPrice";

const Profit = () => {
  const { user, isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();
  const [Branches, setBranches] = React.useState([]);
  const [SaleProductMobile, setSaleProductMobile] = React.useState([]);
  const [SaleProductBook, setSaleProductBook] = React.useState([]);
  const [SaleExpenses, setSaleExpenses] = React.useState([]);
  const [SaleProductRepair, setSaleProductRepair] = React.useState([]);

  const [SaleBranchTransferPrice, setSaleBranchTransferPrice] = React.useState(
    []
  );

  const [SaleProductReRider, setSaleProductReRider] = React.useState([]);

  const [SaleProductRegAppleId, setSaleProductRegAppleId] = React.useState([]);
  const [SaleProductAccessibility, setSaleProductAccessibility] =
    React.useState([]);
  const [SaleProductPayMentLists, setSaleProductPayMentLists] = React.useState(
    []
  );
  const [SaleProductPaymentImages, setSaleProductPaymentImages] =
    React.useState([]);
  const [expandedSections, setExpandedSections] = useState({
    equipmentSales: false,
    monthlyPayments: false,
    paymentBooks: false,
    expenses: false,
    productRepair: false,
    branchTransferPrice: false,
    saleEtc: false,
  });
  const [showBackToTop, setShowBackToTop] = useState(false);

  const storeBranch = useSelector((state) => state.branch);
  const storeProductSale = useSelector((state) => state.productSale);
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      branchId: user.branchId || "",
      startDate: dayjs().startOf("day").toDate(),
      endDate: dayjs().endOf("day").toDate(),
    },
  });

  // Sync Branches from Redux store
  React.useEffect(() => {
    if (!isEmpty(storeBranch.select)) {
      const formattedBranches = [
        { value: 0, label: "ทุกสาขา" },
        ...storeBranch.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      ];
      setBranches(formattedBranches);
    } else {
      setBranches([{ value: 0, label: "ทุกสาขา" }]);
    }
  }, [storeBranch.select]);

  // Sync previous search params and sales data
  React.useEffect(() => {
    if (!isEmpty(storeProductSale.paramsProfit)) {
      const prevParams = storeProductSale.paramsProfit;
      reset({
        branchId: prevParams.branchId,
        startDate: prevParams.startDate
          ? dayjs(prevParams.startDate).toDate()
          : dayjs().startOf("day").toDate(),
        endDate: prevParams.endDate
          ? dayjs(prevParams.endDate).toDate()
          : dayjs().endOf("day").toDate(),
      });
    } else {
      onSubmit({
        branchId: user.branchId,
        startDate: dayjs().startOf("day").toDate(),
        endDate: dayjs().endOf("day").toDate(),
      });
    }

    if (!isEmpty(storeProductSale.allDataProfit)) {
      const {
        saleProductMobile,
        saleProductAccessibility,
        productPayMent,
        productBook,
        expenses,
        productRepair,
        branchTransferPrice,
        saleProductReRider,
        saleProductRegAppleId,
      } = storeProductSale.allDataProfit;
      setSaleBranchTransferPrice(branchTransferPrice);
      setSaleProductReRider(saleProductReRider);
      setSaleProductRegAppleId(saleProductRegAppleId);
      setSaleProductRepair(productRepair);
      setSaleExpenses(expenses);
      setSaleProductMobile(saleProductMobile);
      setSaleProductAccessibility(saleProductAccessibility);
      setSaleProductBook(productBook);

      const { productPayMentLists, productPaymentImages } = productPayMent;
      setSaleProductPayMentLists(productPayMentLists);
      setSaleProductPaymentImages(productPaymentImages);
    }
  }, [storeProductSale.paramsProfit, storeProductSale.allDataProfit]);

  // Load initial data
  React.useEffect(() => {
    if (isEmpty(storeBranch.select)) {
      setIsLoadingOpen(true);
      dispatch(fetchSelectBranch())
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
    }
  }, []);

  // Handle Back to Top button visibility
  useEffect(() => {
    const handleScroll = () => {
      // console.log("Scroll position:", window.scrollY);
      setShowBackToTop(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onSubmit = (data) => {
    setIsLoadingOpen(true);
    dispatch(
      fetchProfit({
        startDate: dayjs(data.startDate).format("YYYY-MM-DD HH:mm:ss"),
        endDate: dayjs(data.endDate).format("YYYY-MM-DD HH:mm:ss"),
        branchId: data.branchId,
      })
    )
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "42px",
      borderRadius: "8px",
      borderColor: errors.branchId ? "#ef4444" : "#e5e7eb",
      backgroundColor: "white",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      "&:hover": {
        borderColor: errors.branchId ? "#ef4444" : "#d1d5db",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
      },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 11 }),
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => {
      const newState = { ...prev, [section]: !prev[section] };
      return newState;
    });
  };

  const toggleAllSections = () => {
    const allExpanded = Object.values(expandedSections).every((val) => val);
    setExpandedSections({
      equipmentSales: !allExpanded,
      saleEtc: !allExpanded,
      monthlyPayments: !allExpanded,
      paymentBooks: !allExpanded,
      productRepair: !allExpanded,
      expenses: !allExpanded,
      branchTransferPrice: !allExpanded,
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full grid grid-cols-1 gap-5">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-lg rounded-xl p-6 w-full col-span-1"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {permissions.includes("view-all-branches") ? (
            <div className="space-y-2">
              <label
                htmlFor="branchId"
                className="block text-sm font-medium text-gray-700"
              >
                ค้นหาสาขา
              </label>
              <Controller
                name="branchId"
                control={control}
                rules={{ required: "กรุณาเลือกสาขา" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    menuPortalTarget={document.body}
                    styles={customSelectStyles}
                    options={Branches}
                    placeholder="กรุณาเลือกสาขา"
                    isClearable
                    isSearchable
                    classNamePrefix="react-select"
                    value={
                      Branches.find((option) => option.value === field.value) ||
                      ""
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption ? selectedOption.value : "")
                    }
                  />
                )}
              />
              {errors.branchId && (
                <span className="text-red-500 text-xs">
                  {errors.branchId.message}
                </span>
              )}
            </div>
          ) : null}

          <div className="w-full flex flex-col lg:flex-row lg:items-end gap-6">
            <div className="w-full space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                วันที่เริ่มต้น
              </label>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <DatePicker
                    showIcon
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    selectsStart
                    startDate={field.value}
                    locale={th}
                    endDate={control._formValues.endDate}
                    // minDate={
                    //   permissions.includes("view-all-calendar")
                    //     ? dayjs().subtract(1, "month").startOf("month").toDate()
                    //     : dayjs().subtract(3, "day").toDate()
                    // }
                    maxDate={dayjs(watch("endDate")).toDate()}
                    dateFormat="dd/MM/yyyy"
                    timeZone="Asia/Bangkok"
                    wrapperClassName="w-full"
                    className={`w-full p-2.5 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white ${
                      errors.startDate ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                )}
              />
            </div>

            <div className="w-full space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                วันที่สิ้นสุด
              </label>
              <Controller
                name="endDate"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <DatePicker
                    showIcon
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    selectsEnd
                    startDate={control._formValues.startDate}
                    locale={th}
                    endDate={field.value}
                    minDate={dayjs(watch("startDate")).toDate()}
                    maxDate={dayjs().toDate()}
                    dateFormat="dd/MM/yyyy"
                    timeZone="Asia/Bangkok"
                    wrapperClassName="w-full"
                    className={`w-full p-2.5 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white ${
                      errors.endDate ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                )}
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingOpen}
              className={`w-full lg:w-56 px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${
                isLoadingOpen ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              ค้นหา
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleAllSections}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            aria-label={
              Object.values(expandedSections).every((val) => val)
                ? "Collapse All Sections"
                : "Expand All Sections"
            }
            aria-controls="equipment-sales-content monthly-payments-content"
          >
            {Object.values(expandedSections).every((val) => val)
              ? "Collapse All"
              : "Expand All"}
          </button>
        </div>

        {/* Sales/Downs Section */}
        <div className="bg-white shadow-lg rounded-xl">
          <button
            type="button"
            onClick={() => toggleSection("equipmentSales")}
            className="w-full flex justify-between items-center p-6 text-left focus:outline-none hover:bg-gray-50 transition duration-200"
            aria-expanded={expandedSections.equipmentSales}
            aria-controls="equipment-sales-content"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              สรุป ค่าเปิดใช้เครื่อง/ขายสด/ขายอุปกรณ์
            </h2>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${
                expandedSections.equipmentSales ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            id="equipment-sales-content"
            className={`transition-all duration-300 ease-in-out overflow-hidden min-h-0 ${
              expandedSections.equipmentSales
                ? "h-auto opacity-100 p-6"
                : "h-0 opacity-0 p-0"
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <ProductSaleMobile data={SaleProductMobile} />
              <ProductSaleAccessibility data={SaleProductAccessibility} />
            </div>
          </div>
        </div>

        {/* ReRider/RegAppleId Section */}
        <div className="bg-white shadow-lg rounded-xl">
          <button
            type="button"
            onClick={() => toggleSection("saleEtc")}
            className="w-full flex justify-between items-center p-6 text-left focus:outline-none hover:bg-gray-50 transition duration-200"
            aria-expanded={expandedSections.saleEtc}
            aria-controls="equipment-sales-content"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              สรุป รับค่าส่ง/ค่าสมัครอีเมล/AppleID/อื่น ๆ
            </h2>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${
                expandedSections.saleEtc ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            id="equipment-sales-content"
            className={`transition-all duration-300 ease-in-out overflow-hidden min-h-0 ${
              expandedSections.saleEtc
                ? "h-auto opacity-100 p-6"
                : "h-0 opacity-0 p-0"
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <ProductSaleReRider data={SaleProductReRider} />
              <ProductSaleRegAppleId data={SaleProductRegAppleId} />
            </div>
          </div>
        </div>

        {/* Payments downs Section */}
        {permissions.includes("view-productPayMent") ? (
          <div className="bg-white shadow-lg rounded-xl w-full">
            <button
              type="button"
              onClick={() => toggleSection("monthlyPayments")}
              className="w-full flex justify-between items-center p-6 text-left focus:outline-none hover:bg-gray-50 transition duration-200"
              aria-expanded={expandedSections.monthlyPayments}
              aria-controls="monthly-payments-content"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                สรุป ค่าบริการดูแลรายเดือน
              </h2>
              <svg
                className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${
                  expandedSections.monthlyPayments ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              id="monthly-payments-content"
              className={`transition-all duration-300 ease-in-out overflow-hidden min-h-0 ${
                expandedSections.monthlyPayments
                  ? "h-auto opacity-100 p-6"
                  : "h-0 opacity-0 p-0"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <ProductPayMentLists data={SaleProductPayMentLists} />
                <ProductPaymentImages data={SaleProductPaymentImages} />
              </div>
            </div>
          </div>
        ) : null}

        {/* Payments books Section */}
        <div className="bg-white shadow-lg rounded-xl w-full">
          <button
            type="button"
            onClick={() => toggleSection("paymentBooks")}
            className="w-full flex justify-between items-center p-6 text-left focus:outline-none hover:bg-gray-50 transition duration-200"
            aria-expanded={expandedSections.paymentBooks}
            aria-controls="monthly-payments-content"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              สรุป จองเครื่อง
            </h2>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${
                expandedSections.paymentBooks ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            id="monthly-payments-content"
            className={`transition-all duration-300 ease-in-out overflow-hidden min-h-0 ${
              expandedSections.paymentBooks
                ? "h-auto opacity-100 p-6"
                : "h-0 opacity-0 p-0"
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <ProductBooks data={SaleProductBook} />
            </div>
          </div>
        </div>

        {/* Product repair Section */}
        <div className="bg-white shadow-lg rounded-xl w-full">
          <button
            type="button"
            onClick={() => toggleSection("productRepair")}
            className="w-full flex justify-between items-center p-6 text-left focus:outline-none hover:bg-gray-50 transition duration-200"
            aria-expanded={expandedSections.productRepair}
            aria-controls="monthly-payments-content"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              สรุป ค่าซ่อม
            </h2>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${
                expandedSections.productRepair ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            id="monthly-payments-content"
            className={`transition-all duration-300 ease-in-out overflow-hidden min-h-0 ${
              expandedSections.productRepair
                ? "h-auto opacity-100 p-6"
                : "h-0 opacity-0 p-0"
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <ProductRepair data={SaleProductRepair} />
            </div>
          </div>
        </div>

        {/* Payments expenses Section */}
        <div className="bg-white shadow-lg rounded-xl w-full">
          <button
            type="button"
            onClick={() => toggleSection("expenses")}
            className="w-full flex justify-between items-center p-6 text-left focus:outline-none hover:bg-gray-50 transition duration-200"
            aria-expanded={expandedSections.expenses}
            aria-controls="monthly-payments-content"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              สรุป ค่าใช้จ่าย
            </h2>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${
                expandedSections.expenses ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            id="monthly-payments-content"
            className={`transition-all duration-300 ease-in-out overflow-hidden min-h-0 ${
              expandedSections.expenses
                ? "h-auto opacity-100 p-6"
                : "h-0 opacity-0 p-0"
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <Expenses data={SaleExpenses} />
            </div>
          </div>
        </div>

        {/* Branch Transfer Price Section */}
        <div className="bg-white shadow-lg rounded-xl w-full">
          <button
            type="button"
            onClick={() => toggleSection("branchTransferPrice")}
            className="w-full flex justify-between items-center p-6 text-left focus:outline-none hover:bg-gray-50 transition duration-200"
            aria-expanded={expandedSections.branchTransferPrice}
            aria-controls="monthly-payments-content"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              สรุป รับเงินต่างสาขา
            </h2>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${
                expandedSections.branchTransferPrice ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            id="monthly-payments-content"
            className={`transition-all duration-300 ease-in-out overflow-hidden min-h-0 ${
              expandedSections.branchTransferPrice
                ? "h-auto opacity-100 p-6"
                : "h-0 opacity-0 p-0"
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <BranchTransferPrice data={SaleBranchTransferPrice} />
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 z-50"
          aria-label="เลื่อนไปด้านบน"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

// PropTypes validation
Profit.propTypes = {
  // No props are passed to Profit, so no validation needed here
};

export default Profit;
