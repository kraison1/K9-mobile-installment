/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { fetchInfoWithdrawSumPriceSale } from "src/store/withdrawSumPriceSale";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "src/hooks/authContext";
import { noImage } from "src/helpers/constant";
import HorizontalRule from "src/helpers/horizontalRule";
import FileDropzone from "src/helpers/fileDropzone";
import { imageJpeg, imagePng } from "src/helpers/fileType";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalWithdrawSumPriceSale = ({ open, setModal, RowData, submitRow }) => {
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();
  const store = useSelector((state) => state.withdrawSumPriceSale);
  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [OldStatus, seOldStatus] = React.useState("1");

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
      seOldStatus(store.data?.status || "1");
      reset(store.data);
    }
  }, [store]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoWithdrawSumPriceSale(id))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
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
        className="relative w-full max-w-2xl"
        ref={container}
      >
        <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[95vh]">
          <div className="flex items-center justify-between p-3 border-b rounded-t">
            <h3 className="text-xl font-semibold text-gray-900">
              {`${
                isNaN(RowData.id)
                  ? `เพิ่มรายการใหม่ ${RowData.productName}`
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
            className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-4"
            disabled={OldStatus == "1" ? false : true}
          >
            <div className="items-center col-span-1 lg:col-span-1">
              <label
                htmlFor="amountWithdraw"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                จำนวนที่เบิก
              </label>
              <Controller
                id="amountWithdraw"
                name="amountWithdraw"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    value={field.value || ""}
                    onChange={(e) => {
                      const amountWithdraw = parseFloat(e.target.value) || 0;
                      field.onChange(amountWithdraw);
                      const priceSum = amountWithdraw * watch("priceSale");
                      setValue(`priceSum`, priceSum);
                    }}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.amountWithdraw
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.amountWithdraw && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล จำนวนที่เบิก
                </span>
              )}
            </div>

            <div className="items-center col-span-1 lg:col-span-1">
              <label
                htmlFor="priceSum"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                รวมยอด
              </label>
              <Controller
                id="priceSum"
                name="priceSum"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    disabled
                    value={field.value || ""}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.priceSum ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.priceSum && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล รวมยอด
                </span>
              )}
            </div>

            {watch("id") ? (
              <div className="items-center">
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
                      <input
                        {...field}
                        id="status-3"
                        type="radio"
                        value="3"
                        checked={field.value === "3"}
                        onChange={() => field.onChange("3")}
                        className="mr-3"
                      />
                      <label htmlFor="status-3" className="text-red-400">
                        ยกเลิก
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
                      <label htmlFor="status-2" className="text-green-400">
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

            <div className="items-center col-span-2">
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
                rules={{ required: true }}
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
              {errors.note && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล หมายเหตุ
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

            {!isEmpty(watch("fileWithdrawSumPriceSale")) ? (
              <div className="items-center col-span-2 lg:col-span-2 ">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-1 lg:col-span-2">
                    <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                  </div>
                  <div className="col-span-1 lg:col-span-2 flex justify-center">
                    {noImage(watch("fileWithdrawSumPriceSale"))}
                  </div>
                </div>
              </div>
            ) : null}
          </fieldset>

          {OldStatus == "1" ? (
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
          ) : null}
        </div>
      </form>
    </div>
  );
};

ModalWithdrawSumPriceSale.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalWithdrawSumPriceSale;
