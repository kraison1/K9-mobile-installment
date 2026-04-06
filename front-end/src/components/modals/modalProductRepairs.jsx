/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty, debounce } from "lodash";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { MdClose, MdOutlineClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { fetchInfoProductRepairs } from "src/store/productRepair";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "src/hooks/authContext";
import { fetchScanProduct, fetchSelectProduct } from "src/store/product";
import AsyncSelect from "react-select/async";
import { fetchSelectProductModels } from "src/store/productModel";
import Select from "react-select";
import HorizontalRule from "src/helpers/horizontalRule";
import { handleScanner } from "src/helpers/disabledHandleScanner";
import DragAndDropImages from "src/components/dragAndDropImages";
import FileDropzone from "src/helpers/fileDropzone";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import { fetchSelectBank } from "src/store/bank";
import dayjs from "src/helpers/dayjsConfig";
import DatePicker from "react-datepicker";
import { th } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { fetchSelectProductTypes } from "src/store/productType";
import { fetchSelectProductBrandsBy } from "src/store/productBrand";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalProductRepairs = ({ open, setModal, RowData, submitRow }) => {
  const { user, isLoadingOpen, setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();
  const store = useSelector((state) => state.productRepair);
  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [Products, setProducts] = React.useState([]);
  const [ProductModels, setProductModels] = React.useState([]);
  const [ProductTypes, setProductTypes] = React.useState([]);
  const [ProductBrand, setProductBrand] = React.useState([]);

  const [Banks, setBanks] = React.useState([]);
  const [ContactCode, setContactCode] = React.useState("");

  const storeProductModel = useSelector((state) => state.productModel);
  const storeProductType = useSelector((state) => state.productType);
  const storeProductBrand = useSelector((state) => state.productBrand);
  const storeProduct = useSelector((state) => state.product);
  const storeBank = useSelector((state) => state.bank);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm({
    defaultValues: RowData,
  });

  const { fields: fieldsProductSaleLists } = useFieldArray({
    control,
    name: "productRepairLists",
  });

  React.useEffect(() => {
    if (!isEmpty(storeProduct.select)) {
      setProducts(
        storeProduct.select.map((item) => ({
          value: item.id,
          label: `${item.code} / ${item.imei}`,
        }))
      );
    }
  }, [storeProduct.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductModel.selectRepair)) {
      setProductModels(
        storeProductModel.selectRepair.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, [storeProductModel.selectRepair]);

  React.useEffect(() => {
    if (!isEmpty(storeBank.select)) {
      setBanks(
        storeBank.select.map((item) => ({
          value: item.id,
          label: `${item.bankOwner}, ${item.bankName} (${item.bankNo})`,
        }))
      );
    } else {
      setBanks([]);
    }
  }, [storeBank.select]);

  const loadOptionsProduct = React.useCallback(
    debounce((inputValue, callback) => {
      if (!inputValue) {
        callback([]);
        return;
      }

      dispatch(
        fetchSelectProduct({
          branchId: user.branchId,
          catalog: "มือถือ",
          search: inputValue,
          active: ["1", "3", "8"],
        })
      )
        .unwrap()
        .then((result) => {
          const options = result?.map((item) => ({
            value: item.id,
            label: `${item.code} / ${item.imei}`,
          }));
          callback(options);
        })
        .catch((error) => {
          console.error("Load options error:", error);
          callback([]);
        });
    }, 1000),
    [dispatch, user.branchId]
  );

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

  React.useEffect(() => {
    if (!isEmpty(storeProductBrand.selectRepair)) {
      setProductBrand(
        storeProductBrand.selectRepair.map((item) => ({
          value: item.id,
          label: `${item.brandname}`,
        }))
      );
    }
  }, [storeProductBrand.selectRepair]);

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (isEmpty(storeProduct.select)) {
        dispatch(
          fetchSelectProduct({
            branchId: user.branchId,
            catalog: "มือถือ",
            search: isNaN(RowData.id) ? "" : RowData.product?.id,
            active: isNaN(RowData.id) ? "1" : ["1", "3", "8"],
          })
        );
      }

      if (isEmpty(storeProductModel.selectRepair)) {
        dispatch(fetchSelectProductModels(["อะไหล่ซ่อม"]));
      }

      if (isEmpty(storeProductType.select)) {
        dispatch(fetchSelectProductTypes("มือถือ"));
      }

      if (isEmpty(storeProductBrand.selectRepair)) {
        dispatch(
          fetchSelectProductBrandsBy({
            catalog: ["อะไหล่ซ่อม"],
          })
        );
      }

      if (isEmpty(storeBank.select)) {
        dispatch(fetchSelectBank("3"));
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
    if (store?.data && RowData.id) {
      reset({
        ...store.data,
        create_date: store.data?.create_date
          ? new Date(store.data?.create_date)
          : new Date(),
      });
    }
  }, [store]);

  const handleSearch = (value) => {
    setContactCode(value);
    if (!isEmpty(value)) {
      debouncedFetch(value, () => {});
    }
  };

  const debouncedFetch = React.useCallback(
    debounce((inputValue, callback) => {
      const productRepairLists = getValues("productRepairLists") || [];
      const existingProduct = productRepairLists.find(
        (item) => item.code === inputValue
      );

      if (existingProduct) {
        const updatedProductBuyLists = productRepairLists.map((item) =>
          item.code === inputValue ? { ...item, amount: item.amount + 1 } : item
        );
        setValue("productRepairLists", updatedProductBuyLists, {
          shouldDirty: true,
        });
        callback(existingProduct);
        setContactCode("");
        return;
      }

      setIsLoadingOpen(true);
      dispatch(
        fetchScanProduct({
          branchId: user.branchId,
          search: inputValue.trim(),
          catalog: "อะไหล่ซ่อม",
          active: "1",
        })
      )
        .unwrap()
        .then((result) => {
          if (!result?.message_error) {
            const newProduct = {
              code: inputValue,
              productName: `${result.productBrand?.name || ""}, ${
                result.productModel?.name || ""
              }, ${result.productColor?.name || ""}`,
              productId: result.id,
              catalog: result.catalog,
              amount: 1,
              defaultPriceSale: result.priceSale,
              // priceSale: watch("isMobileSale") == "1" ? 0 : result.priceSale,
              priceSale: result.priceSale,
              priceCostBuy: result.priceCostBuy,
              buyFormShop: result.buyFormShop,
              // isFree: watch("isMobileSale") == "1" ? "1" : "0",
              isFree: "0",
            };
            setValue(
              "productRepairLists",
              [...productRepairLists, newProduct],
              {
                shouldDirty: true,
              }
            );
            callback(newProduct);
            setContactCode("");
          } else {
            setContactCode("");
            callback(null);
          }
        })
        .catch((error) => {
          console.error("Load options error:", error);
          callback(null);
        })
        .finally(() => setIsLoadingOpen(false));
    }, 500),
    [dispatch]
  );

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoProductRepairs(id))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const onSubmit = (data) => {
    submitRow(data);
  };

  const debouncedCalculate = React.useCallback(
    debounce((values) => {
      calculateTotal(values, (total) => {
        setValue("priceRepair", total, { shouldValidate: false });
      });
    }, 300),
    [setValue] // เพิ่ม setValue เพราะใช้งานในนี้
  );

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      // เช็คว่า field ที่เปลี่ยนเกี่ยวข้องกับการคำนวณหรือไม่
      const relevantFields = ["priceDiscount", "productRepairLists"];

      const isRelevantField =
        relevantFields.includes(name) || // กรณี field หลัก
        (name && name.startsWith("productRepairLists")); // กรณี nested field เช่น productRepairLists[0].priceSale

      if (isRelevantField && !watch("id")) {
        debouncedCalculate(value);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedCalculate]); // dependencies เดิม + debouncedCalculate

  const calculateTotal = React.useCallback((values, onTotalCalculated) => {
    let total = 0;

    const priceEquipSum = calculateProductRepairListsTotal(
      values.productRepairLists || []
    );

    setValue("priceEquipSum", priceEquipSum);

    total += priceEquipSum - Number(values.priceDiscount || 0);
    onTotalCalculated(
      watch("typeRepair") == 4 && watch("id") ? store.data?.priceRepair : total
    );
  }, []);

  const calculateProductRepairListsTotal = (items) => {
    const total = items.reduce((sum, item) => {
      // ตรวจสอบเงื่อนไข isFree
      const priceSale = item.isFree === "1" ? 0 : item.priceSale;
      // คูณกับ amount (แปลงเป็น number ถ้าจำเป็น)
      const itemTotal = priceSale * Number(item.amount);
      return sum + itemTotal;
    }, 0);

    return total;
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

          <fieldset
            className="p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4"
            disabled={watch("id") ? true : false}
          >
            <div className="items-center col-span-4 lg:col-span-4">
              <label
                htmlFor="payType"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                การจ่าย
              </label>
              <Controller
                name="payType"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      id="payType-1"
                      type="radio"
                      value="1"
                      disabled={
                        watch("saleType") == 2 || watch("saleType") == 4
                          ? true
                          : false
                      }
                      checked={field.value === "1"}
                      onChange={() => {
                        field.onChange("1");
                        if (isNaN(RowData.id)) {
                          setValue("bankId", null);
                          setValue("priceCash", 0);
                          setValue("priceTransferCash", 0);
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor="payType-1" className="text-red-500">
                      เงินสด
                    </label>
                    <input
                      {...field}
                      id="payType-2"
                      type="radio"
                      value="2"
                      checked={field.value === "2"}
                      onChange={() => {
                        field.onChange("2");
                        if (isNaN(RowData.id)) {
                          setValue("bankId", null);
                          setValue("priceCash", 0);
                          setValue("priceTransferCash", 0);
                        }
                      }}
                      className="mr-2 ml-4"
                    />
                    <label htmlFor="payType-2" className="text-green-500">
                      เงินโอน
                    </label>

                    <input
                      {...field}
                      id="payType-3"
                      type="radio"
                      value="3"
                      disabled={
                        watch("saleType") == 2 || watch("saleType") == 4
                          ? true
                          : false
                      }
                      checked={field.value === "3"}
                      onChange={() => {
                        field.onChange("3");
                        if (isNaN(RowData.id)) {
                          setValue("bankId", null);
                          setValue("priceCash", 0);
                          setValue("priceTransferCash", 0);
                        }
                      }}
                      className="mr-2 ml-4"
                    />
                    <label htmlFor="payType-3" className="text-yellow-500">
                      สด+โอน
                    </label>
                  </div>
                )}
              />
              {errors.payType && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล การจ่าย
                </span>
              )}
            </div>

            {import.meta.env.VITE_SYSTEM_NAME == "THUNDER" ? (
              <div className="items-center col-span-4 lg:col-span-4">
                <label
                  htmlFor="randomCode"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  สุ่มรหัสสัญญา
                </label>
                <Controller
                  name="randomCode"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-4">
                      <div className="flex items-center">
                        <input
                          {...field}
                          id="randomCode-0"
                          type="radio"
                          value="0"
                          checked={field.value === "0"}
                          onChange={() => field.onChange("0")}
                          className="mr-2"
                        />
                        <label htmlFor="randomCode-0" className="text-red-400">
                          ใช้สัญญาเดิม
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          {...field}
                          id="randomCode-1"
                          type="radio"
                          value="1"
                          checked={field.value === "1"}
                          onChange={() => field.onChange("1")}
                          className="mr-2"
                        />
                        <label htmlFor="randomCode-1" className="text-blue-400">
                          สร้างสัญญาใหม่
                        </label>
                      </div>
                    </div>
                  )}
                />
                {errors.randomCode && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาเลือกข้อมูล สุ่มรหัสสินค้า
                  </span>
                )}
              </div>
            ) : null}

            {import.meta.env.VITE_SYSTEM_NAME == "THUNDER" ? (
              <div className="items-center col-span-4 lg:col-span-4">
                <label
                  htmlFor="create_date"
                  className="block text-sm font-medium text-gray-700"
                >
                  วันที่ทำรายการ
                </label>
                <Controller
                  name="create_date"
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      locale={th}
                      onChange={(date) => field.onChange(date)}
                      timeZone="Asia/Bangkok"
                      dateFormat="dd/MM/yyyy HH:mm"
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={1}
                      className="w-full p-1.5 border border-gray-300 rounded-md mt-1"
                      placeholderText="เลือกวันที่และเวลา"
                      minDate={dayjs()
                        .subtract(1, "month")
                        .startOf("month")
                        .toDate()}
                      maxDate={dayjs().toDate()}
                    />
                  )}
                />

                {errors.create_date && (
                  <p className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล วันที่ทำรายการ
                  </p>
                )}
              </div>
            ) : null}

            {watch("payType") == "2" || watch("payType") == "3" ? (
              <div className="items-center col-span-4 lg:col-span-4">
                <label
                  htmlFor="bankId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  โอนเข้าธนาคาร
                </label>
                <Controller
                  id="bankId"
                  name="bankId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 11 }),
                      }}
                      id="bankId"
                      options={Banks}
                      placeholder="กรุณาเลือกธนาคาร"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={
                        Banks.find((option) => option.value === field.value) ||
                        ""
                      }
                      onChange={(selectedOption) => {
                        field.onChange(
                          selectedOption ? selectedOption.value : ""
                        );
                      }}
                    />
                  )}
                />

                {errors.bankId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล โอนเข้าธนาคาร
                  </span>
                )}
              </div>
            ) : null}

            {/* Type of Repair */}
            {/* <div className="col-span-4 md:col-span-2 lg:col-span-4">
              <label
                htmlFor="typeRepair"
                className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
              >
                ประเภทการซ่อม
              </label>
              <Controller
                name="typeRepair"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
                    <div className="flex items-center">
                      <input
                        {...field}
                        id="typeRepair-1"
                        type="radio"
                        value="1"
                        checked={field.value === "1"}
                        onChange={() => field.onChange("1")}
                        className="mr-1 sm:mr-2"
                      />
                      <label
                        htmlFor="typeRepair-1"
                        className="text-blue-400 text-sm sm:text-base"
                      >
                        เครื่องหน้าร้าน
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        {...field}
                        id="typeRepair-2"
                        type="radio"
                        value="2"
                        checked={field.value === "2"}
                        onChange={() => field.onChange("2")}
                        className="mr-1 sm:mr-2"
                      />
                      <label
                        htmlFor="typeRepair-2"
                        className="text-orange-400 text-sm sm:text-base"
                      >
                        ลูกค้าหน้าร้าน
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        {...field}
                        id="typeRepair-3"
                        type="radio"
                        value="3"
                        checked={field.value === "3"}
                        onChange={() => field.onChange("3")}
                        className="mr-1 sm:mr-2"
                      />
                      <label
                        htmlFor="typeRepair-3"
                        className="text-red-400 text-sm sm:text-base"
                      >
                        ร้านค้าส่งซ่อม
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        {...field}
                        id="typeRepair-4"
                        type="radio"
                        value="4"
                        checked={field.value === "4"}
                        onChange={() => field.onChange("4")}
                        className="mr-1 sm:mr-2"
                      />
                      <label
                        htmlFor="typeRepair-4"
                        className="text-red-400 text-sm sm:text-base"
                      >
                        ส่งซ่อมร้านนอก
                      </label>
                    </div>
                  </div>
                )}
              />
              {errors.typeRepair && (
                <span className="text-red-500 text-xs mt-1 block">
                  กรุณาเลือกข้อมูล ประเภทการซ่อม
                </span>
              )}
            </div> */}

            {/* Product ID (for typeRepair == 1) */}
            {watch("typeRepair") === "1" && (
              <div className="col-span-4 md:col-span-2 lg:col-span-2">
                <label
                  htmlFor="productId"
                  className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                >
                  หมายเลขเครื่อง/หมายเลข IMEI
                </label>
                <Controller
                  id="productId"
                  name="productId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <AsyncSelect
                      {...field}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 11 }),
                      }}
                      isDisabled={watch("id") == null ? false : true}
                      id="productId"
                      defaultOptions={Products}
                      loadOptions={loadOptionsProduct}
                      placeholder="กรุณาเลือกสินค้า"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={
                        Products.find(
                          (option) => option.value === field.value
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        field.onChange(
                          selectedOption ? selectedOption.value : null
                        )
                      }
                    />
                  )}
                />
                {errors.productId && (
                  <span className="text-red-500 text-xs mt-1 block">
                    กรุณาใส่ข้อมูล สินค้า
                  </span>
                )}
              </div>
            )}

            {/* Product Model (for typeRepair == 2, 3, 4) */}

            {(watch("typeRepair") === "2" ||
              watch("typeRepair") === "3" ||
              watch("typeRepair") === "4") && (
              <div className="col-span-4 md:col-span-2 lg:col-span-2">
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
                {errors.productTypeId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ประเภท
                  </span>
                )}
              </div>
            )}

            {(watch("typeRepair") === "2" ||
              watch("typeRepair") === "3" ||
              watch("typeRepair") === "4") && (
              <div className="items-center col-span-2 lg:col-span-2">
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
                        isDisabled={watch("id") == null ? false : true}
                        id="productBrandId"
                        options={ProductBrand}
                        placeholder="กรุณาเลือกแบรนด์"
                        isClearable
                        isSearchable
                        classNamePrefix="react-select"
                        value={
                          ProductBrand.find(
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
                {errors.productBrandId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล แบรนด์
                  </span>
                )}
              </div>
            )}

            {(watch("typeRepair") === "2" ||
              watch("typeRepair") === "3" ||
              watch("typeRepair") === "4") && (
              <div className="col-span-4 md:col-span-2 lg:col-span-2">
                <label
                  htmlFor="productModelId"
                  className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                >
                  รุ่น
                </label>
                <Controller
                  id="productModelId"
                  name="productModelId"
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
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
                        ) || null
                      }
                      onChange={(selectedOption) => {
                        field.onChange(
                          selectedOption ? selectedOption.value : null
                        );
                      }}
                    />
                  )}
                />
                {errors.productModelId && (
                  <span className="text-red-500 text-xs mt-1 block">
                    กรุณาใส่ข้อมูล รุ่น
                  </span>
                )}
              </div>
            )}

            {/* IMEI */}
            {watch("typeRepair") != "1" ? (
              <div className="col-span-4 md:col-span-2 lg:col-span-2">
                <label
                  htmlFor="imei"
                  className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                >
                  หมายเลขเครื่อง/หมายเลข IMEI
                </label>
                <Controller
                  id="imei"
                  name="imei"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="imei"
                      type="text"
                      placeholder="หมายเลขเครื่อง/หมายเลข IMEI"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.imei ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
                {errors.imei && (
                  <span className="text-red-500 text-xs mt-1 block">
                    กรุณาใส่ข้อมูล หมายเลขเครื่อง/หมายเลข IMEI
                  </span>
                )}
              </div>
            ) : null}

            {watch("typeRepair") == "4" ? null : (
              <div className="items-center col-span-4">
                <HorizontalRule />
              </div>
            )}

            {watch("typeRepair") == "4" ? null : (
              <div className="items-center col-span-4">
                <div className="grid grid-cols-1 gap-2">
                  {!RowData.id && (
                    <div className="items-center col-span-1">
                      <label
                        htmlFor="ContactCode"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        ใส่รหัสสินค้า เพื่อขาย/แถม/เครม
                      </label>
                      <input
                        id="ContactCode"
                        onKeyDown={(e) => handleScanner(e)}
                        type="text"
                        value={ContactCode}
                        onChange={(e) => handleSearch(e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    </div>
                  )}

                  <div className="items-center col-span-1">
                    <div className="grid grid-cols-1 gap-4">
                      {fieldsProductSaleLists?.map((v, k) => (
                        <div
                          key={v.id}
                          className="grid grid-cols-1 gap-3 p-4 border rounded-lg bg-white shadow-sm"
                        >
                          <div className="col-span-4">
                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                              {import.meta.env.VITE_SYSTEM_NAME == "THUNDER" ? (
                                <div className="col-span-3 lg:col-span-4">
                                  <label
                                    htmlFor={`buyFormShop-${k}`}
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    ซื้อจากร้าน
                                  </label>
                                  <Controller
                                    name={`productRepairLists[${k}].buyFormShop`}
                                    control={control}
                                    render={({ field }) => (
                                      <input
                                        {...field}
                                        id={`buyFormShop-${k}`}
                                        type="text"
                                        disabled
                                        value={field.value || ""}
                                        className={`w-full px-3 py-2 border ${
                                          errors.productRepairLists?.[k]
                                            ?.buyFormShop
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                      />
                                    )}
                                  />
                                  {errors.productRepairLists?.[k]
                                    ?.buyFormShop && (
                                    <span className="text-red-500 text-xs">
                                      กรุณาใส่ข้อมูล ซื้อจากร้าน
                                    </span>
                                  )}
                                </div>
                              ) : null}

                              <div className="col-span-3 lg:col-span-1">
                                <label
                                  htmlFor={`productName-${k}`}
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  ชื่อสินค้า
                                </label>
                                <Controller
                                  name={`productRepairLists[${k}].productName`}
                                  control={control}
                                  render={({ field }) => (
                                    <input
                                      {...field}
                                      id={`productName-${k}`}
                                      type="text"
                                      disabled
                                      value={field.value || ""}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      className={`w-full px-3 py-2 border ${
                                        errors.productRepairLists?.[k]
                                          ?.productName
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                  )}
                                />
                                {errors.productRepairLists?.[k]
                                  ?.productName && (
                                  <span className="text-red-500 text-xs">
                                    กรุณาใส่ข้อมูล ชื่อสินค้า
                                  </span>
                                )}
                              </div>

                              <div className="col-span-3 lg:col-span-1">
                                <label
                                  htmlFor={`amount-${k}`}
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  จำนวน
                                </label>
                                <Controller
                                  name={`productRepairLists[${k}].amount`}
                                  control={control}
                                  render={({ field }) => (
                                    <input
                                      {...field}
                                      id={`amount-${k}`}
                                      type="number"
                                      value={field.value || 0}
                                      disabled
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      className={`w-full px-3 py-2 border ${
                                        errors.productRepairLists?.[k]?.amount
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                  )}
                                />
                                {errors.productRepairLists?.[k]?.amount && (
                                  <span className="text-red-500 text-xs">
                                    กรุณาใส่ข้อมูล จำนวน
                                  </span>
                                )}
                              </div>

                              <div className="col-span-2 lg:col-span-1">
                                <label
                                  htmlFor={`priceSale-${k}`}
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  ราคาขาย
                                </label>

                                <Controller
                                  name={`productRepairLists[${k}].priceSale`}
                                  control={control}
                                  render={({ field }) => (
                                    <input
                                      {...field}
                                      id={`priceSale-${k}`}
                                      type="number"
                                      disabled={
                                        watch(
                                          `productRepairLists[${k}].isFree`
                                        ) !== "0"
                                      }
                                      value={field.value || 0}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      className={`w-full px-3 py-2 border ${
                                        errors.productRepairLists?.[k]
                                          ?.priceSale
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                  )}
                                />
                              </div>

                              <div className="col-span-4 items-center place-content-center">
                                <Controller
                                  name={`productRepairLists[${k}].isFree`}
                                  control={control}
                                  rules={{ required: true }}
                                  render={({ field }) => (
                                    <div>
                                      <input
                                        {...field}
                                        id={`isFree-${k}`}
                                        type="radio"
                                        value="0"
                                        checked={field.value == "0"}
                                        onChange={() => {
                                          setValue(
                                            `productRepairLists[${k}].priceSale`,
                                            watch(
                                              `productRepairLists[${k}].defaultPriceSale`
                                            )
                                          );
                                          field.onChange("0");
                                        }}
                                        className="mr-2"
                                      />
                                      <label
                                        htmlFor="isFree-0"
                                        className="text-green-400"
                                      >
                                        ซื้อ
                                      </label>

                                      {import.meta.env.VITE_SYSTEM_NAME ==
                                      "THUNDER" ? (
                                        <>
                                          <input
                                            {...field}
                                            id={`isFree-${k}-1`}
                                            type="radio"
                                            value="1"
                                            checked={field.value == "1"}
                                            onChange={() => {
                                              setValue(
                                                `productRepairLists[${k}].priceSale`,
                                                0
                                              );
                                              field.onChange("1");
                                            }}
                                            className="mr-2 ml-4"
                                          />
                                          <label
                                            htmlFor={`isFree-${k}-1`}
                                            className="text-red-400"
                                          >
                                            แถม
                                          </label>
                                        </>
                                      ) : null}

                                      <input
                                        {...field}
                                        id={`isFree-${k}-2`}
                                        type="radio"
                                        value="2"
                                        checked={field.value == "2"}
                                        onChange={() => {
                                          setValue(
                                            `productRepairLists[${k}].priceSale`,
                                            0
                                          );
                                          field.onChange("2");
                                        }}
                                        className="mr-2 ml-4"
                                      />
                                      <label
                                        htmlFor={`isFree-${k}-2`}
                                        className="text-blue-400"
                                      >
                                        เครม
                                      </label>
                                    </div>
                                  )}
                                />
                              </div>
                              <div className="col-span-4">
                                <button
                                  type="button"
                                  className="w-full py-2 text-red-500 hover:bg-red-50 rounded-md border border-red-200 flex items-center justify-center"
                                  onClick={() => {
                                    const currentList =
                                      watch("productRepairLists");
                                    const updatedList = currentList.filter(
                                      (_, index) => index !== k
                                    );
                                    setValue("productRepairLists", updatedList);
                                  }}
                                >
                                  <MdOutlineClose className="text-xl" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="items-center col-span-4">
              <HorizontalRule />
            </div>

            <div className="col-span-4 md:col-span-1 lg:col-span-1">
              <label
                htmlFor="pricePredict"
                className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
              >
                ราคาประเมิน (บ.)
              </label>
              <Controller
                id="pricePredict"
                name="pricePredict"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="pricePredict"
                    type="number"
                    placeholder="ราคาประเมิน"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.pricePredict ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errors.pricePredict && (
                <span className="text-red-500 text-xs mt-1 block">
                  กรุณาใส่ข้อมูล ราคาประเมิน
                </span>
              )}
            </div>
            {/* {watch("typeRepair") == "4" ? (
              <div className="col-span-4 md:col-span-1 lg:col-span-1"></div>
            ) : (
              <div className="col-span-4 md:col-span-1 lg:col-span-1">
                <label
                  htmlFor="priceDiscount"
                  className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                >
                  ส่วนลด (บ.)
                </label>
                <Controller
                  id="priceDiscount"
                  name="priceDiscount"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceDiscount"
                      type="number"
                      placeholder="ส่วนลด"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceDiscount
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
                {errors.priceDiscount && (
                  <span className="text-red-500 text-xs mt-1 block">
                    กรุณาใส่ข้อมูล ส่วนลด
                  </span>
                )}
              </div>
            )} */}
            {/* 
            <div className="col-span-4 md:col-span-1 lg:col-span-1">
              <label
                htmlFor="priceCost"
                className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
              >
                ต้นทุนรวม (บ.)
              </label>
              <Controller
                id="priceCost"
                name="priceCost"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="priceCost"
                    type="number"
                    disabled
                    placeholder="ต้นทุนรวม"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.priceCost ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errors.priceCost && (
                <span className="text-red-500 text-xs mt-1 block">
                  กรุณาใส่ข้อมูล ต้นทุนรวม
                </span>
              )}
            </div> */}

            {/* Price wage */}
            {watch("typeRepair") == "4" ? (
              <div
                className={`col-span-4 md:col-span-1 lg:col-span-${
                  watch("payType") == "3" ? "2" : "1"
                }`}
              >
                <label
                  htmlFor="priceCost"
                  className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                >
                  ต้นทุน (บ.)
                </label>
                <Controller
                  id="priceCost"
                  name="priceCost"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceCost"
                      type="number"
                      placeholder="ต้นทุน"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceCost ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
                {errors.priceCost && (
                  <span className="text-red-500 text-xs mt-1 block">
                    กรุณาใส่ข้อมูล ต้นทุน
                  </span>
                )}
              </div>
            ) : null}

            {watch("payType") == "1" || watch("payType") == "2" ? (
              <div className="col-span-4 md:col-span-1 lg:col-span-2">
                <label
                  htmlFor="priceRepair"
                  className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                >
                  ค่าซ่อม (บ.)
                </label>
                <Controller
                  id="priceRepair"
                  name="priceRepair"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceRepair"
                      type="number"
                      placeholder="ค่าซ่อม"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceRepair
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
                {errors.priceRepair && (
                  <span className="text-red-500 text-xs mt-1 block">
                    กรุณาใส่ข้อมูล ค่าซ่อม
                  </span>
                )}
              </div>
            ) : null}

            {/* Price Repair */}

            {watch("payType") == "3" ? (
              <div className="col-span-4 md:col-span-1 lg:col-span-2">
                <label
                  htmlFor="priceCash"
                  className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                >
                  ค่าซ่อม เงินสด (บ.)
                </label>
                <Controller
                  id="priceCash"
                  name="priceCash"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceCash"
                      type="number"
                      placeholder="ค่าซ่อมเงินสด"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceCash ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
                {errors.priceCash && (
                  <span className="text-red-500 text-xs mt-1 block">
                    กรุณาใส่ข้อมูล ค่าซ่อมเงินสด
                  </span>
                )}
              </div>
            ) : null}

            {watch("payType") == "3" ? (
              <div className="col-span-4 md:col-span-1 lg:col-span-2">
                <label
                  htmlFor="priceTransferCash"
                  className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                >
                  ค่าซ่อม เงินโอน (บ.)
                </label>
                <Controller
                  id="priceTransferCash"
                  name="priceTransferCash"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceTransferCash"
                      type="number"
                      placeholder="ค่าซ่อมเงินโอน"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceTransferCash
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
                {errors.priceTransferCash && (
                  <span className="text-red-500 text-xs mt-1 block">
                    กรุณาใส่ข้อมูล ค่าซ่อมเงินโอน
                  </span>
                )}
              </div>
            ) : null}

            <div className="items-center col-span-4">
              <HorizontalRule />
            </div>

            {/* Note */}
            <div
              className={`col-span-1 md:col-span-2 ${
                watch("typeRepair") === "3" || watch("typeRepair") === "4"
                  ? "lg:col-span-2"
                  : "lg:col-span-2"
              }`}
            >
              <label
                htmlFor="note"
                className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
              >
                รายการซ่อม
              </label>
              <Controller
                id="note"
                name="note"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="note"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.note ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    rows="4"
                  />
                )}
              />
              {errors.note && (
                <span className="text-red-500 text-xs mt-1 block">
                  กรุณาใส่ข้อมูล รายการซ่อม
                </span>
              )}
            </div>

            {/* Shop Name (for typeRepair == 3 or 4) */}
            {(watch("typeRepair") === "3" || watch("typeRepair") === "4") && (
              <div className="col-span-4 md:col-span-2 lg:col-span-2">
                <label
                  htmlFor="shopName"
                  className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                >
                  ชื่อร้าน
                </label>
                <Controller
                  id="shopName"
                  name="shopName"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      id="shopName"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.shopName ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      rows="4"
                    />
                  )}
                />
                {errors.shopName && (
                  <span className="text-red-500 text-xs mt-1 block">
                    กรุณาใส่ข้อมูล ชื่อร้าน
                  </span>
                )}
              </div>
            )}

            {/* Status */}
            {/* <div className="col-span-4 md:col-span-2 lg:col-span-4">
              <label
                htmlFor="active"
                className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
              >
                สถานะ
              </label>
              <Controller
                name="active"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <div className="flex items-center">
                      <input
                        {...field}
                        id="active-1"
                        type="radio"
                        value="1"
                        checked={field.value === "1"}
                        onChange={() => field.onChange("1")}
                        className="mr-1 sm:mr-2"
                      />
                      <label
                        htmlFor="active-1"
                        className="text-green-400 text-sm sm:text-base"
                      >
                        ยืนยัน
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        {...field}
                        id="active-2"
                        type="radio"
                        value="2"
                        checked={field.value === "2"}
                        onChange={() => field.onChange("2")}
                        className="mr-1 sm:mr-2"
                      />
                      <label
                        htmlFor="active-2"
                        className="text-red-400 text-sm sm:text-base"
                      >
                        ยกเลิก
                      </label>
                    </div>
                  </div>
                )}
              />
              {errors.active && (
                <span className="text-red-500 text-xs mt-1 block">
                  กรุณาเลือกข้อมูล สถานะ
                </span>
              )}
            </div> */}

            <div className="items-center col-span-4">
              <label
                htmlFor="uploadFileProductRepair"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                อัพโหลดไฟล์ png, jpeg, jpg
              </label>
              <FileDropzone
                isOpen={open}
                name="uploadFileProductRepair"
                acceptedFileTypes={acceptedFileTypes}
                control={control}
                maxFileSize={5}
                fileMultiple={true}
                setValue={setValue}
              />
            </div>

            <div className="items-center col-span-4">
              <HorizontalRule />
            </div>

            {!isEmpty(watch("productRepairImages")) ? (
              <div className="items-center col-span-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-2 lg:col-span-2">
                    <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                  </div>
                  <div className="col-span-2 lg:col-span-2">
                    <DragAndDropImages
                      images={watch("productRepairImages")}
                      submitSwitch={() => {}}
                      onDelete={() => {}}
                      showDelete={false}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </fieldset>

          {watch("id") ? null : (
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

ModalProductRepairs.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalProductRepairs;
