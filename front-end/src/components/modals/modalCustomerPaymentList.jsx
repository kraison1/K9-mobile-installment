import React from "react";
import PropTypes from "prop-types";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import { isEmpty } from "lodash";
import { formatDateTH } from "src/helpers/formatDate";
import { useAuth } from "src/hooks/authContext";
import { noImage } from "src/helpers/constant";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { fetchSelectBank } from "src/store/bank";
import dayjs from "src/helpers/dayjsConfig";

import { th } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ModalCustomerPaymentList = ({ open, setModal, RowData, submitRow }) => {
  const modalRef = React.useRef(null);
  const { user } = useAuth();
  const [Banks, setBanks] = React.useState([]);
  const storeBank = useSelector((state) => state.bank);
  const dispatch = useDispatch();

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: RowData,
  });

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (isEmpty(storeBank.selectPay) || isEmpty(storeBank.selectPaySaving)) {
        // 2 = ค่าดูแลรายเดือน 5 = ออม
        dispatch(fetchSelectBank(RowData.type == "1" ? 2 : 5));
      }

      modalRef.current.focus();
      reset({
        ...RowData,
        approve_date: RowData?.approve_date
          ? new Date(RowData?.approve_date)
          : new Date(),
      });
    }
  }, [open, RowData]);

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (!isEmpty(storeBank.selectPay) && RowData.type == "1") {
        setBanks(
          storeBank.selectPay.map((item) => ({
            value: item.id,
            label: `${item.bankOwner}, ${item.bankName} (${item.bankNo})`,
          }))
        );
      } else if (!isEmpty(storeBank.selectPaySaving) && RowData.type == "2") {
        setBanks(
          storeBank.selectPaySaving.map((item) => ({
            value: item.id,
            label: `${item.bankOwner}, ${item.bankName} (${item.bankNo})`,
          }))
        );
      } else {
        setBanks([]);
      }
    }
  }, [open, storeBank.selectPay, storeBank.selectPaySaving]);

  const onSubmit = (data) => {
    submitRow(data);
  };

  const statusOptions = [
    { value: "0", label: "รอยืนยัน", color: "yellow" },
    { value: "1", label: "ยืนยัน", color: "green" },
    { value: "2", label: "ยกเลิก", color: "red" },
  ];

  // Determine if the form should be locked for editing
  const isLocked = React.useMemo(() => {
    // Admins can always edit
    if (user?.type === "ผู้ดูแลระบบ") {
      return false;
    }
    return RowData.status !== "0";
  }, [RowData.status, user?.type]);

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
      >
        <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[95vh]">
          <div className="flex items-center justify-between p-3 border-b rounded-t">
            <h3 className="text-xl font-semibold text-gray-900">
              {`รายละเอียดการชำระเงิน: ${RowData.code || ""}`}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              onClick={() => setModal(false)}
            >
              <MdClose />
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Display info */}
            <div className="md:col-span-2 space-y-2">
              <p>
                <strong>ลูกค้า:</strong>{" "}
                {`${watch("customer.name") || ""} ${
                  watch("customer.lastname") || ""
                }`}
              </p>
              <p>
                <strong>เลขสัญญา:</strong>{" "}
                {watch("productSale.code") ||
                  watch("productSaving.code") ||
                  "-"}
              </p>
              <p>
                <strong>ลูกค้าทำรายการ:</strong>{" "}
                {formatDateTH(watch("create_date"))}
              </p>
              <p>
                <strong>ผู้ทำรายการ:</strong> {watch("user.name") || "-"}
              </p>
              {!isEmpty(watch("filePayment")) && (
                <div className="flex flex-col items-center justify-center mt-4">
                  <strong className="mb-2">สลิป:</strong>
                  {noImage(watch("filePayment"), "w-auto h-64 object-contain")}
                </div>
              )}
            </div>

            <fieldset
              disabled={isLocked}
              className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4"
            >
              <div className="items-center col-span-2 lg:col-span-2">
                <label
                  htmlFor="approve_date"
                  className="block text-sm font-medium text-gray-700"
                >
                  วันที่ยืนยัน
                </label>
                <Controller
                  name="approve_date"
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
                        .subtract(1, "month")
                        .startOf("month")
                        .toDate()}
                      maxDate={dayjs().toDate()}
                    />
                  )}
                />

                {errors.approve_date && (
                  <p className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล วันที่ยืนยัน
                  </p>
                )}
              </div>

              {/* Price Input */}
              <div className="items-center col-span-4 lg:col-span-4">
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
                  rules={{ required: watch("status") == "2" ? false : true }}
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
                        Banks.find((option) => option.value === field.value) ||
                        ""
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

              <div className="md:col-span-1">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ยอดชำระ
                </label>
                <Controller
                  name="price"
                  control={control}
                  rules={{ required: "กรุณาระบุยอดชำระ" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      id="price"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.price ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100`}
                    />
                  )}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Status update */}
              <div className="md:col-span-2">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  เปลี่ยนสถานะ
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap items-center gap-4">
                      {statusOptions.map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            {...field}
                            id={`status-${option.value}`}
                            type="radio"
                            value={option.value}
                            checked={field.value === option.value}
                            className={`h-4 w-4 text-${option.color}-600 border-gray-300 focus:ring-${option.color}-500 disabled:opacity-50`}
                          />
                          <label
                            htmlFor={`status-${option.value}`}
                            className={`ml-2 text-sm font-medium text-${option.color}-600`}
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>
            </fieldset>
          </div>
          <div className="flex justify-end items-center p-4 border-t border-gray-200 rounded-b">
            <button
              type="submit"
              disabled={isLocked}
              className="py-2 px-5 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              บันทึก
            </button>
            <button
              onClick={() => setModal(false)}
              type="button"
              className="py-2.5 px-5 ml-3 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
            >
              ปิด
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

ModalCustomerPaymentList.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalCustomerPaymentList;
