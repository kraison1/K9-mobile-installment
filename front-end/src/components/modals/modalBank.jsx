/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { useAuth } from "src/hooks/authContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchInfoBank } from "src/store/bank";
import FileDropzone from "src/helpers/fileDropzone";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import HorizontalRule from "src/helpers/horizontalRule";
import { noImage } from "src/helpers/constant";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalBank = ({ open, setModal, RowData, submitRow }) => {
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();
  const store = useSelector((state) => state.bank);
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
    }
  }, [open]);

  React.useEffect(() => {
    if (!isEmpty(store.data)) {
      reset(store.data);
    }
  }, [store]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoBank(id))
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
                : `แก้ไขรายการ: ${RowData.bankName}`}
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
            <div className="items-center col-span-1 lg:col-span-1">
              <label
                htmlFor="bankName"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ธนาคาร
              </label>
              <Controller
                id="bankName"
                name="bankName"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.bankName ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.bankName && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ธนาคาร
                </span>
              )}
            </div>

            <div className="items-center col-span-1 lg:col-span-1">
              <label
                htmlFor="bankNo"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                เลขบัญชี
              </label>
              <Controller
                id="bankNo"
                name="bankNo"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.bankNo ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.bankNo && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล เลขบัญชี
                </span>
              )}
            </div>

            <div className="items-center col-span-2 lg:col-span-1">
              <label
                htmlFor="bankOwner"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ชื่อบัญชี
              </label>
              <Controller
                id="bankOwner"
                name="bankOwner"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.bankOwner ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.bankOwner && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ชื่อบัญชี
                </span>
              )}
            </div>

            <div className="items-center col-span-2 lg:col-span-1">
              <label
                htmlFor="priceLimit"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ยอดต่อเดือน (บ.)
              </label>
              <Controller
                id="priceLimit"
                name="priceLimit"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.priceLimit ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.priceLimit && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ยอดต่อเดือน
                </span>
              )}
            </div>

            <div className="items-center col-span-2 lg:col-span-2">
              <label
                htmlFor="bookType"
                className=" text-sm font-medium text-gray-700 mb-2"
              >
                ประเภท
              </label>
              <Controller
                name="bookType"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="flex flex-col lg:flex-row lg:flex-wrap gap-2 col-span-2 max-w-full">
                    {[
                      {
                        value: "1",
                        label: "ใช้สำหรับ ค่าเปิดใช้เครื่อง/จอง",
                        color: "text-red-600",
                      },
                      {
                        value: "2",
                        label: "ใช้สำหรับ ค่าดูแลรายเดือน",
                        color: "text-green-600",
                      },
                      {
                        value: "4",
                        label: "ใช้สำหรับ ออม",
                        color: "text-red-600",
                      },
                      {
                        value: "5",
                        label: "ใช้สำหรับ ค่าดูแลออม",
                        color: "text-green-600",
                      },
                      {
                        value: "6",
                        label: "ใช้สำหรับ ค่าใช้จ่าย",
                        color: "text-yellow-600",
                      },
                      {
                        value: "7",
                        label: "ใช้สำหรับ รับเงินต่างสาขา",
                        color: "text-yellow-600",
                      },
                      {
                        value: "8",
                        label: "ใช้สำหรับ โอนเงินต่างสาขา",
                        color: "text-yellow-600",
                      },

                      {
                        value: "3",
                        label: "ใช้สำหรับ อื่น ๆ",
                        color: "text-blue-600",
                      },
                    ].map((item) => (
                      <div
                        key={item.value}
                        className="flex items-center w-full lg:w-1/2"
                      >
                        <input
                          id={`bookType-${item.value}`}
                          type="checkbox"
                          value={item.value}
                          checked={field.value?.includes(item.value)}
                          onChange={() => {
                            const newValue = field.value?.includes(item.value)
                              ? field.value.filter((v) => v !== item.value)
                              : [...(field.value || []), item.value];
                            field.onChange(newValue);
                          }}
                          className="mr-2 h-4 w-4 focus:ring-2 focus:ring-blue-500 hover:bg-gray-100"
                        />
                        <label
                          htmlFor={`bookType-${item.value}`}
                          className={`text-sm ${item.color} lg:text-base truncate`}
                        >
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              />
              {errors.bookType && (
                <span className="text-red-500 text-xs mt-2">
                  กรุณาเลือกข้อมูล บัญชีที่ใช้เริ่มต้นในการโอน
                </span>
              )}
              {errors.bookType && (
                <span className="text-red-500 text-xs mt-2">
                  กรุณาเลือกข้อมูล บัญชีที่ใช้เริ่มต้นในการโอน
                </span>
              )}
            </div>

            <div className="items-center col-span-2 lg:col-span-1">
              <label
                htmlFor="isFirstTransfer"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                เป็นบัญชีที่ใช้เริ่มต้นในการโอน
              </label>
              <Controller
                name="isFirstTransfer"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      id="isFirstTransfer-0"
                      type="radio"
                      value="0"
                      checked={field.value === "0"}
                      onChange={() => field.onChange("0")}
                      className="mr-2"
                    />
                    <label htmlFor="isFirstTransfer-0" className="text-red-400">
                      ไม่
                    </label>
                    <input
                      {...field}
                      id="isFirstTransfer-1"
                      type="radio"
                      value="1"
                      checked={field.value === "1"}
                      onChange={() => field.onChange("1")}
                      className="mr-2 ml-4"
                    />
                    <label
                      htmlFor="isFirstTransfer-1"
                      className="text-green-400"
                    >
                      ใช่
                    </label>
                  </div>
                )}
              />
              {errors.active && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล บัญชีที่ใช้เริ่มต้นในการโอน
                </span>
              )}
            </div>

            <div className="items-center col-span-2 lg:col-span-1">
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
            <div className="items-center col-span-2 lg:col-span-2">
              <HorizontalRule />
            </div>

            <div className="items-center col-span-2 lg:col-span-2">
              <label
                htmlFor="uploadFileBank"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                อัพโหลดไฟล์ png, jpeg, jpg
              </label>
              <FileDropzone
                isOpen={open}
                name="uploadFileBank"
                acceptedFileTypes={acceptedFileTypes}
                control={control}
                maxFileSize={5}
                fileMultiple={false}
                setValue={setValue}
              />
            </div>

            <div className="items-center col-span-2 lg:col-span-2">
              <HorizontalRule />
            </div>

            {!isEmpty(watch("fileBank")) ? (
              <div className="items-center col-span-2 lg:col-span-2 ">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-1 lg:col-span-2">
                    <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                  </div>
                  <div className="col-span-1 lg:col-span-2 flex justify-center">
                    {noImage(watch("fileBank"))}
                  </div>
                </div>
              </div>
            ) : null}
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

ModalBank.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalBank;
