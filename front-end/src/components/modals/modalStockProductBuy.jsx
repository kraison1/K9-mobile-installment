/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes, { string } from "prop-types";
import React from "react";
import { isEmpty, debounce } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "src/hooks/authContext";
import {
  addCustomer,
  fetchSelectCustomer,
  updateCustomer,
} from "src/store/customer";
import FileDropzone from "src/helpers/fileDropzone";
import Select from "react-select";
import HorizontalRule from "src/helpers/horizontalRule";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import DragAndDropImages from "src/components/dragAndDropImages";
import { fetchSelectProductModels } from "src/store/productModel";
import { fetchSelectProductStorages } from "src/store/productStorage";
import { fetchSelectProductColors } from "src/store/productColor";
import { handleScanner } from "src/helpers/disabledHandleScanner";
import DatePicker from "react-datepicker";
import { th } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { addProduct, updateProduct } from "src/store/product";
import { fetchSelectRateFinance } from "src/store/rateFinance";
import { DefaultValuesCustomer } from "src/pages/customers";
import { DefaultValuesProduct } from "src/pages/productBuy/mobile";
import { sizePerPage } from "src/helpers/sizePerPage";
import { fetchProductLogs } from "src/store/productLog";
import AsyncSelect from "react-select/async";
import { fetchSelectProductTypes } from "src/store/productType";
import { fetchSelectProductBrandsBy } from "src/store/productBrand";
import { fetchSelectShopInsurance } from "src/store/shopInsurance";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalStockProductBuy = ({ open, setModal }) => {
  const { setIsLoadingOpen, user } = useAuth();

  const [Customers, setCustomers] = React.useState([]);
  const [noResults, setNoResults] = React.useState(false);
  const [lastQuery, setLastQuery] = React.useState("");
  const [ProductModels, setProductModels] = React.useState([]);
  const [ProductTypes, setProductTypes] = React.useState([]);
  const [ProductStorages, setProductStorages] = React.useState([]);
  const [ProductColors, setProductColors] = React.useState([]);
  const [RateFinances, setRateFinances] = React.useState([]);
  const [ProductBrand, setProductBrand] = React.useState([]);
  const [ShopInsurance, setShopInsurance] = React.useState([]);

  const store = useSelector((state) => state.productLog);
  const storeCustomer = useSelector((state) => state.customer);
  const storeProductModel = useSelector((state) => state.productModel);
  const storeProductType = useSelector((state) => state.productType);
  const storeProductBrand = useSelector((state) => state.productBrand);
  const storeProductStorage = useSelector((state) => state.productStorage);
  const storeProductColor = useSelector((state) => state.productColor);
  const storeRateFinance = useSelector((state) => state.rateFinance);
  const storeShopInsurance = useSelector((state) => state.shopInsurance);

  const dispatch = useDispatch();

  // ---- react-hook-form (ลูกค้าเท่านั้น) ----
  const {
    handleSubmit,
    control,
    formState: { errors, touchedFields },
    setValue,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      ...DefaultValuesCustomer,
      customerType: "2",
    },
  });

  const {
    handleSubmit: handleSubmitProduct,
    control: controlProduct,
    formState: { errors: errorsProduct },
    setValue: setValueProduct,
    reset: resetProduct,
    watch: watchProduct,
    trigger: triggerProduct,
  } = useForm({
    defaultValues: DefaultValuesProduct,
  });

  React.useEffect(() => {
    if (!isEmpty(storeProductStorage.select)) {
      setProductStorages(
        storeProductStorage.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    } else {
      dispatch(fetchSelectProductStorages());
    }
  }, [storeProductStorage.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductColor.select)) {
      setProductColors(
        storeProductColor.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    } else {
      dispatch(fetchSelectProductColors());
    }
  }, [storeProductColor.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductModel.select)) {
      setProductModels(
        storeProductModel.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    } else {
      dispatch(fetchSelectProductModels(["มือถือ"]));
    }
  }, [storeProductModel.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductBrand.selectMobile)) {
      setProductBrand(
        storeProductBrand.selectMobile.map((item) => ({
          value: item.id,
          label: item.brandname,
        })),
      );
    } else {
      dispatch(
        fetchSelectProductBrandsBy({
          catalog: ["มือถือ"],
        }),
      );
    }
  }, [storeProductBrand.selectMobile]);

  React.useEffect(() => {
    if (!isEmpty(storeProductType.select)) {
      setProductTypes(
        storeProductType.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    } else {
      dispatch(fetchSelectProductTypes("มือถือ"));
    }
  }, [storeProductType.select]);

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
    } else {
      dispatch(fetchSelectRateFinance());
    }
  }, [storeRateFinance.select]);

  React.useEffect(() => {
    if (!isEmpty(storeCustomer.select)) {
      setCustomers(
        storeCustomer.select.map((c) => ({
          value: c.id,
          label: `${c.name} ${c.lastname} (${c.citizenIdCard})`,
          customer: c, // เก็บ object ไว้เติมฟอร์ม
          customerType: c.customerType,
        })),
      );
    }
  }, [storeCustomer.select]);

  React.useEffect(() => {
    if (!isEmpty(storeShopInsurance.select)) {
      setShopInsurance(storeShopInsurance.select);
    }
  }, [storeShopInsurance.select]);

  // โหลด options ลูกค้า (async) + ตรวจก่อน/หลังค้นหาว่าพบไหม
  const loadOptionsCustomer = React.useCallback(
    debounce((inputValue, callback) => {
      const q = (inputValue || "").trim();
      setLastQuery(q);
      if (!q) {
        setNoResults(false);
        callback([]);
        return;
      }

      dispatch(
        fetchSelectCustomer({
          branchId: user.branchId,
          customerType: ["1", "2", "3"],
          search: q,
        }),
      )
        .unwrap()
        .then((result) => {
          const options = result.map((c) => ({
            value: c.id,
            label: `${c.name} ${c.lastname} (${c.citizenIdCard})`,
            customer: c,
          }));
          setNoResults(q.length > 0 && options.length === 0);
          callback(options);
        })
        .catch(() => {
          setNoResults(q.length > 0);
          callback([]);
        });
    }, 2000),
    [dispatch, user?.branchId],
  );

  // บันทึกเฉพาะข้อมูลลูกค้า
  const onSubmit = async (data) => {
    setIsLoadingOpen(true);
    try {
      const idNum = Number(data.id);
      const isCreate = !Number.isFinite(idNum);
      if (isCreate) {
        await dispatch(addCustomer(data)).then((res) => {
          const { payload } = res;
          if (!isEmpty(payload.data)) {
            reset(payload.data);
          }
        });
      } else {
        await dispatch(updateCustomer(data)).unwrap();
      }
      // หลังจากบันทึกข้อมูลลูกค้าสำเร็จ ให้เรียก submit ของฟอร์มสินค้าต่อ
      await handleSubmitProduct(onSubmitProduct)();
      setModal(false);
      setIsLoadingOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const onSubmitProduct = async (e) => {
    // ถ้าราคาเกิน ให้หยุดเลย ไม่ทำงานต่อ

    setIsLoadingOpen(true);
    try {
      const venderId = watch("id");
      const idNum = Number(e.id);
      const isCreate = !Number.isFinite(idNum); // หรือจะใช้ !e.id ก็ได้ถ้า id มีแค่ create/update ชัดเจน

      // 1) สร้างหรืออัปเดต แล้วรอให้เสร็จจริง
      const res = await dispatch(
        (isCreate ? addProduct : updateProduct)({ ...e, venderId }),
      ).unwrap();

      if (res?.data && !isEmpty(res.data)) {
        resetProduct(res.data);
        // **ถ้าต้องการให้ fetch logs ใช้ค่าจากหน้าปัจจุบันก่อนเปลี่ยนหน้า**
        // ให้ย้าย handleNext() ไปหลังจาก fetch logs เสร็จ (ดูบรรทัดล่าง)
      }

      // 2) ดึงค่าพารามิเตอร์ล่าสุด (กันค่าเก่า/ค่า stale)
      const {
        page,
        search,
        catalog,
        branchId,
        startDate,
        endDate,
        actionType,
      } = store.paramBuys ?? {};

      // 3) โหลด logs แล้วรอให้เสร็จ
      await dispatch(
        fetchProductLogs({
          search,
          pageSize: sizePerPage(),
          page,
          branchId,
          catalog,
          startDate,
          endDate,
          actionType,
          isBuy: "1",
        }),
      ).unwrap();
    } catch (err) {
      // จัดการ error ตามต้องการ
      console.error(err);
    } finally {
      setIsLoadingOpen(false);
    }
  };

  // ฟังก์ชันใหม่สำหรับจัดการการ submit ทั้งสองฟอร์ม
  const handleSave = async () => {
    const isValid = await triggerProduct();
    if (isValid) {
      handleSubmit(onSubmit)();
    }
  };

  const handleClose = () => {
    reset({ ...DefaultValuesCustomer, customerType: "2" });
    setModal(false);
  };

  // เปิด modal → เคลียร์สถานะเบื้องต้น
  React.useEffect(() => {
    if (!open) return;
    reset({ ...DefaultValuesCustomer, customerType: "2" });
    resetProduct({ ...DefaultValuesProduct, branchId: user.branchId });
    dispatch(
      fetchSelectCustomer({
        branchId: user.branchId,
        customerType: ["1", "2", "3"],
        search: "",
      }),
    );

    if (isEmpty(storeShopInsurance.select)) {
      dispatch(fetchSelectShopInsurance());
    }
  }, [open]);

  return (
    <div
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      className={`${
        open
          ? "fixed inset-0 z-10 flex justify-center items-start md:items-center p-4"
          : "hidden"
      }`}
      onKeyDown={(e) => (e.key === "Escape" ? handleClose() : null)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px]" />

      {/* Panel */}
      <div
        className="relative w-full bg-white rounded-xl shadow-2xl
                   max-h-[85vh] overflow-y-auto overscroll-contain
                   scrollbar-gutter-stable touch-pan-y"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              เพิ่ม/แก้ไขข้อมูลผู้ขาย
            </h3>
            <button
              onClick={handleClose}
              className="inline-flex items-center rounded-md px-3 py-1.5 text-sm
                         text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              ปิด
            </button>
          </div>
        </div>

        {/* Content: ลูกค้า “หน้าเดียว” */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <h2 className="underline">ข้อมูลผู้ขาย</h2>
            </div>

            {/* ค้นหา/เลือกผู้ขาย */}
            <div className="col-span-2">
              <label
                htmlFor="citizenIdCard"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ชื่อ/บัตรประชาชน/เลขผู้เสียภาษี
              </label>
              <div className="flex flex-col gap-2">
                <Controller
                  id="customerId"
                  name="customerId"
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <AsyncSelect
                      {...field}
                      id="customerId"
                      className="w-full"
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 11 }),
                      }}
                      defaultOptions={Customers}
                      cacheOptions
                      loadOptions={loadOptionsCustomer}
                      placeholder="พิมพ์ชื่อหรือตัวเลขเพื่อค้นหา"
                      isClearable
                      isSearchable
                      noOptionsMessage={({ inputValue }) =>
                        inputValue?.trim()
                          ? `ไม่พบข้อมูล "${inputValue.trim()}" — กรอกฟิลด์ด้านล่างเพื่อสร้างลูกค้าใหม่`
                          : "พิมพ์เพื่อค้นหา"
                      }
                      value={
                        Customers.find(
                          (option) => option.value === field.value,
                        ) || ""
                      }
                      onChange={(selectedOption) => {
                        if (!isEmpty(selectedOption)) {
                          const { customer } = selectedOption;
                          // เติมข้อมูลลูกค้าเดิมลงฟอร์ม (ไม่ reset ค่าอื่น)
                          reset({
                            ...DefaultValuesCustomer,
                            ...customer,
                            customerId: selectedOption.value,

                            customerType:
                              customer.customerType == "1" ? "3" : "2",
                          });
                          field.onChange(selectedOption?.value || "");
                          setNoResults(false);
                        } else {
                          // เคลียร์การเลือก → ให้ผู้ใช้พิมพ์เพื่อสร้างใหม่
                          field.onChange("");
                          reset({ ...DefaultValuesProduct });
                        }
                      }}
                    />
                  )}
                />

                {/* แถบแจ้งเตือนเมื่อไม่พบผลลัพธ์ */}
                {noResults && lastQuery.trim() && (
                  <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
                    ไม่พบข้อมูลลูกค้าที่ตรงกับ “{lastQuery.trim()}”
                    โปรดกรอกข้อมูลด้านล่างเพื่อสร้างลูกค้าใหม่
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <div className="items-center col-span-2 lg:col-span-1">
                <label
                  htmlFor="customerType"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ประเภท
                </label>
                <Controller
                  name="customerType"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div>
                      <input
                        {...field}
                        id="customerType-3"
                        type="radio"
                        value="3"
                        checked={field.value === "3"}
                        onChange={() => field.onChange("3")}
                        className="mr-2"
                      />
                      <label htmlFor="customerType-3" className="text-blue-400">
                        ลูกค้าหน้าร้าน
                      </label>

                      <input
                        {...field}
                        id="customerType-2"
                        type="radio"
                        value="2"
                        checked={field.value === "2"}
                        onChange={() => field.onChange("2")}
                        className="mr-2 ml-4"
                      />
                      <label
                        htmlFor="customerType-2"
                        className="text-green-400"
                      >
                        ร้านค้า
                      </label>
                    </div>
                  )}
                />
                {errors.customerType && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาเลือกข้อมูล ประเภท
                  </span>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ฟิลด์ในฟอร์มลูกค้า (คุมด้วย RHF) */}

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อ
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-3 py-2 border ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        } rounded-md text-sm`}
                      />
                    )}
                  />
                  {errors.name && (
                    <span className="text-red-500 text-xs">กรุณาใส่ชื่อ</span>
                  )}
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    นามสกุล
                  </label>
                  <Controller
                    name="lastname"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-3 py-2 border ${
                          errors.lastname ? "border-red-500" : "border-gray-300"
                        } rounded-md text.sm`}
                      />
                    )}
                  />
                  {errors.lastname && (
                    <span className="text-red-500 text-xs">
                      กรุณาใส่นามสกุล
                    </span>
                  )}
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    บัตรประชาชน/ผู้เสียภาษี
                  </label>
                  <Controller
                    name="citizenIdCard"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-3 py-2 border ${
                          errors.citizenIdCard
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md text-sm`}
                      />
                    )}
                  />
                  {errors.citizenIdCard && (
                    <span className="text-red-500 text-xs">
                      กรุณาใส่เลขบัตร/ผู้เสียภาษี
                    </span>
                  )}
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เบอร์ติดต่อ
                  </label>
                  <Controller
                    name="tel"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-3 py-2 border ${
                          errors.tel ? "border-red-500" : "border-gray-300"
                        } rounded-md text-sm`}
                      />
                    )}
                  />
                  {errors.tel && (
                    <span className="text-red-500 text-xs">
                      กรุณาใส่เบอร์ติดต่อ
                    </span>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ที่อยู่
                  </label>
                  <Controller
                    name="address"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-3 py-2 border ${
                          errors.address ? "border-red-500" : "border-gray-300"
                        } rounded-md text-sm`}
                      />
                    )}
                  />
                  {errors.address && (
                    <span className="text-red-500 text-xs">
                      กรุณาใส่ที่อยู่
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-4">
          <HorizontalRule />
        </div>

        <div className="px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-3">
              <h2 className="underline">ข้อมูลเครื่อง</h2>
            </div>

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
                control={controlProduct}
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
                control={controlProduct}
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
                control={controlProduct}
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
              {errorsProduct.productModelId && (
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
                control={controlProduct}
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
              {errorsProduct.productStorageId && (
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
                control={controlProduct}
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
              {errorsProduct.productColorId && (
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
                control={controlProduct}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="relative flex mt-1 gap-2">
                    <input
                      {...field}
                      id="imei"
                      type="text"
                      onKeyDown={(e) => handleScanner(e)}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errorsProduct.imei
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  </div>
                )}
              />
              {errorsProduct.imei && (
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
                control={controlProduct}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="batteryHealth"
                    type="number"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errorsProduct.batteryHealth
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errorsProduct.batteryHealth && (
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
                control={controlProduct}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="machineCondition"
                    type="number"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errorsProduct.machineCondition
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errorsProduct.machineCondition && (
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
                control={controlProduct}
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
              {errorsProduct.boxType && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล กล่อง
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
                control={controlProduct}
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
                          setValueProduct("simName", ""); // กำหนดค่า simName เมื่อ simType เป็น 0
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
                          setValueProduct("simName", ""); // ตั้งค่า simName ให้เป็นค่าว่างเมื่อ simType เป็น 1
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
              {errorsProduct.simType && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล ใช้ได้ทุกซิม
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              {watchProduct("simType") === "ไม่" && ( // ตรวจสอบว่า simType เป็น 0 ถึงจะแสดง
                <Controller
                  id="simName"
                  name="simName"
                  control={controlProduct}
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
                        errorsProduct.simName
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
              )}
              {errorsProduct.simName && (
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
                control={controlProduct}
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
              {errorsProduct.boxType && (
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
                control={controlProduct}
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
              {errorsProduct.shopCenterInsurance && (
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
                control={controlProduct}
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
              {errorsProduct.shopInsurance && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล ประกันร้าน
                </span>
              )}
            </div>

            {watchProduct("shopCenterInsurance") === "มี" ? (
              <div className="items-center col-span-3 lg:col-span-1 border p-1 border-gray-300 rounded-md">
                <label
                  htmlFor="shopCenterInsuranceDate"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  วันที่หมดประกันศูนย์
                </label>
                <Controller
                  name="shopCenterInsuranceDate"
                  control={controlProduct}
                  rules={{ required: true }}
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
                {errorsProduct.shopCenterInsuranceDate && (
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
                control={controlProduct}
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
              {errorsProduct.freeGift && (
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
                ราคาทุน (บาท/หน่วย)
              </label>
              <Controller
                id="priceCostBuy"
                name="priceCostBuy"
                control={controlProduct}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="priceCostBuy"
                    type="number"
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : "";
                      field.onChange(value);
                    }}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errorsProduct.priceCostBuy
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errorsProduct.priceCostBuy ? (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ราคาทุน
                </span>
              ) : null}
            </div>

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
                control={controlProduct}
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
                control={controlProduct}
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
                isOpen={true}
                name="uploadFileProducts"
                acceptedFileTypes={acceptedFileTypes}
                control={controlProduct}
                maxFileSize={5}
                fileMultiple={true}
                setValue={setValueProduct}
              />
            </div>

            <div className="items-center col-span-3 lg:col-span-3">
              <HorizontalRule />
            </div>

            {!isEmpty(watchProduct("productImages")) ? (
              <div className="items-center col-span-3 lg:col-span-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-2 lg:col-span-2">
                    <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                  </div>
                  <div className="col-span-2 lg:col-span-2">
                    <div className="col-span-2 lg:col-span-2">
                      <DragAndDropImages
                        images={watchProduct("productImages")}
                        submitSwitch={() => {}}
                        onDelete={() => {}}
                        showDelete={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-white border-t px-4 py-3">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              ปิด
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ModalStockProductBuy.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
};

export default ModalStockProductBuy;
