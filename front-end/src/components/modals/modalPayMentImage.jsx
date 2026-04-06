/* eslint-disable react-hooks/exhaustive-deps */
import { isArray, isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { useAuth } from "src/hooks/authContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchInfoProductPayMentImages } from "src/store/productPayMentImage";
import FileDropzone from "src/helpers/fileDropzone";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import HorizontalRule from "src/helpers/horizontalRule";
import { noImage } from "src/helpers/constant";
import { fetchSelectBank } from "src/store/bank";
import dayjs from "src/helpers/dayjsConfig";
import { th } from "date-fns/locale";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { conFirm } from "../alart";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalPayMentImage = ({ open, setModal, RowData, submitRow }) => {
  const { isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();
  const [Banks, setBanks] = React.useState([]);

  const dispatch = useDispatch();
  const store = useSelector((state) => state.bank);

  const storeProductPayMentImage = useSelector(
    (state) => state.productPayMentImage
  );

  const modalRef = React.useRef(null);
  const container = React.useRef(null);

  React.useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      } else {
        reset(RowData);
      }

      if (isEmpty(store.selectPay)) {
        dispatch(fetchSelectBank("2"));
      }
    }
  }, [open]);

  React.useEffect(() => {
    if (!isEmpty(store.selectPay)) {
      setBanks(
        store.selectPay.map((item) => ({
          value: item.id,
          label: `${item.bankOwner}, ${item.bankName} (${item.bankNo})`,
        }))
      );
    } else {
      setBanks([]);
    }
  }, [store.selectPay]);

  React.useEffect(() => {
    if (!isEmpty(storeProductPayMentImage.data)) {
      reset({
        ...storeProductPayMentImage.data,
        datePay: dayjs(storeProductPayMentImage.data.datePay).toDate(),
      });
    }
  }, [storeProductPayMentImage]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoProductPayMentImages(id))
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

  const onSubmit = (formData) => {
    // Ensure storeProductPayMentImage and allData exist
    const allData = storeProductPayMentImage?.allData;
    const data = allData?.data;
    const datePay = dayjs(watch("datePay")).format("YYYY-MM-DD");
    // Find existing payment with the same date
    const findDatePay = data.find(
      (e) => dayjs(e.datePay).format("YYYY-MM-DD") === datePay
    );

    if (!isEmpty(findDatePay)) {
      // If a payment exists for the same date, ask for confirmation
      conFirm(
        "มีการอัพโหลดสลิปในวันเดียวกันก่อนหน้านั้นแล้ว ยืนยันที่จะทำรายการหรือไม่ ?",
        "ตกลง",
        "ปิด",
        true
      ).then((result) => {
        if (result.isConfirmed) {
          submitRow(formData);
        }
      });
    } else {
      // No existing payment, submit directly
      submitRow(formData);
    }
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
        className="relative w-full max-w-2xl"
        ref={container}
      >
        <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[95vh]">
          <div className="flex items-center justify-between p-3 border-b rounded-t">
            <h3 className="text-xl font-semibold text-gray-900">
              {isNaN(RowData.id)
                ? "เพิ่มรายการใหม่"
                : `แก้ไขรายการงวดที่: ${RowData.payNo}`}
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
                disabled={
                  RowData.id && !permissions.includes("edit-image-payment")
                    ? true
                    : false
                }
              >
                <div className="flex flex-col items-end col-span-2 lg:col-span-2">
                  <label
                    htmlFor="datePay"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ชำระวันที่
                  </label>
                  <Controller
                    name="datePay"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <DatePicker
                        showIcon
                        showTimeSelect
                        selected={field.value}
                        onChange={(date) => field.onChange(date)}
                        minDate={
                          permissions.includes("view-all-calendar")
                            ? dayjs().subtract(5, "month").toDate()
                            : dayjs().subtract(1, "month").toDate()
                        }
                        maxDate={dayjs().toDate()}
                        locale={th}
                        dateFormat="dd/MM/yyyy HH:mm"
                        timeFormat="HH:mm"
                        timeZone="Asia/Bangkok"
                        timeIntervals={1}
                        className={`py-2 border ${
                          errors.datePay ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        placeholderText="เลือกวันที่และเวลา"
                      />
                    )}
                  />
                  {errors.datePay && (
                    <p className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล ชำระวันที่
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="items-center col-span-2">
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
                            checked={field.value === "1"}
                            onChange={() => {
                              setValue("bankId", null);
                              field.onChange("1");
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
                              setValue("bankId", null);
                              field.onChange("2");
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
                  {watch("payType") == "2" ? (
                    <div className="items-center col-span-2">
                      <label
                        htmlFor="bankId"
                        className="text-sm font-medium text-gray-700"
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

                  <div className="items-center col-span-2 lg:col-span-2">
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      ยอดชำระ
                    </label>
                    <Controller
                      id="price"
                      name="price"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <input
                          disabled={watch("id") ? true : false}
                          {...field}
                          type="number"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.price ? "border-red-500" : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                      )}
                    />
                    {errors.price && (
                      <span className="text-red-500 text-xs mt-1">
                        กรุณาใส่ข้อมูล ยอดชำระ
                      </span>
                    )}
                  </div>

                  {/* {RowData?.id ? (
                    <div className="items-center col-span-2 lg:col-span-2">
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
                            <label
                              htmlFor="active-1"
                              className="text-green-400"
                            >
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
                  ) : null} */}

                  <div className="items-center col-span-2 lg:col-span-2">
                    <HorizontalRule />
                  </div>

                  {RowData.id ? null : (
                    <div className="items-center col-span-2 lg:col-span-2">
                      <label
                        htmlFor="uploadFilePayMent"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        อัพโหลดไฟล์ png, jpeg, jpg
                      </label>
                      <FileDropzone
                        isOpen={open}
                        name="uploadFilePayMent"
                        acceptedFileTypes={acceptedFileTypes}
                        control={control}
                        maxFileSize={5}
                        fileMultiple={false}
                        setValue={setValue}
                      />
                    </div>
                  )}

                  <div className="items-center col-span-2 lg:col-span-2">
                    <HorizontalRule />
                  </div>

                  {!isEmpty(watch("filePayMent")) ? (
                    <div className="items-center col-span-2 lg:col-span-2 ">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="col-span-1 lg:col-span-2">
                          <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                        </div>
                        <div className="col-span-1 lg:col-span-2 flex justify-center">
                          {noImage(watch("filePayMent"))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </fieldset>
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

ModalPayMentImage.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalPayMentImage;
