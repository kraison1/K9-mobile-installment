/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty } from "lodash";
import { Controller, useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { fetchInfoProductClaims } from "src/store/productClaim";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "src/hooks/authContext";

import HorizontalRule from "src/helpers/horizontalRule";
import DragAndDropImages from "src/components/dragAndDropImages";

// import FileDropzone from "src/helpers/fileDropzone";
// import { imageJpeg, imagePng } from "src/helpers/fileType";
// const acceptedFileTypes = {
//   "image/jpeg": imageJpeg,
//   "image/png": imagePng,
// };

const ModalProductClaim = ({ open, setModal, RowData, submitRow }) => {
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();
  const store = useSelector((state) => state.productClaim);
  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [OldStatus, setOldStatus] = React.useState("0");

  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm({
    defaultValues: RowData,
  });

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
    if (store?.data) {
      setOldStatus(store.data.status);
      reset({
        ...store.data,
        create_date: store.data?.create_date
          ? new Date(store.data?.create_date)
          : new Date(),
      });
    }
  }, [store]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoProductClaims(id))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

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
                  ? "เพิ่มรายการใหม่"
                  : `แก้ไขรายการ: ${RowData.product?.productModel?.name} (${RowData.product?.code})`
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
            disabled={OldStatus !== "0" ? true : false}
          >
            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                จำนวน
              </label>
              <Controller
                id="amount"
                name="amount"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="amount"
                    type="number"
                    disabled
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.amount ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errors.amount && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล จำนวน
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="priceCostBuy"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ต้นทุน (บ.)
              </label>
              <Controller
                id="priceCostBuy"
                name="priceCostBuy"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="priceCostBuy"
                    type="number"
                    disabled
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.priceCostBuy ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errors.priceCostBuy && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ต้นทุน
                </span>
              )}
            </div>

            {/* Status */}
            <div className="col-span-4 md:col-span-2 lg:col-span-4">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
              >
                สถานะ
              </label>
              <Controller
                name="status"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <div className="flex items-center">
                      <input
                        {...field}
                        id="status-1"
                        type="radio"
                        value="1"
                        checked={field.value === "1"}
                        onChange={() => field.onChange("1")}
                        className="mr-1 sm:mr-2"
                      />
                      <label
                        htmlFor="status-1"
                        className="text-green-400 text-sm sm:text-base"
                      >
                        ยืนยัน
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        {...field}
                        id="status-2"
                        type="radio"
                        value="2"
                        checked={field.value === "2"}
                        onChange={() => field.onChange("2")}
                        className="mr-1 sm:mr-2"
                      />
                      <label
                        htmlFor="status-2"
                        className="text-red-400 text-sm sm:text-base"
                      >
                        ยกเลิก
                      </label>
                    </div>
                  </div>
                )}
              />
              {errors.status && (
                <span className="text-red-500 text-xs mt-1 block">
                  กรุณาเลือกข้อมูล สถานะ
                </span>
              )}
            </div>
            {/* 
            <div className="items-center col-span-4">
              <label
                htmlFor="uploadFileProductClaim"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                อัพโหลดไฟล์ png, jpeg, jpg
              </label>
              <FileDropzone
                isOpen={open}
                name="uploadFileProductClaim"
                acceptedFileTypes={acceptedFileTypes}
                control={control}
                maxFileSize={5}
                fileMultiple={true}
                setValue={setValue}
              />
            </div> */}

            <div className="items-center col-span-4">
              <HorizontalRule />
            </div>

            {!isEmpty(watch("productClaimImages")) ? (
              <div className="items-center col-span-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-2 lg:col-span-2">
                    <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                  </div>
                  <div className="col-span-2 lg:col-span-2">
                    <DragAndDropImages
                      images={watch("productClaimImages")}
                      submitSwitch={() => {}}
                      onDelete={() => {}}
                      showDelete={false}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </fieldset>

          {OldStatus == "0" ? (
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

ModalProductClaim.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalProductClaim;
