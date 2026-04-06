/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "src/hooks/authContext";
import { fetchInfoExpenses } from "src/store/expenses";
import { fetchSelectExpenseType } from "src/store/expenseType";
import Select from "react-select";
import HorizontalRule from "src/helpers/horizontalRule";
import FileDropzone from "src/helpers/fileDropzone";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import { fetchSelectBank } from "src/store/bank";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from "date-fns/locale";
import dayjs from "src/helpers/dayjsConfig";
import DragAndDropImages from "src/components/dragAndDropImages";
import {
  deleteExpenseImage,
  updateExpenseImageSeq,
} from "src/store/expenseImage";
import { conFirm } from "../alart";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalExpenses = ({ open, setModal, RowData, submitRow }) => {
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();

  const storeExpenseType = useSelector((state) => state.expenseType);
  const store = useSelector((state) => state.expenses);
  const [ExpenseTypes, setExpenseTypes] = React.useState([]);
  const [Banks, setBanks] = React.useState([]);
  const storeBank = useSelector((state) => state.bank);

  const modalRef = React.useRef(null);
  const container = React.useRef(null);

  React.useEffect(() => {
    if (!isEmpty(storeExpenseType.select)) {
      setExpenseTypes(
        storeExpenseType.select.map((item) => ({
          value: item.id,
          label: `${item.name} (${item.code})`,
          type: item.type,
        }))
      );
    }
  }, [storeExpenseType.select]);

  React.useEffect(() => {
    if (!isEmpty(storeBank.selectPayExpense)) {
      setBanks(
        storeBank.selectPayExpense.map((item) => ({
          value: item.id,
          label: `${item.bankOwner}, ${item.bankName} (${item.bankNo})`,
        }))
      );
    } else {
      setBanks([]);
    }
  }, [storeBank.selectPayExpense]);

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (isEmpty(storeExpenseType.select)) {
        dispatch(fetchSelectExpenseType());
      }

      if (isEmpty(storeBank.selectPayExpense)) {
        dispatch(fetchSelectBank("6"));
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
    if (!isEmpty(store.data)) {
      reset(store.data);
    }
  }, [store]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoExpenses(id))
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

  const submitSwitch = (items) => {
    setIsLoadingOpen(true);
    dispatch(updateExpenseImageSeq(items))
      .unwrap()
      .then(() => {
        fetchInfo(RowData.id);
        setIsLoadingOpen(false);
      })
      .catch(() => setIsLoadingOpen(false));
  };

  const onDelete = (item) => {
    try {
      conFirm(`ยืนยันการลบรูปภาพของ ${RowData.code}`, "ตกลง", "ปิด", true).then(
        (e) => {
          if (e.isConfirmed) {
            setIsLoadingOpen(true);
            dispatch(deleteExpenseImage(item.id))
              .unwrap()
              .then(() => {
                fetchInfo(RowData.id);
                setIsLoadingOpen(false);
              })
              .catch(() => setIsLoadingOpen(false));
          }
        }
      );
    } catch (error) {
      console.log(error);
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

          <fieldset disabled={RowData.id ? true : false}>
            <div className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div
                className="items-center col-span-2"
                style={{
                  justifyItems: "right",
                }}
              >
                <label
                  htmlFor="create_date"
                  className="block text-sm font-medium text-gray-700"
                >
                  วันที่ทำรายการ
                </label>
                <Controller
                  name="create_date"
                  control={control}
                  rules={{ required: true }}
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
                        // .subtract(1, "month")
                        .subtract(5, "month")
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
                    บัญชีในการโอน
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
                      กรุณาใส่ข้อมูล บัญชีในการโอน
                    </span>
                  )}
                </div>
              ) : null}

              <div className="items-center sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="expenseTypeId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ประเภทค่าใช้จ่าย
                </label>
                <Controller
                  id="expenseTypeId"
                  name="expenseTypeId"
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
                        id="expenseTypeId"
                        options={ExpenseTypes}
                        placeholder="กรุณาเลือกประเภท"
                        isClearable
                        isSearchable
                        classNamePrefix="react-select"
                        value={
                          ExpenseTypes.find(
                            (option) => option.value === field.value
                          ) || ""
                        }
                        onChange={(selectedOption) => {
                          field.onChange(
                            selectedOption ? selectedOption.value : ""
                          );
                          setValue(
                            "type",
                            selectedOption ? selectedOption.type : ""
                          );
                        }}
                      />
                    );
                  }}
                />
                {errors.expenseTypeId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ประเภทค่าใช้จ่าย
                  </span>
                )}
              </div>

              <div className="items-center col-span-1 lg:col-span-1">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ยอดเงิน
                </label>
                <Controller
                  id="price"
                  name="price"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="price"
                      type="number"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.price ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
                {errors.price && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ยอดเงิน
                  </span>
                )}
              </div>

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

              <div className="items-center">
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
            </div>
          </fieldset>

          <div className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="items-center col-span-2 lg:col-span-2">
              <HorizontalRule />
            </div>

            <div className="items-center col-span-2 lg:col-span-2">
              <label
                htmlFor="uploadFileExpense"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                อัพโหลดไฟล์ png, jpeg, jpg
              </label>
              <FileDropzone
                isOpen={open}
                name="uploadFileExpense"
                acceptedFileTypes={acceptedFileTypes}
                control={control}
                maxFileSize={5}
                fileMultiple={true}
                setValue={setValue}
              />
            </div>

            <div className="items-center col-span-2 lg:col-span-2">
              <HorizontalRule />
            </div>

            {!isEmpty(watch("expenseImages")) ? (
              <div className="items-center col-span-2 lg:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-2 lg:col-span-2">
                    <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                  </div>
                  <div className="col-span-2 lg:col-span-2">
                    <DragAndDropImages
                      images={watch("expenseImages")}
                      submitSwitch={submitSwitch}
                      onDelete={onDelete}
                      showDelete={true}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end items-center p-4 lg:p-5 border-t border-gray-200 rounded-b">
            <button
              type="submit"
              disabled={isLoadingOpen}
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

ModalExpenses.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalExpenses;
