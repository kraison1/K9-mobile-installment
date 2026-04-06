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
import { handleScanner } from "src/helpers/disabledHandleScanner";
import { fetchSelectCustomer } from "src/store/customer";
import AsyncSelect from "react-select/async";
import { error } from "../alart";
import HorizontalRule from "src/helpers/horizontalRule";
import { fetchSelectRateFinance } from "src/store/rateFinance";
import { fetchSelectProductTypes } from "src/store/productType";
const ModalStockProduct = ({ open, setModal, RowData, submitRow }) => {
  const { user, isLoadingOpen, setIsLoadingOpen } = useAuth();
  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [ContactCode, setContactCode] = React.useState("");
  const [ProductModels, setProductModels] = React.useState([]);
  const [ProductTypes, setProductTypes] = React.useState([]);

  const [ProductStorages, setProductStorages] = React.useState([]);
  const [ProductColors, setProductColors] = React.useState([]);
  const [Customers, setCustomers] = React.useState([]);
  const [AddProductLists, setAddProductLists] = React.useState([]);
  const [RateFinances, setRateFinances] = React.useState([]);

  const dispatch = useDispatch();
  const store = useSelector((state) => state.product);
  const storeProductModel = useSelector((state) => state.productModel);
  const storeProductType = useSelector((state) => state.productType);

  const storeProductStorage = useSelector((state) => state.productStorage);
  const storeProductColor = useSelector((state) => state.productColor);
  const storeCustomer = useSelector((state) => state.customer);
  const storeRateFinance = useSelector((state) => state.rateFinance);

  React.useEffect(() => {
    if (!isEmpty(storeProductColor.select)) {
      setProductColors(
        storeProductColor.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, [storeProductColor.select]);

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
    if (!isEmpty(storeCustomer.select)) {
      setCustomers(
        storeCustomer.select.map((item) => ({
          value: item.id,
          label: `${item.name} ${item.lastname} (${item.citizenIdCard})`,
        }))
      );
    }
  }, [storeCustomer.select]);

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
    if (!isEmpty(storeProductType.select)) {
      setProductTypes(
        storeProductType.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
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
        })
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
    [dispatch, user.branchId]
  );

  const addProducts = (item) => {
    if (!isEmpty(item)) {
      const isDuplicate = AddProductLists.some((e) => e.imei === item);
      if (isDuplicate) {
        error(`มีข้อมูลซ้ำ ${item}`);
      } else {
        const lastNumber = AddProductLists.length;
        const newProduct = {
          ...watch(), // สมมติจาก react-hook-form
          imei: item,
          branchId: user.branchId,
          createByUserId: user.id,
          refOldStockNumber:
            Number(watch("refOldStockNumber")) + lastNumber + 1,
        };
        setAddProductLists([...AddProductLists, newProduct]);
      }
      setContactCode(""); // ล้าง input
    }
  };

  const debouncedAddProducts = React.useCallback(
    debounce((value) => {
      addProducts(value);
    }, 150),
    [AddProductLists]
  );

  const handleChange = (e) => {
    const value = String(e.target.value).trim();
    setContactCode(value);
    debouncedAddProducts(value);
  };

  const handleDelete = (index) => {
    const currentLists = AddProductLists || [];
    const updatedLists = currentLists.filter((_, i) => i !== index);
    setAddProductLists(updatedLists);
  };

  React.useEffect(() => {
    if (open && modalRef.current) {
      setAddProductLists([]);
      if (isEmpty(storeProductColor.select)) {
        dispatch(fetchSelectProductColors());
      }

      if (isEmpty(storeRateFinance.select)) {
        dispatch(fetchSelectRateFinance());
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

      if (isEmpty(storeCustomer.select)) {
        dispatch(
          fetchSelectCustomer({
            branchId: user.branchId,
            customerType: ["2"],
            search: RowData.venderId == null ? null : RowData.venderId,
          })
        );
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
    defaultValues: {},
  });

  const onSubmit = () => {
    submitRow(AddProductLists);
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
          <div className="p-2 grid grid-cols-1 lg:grid-cols-4 gap-4">
            {import.meta.env.VITE_SYSTEM_NAME == "THUNDER" ? (
              <div className="items-center col-span-4">
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
              <div className="items-center col-span-4">
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
                          (option) => option.value === field.value
                        ) || ""
                      }
                      onChange={(selectedOption) => {
                        field.onChange(
                          selectedOption ? selectedOption.value : null
                        );
                      }}
                    />
                  )}
                />
              </div>
            )}

            {import.meta.env.VITE_SYSTEM_NAME == "THUNDER" ? (
              <div className="items-center col-span-4 lg:col-span-1"></div>
            ) : (
              <div className="items-center col-span-4 lg:col-span-1">
                <label
                  htmlFor="refOldStockNumber"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  รหัสสุดท้ายของสต็อกเก่า
                </label>
                <Controller
                  id="refOldStockNumber"
                  name="refOldStockNumber"
                  control={control}
                  rules={{ required: true }}
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
                    กรุณาใส่ข้อมูล รหัสสุดท้ายของสต็อกเก่า
                  </span>
                )}
              </div>
            )}

            <div className="items-center col-span-4 lg:col-span-1">
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
                      isDisabled={watch("id") == null ? false : true}
                      id="productTypeId"
                      options={ProductTypes}
                      placeholder="กรุณาเลือกประเภท"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={
                        ProductTypes.find(
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
                  กรุณาใส่ข้อมูล ประเภท
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-1">
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
                      isDisabled={watch("id") == null ? false : true}
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
                        setValue(
                          "productBrandId",
                          selectedOption ? selectedOption.productBrandId : ""
                        );

                        setValue("catalog", "มือถือ");
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

            <div className="items-center col-span-4 lg:col-span-1">
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

            <div className="items-center col-span-4 lg:col-span-1">
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
              {errors.productColorId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล สี
                </span>
              )}
            </div>

            <div className="items-center col-span-4">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                <div className="items-center col-span-6 lg:col-span-1">
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

                <div className="items-center col-span-6 lg:col-span-1">
                  <label
                    htmlFor="priceCostBuy"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    ราคาต้นทุน (บาท/ชิ้น)
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

                <div className="items-center col-span-6 lg:col-span-1">
                  <label
                    htmlFor="priceWholeSale"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    ราคาขายส่ง (บาท/ชิ้น)
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

                <div className="items-center col-span-6 lg:col-span-1">
                  <label
                    htmlFor="priceWholeSale"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    ราคาขายปลีก (บาท/ชิ้น)
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
                          errors.priceSale
                            ? "border-red-500"
                            : "border-gray-300"
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

                <div className="items-center col-span-6 lg:col-span-1">
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

                <div className="items-center col-span-6 lg:col-span-1">
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

                <div className="items-center col-span-6 lg:col-span-6 border p-1 border-gray-300 rounded-md">
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
                          <label
                            htmlFor="freeGift-1"
                            className="text-green-400"
                          >
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

                <div className="items-center col-span-6 border p-1 border-gray-300 rounded-md">
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
                              checked={
                                field.value === rate.valueMonth.toString()
                              }
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
              </div>
            </div>

            {!isNumber(watch("productModelId")) ||
            !isNumber(watch("productStorageId")) ||
            !isNumber(watch("productColorId")) ? null : (
              <div className="items-center col-span-4 lg:col-span-4">
                <div className="items-center col-span-1">
                  <label
                    htmlFor="ContactCode"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    หมายเลขเครื่อง/หมายเลข IMEI
                  </label>
                  <input
                    autoFocus
                    id="ContactCode"
                    type="text"
                    value={ContactCode}
                    onChange={(e) => handleChange(e)}
                    onKeyDown={(e) => handleScanner(e)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="items-center col-span-4 lg:col-span-4">
              <HorizontalRule />
            </div>

            <div className="col-span-4">
              <ul className="space-y-3">
                {AddProductLists.map((v, k) => (
                  <li
                    key={k}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {`${k + 1}. หมายเลขเครื่อง/หมายเลข IMEI  -`}
                      <span className="text-blue-600">{` ${v.imei}`}</span>
                      <span className="text-blue-600">{` (${v.refOldStockNumber})`}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(k)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                      aria-label={`ลบ ${v.imei}`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end items-center p-4 lg:p-5 border-t border-gray-200 rounded-b">
            {AddProductLists.length > 0 ? (
              <button
                disabled={isLoadingOpen}
                type="submit"
                className="py-2 px-5 ml-3 text-sm text-white bg-blue-400 rounded-lg border border-blue-400 hover:bg-blue-500"
              >
                ยืนยัน
              </button>
            ) : (
              <div>
                <p className="text-red-300">ต้องมีอย่างน้อย 1 รายการ</p>
              </div>
            )}

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

ModalStockProduct.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalStockProduct;
