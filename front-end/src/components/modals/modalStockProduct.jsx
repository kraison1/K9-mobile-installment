/* eslint-disable react-hooks/exhaustive-deps */
import { debounce, isEmpty, isNumber } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import React from "react";
import { fetchSelectProductModels } from "src/store/productModel";
import { fetchSelectProductStorages } from "src/store/productStorage";
import { fetchSelectProductColors } from "src/store/productColor";
import { useAuth } from "src/hooks/authContext";
import { fetchInfoProduct } from "src/store/product";
import Select from "react-select";
import HorizontalRule from "src/helpers/horizontalRule";
import FileDropzone from "src/helpers/fileDropzone";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import DragAndDropImages from "src/components/dragAndDropImages";
import {
  deleteProductImage,
  updateProductImageSeq,
} from "src/store/productImage";
import { handleScanner } from "src/helpers/disabledHandleScanner";
import { fetchSelectCustomer } from "src/store/customer";
import AsyncSelect from "react-select/async";
import { th } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchSelectRateFinance } from "src/store/rateFinance";
import { formatDateTimeZoneTH } from "src/helpers/formatDate";
import { formatNumberDigit } from "src/helpers/formatNumber";
import { fetchSelectProductTypes } from "src/store/productType";
import { fetchSelectProductBrandsBy } from "src/store/productBrand";
import { fetchSelectShopInsurance } from "src/store/shopInsurance";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalStockProduct = ({
  open,
  setModal,
  RowData,
  submitRow,
  getItems,
  isSee,
}) => {
  const { user, isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();
  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [ProductModels, setProductModels] = React.useState([]);
  const [ProductTypes, setProductTypes] = React.useState([]);
  const [ProductBrand, setProductBrand] = React.useState([]);
  const [ShopInsurance, setShopInsurance] = React.useState([]);

  const [ProductStorages, setProductStorages] = React.useState([]);
  const [ProductColors, setProductColors] = React.useState([]);
  const [Customers, setCustomers] = React.useState([]);
  const [RateFinances, setRateFinances] = React.useState([]);
  const dispatch = useDispatch();
  const store = useSelector((state) => state.product);
  const storeProductModel = useSelector((state) => state.productModel);
  const storeProductType = useSelector((state) => state.productType);
  const storeProductBrand = useSelector((state) => state.productBrand);
  const storeProductStorage = useSelector((state) => state.productStorage);
  const storeProductColor = useSelector((state) => state.productColor);
  const storeCustomer = useSelector((state) => state.customer);
  const storeRateFinance = useSelector((state) => state.rateFinance);
  const storeShopInsurance = useSelector((state) => state.shopInsurance);

  React.useEffect(() => {
    if (!isEmpty(storeProductColor.select)) {
      setProductColors(
        storeProductColor.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    }
  }, [storeProductColor.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductBrand.selectMobile)) {
      setProductBrand(
        storeProductBrand.selectMobile.map((item) => ({
          value: item.id,
          label: `${item.brandname}`,
        })),
      );
    }
  }, [storeProductBrand.selectMobile]);

  React.useEffect(() => {
    if (!isEmpty(storeRateFinance.select)) {
      setRateFinances(
        storeRateFinance.select.map((item) => ({
          value: item.id,
          label: item.name,
          valueMonth: item.valueMonth,
          valueEqual: item.valueEqual,
        })),
      );
    }
  }, [storeRateFinance.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductStorage.select)) {
      setProductStorages(
        storeProductStorage.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    }
  }, [storeProductStorage.select]);

  React.useEffect(() => {
    if (!isEmpty(storeCustomer.select)) {
      setCustomers(
        storeCustomer.select.map((item) => ({
          value: item.id,
          label: `${item.name} ${item.lastname} (${item.citizenIdCard})`,
        })),
      );
    }
  }, [storeCustomer.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductModel.select)) {
      setProductModels(
        storeProductModel.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    }
  }, [storeProductModel.select]);

  React.useEffect(() => {
    if (!isEmpty(storeShopInsurance.select)) {
      setShopInsurance(storeShopInsurance.select);
    }
  }, [storeShopInsurance.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductType.select)) {
      setProductTypes(
        storeProductType.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    }
  }, [storeProductType.select]);

  const loadOptionsCustomer = React.useCallback(
    debounce((inputValue, callback) => {
      if (!inputValue) {
        callback([]);
        return;
      }

      dispatch(
        fetchSelectCustomer({
          branchId: user.branchId,
          customerType: ["2"],
          search: inputValue,
        }),
      )
        .unwrap()
        .then((result) => {
          const options = result.map((customer) => ({
            value: customer.id,
            label: `${customer.name} ${customer.lastname} (${customer.citizenIdCard})`,
          }));
          callback(options);
        })
        .catch((error) => {
          console.error("Load options error:", error);
          callback([]);
        });
    }, 500),
    [dispatch, user.branchId],
  );

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (isEmpty(storeRateFinance.select)) {
        dispatch(fetchSelectRateFinance());
      }

      if (isEmpty(storeProductColor.select)) {
        dispatch(fetchSelectProductColors());
      }

      if (isEmpty(storeProductStorage.select)) {
        dispatch(fetchSelectProductStorages());
      }

      if (isEmpty(storeProductModel.select)) {
        dispatch(fetchSelectProductModels(["มือถือ"]));
      }

      if (isEmpty(storeProductType.select)) {
        dispatch(fetchSelectProductTypes("มือถือ"));
      }

      if (isEmpty(storeProductBrand.selectMobile)) {
        dispatch(
          fetchSelectProductBrandsBy({
            catalog: ["มือถือ"],
          }),
        );
      }

      if (isEmpty(storeShopInsurance.select)) {
        dispatch(fetchSelectShopInsurance());
      }

      if (isEmpty(storeCustomer.select)) {
        dispatch(
          fetchSelectCustomer({
            branchId: user.branchId,
            customerType: ["2"],
            search: isNumber(RowData.venderId) ? RowData.venderId : null,
          }),
        );
      }

      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      } else {
        reset(RowData);
      }

      modalRef.current.focus();
    }
  }, [open]);

  React.useEffect(() => {
    if (!isEmpty(store.data)) {
      reset(store.data);
    }
  }, [store]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoProduct(id))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: RowData,
  });

  const onSubmit = (data) => {
    submitRow({ ...data, createByUserId: user.id });
  };

  const submitSwitch = (items) => {
    setIsLoadingOpen(true);
    dispatch(updateProductImageSeq(items))
      .unwrap()
      .then(() => {
        const { page } = store.params;
        getItems(page);
        fetchInfo(RowData.id);
        setIsLoadingOpen(false);
      })
      .catch(() => setIsLoadingOpen(false));
  };

  const onDelete = (item) => {
    setIsLoadingOpen(true);
    dispatch(deleteProductImage(item.id))
      .unwrap()
      .then(() => {
        fetchInfo(RowData.id);
        setIsLoadingOpen(false);
      })
      .catch(() => setIsLoadingOpen(false));
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
        className="relative w-full max-w-6xl"
        ref={container}
      >
        <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[95vh]">
          <div className="flex items-center justify-between p-3 border-b rounded-t">
            <h3 className="text-xl font-semibold text-gray-900">
              {`${
                isNaN(RowData.id)
                  ? "เพิ่มรายการใหม่"
                  : `แก้ไขรายการ: ${RowData.code || RowData.imei}`
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
          <fieldset disabled={isSee}>
            <div className="p-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {user.type != "ไฟแนนซ์" ? (
                import.meta.env.VITE_SYSTEM_NAME == "THUNDER" ? (
                  <div className="items-center col-span-3 lg:col-span-3">
                    <label
                      htmlFor="buyFormShop"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      ซื้อจากร้านค้า
                    </label>
                    <Controller
                      id="buyFormShop"
                      name="buyFormShop"
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="buyFormShop"
                          type="text"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.buyFormShop
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                        />
                      )}
                    />
                    {errors.buyFormShop && (
                      <span className="text-red-500 text-xs mt-1">
                        กรุณาใส่ข้อมูล ซื้อจากร้านค้า
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="items-center col-span-3">
                    <label
                      htmlFor="venderId"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      ลูกค้า/บัตรประชาชน/เลขผู้เสียภาษี / ร้านค้า
                    </label>
                    <Controller
                      id="venderId"
                      name="venderId"
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <AsyncSelect
                          {...field}
                          menuPortalTarget={document.body}
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 11 }),
                          }}
                          id="venderId"
                          defaultOptions={Customers}
                          loadOptions={loadOptionsCustomer}
                          placeholder="กรุณาเลือกลูกค้า"
                          isClearable
                          isSearchable
                          classNamePrefix="react-select"
                          value={
                            Customers.find(
                              (option) => option.value === field.value,
                            ) || ""
                          }
                          onChange={(selectedOption) => {
                            field.onChange(
                              selectedOption ? selectedOption.value : null,
                            );
                          }}
                        />
                      )}
                    />
                  </div>
                )
              ) : null}

              {user.type != "ไฟแนนซ์" ? (
                import.meta.env.VITE_SYSTEM_NAME == "THUNDER" ? null : (
                  <div className="items-center col-span-3">
                    <label
                      htmlFor="refOldStockNumber"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      รหัสสต็อกเก่า
                    </label>
                    <Controller
                      id="refOldStockNumber"
                      name="refOldStockNumber"
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="refOldStockNumber"
                          type="number"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.refOldStockNumber
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                        />
                      )}
                    />
                    {errors.refOldStockNumber && (
                      <span className="text-red-500 text-xs mt-1">
                        กรุณาใส่ข้อมูล รหัสสต็อกเก่า
                      </span>
                    )}
                  </div>
                )
              ) : null}

              <div className="items-center col-span-3 lg:col-span-1">
                <label
                  htmlFor="productTypeId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ประเภท
                </label>
                <Controller
                  id="productTypeId"
                  name="productTypeId"
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
                        id="productTypeId"
                        options={ProductTypes}
                        placeholder="กรุณาเลือกประเภท"
                        isClearable
                        isSearchable
                        classNamePrefix="react-select"
                        value={
                          ProductTypes.find(
                            (option) => option.value === field.value,
                          ) || ""
                        }
                        onChange={(selectedOption) => {
                          field.onChange(
                            selectedOption ? selectedOption.value : "",
                          );
                        }}
                      />
                    );
                  }}
                />
                {errors.productTypeId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ประเภท
                  </span>
                )}
              </div>

              <div className="items-center col-span-3 lg:col-span-1">
                <label
                  htmlFor="productBrandId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  แบรนด์
                </label>
                <Controller
                  id="productBrandId"
                  name="productBrandId"
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
                        id="productBrandId"
                        options={ProductBrand}
                        placeholder="กรุณาเลือกแบรนด์"
                        isClearable
                        isSearchable
                        classNamePrefix="react-select"
                        value={
                          ProductBrand.find(
                            (option) => option.value === field.value,
                          ) || ""
                        }
                        onChange={(selectedOption) => {
                          field.onChange(
                            selectedOption ? selectedOption.value : "",
                          );
                        }}
                      />
                    );
                  }}
                />
                {errors.productBrandId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล แบรนด์
                  </span>
                )}
              </div>

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
                            (option) => option.value === field.value,
                          ) || ""
                        }
                        onChange={(selectedOption) => {
                          field.onChange(
                            selectedOption ? selectedOption.value : "",
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
                            (option) => option.value === field.value,
                          ) || ""
                        }
                        onChange={(selectedOption) => {
                          field.onChange(
                            selectedOption ? selectedOption.value : "",
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

              <div className="items-center col-span-3 lg:col-span-1">
                <label
                  htmlFor="productColorId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  สี
                </label>
                <Controller
                  id="productColorId"
                  name="productColorId"
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
                        id="productColorId"
                        options={ProductColors}
                        placeholder="กรุณาเลือกสี"
                        isClearable
                        isSearchable
                        classNamePrefix="react-select"
                        value={
                          ProductColors.find(
                            (option) => option.value === field.value,
                          ) || ""
                        }
                        onChange={(selectedOption) => {
                          field.onChange(
                            selectedOption ? selectedOption.value : "",
                          );
                        }}
                      />
                    );
                  }}
                />
                {errors.productColorId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล สี
                  </span>
                )}
              </div>

              <div className="items-center col-span-3 lg:col-span-1">
                <label
                  htmlFor="imei"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  หมายเลขเครื่อง/หมายเลข IMEI
                </label>
                <Controller
                  id="imei"
                  name="imei"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div className="relative flex mt-1 gap-2">
                      <input
                        {...field}
                        id="imei"
                        type="text"
                        onKeyDown={(e) => handleScanner(e)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.imei ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    </div>
                  )}
                />
                {errors.imei && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล หมายเลขเครื่อง/หมายเลข IMEI
                  </span>
                )}
              </div>

              <div className="items-center col-span-3 lg:col-span-1">
                <label
                  htmlFor="batteryHealth"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  สุขภาพแบต %
                </label>
                <Controller
                  id="batteryHealth"
                  name="batteryHealth"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="batteryHealth"
                      type="number"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.batteryHealth
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
                {errors.batteryHealth && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล สุขภาพแบต
                  </span>
                )}
              </div>

              <div className="items-center col-span-3 lg:col-span-1">
                <label
                  htmlFor="machineCondition"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  สภาพเครื่อง %
                </label>
                <Controller
                  id="machineCondition"
                  name="machineCondition"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="machineCondition"
                      type="number"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.machineCondition
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
                {errors.machineCondition && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล สภาพเครื่อง
                  </span>
                )}
              </div>

              <div className="items-center col-span-3 lg:col-span-1 border p-1 border-gray-300 rounded-md">
                <label
                  htmlFor="hand"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  สินค้า
                </label>
                <Controller
                  name="hand"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div className="grid  grid-cols-1 lg:grid-cols-4 gap-y-2 gap-x-4">
                      <div className="flex items-center">
                        <input
                          {...field}
                          id="hand-0"
                          type="radio"
                          value="มือหนึ่ง"
                          checked={field.value === "มือหนึ่ง"}
                          onChange={() => field.onChange("มือหนึ่ง")}
                          className="mr-2"
                        />
                        <label htmlFor="hand-0" className="text-red-400">
                          มือหนึ่ง
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          {...field}
                          id="hand-1"
                          type="radio"
                          value="มือสอง"
                          checked={field.value === "มือสอง"}
                          onChange={() => field.onChange("มือสอง")}
                          className="mr-2"
                        />
                        <label htmlFor="hand-1" className="text-blue-400">
                          มือสอง
                        </label>
                      </div>
                    </div>
                  )}
                />
                {errors.boxType && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาเลือกข้อมูล สถาพสินค้า
                  </span>
                )}
              </div>

              <div className="items-center col-span-3 lg:col-span-1 border p-1 border-gray-300 rounded-md">
                <label
                  htmlFor="simType"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ใช้ได้ทุกซิม
                </label>
                <Controller
                  name="simType"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div className="grid grid-cols-4 gap-y-2 gap-x-4">
                      <div className="flex items-center">
                        <input
                          {...field}
                          id="simType-0"
                          type="radio"
                          value="ไม่"
                          checked={field.value === "ไม่"}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setValue("simName", ""); // กำหนดค่า simName เมื่อ simType เป็น 0
                          }}
                          className="mr-2"
                        />
                        <label htmlFor="simType-0" className="text-red-400">
                          ไม่
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          {...field}
                          id="simType-1"
                          type="radio"
                          value="ใช่"
                          checked={field.value === "ใช่"}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setValue("simName", ""); // ตั้งค่า simName ให้เป็นค่าว่างเมื่อ simType เป็น 1
                          }}
                          className="mr-2"
                        />
                        <label htmlFor="simType-1" className="text-blue-400">
                          ใช่
                        </label>
                      </div>
                    </div>
                  )}
                />
                {errors.simType && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาเลือกข้อมูล ใช้ได้ทุกซิม
                  </span>
                )}
              </div>

              <div className="items-center col-span-3 lg:col-span-1">
                {watch("simType") === "ไม่" && ( // ตรวจสอบว่า simType เป็น 0 ถึงจะแสดง
                  <Controller
                    id="simName"
                    name="simName"
                    control={control}
                    rules={{
                      validate: (value) => value.trim() !== "", // ตรวจสอบว่า simName ต้องไม่ว่าง
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="simName"
                        type="text"
                        placeholder="ใช้ได้เฉพาะ"
                        className={`block w-full px-2 py-4 border ${
                          errors.simName ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                )}
                {errors.simName && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล เครือข่าย
                  </span>
                )}
              </div>

              <div className="items-center col-span-3 lg:col-span-2 border p-1 border-gray-300 rounded-md">
                <label
                  htmlFor="boxType"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  กล่อง
                </label>
                <Controller
                  name="boxType"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div className="grid  grid-cols-1 lg:grid-cols-4 gap-y-2 gap-x-4">
                      <div className="flex items-center">
                        <input
                          {...field}
                          id="boxType-0"
                          type="radio"
                          value="ไม่มี"
                          checked={field.value === "ไม่มี"}
                          onChange={() => field.onChange("ไม่มี")}
                          className="mr-2"
                        />
                        <label htmlFor="boxType-0" className="text-red-400">
                          ไม่มี
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          {...field}
                          id="boxType-1"
                          type="radio"
                          value="มี"
                          checked={field.value === "มี"}
                          onChange={() => field.onChange("มี")}
                          className="mr-2"
                        />
                        <label htmlFor="boxType-1" className="text-blue-400">
                          มี
                        </label>
                      </div>

                      {/* <div className="flex items-center">
                        <input
                          {...field}
                          id="boxType-2"
                          type="radio"
                          value="ครบกล่องตรงอีมี่"
                          checked={field.value === "ครบกล่องตรงอีมี่"}
                          onChange={() => field.onChange("ครบกล่องตรงอีมี่")}
                          className="mr-2"
                        />
                        <label htmlFor="boxType-2" className="text-green-400">
                          ครบกล่องตรงอีมี่
                        </label>
                      </div> */}
                    </div>
                  )}
                />
                {errors.boxType && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาเลือกข้อมูล กล่อง
                  </span>
                )}
              </div>

              <div className="items-center col-span-3 lg:col-span-1 border p-1 border-gray-300 rounded-md">
                <label
                  htmlFor="shopCenterInsurance"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ประกันศูนย์
                </label>
                <Controller
                  name="shopCenterInsurance"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div className="grid grid-cols-4 gap-y-2 gap-x-4">
                      <div className="flex items-center">
                        <input
                          {...field}
                          id="shopCenterInsurance-0"
                          type="radio"
                          value="ไม่มี"
                          checked={field.value === "ไม่มี"}
                          onChange={() => field.onChange("ไม่มี")}
                          className="mr-2"
                        />
                        <label
                          htmlFor="shopCenterInsurance-0"
                          className="text-red-400"
                        >
                          ไม่มี
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          {...field}
                          id="shopCenterInsurance-1"
                          type="radio"
                          value="มี"
                          checked={field.value === "มี"}
                          onChange={() => field.onChange("มี")}
                          className="mr-2"
                        />
                        <label
                          htmlFor="shopCenterInsurance-1"
                          className="text-blue-400"
                        >
                          มี
                        </label>
                      </div>
                    </div>
                  )}
                />
                {errors.shopCenterInsurance && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาเลือกข้อมูล ประกันศูนย์
                  </span>
                )}
              </div>

              <div className="items-center col-span-3 lg:col-span-2 border p-1 border-gray-300 rounded-md">
                <label
                  htmlFor="shopInsurance"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ประกันร้าน (วัน)
                </label>
                <Controller
                  name="shopInsurance"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div className="grid grid-cols-4 gap-y-2 gap-x-4">
                      {ShopInsurance.map((insurance) => (
                        <div key={insurance.name} className="flex items-center">
                          <input
                            {...field}
                            id={`shopInsurance-${insurance.name}`}
                            type="radio"
                            value={insurance.name}
                            checked={field.value === insurance.name}
                            onChange={() => field.onChange(insurance.name)}
                            className="mr-2"
                          />
                          <label
                            htmlFor={`shopInsurance-${insurance.name}`}
                            className={insurance.color}
                          >
                            {insurance.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                />
                {errors.shopInsurance && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาเลือกข้อมูล ประกันร้าน
                  </span>
                )}
              </div>

              {watch("shopCenterInsurance") === "มี" ? (
                <div className="items-center col-span-3 lg:col-span-1 border p-1 border-gray-300 rounded-md">
                  <label
                    htmlFor="shopCenterInsuranceDate"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    วันที่หมดประกันศูนย์
                  </label>
                  <Controller
                    name="shopCenterInsuranceDate"
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <DatePicker
                        showIcon
                        locale={th}
                        selected={field.value}
                        onChange={(date) => field.onChange(date)}
                        dateFormat="dd/MM/yyyy"
                        timeZone="Asia/Bangkok"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholderText="เลือกวันที่"
                      />
                    )}
                  />
                  {errors.shopCenterInsuranceDate && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาเลือกข้อมูล วันที่หมดประกันศูนย์
                    </span>
                  )}
                </div>
              ) : null}

              <div className="items-center col-span-3 lg:col-span-3 border p-1 border-gray-300 rounded-md">
                <label
                  htmlFor="freeGift"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ชุดชาร์จ
                </label>
                <Controller
                  name="freeGift"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div className="grid  grid-cols-1 lg:grid-cols-4 gap-y-2 gap-x-4">
                      <div className="flex items-center">
                        <input
                          {...field}
                          id="freeGift-0"
                          type="radio"
                          value="ไม่มี"
                          checked={field.value === "ไม่มี"}
                          onChange={() => field.onChange("ไม่มี")}
                          className="mr-2"
                        />
                        <label htmlFor="freeGift-0" className="text-red-400">
                          ไม่มี
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          {...field}
                          id="freeGift-2"
                          type="radio"
                          value="หัวชาร์จ"
                          checked={field.value === "หัวชาร์จ"}
                          onChange={() => field.onChange("หัวชาร์จ")}
                          className="mr-2"
                        />
                        <label htmlFor="freeGift-2" className="text-blue-400">
                          หัวชาร์จ
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          {...field}
                          id="freeGift-3"
                          type="radio"
                          value="สายชาร์จ"
                          checked={field.value === "สายชาร์จ"}
                          onChange={() => field.onChange("สายชาร์จ")}
                          className="mr-2"
                        />
                        <label htmlFor="freeGift-3" className="text-blue-400">
                          สายชาร์จ
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          {...field}
                          id="freeGift-1"
                          type="radio"
                          value="หัวชาร์จ+สายชาร์จ"
                          checked={field.value === "หัวชาร์จ+สายชาร์จ"}
                          onChange={() => field.onChange("หัวชาร์จ+สายชาร์จ")}
                          className="mr-2"
                        />
                        <label htmlFor="freeGift-1" className="text-green-400">
                          หัวชาร์จ+สายชาร์จ
                        </label>
                      </div>
                    </div>
                  )}
                />
                {errors.freeGift && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาเลือกข้อมูล ชุดชาร์จ
                  </span>
                )}
              </div>

              <div className="items-center col-span-3 lg:col-span-3">
                <HorizontalRule />
              </div>

              <div className="items-center col-span-3 lg:col-span-1">
                <label
                  htmlFor="priceCostBuy"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ราคาต้นทุน (บาท/หน่วย)
                </label>
                <Controller
                  id="priceCostBuy"
                  name="priceCostBuy"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceCostBuy"
                      type="number"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceCostBuy
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
                {errors.priceCostBuy && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ราคาต้นทุน
                  </span>
                )}
              </div>

              {user.type != "ไฟแนนซ์" ? (
                <div className="items-center col-span-3 lg:col-span-1">
                  <label
                    htmlFor="priceWholeSale"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    ราคาขายส่ง (บาท/หน่วย)
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
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                  {errors.priceWholeSale && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล ราคาขายส่ง
                    </span>
                  )}
                </div>
              ) : null}

              <div className="items-center col-span-3 lg:col-span-1">
                <label
                  htmlFor="priceWholeSale"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ราคาขายปลีก (บาท/หน่วย)
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
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
                {errors.priceSale && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ราคาขายปลีก
                  </span>
                )}
              </div>

              {user.type != "ไฟแนนซ์" ? (
                <div className="items-center col-span-3 lg:col-span-1">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="items-center col-span-2 lg:col-span-1">
                      <label
                        htmlFor="priceCommission"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        ค่าคอม (บาท)
                      </label>
                      <Controller
                        id="priceCommission"
                        name="priceCommission"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="priceCommission"
                            type="number"
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.priceCommission
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                          />
                        )}
                      />
                      {errors.priceCommission && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล ค่าคอม
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {user.type != "ไฟแนนซ์" ? (
                <div className="items-center col-span-3 lg:col-span-1">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {user.type != "ไฟแนนซ์" ? (
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
                    ) : null}

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
                  </div>
                </div>
              ) : null}

              {user.type != "ไฟแนนซ์" ? (
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
              ) : null}

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

              {/* {user.type != "ไฟแนนซ์" ? (
                <div className="items-center col-span-3 lg:col-span-3">
                  <div className="p-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="items-center col-span-3 lg:col-span-1">
                      <label
                        htmlFor="priceRepair"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        ยอดซ่อม (บาท)
                      </label>
                      <Controller
                        id="priceRepair"
                        name="priceRepair"
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="priceRepair"
                            type="number"
                            disabled
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.priceRepair
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                          />
                        )}
                      />
                      {errors.priceRepair && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล ยอดซ่อม
                        </span>
                      )}
                    </div>

                    <div className="items-center col-span-3 lg:col-span-1">
                      <label
                        htmlFor="priceReRider"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        ค่าสมัคร Email (บาท)
                      </label>
                      <Controller
                        id="priceReRider"
                        name="priceReRider"
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="priceReRider"
                            type="number"
                            disabled
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.priceReRider
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                          />
                        )}
                      />
                      {errors.priceReRider && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล ค่าสมัคร Email
                        </span>
                      )}
                    </div>

                    <div className="items-center col-span-3 lg:col-span-1">
                      <label
                        htmlFor="priceRegAppleId"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        ค่าสมัคร Apple ID (บาท)
                      </label>
                      <Controller
                        id="priceRegAppleId"
                        name="priceRegAppleId"
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="priceRegAppleId"
                            type="number"
                            disabled
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.priceRegAppleId
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                          />
                        )}
                      />
                      {errors.priceRegAppleId && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล ค่าสมัคร Apple ID
                        </span>
                      )}
                    </div>

                    <div className="items-center col-span-3 lg:col-span-1">
                      <label
                        htmlFor="priceETC"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        ค่าบริการอื่น ๆ ต้นทุน (บาท)
                      </label>
                      <Controller
                        id="priceETC"
                        name="priceETC"
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="priceETC"
                            type="number"
                            disabled
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.priceETC
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                          />
                        )}
                      />
                      {errors.priceETC && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล ค่าบริการอื่น ๆ
                        </span>
                      )}
                    </div>

                    <div className="items-center col-span-3 lg:col-span-3">
                      <label
                        htmlFor="note"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        หมายเหตุ
                      </label>
                      <Controller
                        id="note"
                        name="note"
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            id="note"
                            type="text"
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.note ? "border-red-500" : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              ) : null} */}

              {permissions.includes("view-status-product") && watch("id") ? (
                <div className="items-center col-span-3 lg:col-span-3">
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
                      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-4">
                        <div className="flex items-center">
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
                        </div>

                        <div className="flex items-center">
                          <input
                            {...field}
                            id="active-1"
                            type="radio"
                            value="1"
                            checked={field.value === "1"}
                            onChange={() => field.onChange("1")}
                            className="mr-2"
                          />
                          <label htmlFor="active-1" className="text-green-400">
                            พร้อมขาย
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            {...field}
                            id="active-3"
                            type="radio"
                            value="3"
                            checked={field.value === "3"}
                            onChange={() => field.onChange("3")}
                            className="mr-2"
                          />
                          <label htmlFor="active-3" className="text-black">
                            มีในสัญญา
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            {...field}
                            id="active-6"
                            type="radio"
                            value="6"
                            checked={field.value === "6"}
                            onChange={() => field.onChange("6")}
                            className="mr-2"
                          />
                          <label htmlFor="active-6" className="text-yellow-400">
                            จอง
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            {...field}
                            id="active-7"
                            type="radio"
                            value="7"
                            checked={field.value === "7"}
                            onChange={() => field.onChange("7")}
                            className="mr-2"
                          />
                          <label htmlFor="active-7" className="text-black">
                            มีในออม
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            {...field}
                            id="active-8"
                            type="radio"
                            value="8"
                            checked={field.value === "8"}
                            onChange={() => field.onChange("8")}
                            className="mr-2"
                          />
                          <label htmlFor="active-8" className="text-red-400">
                            ซ่อม
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            {...field}
                            id="active-9"
                            type="radio"
                            value="9"
                            checked={field.value === "9"}
                            onChange={() => field.onChange("9")}
                            className="mr-2"
                          />
                          <label htmlFor="active-9" className="text-black">
                            ใช้ภายใน
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            {...field}
                            id="active-10"
                            type="radio"
                            value="10"
                            checked={field.value === "10"}
                            onChange={() => field.onChange("10")}
                            className="mr-2"
                          />
                          <label htmlFor="active-10" className="text-black">
                            เครื่องคืน
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            {...field}
                            id="active-11"
                            type="radio"
                            value="11"
                            checked={field.value === "11"}
                            onChange={() => field.onChange("11")}
                            className="mr-2"
                          />
                          <label htmlFor="active-11" className="text-black">
                            เครื่องยึด
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            {...field}
                            id="active-4"
                            type="radio"
                            value="4"
                            checked={field.value === "4"}
                            onChange={() => field.onChange("4")}
                            className="mr-2"
                          />
                          <label htmlFor="active-4" className="text-black">
                            ขายออกแล้ว
                          </label>
                        </div>
                      </div>
                    )}
                  />
                  {errors.active && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาเลือกข้อมูล สถานะ
                    </span>
                  )}
                </div>
              ) : null}

              <div className="items-center col-span-3 lg:col-span-3">
                <HorizontalRule />
              </div>

              <div className="items-center col-span-3 lg:col-span-3 w-full">
                <h2 className="mb-2 font-semibold">รายการซ่อม</h2>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          วันที่ซ่อม
                        </th>
                        <th scope="col" className="px-6 py-3">
                          รายการซ่อม
                        </th>
                        <th scope="col" className="px-6 py-3 text-right">
                          ต้นทุนซ่อม
                        </th>
                        <th scope="col" className="px-6 py-3 text-right">
                          ต้นทุนเครื่องสุทธิ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(watch("productRepairs") || []).map((e, k) => {
                        const priceEquipCost = Number(e.priceEquipCost) || 0;
                        const mobilePriceCost = Number(e.mobilePriceCost) || 0;

                        return (
                          <tr className="bg-white border-b" key={k}>
                            <td className="px-6 py-4">
                              {formatDateTimeZoneTH(e.create_date)}
                            </td>
                            <td className="px-6 py-4">{e?.note || ""}</td>
                            <td className="px-6 py-4 text-right">
                              {formatNumberDigit(priceEquipCost)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {formatNumberDigit(mobilePriceCost)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="items-center col-span-3 lg:col-span-3">
                <HorizontalRule />
              </div>

              <div className="items-center col-span-3 lg:col-span-3">
                <label
                  htmlFor="uploadFileProducts"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  อัพโหลดไฟล์ png, jpeg, jpg
                </label>
                <FileDropzone
                  isOpen={open}
                  name="uploadFileProducts"
                  acceptedFileTypes={acceptedFileTypes}
                  control={control}
                  maxFileSize={5}
                  fileMultiple={true}
                  setValue={setValue}
                />
              </div>

              <div className="items-center col-span-3 lg:col-span-3">
                <HorizontalRule />
              </div>

              {!isEmpty(watch("productImages")) ? (
                <div className="items-center col-span-3 lg:col-span-3">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="col-span-2 lg:col-span-2">
                      <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                    </div>
                    <div className="col-span-2 lg:col-span-2">
                      <div className="col-span-2 lg:col-span-2">
                        <DragAndDropImages
                          images={watch("productImages")}
                          submitSwitch={submitSwitch}
                          onDelete={onDelete}
                          showDelete={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </fieldset>

          {isSee ? null : (
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

ModalStockProduct.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
  getItems: PropTypes.func,
  isSee: PropTypes.bool,
};

export default ModalStockProduct;
