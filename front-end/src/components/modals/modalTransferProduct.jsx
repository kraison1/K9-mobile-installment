/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { MdClose, MdOutlineClose } from "react-icons/md";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { fetchSelectBranch } from "src/store/branch";
import { useAuth } from "src/hooks/authContext";
import {
  fetchSelectProduct,
  fetchSelectProductTransfer,
} from "src/store/product";
import { debounce, isArray, isEmpty, isNumber, map } from "lodash";
import { fetchInfoTransferProduct } from "src/store/transferProduct";
import { error } from "../alart";
import Select from "react-select";
import { fetchSelectTransport } from "src/store/transport";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import FileDropzone from "src/helpers/fileDropzone";
import AsyncSelect from "react-select/async";
import { handleScanner } from "src/helpers/disabledHandleScanner";
import { noImage } from "src/helpers/constant";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalBranchTransferProduct = ({ open, setModal, RowData, submitRow }) => {
  const { user, isLoadingOpen, setIsLoadingOpen } = useAuth();
  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [Products, setProducts] = React.useState([]);
  const [DisabledForm, setDisabledForm] = React.useState(false);
  const [Branches, setBranches] = React.useState([]);
  const [Transports, setTransports] = React.useState([]);

  const dispatch = useDispatch();
  const store = useSelector((state) => state.transferProduct);
  const storeTransport = useSelector((state) => state.transport);
  const storeBranch = useSelector((state) => state.branch);
  const storeProduct = useSelector((state) => state.product);

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
    if (!isEmpty(storeTransport.select)) {
      setTransports(
        storeTransport.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, [storeTransport.select]);

  React.useEffect(() => {
    if (!isNumber(RowData.id)) {
      if (!isEmpty(storeProduct.select)) {
        const newProducts = storeProduct.select.map((item) => ({
          value: item.id,
          label: `${item.code} ${
            watch("catalog") == "มือถือ" ? `/ ${item.imei}` : ""
          }`,
          priceCostBuy: item.priceCostBuy,
          priceSale: watch("มือถือ") ? item.priceSale : item.priceCostBuy,
          amount: 1,
        }));
        setProducts((prevProducts) => {
          const productMap = new Map();
          prevProducts.forEach((p) => productMap.set(p.value, p));
          newProducts.forEach((p) => productMap.set(p.value, p));
          return Array.from(productMap.values());
        });
      }
    } else {
      if (!isEmpty(storeProduct.transferProduct)) {
        setProducts(
          storeProduct.transferProduct.map((item) => ({
            value: item.id,
            label: `${item.code} ${
              watch("catalog") == "มือถือ" ? `/ ${item.imei}` : ""
            }`,
            priceCostBuy: item.priceCostBuy,
            priceSale: watch("มือถือ") ? item.priceSale : item.priceCostBuy,
            amount: 1,
          }))
        );
      }
    }
  }, [storeProduct.select, storeProduct.transferProduct]);

  const loadOptionsProduct = React.useCallback(
    debounce((inputValue, callback) => {
      if (!inputValue) {
        callback([]);
        return;
      }

      dispatch(
        fetchSelectProduct({
          branchId: user.branchId,
          catalog: watch("catalog"),
          search: inputValue,
          active: "1",
        })
      )
        .unwrap()
        .then((result) => {
          const options = result?.map((item) => ({
            value: item.id,
            label: `${item.code} ${
              watch("catalog") == "มือถือ" ? `/ ${item.imei}` : ""
            }`,
            priceCostBuy: item.priceCostBuy,
            priceSale: watch("มือถือ") ? item.priceSale : item.priceCostBuy,
            amount: 1,
          }));
          if (!isEmpty(options)) {
            setProducts((prevProducts) => {
              const newOptions = options.filter(
                (opt) => !prevProducts.some((p) => p.value === opt.value)
              );
              return [...prevProducts, ...newOptions];
            });
          }
          callback(options || []);
        })
        .catch((error) => {
          console.error("Load options error:", error);
          callback([]);
        });
    }, 500),
    [dispatch, user.branchId]
  );

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (isEmpty(storeBranch.select)) {
        dispatch(fetchSelectBranch());
      }

      if (isEmpty(storeTransport.select)) {
        dispatch(fetchSelectTransport());
      }

      setDisabledForm(false);
      setProducts([]);

      const loadInitialProducts = async () => {
        let initialProducts = [];
        try {
          if (!isNumber(RowData.id)) {
            // New transfer: fetch default products
            const result = await dispatch(
              fetchSelectProduct({
                branchId: user.branchId,
                catalog: watch("catalog"),
                search: "",
                active: "1",
              })
            ).unwrap();
            initialProducts =
              result?.map((item) => ({
                value: item.id,
                label: `${item.code} ${
                  watch("catalog") == "มือถือ" ? `/ ${item.imei}` : ""
                }`,
                priceCostBuy: item.priceCostBuy,
                priceSale: watch("มือถือ") ? item.priceSale : item.priceCostBuy,
                amount: 1,
              })) || [];
          } else {
            // Existing transfer: fetch products associated with it
            setDisabledForm(true);
            const result = await dispatch(
              fetchSelectProductTransfer(RowData.id)
            ).unwrap();
            initialProducts =
              result?.map((item) => ({
                value: item.id,
                label: `${item.code} ${
                  watch("catalog") == "มือถือ" ? `/ ${item.imei}` : ""
                }`,
                priceCostBuy: item.priceCostBuy,
                priceSale: watch("มือถือ") ? item.priceSale : item.priceCostBuy,
                amount: 1,
              })) || [];
          }
          setProducts(initialProducts);
        } catch (e) {
          console.error("Failed to load initial products:", e);
          setProducts([]);
        }
      };

      loadInitialProducts();

      modalRef.current.focus();
      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      } else {
        reset(RowData);
        addRow();
      }
    }
  }, [open, RowData.id, user.branchId]);

  React.useEffect(() => {
    if (!isEmpty(store.data)) {
      reset(store.data);
    }
  }, [store]);

  const fetchInfo = (id) => {
    
    setIsLoadingOpen(true);
    dispatch(fetchInfoTransferProduct(id))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const onSubmit = (data) => {
    submitRow(data);
  };

  const addRow = () => {
    const oldRow = [
      ...(getValues("transferProductBranchLists") || []),
      { productId: "", amount: 0, priceCostBuy: 0, priceSale: 0 },
    ];
    setValue("transferProductBranchLists", oldRow);
  };

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      // ตรวจสอบว่าเป็นการเปลี่ยนแปลงที่ transferProductBranchLists หรือไม่
      if (
        name?.startsWith("transferProductBranchLists") &&
        isArray(value.transferProductBranchLists)
      ) {
        const sum = value.transferProductBranchLists.reduce((total, item) => {
          const priceSale = Number(item.priceSale) || 0;
          return total + priceSale;
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
        className="relative w-full max-w-2xl"
        ref={container}
        disabled={DisabledForm}
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
          <div className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="items-center sm:col-span-2 lg:col-span-2">
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
              {errors.transportId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ขนส่ง
                </span>
              )}
            </div>

            <div className="items-center col-span-1 lg:col-span-2">
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

            {RowData.toBranchId == user.branchId &&
            import.meta.env.VITE_SYSTEM_NAME == "AAA" ? (
              <div className="items-center col-span-1 lg:col-span-2">
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
            ) : null}

            <div className="items-center sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="branchId"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                จากสาขา
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
                      isDisabled
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
                  กรุณาใส่ข้อมูล จากสาขา
                </span>
              )}
            </div>

            <div className="items-center sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="toBranchId"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ไปยังสาขา
              </label>
              <Controller
                id="toBranchId"
                name="toBranchId"
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
                      id="toBranchId"
                      isDisabled={DisabledForm}
                      options={Branches.filter(
                        (e) => e.value !== user.branchId
                      )}
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
                        if (selectedOption.value === user.branchId) {
                          error("ไม่สามารถเลือกสาขาตัวเอง");
                          field.onChange(""); // รีเซ็ตการเลือกหากซ้ำ
                        } else {
                          field.onChange(
                            selectedOption ? selectedOption.value : ""
                          );
                        }
                      }}
                    />
                  );
                }}
              />
              {errors.toBranchId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ไปยังสาขา
                </span>
              )}
            </div>

            <div className="items-center sm:col-span-2 lg:col-span-2 border p-2">
              <fieldset disabled={RowData.id ? true : false}>
                <div className="grid grid-cols-1 gap-4">
                  {map(
                    watch("transferProductBranchLists"),
                    (transferProductBranchList, k) => (
                      <div
                        key={k}
                        className="grid grid-cols-1 gap-3 p-4 border rounded-lg bg-white shadow-sm"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <label className="block text-sm font-medium text-gray-700 mr-2">
                            {watch("catalog") == "มือถือ"
                              ? "หมายเลขเครื่อง/หมายเลข IMEI"
                              : "รหัสสินค้าของอุปกรณ์"}
                          </label>
                        </div>

                        {/* Select Section */}
                        <div className="space-y-2">
                          <Controller
                            id={`transferProductBranchList-${k}`}
                            name={`transferProductBranchLists[${k}].productId`}
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <AsyncSelect
                                {...field}
                                id={`transferProductBranchList-${k}`}
                                defaultOptions={Products.filter(
                                  (product) =>
                                    !watch("transferProductBranchLists").some(
                                      (item) => item.productId === product.value
                                    )
                                )}
                                isDisabled={DisabledForm}
                                onKeyDown={(e) => handleScanner(e)}
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
                                onChange={(selectedOption) => {
                                  field.onChange(
                                    selectedOption ? selectedOption.value : null
                                  );

                                  setValue(
                                    `transferProductBranchLists[${k}].priceCostBuy`,
                                    selectedOption
                                      ? Number(selectedOption.priceCostBuy)
                                      : 0,
                                    { shouldValidate: true }
                                  );

                                  setValue(
                                    `transferProductBranchLists[${k}].amount`,
                                    1,
                                    { shouldValidate: true }
                                  );

                                  setValue(
                                    `transferProductBranchLists[${k}].priceSale`,
                                    selectedOption
                                      ? Number(selectedOption.priceSale)
                                      : 0,
                                    { shouldValidate: true }
                                  );
                                }}
                              />
                            )}
                          />
                          {errors.transferProductBranchLists?.[k]
                            ?.productId && (
                            <span className="text-red-500 text-xs">
                              กรุณาใส่ข้อมูล สินค้า
                            </span>
                          )}
                        </div>

                        {/* Inputs Section */}
                        <div
                          className={`grid grid-cols-1 gap-3 ${
                            watch("catalog") === "มือถือ"
                              ? "md:grid-cols-2"
                              : "md:grid-cols-3"
                          }`}
                        >
                          {/* Price Cost Buy */}
                          <div className="space-y-1">
                            <label
                              htmlFor={`priceCostBuy-${k}`} // ปรับ id ให้ unique
                              className="block text-sm font-medium text-gray-700"
                            >
                              ทุนการซื้อ
                            </label>
                            <Controller
                              name={`transferProductBranchLists[${k}].priceCostBuy`}
                              control={control}
                              rules={{ required: false }}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  disabled
                                  id={`priceCostBuy-${k}`}
                                  type="number"
                                  value={field.value} // เพิ่ม fallback
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  className={`w-full px-3 py-2 border ${
                                    errors.transferProductBranchLists?.[k]
                                      ?.priceCostBuy
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                />
                              )}
                            />
                            {errors.transferProductBranchLists?.[k]
                              ?.priceCostBuy && (
                              <span className="text-red-500 text-xs">
                                กรุณาใส่ข้อมูล ทุนการซื้อ
                              </span>
                            )}
                          </div>

                          {/* amount */}
                          {watch("catalog") == "มือถือ" ? null : (
                            <div className="space-y-1">
                              <label
                                htmlFor={`amount-${k}`} // ปรับ id ให้ unique
                                className="block text-sm font-medium text-gray-700"
                              >
                                จำนวน
                              </label>
                              <Controller
                                name={`transferProductBranchLists[${k}].amount`}
                                control={control}
                                rules={{ required: false }}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    id={`amount-${k}`}
                                    type="number"
                                    value={field.value ?? ""}
                                    disabled={
                                      watch("branchId") == user.branchId
                                        ? false
                                        : true
                                    }
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      const newAmount =
                                        value === "" ? "" : Number(value);
                                      field.onChange(newAmount);

                                      const priceCostBuy = getValues(
                                        `transferProductBranchLists[${k}].priceCostBuy`
                                      );

                                      const newPriceSale =
                                        (Number(priceCostBuy) || 0) *
                                        (Number(newAmount) || 0);

                                      setValue(
                                        `transferProductBranchLists[${k}].priceSale`,
                                        newPriceSale,
                                        { shouldValidate: true }
                                      );
                                    }}
                                    className={`w-full px-3 py-2 border ${
                                      errors.transferProductBranchLists?.[k]
                                        ?.amount
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  />
                                )}
                              />
                              {errors.transferProductBranchLists?.[k]
                                ?.priceSale && (
                                <span className="text-red-500 text-xs">
                                  กรุณาใส่ข้อมูล จำนวน
                                </span>
                              )}
                            </div>
                          )}

                          {/* Price Sale */}
                          <div className="space-y-1">
                            <label
                              htmlFor={`priceSale-${k}`} // ปรับ id ให้ unique
                              className="block text-sm font-medium text-gray-700"
                            >
                              รวมยอด
                            </label>
                            <Controller
                              name={`transferProductBranchLists[${k}].priceSale`}
                              control={control}
                              rules={{ required: false }}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  id={`priceSale-${k}`}
                                  disabled={
                                    watch("branchId") == user.branchId
                                      ? false
                                      : true
                                  }
                                  type="number"
                                  value={field.value} // เพิ่ม fallback
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  className={`w-full px-3 py-2 border ${
                                    errors.transferProductBranchLists?.[k]
                                      ?.priceSale
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                />
                              )}
                            />
                            {errors.transferProductBranchLists?.[k]
                              ?.priceSale && (
                              <span className="text-red-500 text-xs">
                                กรุณาใส่ข้อมูล รวมยอด
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-1">
                          {k !== 0 && (
                            <button
                              type="button"
                              disabled={DisabledForm}
                              className="w-full py-2 text-red-500 hover:bg-red-50 rounded-md border border-red-200 flex items-center justify-center"
                              onClick={() => {
                                const currentList = watch(
                                  "transferProductBranchLists"
                                );
                                const updatedList = currentList.filter(
                                  (_, index) => index !== k
                                );
                                setValue(
                                  "transferProductBranchLists",
                                  updatedList
                                );
                              }}
                            >
                              <MdOutlineClose className="text-xl" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  )}

                  {!DisabledForm && (
                    <div className="p-4">
                      <button
                        type="button"
                        className="w-full py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors duration-200"
                        onClick={addRow}
                      >
                        เพิ่มสินค้า
                      </button>
                    </div>
                  )}
                </div>
              </fieldset>
            </div>

            <div className="items-center col-span-1 lg:col-span-2">
              <label
                htmlFor="priceSumAll"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ยอดเก็บสาขาปลายทาง
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
                      errors.priceSumAll ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.priceSumAll && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ยอดเก็บสาขาปลายทาง
                </span>
              )}
            </div>

            {watch("id") ? (
              <div className="items-center col-span-2 lg:col-span-2 border p-2">
                <label
                  htmlFor="uploadFileTransfer"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  อัพโหลดไฟล์ png, jpeg, jpg
                </label>
                <FileDropzone
                  isOpen={open}
                  name="uploadFileTransfer"
                  acceptedFileTypes={acceptedFileTypes}
                  control={control}
                  maxFileSize={5}
                  fileMultiple={false}
                  setValue={setValue}
                />
              </div>
            ) : null}

            {RowData.status === "0" ? (
              <div className="items-center sm:col-span-2 lg:col-span-1">
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
                    <div>
                      {RowData.toBranchId === user.branchId ? null : (
                        <>
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

                          <input
                            {...field}
                            id="status-3"
                            type="radio"
                            value="3"
                            checked={field.value === "3"}
                            onChange={() => field.onChange("3")}
                            className="mr-2 ml-4"
                          />
                          <label htmlFor="status-3" className="text-red-400">
                            ยกเลิก
                          </label>
                        </>
                      )}

                      {RowData.toBranchId === user.branchId ? (
                        <>
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

                          <input
                            {...field}
                            id="status-2"
                            type="radio"
                            value="2"
                            checked={field.value === "2"}
                            onChange={() => field.onChange("2")}
                            className="mr-2 ml-4"
                          />
                          <label htmlFor="status-2" className="text-red-400">
                            ปฏิเสธ
                          </label>
                        </>
                      ) : null}
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

            {!isEmpty(watch("fileTransferProductBranch")) ? (
              <div className="items-center col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                  </div>
                  <div className="col-span-2 flex justify-center items-center">
                    {noImage(RowData.fileTransferProductBranch)}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

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
        </div>
      </form>
    </div>
  );
};

ModalBranchTransferProduct.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalBranchTransferProduct;
