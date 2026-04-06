/* eslint-disable react-hooks/exhaustive-deps */
import { debounce, isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { useAuth } from "src/hooks/authContext";
import { useDispatch, useSelector } from "react-redux";
import { handleScanner } from "src/helpers/disabledHandleScanner";
import { fetchInfoProcessCase } from "src/store/processCase";
import AsyncSelect from "react-select/async";
import { fetchInfoProduct, fetchScanProduct } from "src/store/product";
import Select from "react-select";
import { fetchSelectProductColors } from "src/store/productColor";
import { fetchSelectProductModels } from "src/store/productModel";
import { fetchSelectProductStorages } from "src/store/productStorage";
import HorizontalRule from "src/helpers/horizontalRule";

const ModalClaimMobileContact = ({ open, setModal, RowData, submitRow }) => {
  const { user, isLoadingOpen, setIsLoadingOpen } = useAuth();

  const dispatch = useDispatch();

  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [oldProductOptions, setOldProductOptions] = React.useState([]);
  const [newProductOptions, setNewProductOptions] = React.useState([]);

  const [ProductModels, setProductModels] = React.useState([]);
  const [ProductStorages, setProductStorages] = React.useState([]);
  const [ProductColors, setProductColors] = React.useState([]);

  const store = useSelector((state) => state.processCase);
  const storeProduct = useSelector((state) => state.product);
  const storeProductModel = useSelector((state) => state.productModel);
  const storeProductStorage = useSelector((state) => state.productStorage);
  const storeProductColor = useSelector((state) => state.productColor);
  const [CurrentStatus, setCurrentStatus] = React.useState("1");

  const addOrUpdateOption = (options, newOption) => {
    if (!newOption) return options;
    const existingIndex = options.findIndex(
      (opt) => opt.value === newOption.value
    );
    if (existingIndex > -1) {
      const newOptions = [...options];
      newOptions[existingIndex] = newOption;
      return newOptions;
    }
    return [...options, newOption];
  };

  React.useEffect(() => {
    const processCase = store.data;
    if (processCase) {
      reset({
        ...processCase,
        status: processCase.status == "0" ? "1" : "2",
      });
    }
  }, [store]);

  React.useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();

      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      } else {
        reset(RowData);
      }
    }
  }, [open]);

  React.useEffect(() => {
    if (!isEmpty(storeProductStorage.select)) {
      setProductStorages(
        storeProductStorage.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
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
        }))
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
        }))
      );
    } else {
      dispatch(fetchSelectProductModels(["มือถือ"]));
    }
  }, [storeProductModel.select]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoProcessCase(id))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  React.useEffect(() => {
    if (!isEmpty(storeProduct.select)) {
      setOldProductOptions(
        storeProduct.select.map((item) => ({
          value: item.id,
          label: `${item.code} / ${item.imei}`,
          priceSale: item.priceSale,
          priceDownPayment: item.priceDownPayment,
          priceDownPaymentPercent: item.priceDownPaymentPercent,
          priceWholeSale: item.priceWholeSale,
          payPerMonth: item.payPerMonth,
          valueMonth: item.valueMonth,
        }))
      );
    } else {
      setOldProductOptions([]);
    }
  }, [storeProduct.select]);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: RowData,
  });

  const {
    control: controlProduct,
    formState: { errors: errorsProduct },
    setValue: setValueProduct,
  } = useForm({
    defaultValues: {},
  });

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (watch("oldProductId")) {
        fetchProductInfo(watch("oldProductId"), "old");
      }
      if (watch("newProductId")) {
        fetchProductInfo(watch("newProductId"), "new");
      }
    }
  }, [open]);

  const fetchProductInfo = (id, prefix) => {
    if (!id || !prefix) return;
    setIsLoadingOpen(true);
    dispatch(fetchInfoProduct(id))
      .unwrap()
      .then((productInfo) => {
        if (productInfo) {
          setValueProduct(
            `${prefix}ProductModelId`,
            productInfo.productModelId
          );
          setValueProduct(
            `${prefix}ProductStorageId`,
            productInfo.productStorageId
          );
          setValueProduct(
            `${prefix}ProductColorId`,
            productInfo.productColorId
          );
          setValueProduct(`${prefix}Imei`, productInfo.imei);
          setValueProduct(`${prefix}BatteryHealth`, productInfo.batteryHealth);
          setValueProduct(
            `${prefix}MachineCondition`,
            productInfo.machineCondition
          );
          setValueProduct(`${prefix}PriceCostBuy`, productInfo.priceCostBuy);
          setValueProduct(
            `${prefix}PriceWholeSale`,
            productInfo.priceWholeSale
          );
          setValueProduct(`${prefix}PriceSale`, productInfo.priceSale);

          const option = {
            value: productInfo.id,
            label: `${productInfo.code} / ${productInfo.imei}`,
            ...productInfo,
          };
          if (prefix === "old") {
            setOldProductOptions((prev) => addOrUpdateOption(prev, option));
          } else {
            setNewProductOptions((prev) => addOrUpdateOption(prev, option));
          }
        }
        setIsLoadingOpen(false);
      })
      .catch((error) => {
        console.error("Failed to fetch product info:", error);
        setIsLoadingOpen(false);
      });
  };

  const loadOptionsProduct = React.useCallback(
    debounce((inputValue, callback) => {
      if (!inputValue) {
        callback([]);
        return;
      }

      dispatch(
        fetchScanProduct({
          branchId: user.branchId,
          catalog: "มือถือ",
          search: inputValue,
          active: "1",
        })
      )
        .unwrap()
        .then((result) => {
          const options = result?.map((item) => ({
            value: item.id,
            label: `${item.code} / ${item.imei}`,
            priceSale: item.priceSale,
            priceDownPayment: item.priceDownPayment,
            priceDownPaymentPercent: item.priceDownPaymentPercent,
            priceWholeSale: item.priceWholeSale,
            payPerMonth: item.payPerMonth,
            valueMonth: item.valueMonth,
          }));
          callback(options);
        })
        .catch((error) => {
          console.error("Load options error:", error);
          callback([]);
        });
    }, 500),
    [dispatch]
  );

  const onSubmit = (formData) => {
    submitRow(formData);
  };

  const mobileSelection = (title) => {
    const isOldProduct = title === "เครื่องในสัญญา";
    const prefix = isOldProduct ? "old" : "new";
    const productIdName = isOldProduct ? "oldProductId" : "newProductId";
    const productError = isOldProduct
      ? errors.oldProductId
      : errors.newProductId;
    const productOptions = isOldProduct ? oldProductOptions : newProductOptions;
    const setProductOptions = isOldProduct
      ? setOldProductOptions
      : setNewProductOptions;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2 text-center">
          <h2>{title}</h2>
        </div>

        <div className="col-span-2">
          <div className="items-center">
            <label
              htmlFor={productIdName}
              className="flex text-sm font-medium text-gray-700 mr-2"
            >
              หมายเลขเครื่อง/หมายเลข IMEI
            </label>
            <Controller
              id={productIdName}
              name={productIdName}
              control={control}
              rules={{ required: false }}
              render={({ field }) => {
                return (
                  <AsyncSelect
                    {...field}
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 11,
                      }),
                    }}
                    id={productIdName}
                    isDisabled={isOldProduct ? true : RowData.id ? true : false}
                    defaultOptions={productOptions}
                    loadOptions={loadOptionsProduct}
                    onKeyDown={(e) => handleScanner(e)}
                    placeholder="กรุณาเลือกสินค้า"
                    isClearable
                    isSearchable
                    classNamePrefix="react-select"
                    value={
                      productOptions.find(
                        (option) => option.value === field.value
                      ) || ""
                    }
                    onChange={(selectedOption) => {
                      field.onChange(selectedOption?.value || "");

                      if (selectedOption) {
                        setIsLoadingOpen(true);
                        dispatch(fetchInfoProduct(selectedOption.value))
                          .unwrap()
                          .then((productInfo) => {
                            if (productInfo) {
                              setValueProduct(
                                `${prefix}ProductModelId`,
                                productInfo.productModelId
                              );
                              setValueProduct(
                                `${prefix}ProductStorageId`,
                                productInfo.productStorageId
                              );
                              setValueProduct(
                                `${prefix}ProductColorId`,
                                productInfo.productColorId
                              );
                              setValueProduct(
                                `${prefix}Imei`,
                                productInfo.imei
                              );
                              setValueProduct(
                                `${prefix}BatteryHealth`,
                                productInfo.batteryHealth
                              );
                              setValueProduct(
                                `${prefix}MachineCondition`,
                                productInfo.machineCondition
                              );
                              setValueProduct(
                                `${prefix}PriceCostBuy`,
                                productInfo.priceCostBuy
                              );
                              setValueProduct(
                                `${prefix}PriceWholeSale`,
                                productInfo.priceWholeSale
                              );
                              setValueProduct(
                                `${prefix}PriceSale`,
                                productInfo.priceSale
                              );

                              setProductOptions((prev) =>
                                addOrUpdateOption(prev, selectedOption)
                              );
                            }
                            setIsLoadingOpen(false);
                          })
                          .catch((error) => {
                            console.error(
                              "Failed to fetch product info:",
                              error
                            );
                            setIsLoadingOpen(false);
                          });
                      } else {
                        const fieldsToClear = [
                          "ProductModelId",
                          "ProductStorageId",
                          "ProductColorId",
                          "Imei",
                          "BatteryHealth",
                          "MachineCondition",
                          "PriceCostBuy",
                          "PriceWholeSale",
                          "PriceSale",
                          "ProductBrandId",
                          "ProductTypeId",
                          "Catalog",
                        ];
                        fieldsToClear.forEach((fieldName) => {
                          setValueProduct(`${prefix}${fieldName}`, "");
                        });
                      }
                    }}
                  />
                );
              }}
            />
            {productError && (
              <span className="text-red-500 text-xs mt-1">
                กรุณาใส่ข้อมูล หมายเลขเครื่อง/หมายเลข IMEI
              </span>
            )}
          </div>
        </div>
        <div className="col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor={`${prefix}ProductModelId`}
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                รุ่น
              </label>
              <Controller
                id={`${prefix}ProductModelId`}
                name={`${prefix}ProductModelId`}
                control={controlProduct}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 11,
                        }),
                      }}
                      isDisabled
                      id={`${prefix}ProductModelId`}
                      options={ProductModels}
                      placeholder="กรุณาเลือกรุ่น"
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
              {errorsProduct[`${prefix}ProductModelId`] && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล รุ่น
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor={`${prefix}ProductStorageId`}
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ความจุ
              </label>
              <Controller
                id={`${prefix}ProductStorageId`}
                name={`${prefix}ProductStorageId`}
                control={controlProduct}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 11,
                        }),
                      }}
                      id={`${prefix}ProductStorageId`}
                      options={ProductStorages}
                      placeholder="กรุณาเลือกความจุ"
                      isDisabled
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
              {errorsProduct[`${prefix}ProductStorageId`] && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ความจุ
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor={`${prefix}ProductColorId`}
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                สี
              </label>
              <Controller
                id={`${prefix}ProductColorId`}
                name={`${prefix}ProductColorId`}
                control={controlProduct}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 11,
                        }),
                      }}
                      id={`${prefix}ProductColorId`}
                      options={ProductColors}
                      placeholder="กรุณาเลือกสี"
                      isSearchable
                      isDisabled
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
              {errorsProduct[`${prefix}ProductColorId`] && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล สี
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor={`${prefix}Imei`}
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                หมายเลขเครื่อง/หมายเลข IMEI
              </label>
              <Controller
                id={`${prefix}Imei`}
                name={`${prefix}Imei`}
                control={controlProduct}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="relative flex mt-1 gap-2">
                    <input
                      {...field}
                      disabled
                      id={`${prefix}Imei`}
                      type="text"
                      onKeyDown={(e) => handleScanner(e)}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errorsProduct[`${prefix}Imei`]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  </div>
                )}
              />
              {errorsProduct[`${prefix}Imei`] && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล หมายเลขเครื่อง/หมายเลข IMEI
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor={`${prefix}BatteryHealth`}
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                สุขภาพแบต %
              </label>
              <Controller
                id={`${prefix}BatteryHealth`}
                name={`${prefix}BatteryHealth`}
                control={controlProduct}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id={`${prefix}BatteryHealth`}
                    type="number"
                    disabled
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errorsProduct[`${prefix}BatteryHealth`]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errorsProduct[`${prefix}BatteryHealth`] && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล สุขภาพแบต
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor={`${prefix}MachineCondition`}
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                สภาพเครื่อง %
              </label>
              <Controller
                id={`${prefix}MachineCondition`}
                name={`${prefix}MachineCondition`}
                control={controlProduct}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id={`${prefix}MachineCondition`}
                    type="number"
                    disabled
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errorsProduct[`${prefix}MachineCondition`]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errorsProduct[`${prefix}MachineCondition`] && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล สภาพเครื่อง
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-3">
              <HorizontalRule />
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor={`${prefix}PriceCostBuy`}
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ราคาต้นทุน (บาท/หน่วย)
              </label>
              <Controller
                id={`${prefix}PriceCostBuy`}
                name={`${prefix}PriceCostBuy`}
                control={controlProduct}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id={`${prefix}PriceCostBuy`}
                    type="number"
                    disabled
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errorsProduct[`${prefix}PriceCostBuy`]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errorsProduct[`${prefix}PriceCostBuy`] && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ราคาต้นทุน
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor={`${prefix}PriceWholeSale`}
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ราคาขายส่ง (บาท/หน่วย)
              </label>
              <Controller
                id={`${prefix}PriceWholeSale`}
                name={`${prefix}PriceWholeSale`}
                control={controlProduct}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id={`${prefix}PriceWholeSale`}
                    type="number"
                    disabled
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errorsProduct[`${prefix}PriceWholeSale`]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errorsProduct[`${prefix}PriceWholeSale`] && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ราคาขายส่ง
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor={`${prefix}PriceSale`}
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ราคาขายปลีก (บาท/หน่วย)
              </label>
              <Controller
                id={`${prefix}PriceSale`}
                name={`${prefix}PriceSale`}
                control={controlProduct}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id={`${prefix}PriceSale`}
                    disabled
                    type="number"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errorsProduct[`${prefix}PriceSale`]
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errorsProduct[`${prefix}PriceSale`] && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ราคาขายปลีก
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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
      onKeyDown={(e) => (e.key === "Escape" ? setModal(false) : null)}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-screen-xl"
        ref={container}
      >
        <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[95vh]">
          <div className="flex items-center justify-between p-3 border-b rounded-t">
            <h3 className="text-xl font-semibold text-gray-900">
              {isNaN(RowData.id)
                ? "เพิ่มรายการใหม่"
                : `แก้ไขเลขสัญญา: ${RowData?.productSale?.code}`}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              onClick={() => setModal(false)}
            >
              <MdClose />
            </button>
          </div>
          <div className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="col-span-2">
              <fieldset
                disabled={RowData.id && RowData.status != "1" ? true : false}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    {mobileSelection("เครื่องในสัญญา")}
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    {mobileSelection("เครื่องใหม่")}
                  </div>
                  {RowData.id ? (
                    <div className="col-span-2 md:col-span-1">
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        อัพเดตสถานะ
                      </label>
                      <Controller
                        name="status"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <div>
                            <input
                              {...field}
                              id="status-3"
                              type="radio"
                              value="3"
                              checked={field.value === "3"}
                              onChange={() => field.onChange("3")}
                              className="mr-2"
                            />
                            <label htmlFor="status-3" className="text-red-400">
                              ปฏิเสธ
                            </label>
                            <input
                              {...field}
                              id="status-2"
                              type="radio"
                              value="2"
                              checked={field.value === "2"}
                              onChange={() => field.onChange("2")}
                              className="mr-2 ml-4"
                            />
                            <label
                              htmlFor="status-2"
                              className="text-green-400"
                            >
                              ยืนยัน
                            </label>
                          </div>
                        )}
                      />
                      {errors.status && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาเลือกข้อมูล สถานะ
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              </fieldset>
            </div>
          </div>

          <div className="flex justify-end items-center p-4 lg:p-5 border-t border-gray-200 rounded-b">
            {RowData.status != "2" ? (
              <button
                disabled={isLoadingOpen}
                type="submit"
                className="py-2 px-5 ml-3 text-sm text-white bg-blue-400 rounded-lg border border-blue-400 hover:bg-blue-500"
              >
                ยืนยัน
              </button>
            ) : null}

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

ModalClaimMobileContact.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalClaimMobileContact;
