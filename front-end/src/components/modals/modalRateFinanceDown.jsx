/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { useAuth } from "src/hooks/authContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchInfoRateFinanceDown } from "src/store/rateFinanceDown";
import { fetchSelectProductModels } from "src/store/productModel";
import { fetchSelectProductStorages } from "src/store/productStorage";
import Select from "react-select";

const ModalRateFinanceDown = ({ open, setModal, RowData, submitRow }) => {
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();
  const [ProductModels, setProductModels] = React.useState([]);
  const [ProductStorages, setProductStorages] = React.useState([]);
  const store = useSelector((state) => state.rateFinanceDown);

  const storeProductModel = useSelector((state) => state.productModel);
  const storeProductStorage = useSelector((state) => state.productStorage);

  const modalRef = React.useRef(null);
  const container = React.useRef(null);

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (isEmpty(storeProductStorage.select)) {
        dispatch(fetchSelectProductStorages());
      }

      if (isEmpty(storeProductModel.select)) {
        dispatch(fetchSelectProductModels(['มือถือ']));
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
    if (!isEmpty(store.data)) {
      reset(store.data);
    }
  }, [store]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoRateFinanceDown(id))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: RowData,
  });

  const onSubmit = (data) => {
    submitRow(data);
  };

  React.useEffect(() => {
    if (!isEmpty(storeProductModel.select)) {
      setProductModels(
        storeProductModel.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, [storeProductModel.select]);

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

  return (
    <div
      ref={modalRef}
      tabIndex="-1"
      className={`${
        open
          ? "flex justify-center items-center absolute inset-0 overflow-y-auto z-10 overflow-x-hidden p-5 bg-gray-300 bg-opacity-70"
          : "hidden"
      }`}
      onKeyDown={(e) => (e.key === "Escape" ? setModal(false) : null)}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-2xl"
        ref={container}
      >
        <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[95vh]">
          <div className="flex items-center justify-between p-3 border-b rounded-t">
            <h3 className="text-xl font-semibold text-gray-900">
              {isNaN(RowData.id)
                ? "เพิ่มรายการใหม่"
                : `แก้ไขรายการ: ${RowData.name}`}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              onClick={() => setModal(false)}
            >
              <MdClose />
            </button>
          </div>
          <div className="p-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor="isPromotions"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                โปรโมชั่น
              </label>
              <Controller
                name="isPromotions"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      id="isPromotions-0"
                      type="radio"
                      value="0"
                      checked={field.value === "0"}
                      onChange={() => field.onChange("0")}
                      className="mr-2"
                    />
                    <label htmlFor="isPromotions-0" className="text-red-400">
                      ไม่
                    </label>
                    <input
                      {...field}
                      id="isPromotions-1"
                      type="radio"
                      value="1"
                      checked={field.value === "1"}
                      onChange={() => field.onChange("1")}
                      className="mr-2 ml-4"
                    />
                    <label htmlFor="isPromotions-1" className="text-green-400">
                      ใช่
                    </label>
                  </div>
                )}
              />
              {errors.isPromotions && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล โปรโมชั่น
                </span>
              )}
            </div>

            {watch("isPromotions") == 1 ? (
              <div className="items-center col-span-3 lg:col-span-1">
                <label
                  htmlFor="priceCommission"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ค่าคอม (บ.)
                </label>
                <Controller
                  id="priceCommission"
                  name="priceCommission"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      value={watch("priceCommission")}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceCommission
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
                {errors.priceCommission && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ค่าคอม (บ.)
                  </span>
                )}
              </div>
            ) : (
              <div className="items-center col-span-3 lg:col-span-1"></div>
            )}

            {watch("isPromotions") == 1 ? (
              <div className="items-center col-span-3 lg:col-span-1">
                <label
                  htmlFor="payPerMonth"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ค่าดูแลต่อเดือน (บ.)
                </label>
                <Controller
                  id="payPerMonth"
                  name="payPerMonth"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      value={watch("payPerMonth")}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.payPerMonth
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
                {errors.payPerMonth && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ค่าดูแลต่อเดือน (บ.)
                  </span>
                )}
              </div>
            ) : (
              <div className="items-center col-span-3 lg:col-span-1"></div>
            )}

            <div className="items-center col-span-3 lg:col-span-1">
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

            <div className="items-center col-span-3 lg:col-span-1">
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

            {watch("isPromotions") == "1" ? (
              <div className="items-center col-span-2 lg:col-span-1">
                <label
                  htmlFor="priceDownPayment"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  วางดาวน์ (บ.)
                </label>
                <Controller
                  id="priceDownPayment"
                  name="priceDownPayment"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      value={watch("priceDownPayment")}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceDownPayment
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
                {errors.priceDownPayment && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล วางดาวน์ (บ.)
                  </span>
                )}
              </div>
            ) : (
              <div className="items-center col-span-2 lg:col-span-1">
                <label
                  htmlFor="percentDown"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  วางดาวน์ (%)
                </label>
                <Controller
                  id="percentDown"
                  name="percentDown"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      value={watch("percentDown")}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.percentDown
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
                {errors.percentDown && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล วางดาวน์ (%)
                  </span>
                )}
              </div>
            )}

            <div className="items-center col-span-2 lg:col-span-1">
              <label
                htmlFor="priceHandOne"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ราคามือ 1
              </label>
              <Controller
                id="priceHandOne"
                name="priceHandOne"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.priceHandOne ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.priceHandOne && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ราคามือ 1
                </span>
              )}
            </div>

            <div className="items-center col-span-2 lg:col-span-1">
              <label
                htmlFor="priceStartHandTwo"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ราคาน้อยสุดมือ 2
              </label>
              <Controller
                id="priceStartHandTwo"
                name="priceStartHandTwo"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.priceStartHandTwo
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.priceStartHandTwo && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ราคาน้อยสุดมือ 2
                </span>
              )}
            </div>

            <div className="items-center col-span-2 lg:col-span-1">
              <label
                htmlFor="priceEndHandTwo"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ราคาเริ่มสูงสุดมือ 2
              </label>
              <Controller
                id="priceEndHandTwo"
                name="priceEndHandTwo"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.priceEndHandTwo
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.priceEndHandTwo && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ราคาเริ่มสูงสุดมือ 2
                </span>
              )}
            </div>

            <div className="items-center col-span-1 lg:col-span-3">
              <label
                htmlFor="active"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                สถานะ
              </label>
              <Controller
                name="active"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      id="active-0"
                      type="radio"
                      value="0"
                      checked={field.value === "0"}
                      onChange={() => field.onChange("0")}
                      className="mr-2"
                    />
                    <label htmlFor="active-0" className="text-red-400">
                      ปิดใช้งาน
                    </label>
                    <input
                      {...field}
                      id="active-1"
                      type="radio"
                      value="1"
                      checked={field.value === "1"}
                      onChange={() => field.onChange("1")}
                      className="mr-2 ml-4"
                    />
                    <label htmlFor="active-1" className="text-green-400">
                      เปิดใช้งาน
                    </label>
                  </div>
                )}
              />
              {errors.active && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล สถานะ
                </span>
              )}
            </div>
          </div>

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
        </div>
      </form>
    </div>
  );
};

ModalRateFinanceDown.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalRateFinanceDown;
