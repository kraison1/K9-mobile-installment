/* eslint-disable react-hooks/exhaustive-deps */
import { debounce, isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { fetchInfoProcessManageFinance } from "src/store/manageFinancial";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "src/hooks/authContext";
import { conFirm } from "../alart";
import FileDropzone from "src/helpers/fileDropzone";
import HorizontalRule from "src/helpers/horizontalRule";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import DragAndDropImages from "src/components/dragAndDropImages";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalManageFinancialList = ({ open, setModal, RowData, submitRow }) => {
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();
  const store = useSelector((state) => state.manageFinancial);
  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [CurrentStatus, setCurrentStatus] = React.useState("1");

  React.useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      }
    }
  }, [open]);

  React.useEffect(() => {
    const manageFinancial = store.data;

    if (manageFinancial) {
      setCurrentStatus(manageFinancial.status);
      reset(manageFinancial);

      // reset({
      //   ...manageFinancial,
      //   status: manageFinancial.status == "1" ? "2" : manageFinancial.status,
      // });
    }
  }, [store]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoProcessManageFinance(id))
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
    conFirm(`ยืนยันการอัพเดตสินเชื่อ ${RowData.code}`, "ตกลง", "ปิด", true).then((e) => {
      if (e.isConfirmed) {
        submitRow(data);
      }
    });
  };

  const debouncedCalculate = React.useCallback(
    debounce((values) => {
      const priceEndCase =
        Number(values.priceRemaining) -
        (Number(values.priceDiscount) + Number(values.priceDebt));

      setValue("priceEndCase", priceEndCase);
    }, 300),
    [setValue] // เพิ่ม setValue เพราะใช้งานในนี้
  );

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      // เช็คว่า field ที่เปลี่ยนเกี่ยวข้องกับการคำนวณหรือไม่
      const relevantFields = ["priceDiscount", "priceDebt"];

      const isRelevantField = relevantFields.includes(name);
      if (isRelevantField) {
        debouncedCalculate(value);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedCalculate]);

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

          <fieldset disabled={CurrentStatus == 1 ? false : true}>
            <div className="p-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="items-center col-span-1 lg:col-span-1">
                <label
                  htmlFor="priceBranchService"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ค่าดำเนินการ
                </label>
                <Controller
                  id="priceBranchService"
                  name="priceBranchService"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      disabled
                      id="priceBranchService"
                      type="number"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceBranchService
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
              </div>

              <div className="items-center col-span-1 lg:col-span-1">
                <label
                  htmlFor="priceCommission"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ค่าคอม
                </label>
                <Controller
                  id="priceCommission"
                  name="priceCommission"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      disabled
                      id="priceCommission"
                      type="number"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceCommission
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
              </div>

              <div className="items-center col-span-1 lg:col-span-1">
                <label
                  htmlFor="priceReceive"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ได้รับรวม
                </label>
                <Controller
                  id="priceReceive"
                  name="priceReceive"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      disabled
                      id="priceReceive"
                      type="number"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceReceive
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
              </div>

              <div className="items-center col-span-3">
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
                  rules={{ required: false }}
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

              {/* <div className="items-center col-span-3 lg:col-span-3">
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
              </div> */}

              <div className="items-center col-span-3">
                <label
                  htmlFor="uploadFileManageFinancial"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  อัพโหลดไฟล์ png, jpeg, jpg
                </label>
                <FileDropzone
                  isOpen={open}
                  name="uploadFileManageFinancial"
                  acceptedFileTypes={acceptedFileTypes}
                  control={control}
                  maxFileSize={5}
                  fileMultiple={true}
                  setValue={setValue}
                />
              </div>

              <div className="items-center col-span-3">
                <HorizontalRule />
              </div>

              {!isEmpty(watch("manageFinancialImages")) ? (
                <div className="items-center col-span-3">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="col-span-2 lg:col-span-2">
                      <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                    </div>
                    <div className="col-span-2 lg:col-span-2">
                      <DragAndDropImages
                        images={watch("manageFinancialImages")}
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
          {CurrentStatus == 1 ? (
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

ModalManageFinancialList.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalManageFinancialList;
