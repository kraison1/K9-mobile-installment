/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { fetchInfoPriceProducts } from "src/store/priceProduct";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "src/hooks/authContext";
import { fetchSelectProductModels } from "src/store/productModel";
import Select from "react-select";
import { fetchSelectProductStorages } from "src/store/productStorage";
import { fetchSelectBranch } from "src/store/branch";
import { fetchSelectRateFinance } from "src/store/rateFinance";

const ModalPriceProducts = ({ open, setModal, RowData, submitRow }) => {
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();
  const store = useSelector((state) => state.priceProduct);
  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [ProductModels, setProductModels] = React.useState([]);
  const [ProductStorages, setProductStorages] = React.useState([]);
  const [Branches, setBranches] = React.useState([]);
  const [RateFinances, setRateFinances] = React.useState([]);

  const storePriceProduct = useSelector((state) => state.productModel);
  const storeProductStorage = useSelector((state) => state.productStorage);
  const storeBranch = useSelector((state) => state.branch);
  const storeRateFinance = useSelector((state) => state.rateFinance);

  React.useEffect(() => {
    if (!isEmpty(storeBranch.select)) {
      setBranches(
        storeBranch.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, [storeBranch.select]);

  React.useEffect(() => {
    if (!isEmpty(storePriceProduct.select)) {
      setProductModels(
        storePriceProduct.select.map((item) => ({
          value: item.id,
          label: item.name,
          type: item.type,
        }))
      );
    }
  }, [storePriceProduct.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductStorage.select)) {
      setProductStorages(
        storeProductStorage.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, [storeProductStorage.select]);

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (isEmpty(storePriceProduct.select)) {
        dispatch(fetchSelectProductModels(["มือถือ"]));
      }

      if (isEmpty(storeRateFinance.select)) {
        dispatch(fetchSelectRateFinance());
      }

      if (isEmpty(storeBranch.select)) {
        dispatch(fetchSelectBranch());
      }

      if (isEmpty(storeProductStorage.select)) {
        dispatch(fetchSelectProductStorages());
      }

      modalRef.current.focus();
      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      } else {
        reset(RowData);
      }
    }
  }, [open]);

  React.useEffect(() => {
    if (!isEmpty(storeRateFinance.select)) {
      setRateFinances(
        storeRateFinance.select.map((item) => ({
          value: item.id,
          label: item.name,
          valueMonth: item.valueMonth,
          valueEqual: item.valueEqual,
        }))
      );
    }
  }, [storeRateFinance.select]);

  React.useEffect(() => {
    if (!isEmpty(store.data)) {
      reset(store.data);
    }
  }, [store]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoPriceProducts(id))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: RowData,
  });

  const onSubmit = (data) => {
    submitRow(data);
  };

  return (
    <div
      ref={modalRef}
      tabIndex="-1"
      className={`${
        open
          ? "flex justify-center items-center absolute inset-0 overflow-y-auto z-10 overflow-x-hidden p-5 bg-gray-300 bg-opacity-70"
          : "hidden"
      }`}
      onKeyDown={(e) => (e.key == "Escape" ? setModal(false) : null)}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-2xl"
        ref={container}
      >
        <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[95vh]">
          <div className="flex items-center justify-between p-3 border-b rounded-t">
            <h3 className="text-xl font-semibold text-gray-900">
              {`${
                isNaN(RowData.id)
                  ? "เพิ่มรายการใหม่"
                  : `แก้ไขรายการ: ${RowData.code}`
              }`}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="static-modal"
              onClick={() => setModal(false)}
            >
              <MdClose />
            </button>
          </div>

          <div className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="items-center sm:col-span-2">
              <label
                htmlFor="branchId"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ปรับให้กับสาขา
              </label>
              <Controller
                id="branchId"
                name="branchId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 11 }),
                      }}
                      id="branchId"
                      options={Branches}
                      placeholder="กรุณาเลือกจากสาขา"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={
                        Branches.find(
                          (option) => option.value === field.value
                        ) || ""
                      }
                      onChange={(selectedOption) => {
                        field.onChange(
                          selectedOption ? selectedOption.value : ""
                        );
                      }}
                    />
                  );
                }}
              />
              {errors.branchId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ปรับให้กับสาขา
                </span>
              )}
            </div>

            <div className="items-center col-span-2 lg:col-span-1">
              <label
                htmlFor="productModelId"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                รุ่น
              </label>
              <Controller
                id="productModelId"
                name="productModelId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 11 }),
                      }}
                      id="productModelId"
                      options={ProductModels}
                      placeholder="กรุณาเลือกรุ่น"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={
                        ProductModels.find(
                          (option) => option.value === field.value
                        ) || ""
                      }
                      onChange={(selectedOption) => {
                        field.onChange(
                          selectedOption ? selectedOption.value : ""
                        );
                      }}
                    />
                  );
                }}
              />
              {errors.productModelId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล รุ่น
                </span>
              )}
            </div>

            <div className="items-center col-span-2 lg:col-span-1">
              <label
                htmlFor="productStorageId"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ความจุ
              </label>
              <Controller
                id="productStorageId"
                name="productStorageId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 11 }),
                      }}
                      id="productStorageId"
                      options={ProductStorages}
                      placeholder="กรุณาเลือกความจุ"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={
                        ProductStorages.find(
                          (option) => option.value === field.value
                        ) || ""
                      }
                      onChange={(selectedOption) => {
                        field.onChange(
                          selectedOption ? selectedOption.value : ""
                        );
                      }}
                    />
                  );
                }}
              />
              {errors.productStorageId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ความจุ
                </span>
              )}
            </div>

            <div className="items-center col-span-2">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="items-center col-span-3 lg:col-span-1">
                  <label
                    htmlFor="priceDownPayment"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    ค่าเปิดใช้เครื่อง
                  </label>
                  <Controller
                    id="priceDownPayment"
                    name="priceDownPayment"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="priceDownPayment"
                        type="number"
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.priceDownPayment
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                  {errors.priceDownPayment && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล ค่าเปิดใช้เครื่อง
                    </span>
                  )}
                </div>

                <div className="items-center col-span-3 lg:col-span-1">
                  <label
                    htmlFor="priceDownPaymentPercent"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    ค่าเปิดใช้เครื่อง (%)
                  </label>
                  <Controller
                    id="priceDownPaymentPercent"
                    name="priceDownPaymentPercent"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="priceDownPaymentPercent"
                        type="number"
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.priceDownPaymentPercent
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                  {errors.priceDownPaymentPercent && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล ค่าเปิดใช้เครื่อง %
                    </span>
                  )}
                </div>

                <div className="items-center col-span-3 lg:col-span-1">
                  <label
                    htmlFor="payPerMonth"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    ค่าดูแลต่อเดือน
                  </label>
                  <Controller
                    id="payPerMonth"
                    name="payPerMonth"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="payPerMonth"
                        type="number"
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.payPerMonth
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                  {errors.payPerMonth && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล ค่าดูแลต่อเดือน
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="items-center col-span-2 border p-1 border-gray-300 rounded-md">
              <label
                htmlFor="valueMonth"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                จำนวนเดือนที่เช่า
              </label>
              <Controller
                name="valueMonth"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-2 gap-x-4">
                    {RateFinances.map((rate) => (
                      <div key={rate.id} className="flex items-center">
                        <input
                          {...field}
                          id={`valueMonth-${rate.valueMonth}`}
                          type="radio"
                          value={rate.valueMonth.toString()}
                          checked={field.value === rate.valueMonth.toString()}
                          className="mr-2"
                        />
                        <label
                          htmlFor={`valueMonth-${rate.valueMonth}`}
                          className={
                            rate.valueMonth === 6
                              ? "text-red-400"
                              : rate.valueMonth === 10
                              ? "text-green-400"
                              : "text-blue-400"
                          }
                        >
                          {rate.valueMonth} เดือน
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              />
              {errors.valueMonth && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล จำนวนเดือนที่เช่า
                </span>
              )}
            </div>

            <div className="items-center col-span-2 lg:col-span-1">
              <label
                htmlFor="priceWholeSale"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ขายส่ง (บ.)
              </label>
              <Controller
                id="priceWholeSale"
                name="priceWholeSale"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="priceWholeSale"
                    type="number"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.priceWholeSale
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.priceWholeSale && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ขายส่ง
                </span>
              )}
            </div>

            <div className="items-center col-span-2 lg:col-span-1">
              <label
                htmlFor="priceSale"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ขายปลีก (บ.)
              </label>
              <Controller
                id="priceSale"
                name="priceSale"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="priceSale"
                    type="number"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.priceSale ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.priceSale && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ขายปลีก
                </span>
              )}
            </div>

            <div className="items-center">
              <label
                htmlFor="hand"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ประเภท
              </label>
              <Controller
                name="hand"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      id="hand-1"
                      type="radio"
                      value="มือหนึ่ง"
                      checked={field.value === "มือหนึ่ง"}
                      onChange={() => field.onChange("มือหนึ่ง")}
                      className="mr-2"
                    />
                    <label htmlFor="hand-1" className="text-red-500">
                      มือหนึ่ง
                    </label>
                    <input
                      {...field}
                      id="hand-2"
                      type="radio"
                      value="มือสอง"
                      checked={field.value === "มือสอง"}
                      onChange={() => field.onChange("มือสอง")}
                      className="mr-2 ml-4"
                    />
                    <label htmlFor="hand-2" className="text-green-500">
                      มือสอง
                    </label>
                  </div>
                )}
              />
              {errors.hand && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล ประเภท
                </span>
              )}
            </div>
          </div>

          {!isNaN(RowData.id) ? null : (
            <div className="flex justify-end items-center p-4 lg:p-5 border-t border-gray-200 rounded-b">
              <button
                disabled={isLoadingOpen}
                type="submit"
                className="py-2 px-5 ml-3 text-sm text-white bg-blue-400 rounded-lg border border-blue-400 hover:bg-blue-500"
              >
                ยืนยัน
              </button>
              <button
                onClick={() => setModal(!open)}
                type="button"
                className="py-2.5 px-5 ml-3 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-red-300 hover:text-white"
              >
                ปิด
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

ModalPriceProducts.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalPriceProducts;
