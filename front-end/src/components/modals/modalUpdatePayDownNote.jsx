import React from "react";
import PropTypes from "prop-types";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import { useAuth } from "src/hooks/authContext";
import { formatNumberDigit2 } from "src/helpers/formatNumber";
import { th } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "src/helpers/dayjsConfig";

const ModalUpdatePayDownNote = ({ open, setModal, RowData, submitRow }) => {
  const modalRef = React.useRef(null);
  const { permissions, isLoadingOpen } = useAuth();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: RowData,
  });

  React.useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
      reset(RowData);
    }
  }, [open, RowData, reset]);

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
        className="relative w-full max-w-lg"
      >
        <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[95vh]">
          <div className="flex items-center justify-between p-3 border-b rounded-t">
            <h3 className="text-xl font-semibold text-gray-900">
              {`แก้ไขข้อมูล งวดที่ ${RowData?.payNo || ""}`}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              onClick={() => setModal(false)}
            >
              <MdClose />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* งวดที่ */}
              <div>
                <label
                  htmlFor="payNo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  งวดที่
                </label>
                <Controller
                  name="payNo"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="payNo"
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none sm:text-sm"
                    />
                  )}
                />
              </div>

              {/* ชำระวันที่ */}
              <div>
                <label
                  htmlFor="datePay"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ชำระวันที่
                </label>
                <Controller
                  name="datePay"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      locale={th}
                      onChange={(date) => {
                        field.onChange(date);
                      }}
                      dateFormat="dd/MM/yyyy"
                      timeZone="Asia/Bangkok"
                      className="w-full p-1.5 border border-gray-300 rounded-md mt-1"
                      placeholderText="เลือกวันที่"
                      minDate={
                        permissions.includes("view-all-calendar")
                          ? dayjs(watch("datePay")).subtract(10, "day").toDate()
                          : dayjs(watch("datePay")).toDate()
                      }
                      maxDate={dayjs(watch("datePay")).add(10, "day").toDate()}
                    />
                  )}
                />
              </div>

              {/* ยอดเช่า */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ยอดเช่า (บาท)
                </label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <input
                      value={formatNumberDigit2(field.value)}
                      type="text"
                      id="price"
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none sm:text-sm"
                    />
                  )}
                />
              </div>

              {/* ชำระแล้ว */}
              <div>
                <label
                  htmlFor="pricePay"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ชำระแล้ว (บาท)
                </label>
                <Controller
                  name="pricePay"
                  control={control}
                  render={({ field }) => (
                    <input
                      value={formatNumberDigit2(field.value)}
                      type="text"
                      id="pricePay"
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none sm:text-sm"
                    />
                  )}
                />
              </div>
            </div>
            {/* ค่าทวงถาม */}
            <div>
              <label
                htmlFor="priceDebt"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ค่าทวงถาม
              </label>
              <Controller
                name="priceDebt"
                control={control}
                rules={{
                  required: "กรุณาระบุค่าทวงถาม",
                  valueAsNumber: true,
                  min: { value: 0, message: "ค่าทวงถามต้องไม่ติดลบ" },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    id="priceDebt"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.priceDebt ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="ระบุค่าทวงถาม"
                  />
                )}
              />
              {errors.priceDebt && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.priceDebt.message}
                </p>
              )}
            </div>

            {/* หมายเหตุ */}
            <div>
              <label
                htmlFor="note"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                หมายเหตุ
              </label>
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="note"
                    rows="4"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="ระบุหมายเหตุเพิ่มเติม"
                  />
                )}
              />
            </div>
          </div>
          <div className="flex justify-end items-center p-4 border-t border-gray-200 rounded-b">
            <button
              disabled={isLoadingOpen}
              type="submit"
              className="py-2 px-5 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
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

ModalUpdatePayDownNote.propTypes = {
  open: PropTypes.bool.isRequired,
  setModal: PropTypes.func.isRequired,
  RowData: PropTypes.object,
  submitRow: PropTypes.func.isRequired,
};

export default ModalUpdatePayDownNote;
