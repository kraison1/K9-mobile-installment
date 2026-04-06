/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { MdClose, MdOutlineClose } from "react-icons/md";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { fetchSelectBranch } from "src/store/branch";
import { useAuth } from "src/hooks/authContext";
import { fetchScanProduct } from "src/store/product";
import { debounce, isArray, isEmpty } from "lodash";
import { fetchInfoProductBuy } from "src/store/productBuy";
import Select from "react-select";
import { fetchSelectTransport } from "src/store/transport";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import FileDropzone from "src/helpers/fileDropzone";
import { handleScanner } from "src/helpers/disabledHandleScanner";
import AsyncSelect from "react-select/async";
import { fetchSelectCustomer } from "src/store/customer";
import HorizontalRule from "src/helpers/horizontalRule";
import DragAndDropImages from "src/components/dragAndDropImages";
import { noImage } from "src/helpers/constant";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalBuyIntoStock = ({ open, setModal, RowData, submitRow }) => {
  const { user, isLoadingOpen, setIsLoadingOpen } = useAuth();
  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [Transports, setTransports] = React.useState([]);
  const [ScanProduct, setScanProduct] = React.useState("");
  const [Customers, setCustomers] = React.useState([]);

  const dispatch = useDispatch();
  const store = useSelector((state) => state.productBuy);
  const storeTransport = useSelector((state) => state.transport);
  const storeBranch = useSelector((state) => state.branch);
  const storeCustomer = useSelector((state) => state.customer);

  React.useEffect(() => {
    if (!isEmpty(storeTransport.select)) {
      setTransports(
        storeTransport.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    }
  }, [storeTransport.select]);

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (isEmpty(storeBranch.select)) {
        dispatch(fetchSelectBranch());
      }

      dispatch(
        fetchSelectCustomer({
          branchId: user.branchId,
          customerType: ["2"],
          search: RowData.id == undefined ? "" : RowData.venderId,
        }),
      );

      if (isEmpty(storeTransport.select)) {
        dispatch(fetchSelectTransport());
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
    if (!isEmpty(storeCustomer.select)) {
      setCustomers(
        storeCustomer.select.map((item) => ({
          value: item.id,
          label: `${item.name} ${item.lastname} (${item.citizenIdCard})`,
        })),
      );
    }
  }, [storeCustomer.select]);

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
    if (!isEmpty(store.data)) {
      reset({
        ...store.data,
      });
    }
  }, [store]);

  const debouncedFetch = React.useCallback(
    debounce((inputValue, callback) => {
      const productBuyLists = getValues("productBuyLists") || [];
      const existingProduct = productBuyLists.find(
        (item) => item.code === inputValue,
      );

      if (existingProduct) {
        const updatedproductBuyLists = productBuyLists.map((item) =>
          item.code === inputValue
            ? { ...item, amount: item.amount + 1 }
            : item,
        );
        setValue("productBuyLists", updatedproductBuyLists, {
          shouldDirty: true,
        });
        callback(existingProduct);
        setScanProduct("");
        return;
      }

      setIsLoadingOpen(true);
      dispatch(
        fetchScanProduct({
          branchId: user.branchId,
          search: inputValue.trim(),
          catalog: RowData.catalog,
          active: "1",
        }),
      )
        .unwrap()
        .then((result) => {
          if (!result?.message_error) {
            const newProduct = {
              code: inputValue,
              productName: `${result.productModel?.name || ""}, ${
                result.productColor?.name || ""
              } (${result.productBrand?.name || ""}) `,
              productId: result.id,
              amount: 1,
              priceCostBuy: result.priceCostBuy,
              priceSumCostBuy: Number(result.priceCostBuy) * 1,
            };
            setValue("productBuyLists", [...productBuyLists, newProduct], {
              shouldDirty: true,
            });
            callback(newProduct);
            setScanProduct("");
          } else {
            setScanProduct("");
            callback(null);
          }
        })
        .catch((error) => {
          console.error("Load options error:", error);
          callback(null);
        })
        .finally(() => setIsLoadingOpen(false));
    }, 500),
    [dispatch, user.branchId, RowData.catalog],
  );

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoProductBuy(id))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const handleSearch = (value) => {
    setScanProduct(value);
    if (!isEmpty(value)) {
      debouncedFetch(value, () => {});
    }
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    getValues,
    watch,
  } = useForm({
    defaultValues: RowData,
  });

  const { fields } = useFieldArray({
    control,
    name: "productBuyLists",
  });

  const onSubmit = (data) => {
    submitRow(data);
  };

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      // ตรวจสอบว่าเป็นการเปลี่ยนแปลงที่ productBuyLists หรือไม่
      if (
        name?.startsWith("productBuyLists") &&
        isArray(value.productBuyLists)
      ) {
        const sum = value.productBuyLists.reduce((total, item) => {
          const productSumPrice = Number(item.priceCostBuy * item.amount) || 0;
          return total + productSumPrice;
        }, 0);
        setValue("priceSumAll", sum, { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

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
        className="relative w-full max-w-5xl"
        ref={container}
      >
        <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[95vh]">
          <div className="flex items-center justify-between p-3 border-b rounded-t">
            <h3 className="text-xl font-semibold text-gray-900">
              {isNaN(RowData.id)
                ? "เพิ่มรายการใหม่"
                : `แก้ไขรายการ: ${RowData.code}`}
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
          <fieldset disabled={RowData.status == "1" ? true : false}>
            <div className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="items-center col-span-2">
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

              <div className="items-center col-span-2 lg:col-span-2">
                <label
                  htmlFor="transportId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ขนส่ง
                </label>
                <Controller
                  id="transportId"
                  name="transportId"
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => {
                    return (
                      <Select
                        {...field}
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 11 }),
                        }}
                        id="transportId"
                        options={Transports}
                        placeholder="กรุณาเลือกขนส่ง"
                        isClearable
                        isSearchable
                        classNamePrefix="react-select"
                        value={
                          Transports.find(
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
                {errors.transportId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ขนส่ง
                  </span>
                )}
              </div>

              <div className="items-center col-span-2 lg:col-span-2">
                <label
                  htmlFor="tackingNumber"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  เลขติดตามสินค้า
                </label>
                <Controller
                  id="tackingNumber"
                  name="tackingNumber"
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="tackingNumber"
                      type="text"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.tackingNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
                {errors.tackingNumber && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล เลขติดตามสินค้า
                  </span>
                )}
              </div>

              {!RowData.id && (
                <div className="items-center col-span-1 lg:col-span-2">
                  <label
                    htmlFor="ScanProduct"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    รหัสสินค้า
                  </label>
                  <input
                    id="ScanProduct"
                    onKeyDown={(e) => handleScanner(e)}
                    type="text"
                    value={ScanProduct}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                </div>
              )}

              <div className="items-center col-span-2 lg:col-span-2 p-2">
                <div className="grid grid-cols-1 gap-4">
                  {fields.map((productBuy, k) => (
                    <div
                      key={productBuy.id}
                      className="grid grid-cols-1 gap-3 p-4 border rounded-lg bg-white shadow-sm"
                    >
                      <div className="col-span-1">
                        <div className="space-y-2 col-span-2">
                          <label
                            htmlFor={`productName-${k}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            ชื่อสินค้า
                          </label>
                          <Controller
                            name={`productBuyLists[${k}].productName`}
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                id={`productName-${k}`}
                                type="text"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                className={`w-full px-3 py-2 border ${
                                  errors.productBuyLists?.[k]?.productName
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                              />
                            )}
                          />
                          {errors.productBuyLists?.[k]?.productName && (
                            <span className="text-red-500 text-xs">
                              กรุณาใส่ข้อมูล ชื่อสินค้า
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-1">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          <div className="space-y-1">
                            <label
                              htmlFor={`priceCostBuy-${k}`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              ราคาซื้อเข้าต่อชิ้น
                            </label>
                            <Controller
                              name={`productBuyLists[${k}].priceCostBuy`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  id={`priceCostBuy-${k}`}
                                  type="number"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const priceCostBuy =
                                      parseFloat(e.target.value) || 0;
                                    field.onChange(priceCostBuy);
                                    const amount =
                                      parseFloat(
                                        watch(`productBuyLists[${k}].amount`),
                                      ) || "";
                                    setValue(
                                      `productBuyLists[${k}].priceSumCostBuy`,
                                      priceCostBuy * amount,
                                    );
                                  }}
                                  className={`w-full px-3 py-2 border ${
                                    errors.productBuyLists?.[k]?.priceCostBuy
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                />
                              )}
                            />
                            {errors.productBuyLists?.[k]?.priceCostBuy && (
                              <span className="text-red-500 text-xs">
                                กรุณาใส่ข้อมูล ราคาซื้อเข้า
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label
                              htmlFor={`amount-${k}`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              จำนวน
                            </label>
                            <Controller
                              name={`productBuyLists[${k}].amount`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  id={`amount-${k}`}
                                  type="number"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const amount =
                                      parseFloat(e.target.value) || "";
                                    field.onChange(amount);
                                    const priceCostBuy =
                                      parseFloat(
                                        watch(
                                          `productBuyLists[${k}].priceCostBuy`,
                                        ),
                                      ) || 0;
                                    setValue(
                                      `productBuyLists[${k}].priceSumCostBuy`,
                                      priceCostBuy * amount,
                                    );
                                  }}
                                  className={`w-full px-3 py-2 border ${
                                    errors.productBuyLists?.[k]?.amount
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                />
                              )}
                            />
                            {errors.productBuyLists?.[k]?.amount && (
                              <span className="text-red-500 text-xs">
                                กรุณาใส่ข้อมูล จำนวน
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label
                              htmlFor={`priceSumCostBuy-${k}`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              ราคาซื้อเข้ารวม
                            </label>
                            <Controller
                              name={`productBuyLists[${k}].priceSumCostBuy`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  id={`priceSumCostBuy-${k}`}
                                  type="number"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const priceSumCostBuy =
                                      parseFloat(e.target.value) || 0;
                                    field.onChange(priceSumCostBuy);
                                    const amount =
                                      parseFloat(
                                        watch(`productBuyLists[${k}].amount`),
                                      ) || 1;
                                    setValue(
                                      `productBuyLists[${k}].priceCostBuy`,
                                      amount > 0 ? priceSumCostBuy / amount : 0,
                                    );
                                  }}
                                  className={`w-full px-3 py-2 border ${
                                    errors.productBuyLists?.[k]?.priceSumCostBuy
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                />
                              )}
                            />
                            {errors.productBuyLists?.[k]?.priceSumCostBuy && (
                              <span className="text-red-500 text-xs">
                                กรุณาใส่ข้อมูล ราคาซื้อเข้ารวม
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <button
                          type="button"
                          className="w-full py-2 text-red-500 hover:bg-red-50 rounded-md border border-red-200 flex items-center justify-center"
                          onClick={() => {
                            const currentList = watch("productBuyLists");
                            const updatedList = currentList.filter(
                              (_, index) => index !== k,
                            );
                            setValue("productBuyLists", updatedList);
                          }}
                        >
                          <MdOutlineClose className="text-xl" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="items-center col-span-1 lg:col-span-2">
                <label
                  htmlFor="priceSumAll"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  รวมยอดซื้อเข้า
                </label>
                <Controller
                  id="priceSumAll"
                  name="priceSumAll"
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <input
                      disabled
                      {...field}
                      id="priceSumAll"
                      type="text"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceSumAll
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
                {errors.priceSumAll && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล รวมยอดซื้อเข้า
                  </span>
                )}
              </div>

              {RowData.status === "0" && RowData.id ? (
                <div className="items-center col-span-2 lg:col-span-1">
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    สถานะ
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-4">
                        <div>
                          <input
                            {...field}
                            id="status-0"
                            type="radio"
                            value="0"
                            checked={field.value === "0"}
                            onChange={() => field.onChange("0")}
                            className="mr-2"
                          />
                          <label htmlFor="status-0" className="text-blue-400">
                            รอ
                          </label>
                        </div>
                        <div>
                          <input
                            {...field}
                            id="status-2"
                            type="radio"
                            value="2"
                            checked={field.value === "2"}
                            onChange={() => field.onChange("2")}
                            className="mr-2"
                          />
                          <label htmlFor="status-3" className="text-red-400">
                            ยกเลิก
                          </label>
                        </div>
                        <div>
                          <input
                            {...field}
                            id="status-1"
                            type="radio"
                            value="1"
                            checked={field.value === "1"}
                            onChange={() => field.onChange("1")}
                            className="mr-2"
                          />
                          <label htmlFor="status-1" className="text-green-400">
                            ยืนยัน
                          </label>
                        </div>
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

              <div className="col-span-2">
                <div className="items-center grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Customer Picture */}
                  <div className="items-center col-span-1">
                    <div className="items-center grid grid-cols-1 gap-4">
                      <div className="items-center col-span-1">
                        <label
                          htmlFor="uploadFileBuyCustomer"
                          className="block text-sm font-medium text-red-700 mr-2"
                        >
                          รูปลูกค้า (png, jpeg, jpg)
                        </label>
                        <FileDropzone
                          isOpen={open}
                          name="uploadFileBuyCustomer"
                          acceptedFileTypes={acceptedFileTypes}
                          control={control}
                          maxFileSize={5}
                          fileMultiple={false}
                          setValue={setValue}
                        />
                      </div>

                      <div className="items-center col-span-1">
                        <HorizontalRule />
                      </div>

                      {!isEmpty(watch("fileProductBuyCustomer")) ? (
                        <div className="items-center col-span-1">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="col-span-1">
                              <p className="text-lg">รูปที่เคยอัพโหลด</p>
                            </div>
                            <div className="col-span-2 flex justify-center items-center">
                              {noImage(watch("fileProductBuyCustomer"))}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Right Column: Proof of Payment */}
                  <div className="items-center col-span-1">
                    <div className="items-center grid grid-cols-1 gap-4">
                      <div className="items-center col-span-1">
                        <label
                          htmlFor="uploadFileBuy"
                          className="block text-sm font-medium text-blue-700 mr-2"
                        >
                          หลักฐานการชำระ (png, jpeg, jpg)
                        </label>
                        <FileDropzone
                          isOpen={open}
                          name="uploadFileBuy"
                          acceptedFileTypes={acceptedFileTypes}
                          control={control}
                          maxFileSize={5}
                          fileMultiple={false}
                          setValue={setValue}
                        />
                      </div>

                      <div className="items-center col-span-1">
                        <HorizontalRule />
                      </div>

                      {!isEmpty(watch("fileProductBuy")) ? (
                        <div className="items-center col-span-1">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="col-span-1">
                              <p className="text-lg">รูปที่เคยอัพโหลด</p>
                            </div>
                            <div className="col-span-2 flex justify-center items-center">
                              {noImage(watch("fileProductBuy"))}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </fieldset>

          {RowData.status == "1" ? null : (
            <div className="flex justify-end items-center p-4 lg:p-5 border-t border-gray-200 rounded-b">
              {RowData.status === "0" ? (
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
          )}
        </div>
      </form>
    </div>
  );
};

ModalBuyIntoStock.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalBuyIntoStock;
