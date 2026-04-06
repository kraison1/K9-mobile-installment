/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty, isNumber, debounce } from "lodash";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { fetchInfoProductSaving } from "src/store/productSaving";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "src/hooks/authContext";
import { fetchScanProduct, fetchSelectProduct } from "src/store/product";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { fetchSelectCustomer } from "src/store/customer";
import { handleScanner } from "src/helpers/disabledHandleScanner";
import FileDropzone from "src/helpers/fileDropzone";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import HorizontalRule from "src/helpers/horizontalRule";
import { fetchSelectBank } from "src/store/bank";
import DragAndDropImages from "src/components/dragAndDropImages";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalProductSaving = ({ open, setModal, RowData, submitRow }) => {
  const { user, isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();
  const dispatch = useDispatch();
  const store = useSelector((state) => state.productSaving);
  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [Products, setProducts] = React.useState([]);
  const [Banks, setBanks] = React.useState([]);
  const [Customers, setCustomers] = React.useState([]);

  const storeProduct = useSelector((state) => state.product);
  const storeCustomer = useSelector((state) => state.customer);
  const storeBank = useSelector((state) => state.bank);

  React.useEffect(() => {
    if (!isEmpty(storeProduct.select)) {
      setProducts(
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
      setProducts([]);
    }
  }, [storeProduct.select]);

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

  const loadOptionsCustomer = React.useCallback(
    debounce((inputValue, callback) => {
      if (!inputValue) {
        callback([]);
        return;
      }

      dispatch(
        fetchSelectCustomer({
          branchId: user.branchId,
          customerType: ["1", "3"],
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

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (isNumber(RowData.productBookId)) {
        dispatch(
          fetchSelectProduct({
            branchId: user.branchId,
            catalog: "มือถือ",
            search: RowData.id == undefined ? "" : RowData.product?.imei,
            active: isNumber(RowData.id) ? "7" : "6",
          })
        );

        dispatch(
          fetchSelectCustomer({
            branchId: user.branchId,
            customerType: ["1", "3"],
            search: RowData.customerId,
          })
        );
      } else {
        dispatch(
          fetchSelectProduct({
            branchId: user.branchId,
            catalog: "มือถือ",
            search: RowData.id == undefined ? "" : RowData.product?.imei,
            active: RowData.id == undefined ? "1" : "7",
          })
        );

        dispatch(
          fetchSelectCustomer({
            branchId: user.branchId,
            customerType: ["1", "3"],
            search: RowData.id == undefined ? "" : RowData.customerId,
          })
        );
      }

      if (isEmpty(storeBank.select)) {
        dispatch(fetchSelectBank("4"));
      }

      modalRef.current.focus();

      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      } else {
        reset({
          ...RowData,
          productId: RowData.product?.id,
        });
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
    dispatch(fetchInfoProductSaving(id))
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
        className={`relative w-full max-w-4xl`}
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
          <fieldset disabled={RowData.id ? true : false}>
            <div className="p-2 grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="items-center col-span-4 lg:col-span-2">
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
                        disabled={RowData.productBookId ? true : false}
                        checked={field.value === "1"}
                        onChange={() => {
                          setValue("bankId", null);
                          field.onChange("1");
                          setValue("priceCash", 0);
                          setValue("priceTransferCash", 0);
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
                        disabled={RowData.productBookId ? true : false}
                        onChange={() => {
                          setValue("bankId", null);
                          field.onChange("2");
                          setValue("priceCash", 0);
                          setValue("priceTransferCash", 0);
                        }}
                        className="mr-2 ml-4"
                      />
                      <label htmlFor="payType-2" className="text-green-500">
                        เงินโอน
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

              <div className="items-center col-span-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {watch("payType") == "2" || watch("payType") == "3" ? (
                    <div className="items-center col-span-4">
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
                            isDisabled={
                              isNumber(RowData.productBookId) ? true : false
                            }
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
                              Banks.find(
                                (option) => option.value === field.value
                              ) || ""
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

                  <div className="items-center col-span-4">
                    <label
                      htmlFor="customerId"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                    ลูกค้า/บัตรประชาชน/เลขผู้เสียภาษี
                    </label>
                    <Controller
                      id="customerId"
                      name="customerId"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <AsyncSelect
                          {...field}
                          menuPortalTarget={document.body}
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 11 }),
                          }}
                          id="customerId"
                          isDisabled={
                            isNumber(RowData.productBookId) ? true : false
                          }
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
                            field.onChange(selectedOption?.value || "");
                          }}
                        />
                      )}
                    />

                    {errors.customerId && (
                      <span className="text-red-500 text-xs mt-1">
                        กรุณาใส่ข้อมูล ลูกค้า / บัตรประชาชน
                      </span>
                    )}
                  </div>

                  <div className="items-center col-span-4">
                    <label
                      htmlFor="productId"
                      className="flex text-sm font-medium text-gray-700 mr-2"
                    >
                      หมายเลขเครื่อง/หมายเลข IMEI
                    </label>
                    <Controller
                      id={`productId`}
                      name={`productId`}
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
                            isDisabled={
                              isNumber(RowData.productBookId) &&
                              RowData.product?.id
                                ? true
                                : false
                            }
                            id={`productId`}
                            defaultOptions={Products}
                            loadOptions={loadOptionsProduct}
                            onKeyDown={(e) => handleScanner(e)}
                            placeholder="กรุณาเลือกสินค้า"
                            isClearable
                            isSearchable
                            classNamePrefix="react-select"
                            value={
                              Products.find(
                                (option) => option.value === field.value
                              ) || ""
                            }
                            onChange={(selectedOption) =>
                              field.onChange(selectedOption?.value || "")
                            }
                          />
                        );
                      }}
                    />
                    {errors.productId && (
                      <span className="text-red-500 text-xs mt-1">
                        กรุณาใส่ข้อมูล หมายเลขเครื่อง/หมายเลข IMEI
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="items-center col-span-4">
                <HorizontalRule />
              </div>

              {watch("payType") == "3" || watch("payType") == "1" ? (
                <div className="items-center col-span-4 lg:col-span-2">
                  <label
                    htmlFor="priceCash"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    เงินสด (บ.)
                  </label>
                  <Controller
                    id="priceCash"
                    name="priceCash"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        disabled={
                          isNumber(RowData.productBookId) ? true : false
                        }
                        id="priceCash"
                        type="number"
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.priceCash
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                  {errors.priceCash && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล เงินสด
                    </span>
                  )}
                </div>
              ) : null}

              {watch("payType") == "3" || watch("payType") == "2" ? (
                <div className="items-center col-span-4 lg:col-span-2">
                  <label
                    htmlFor="priceTransferCash"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    เงินโอน (บ.)
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
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.priceTransferCash
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                  {errors.priceTransferCash && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล เงินโอน
                    </span>
                  )}
                </div>
              ) : null}

              <div className="items-center col-span-4">
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
                  rules={{
                    required: isNumber(watch("productId")) ? false : true,
                  }}
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

              <div className="items-center col-span-4">
                <label
                  htmlFor="uploadFileProductSaving"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  อัพโหลดไฟล์ png, jpeg, jpg
                </label>
                <FileDropzone
                  isOpen={open}
                  name="uploadFileProductSaving"
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

              {!isEmpty(watch("productSavingImages")) ? (
                <div className="items-center col-span-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="col-span-2 lg:col-span-2">
                      <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                    </div>
                    <div className="col-span-2 lg:col-span-2">
                      <DragAndDropImages
                        images={watch("productSavingImages")}
                        submitSwitch={() => {}}
                        onDelete={() => {}}
                        showDelete={false}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </fieldset>

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

ModalProductSaving.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalProductSaving;
