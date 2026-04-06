/* eslint-disable react-hooks/exhaustive-deps */
import { debounce, isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { fetchInfoProcessCase } from "src/store/processCase";
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

const ModalProcessCase = ({ open, setModal, RowData, submitRow }) => {
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();
  const store = useSelector((state) => state.processCase);
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
    const processCase = store.data;
    if (processCase) {
      const priceEndCase =
        Number(processCase.priceRemaining) +
        Number(processCase.sumPriceDebt) -
        (Number(processCase.priceDiscount) + Number(processCase.priceDebt));
      setCurrentStatus(processCase.status);
      reset({
        ...processCase,
        status: processCase.status == "0" ? "1" : "2",
        priceEndCase: priceEndCase,
      });
    }
  }, [store]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoProcessCase(id))
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

    // conFirm(
    //   `ยืนยันการปิดสัญญา ${RowData.productSale.code}`,
    //   "ตกลง",
    //   "ปิด",
    //   true
    // ).then((e) => {
    //   if (e.isConfirmed) {
    //     submitRow(data);
    //   }
    // });
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
                  : `แก้ไขรายการ: ${RowData.productSale.code}`
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
              <div className="items-center col-span-2 lg:col-span-2">
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

              {watch("caseType") == 3 || watch("caseType") == 4 ? (
                <div className="col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div
                    className={`items-center col-span-${
                      watch("useCostType") == "2" ? "1" : "2"
                    }`}
                  >
                    <label
                      htmlFor="useCostType"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      เปลื่ยนแปลงราคาต้นทุน
                    </label>
                    <Controller
                      name="useCostType"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <div>
                          <input
                            {...field}
                            id="useCostType-1"
                            type="radio"
                            value="1"
                            checked={field.value === "1"}
                            onChange={() => field.onChange("1")}
                            className="mr-2"
                          />
                          <label
                            htmlFor="useCostType-1"
                            className="text-red-400"
                          >
                            ใช้ทุนเดิม
                          </label>
                          <input
                            {...field}
                            id="useCostType-2"
                            type="radio"
                            value="2"
                            checked={field.value === "2"}
                            onChange={() => field.onChange("2")}
                            className="mr-2 ml-4"
                          />
                          <label
                            htmlFor="useCostType-2"
                            className="text-green-400"
                          >
                            ใช้ทุนใหม่
                          </label>
                        </div>
                      )}
                    />
                    {errors.useCostType && (
                      <span className="text-red-500 text-xs mt-1">
                        กรุณาเลือกข้อมูล เปลื่ยนแปลงราคาต้นทุน
                      </span>
                    )}
                  </div>
                  {watch("useCostType") == "2" ? (
                    <div className="items-center col-span-1 lg:col-span-1">
                      <label
                        htmlFor="priceDownPayment"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        มูลค่าทรัพย์สินใหม่ บ.
                      </label>
                      <Controller
                        id="priceNewCostBuy"
                        name="priceNewCostBuy"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="priceNewCostBuy"
                            type="number"
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.priceNewCostBuy
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                          />
                        )}
                      />
                    </div>
                  ) : null}

                  <div className="items-center col-span-1 lg:col-span-1">
                    <label
                      htmlFor="priceRemaining"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      มูลค่าทรัพย์สิน บ.
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
                          disabled
                          type="number"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.priceCostBuy
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                      )}
                    />
                  </div>

                  <div className="items-center col-span-1 lg:col-span-1">
                    <label
                      htmlFor="priceDownPayment"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      ค่าเปิดใช้เครื่อง บ.
                    </label>
                    <Controller
                      id="priceDownPayment"
                      name="priceDownPayment"
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="priceDownPayment"
                          disabled
                          type="number"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.priceDownPayment
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                      )}
                    />
                  </div>
                </div>
              ) : null}

              <div className="items-center col-span-1 lg:col-span-1">
                <label
                  htmlFor="valueDebtMonth"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  จำนวนงวดที่ค้าง เดือน
                </label>
                <Controller
                  id="valueDebtMonth"
                  name="valueDebtMonth"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      disabled
                      id="valueDebtMonth"
                      type="number"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.valueDebtMonth
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
              </div>

              <div className="items-center col-span-1 lg:col-span-1">
                <label
                  htmlFor="priceRemaining"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ยอดค้างชำระ บ.
                </label>
                <Controller
                  id="priceRemaining"
                  name="priceRemaining"
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceRemaining"
                      disabled
                      type="number"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceRemaining
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
              </div>

              <div className="items-center col-span-1 lg:col-span-1">
                <label
                  htmlFor="sumPriceDebt"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ค่าทวงถาม บ.
                </label>
                <Controller
                  id="sumPriceDebt"
                  name="sumPriceDebt"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="sumPriceDebt"
                      type="number"
                      disabled
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.sumPriceDebt
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
              </div>

              {watch("caseType") == 3 || watch("caseType") == 4 ? (
                <div className="col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="items-center col-span-1 lg:col-span-1">
                    <label
                      htmlFor="priceReRider"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      ค่าติดตามนอกพื้นที่ บ.
                    </label>
                    <Controller
                      id="priceReRider"
                      name="priceReRider"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="priceReRider"
                          type="number"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.priceReRider
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                      )}
                    />

                    {errors.priceReRider && (
                      <span className="text-red-500 text-xs mt-1">
                        กรุณาเลือกข้อมูล รับค่าส่ง
                      </span>
                    )}
                  </div>

                  <div className="items-center col-span-1 lg:col-span-1">
                    <label
                      htmlFor="pricePayRider"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      ค่าทีมติดตาม บ.
                    </label>
                    <Controller
                      id="pricePayRider"
                      name="pricePayRider"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="pricePayRider"
                          type="number"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.pricePayRider
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                      )}
                    />

                    {errors.priceDebt && (
                      <span className="text-red-500 text-xs mt-1">
                        กรุณาเลือกข้อมูล เสียค่าส่ง
                      </span>
                    )}
                  </div>

                  <div className="items-center col-span-1 lg:col-span-1">
                    <label
                      htmlFor="priceEquipSum"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      ค่าอะไหล่เสริม บ.
                    </label>
                    <Controller
                      id="priceEquipSum"
                      name="priceEquipSum"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="priceEquipSum"
                          type="number"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.priceEquipSum
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                      )}
                    />
                    {errors.priceEquipSum && (
                      <span className="text-red-500 text-xs mt-1">
                        กรุณาเลือกข้อมูล ค่าอะไหล่เสริม
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="items-center col-span-3 lg:col-span-3">
                <label
                  htmlFor="priceReturnCustomer"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  คืนลูกค้าจำนวน บ.
                </label>
                <Controller
                  id="priceReturnCustomer"
                  name="priceReturnCustomer"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceReturnCustomer"
                      type="number"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceReturnCustomer
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
                {errors.priceReturnCustomer && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาเลือกข้อมูล คืนลูกค้าจำนวน
                  </span>
                )}
              </div>

              {watch("caseType") == 1 || watch("caseType") == 2 ? (
                <div className="col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="items-center col-span-1 lg:col-span-1">
                    <label
                      htmlFor="valueDebtMonth"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      ส่วนลดในการปิดสัญญา บ.
                    </label>
                    <Controller
                      id="priceDiscount"
                      name="priceDiscount"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="priceDiscount"
                          type="number"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.priceDiscount
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                      )}
                    />

                    {errors.priceDiscount && (
                      <span className="text-red-500 text-xs mt-1">
                        กรุณาเลือกข้อมูล ส่วนลดในการปิด
                      </span>
                    )}
                  </div>

                  <div className="items-center col-span-1 lg:col-span-1">
                    <label
                      htmlFor="priceDebt"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      ยอดค่าทวงถาม บ.
                    </label>
                    <Controller
                      id="priceDebt"
                      name="priceDebt"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="priceDebt"
                          type="number"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.priceDebt
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                      )}
                    />

                    {errors.priceDebt && (
                      <span className="text-red-500 text-xs mt-1">
                        กรุณาเลือกข้อมูล ยอดค่าทวงถาม
                      </span>
                    )}
                  </div>

                  <div className="items-center col-span-1 lg:col-span-1">
                    <label
                      htmlFor="priceEndCase"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      ยอดที่ต้องปิด บ.
                    </label>
                    <Controller
                      id="priceEndCase"
                      name="priceEndCase"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="priceEndCase"
                          disabled
                          type="number"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.priceEndCase
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                      )}
                    />
                    {errors.priceEndCase && (
                      <span className="text-red-500 text-xs mt-1">
                        กรุณาเลือกข้อมูล ยอดที่ต้องปิด
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="items-center col-span-3 lg:col-span-3">
                <div className="items-center col-span-3 lg:col-span-1">
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
              </div>

              <div className="items-center col-span-3 lg:col-span-3">
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
              </div>

              <div className="items-center col-span-3">
                <label
                  htmlFor="uploadFileProcessCase"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  อัพโหลดไฟล์ png, jpeg, jpg
                </label>
                <FileDropzone
                  isOpen={open}
                  name="uploadFileProcessCase"
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

              {!isEmpty(watch("processCaseImages")) ? (
                <div className="items-center col-span-3">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="col-span-2 lg:col-span-2">
                      <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                    </div>
                    <div className="col-span-2 lg:col-span-2">
                      <DragAndDropImages
                        images={watch("processCaseImages")}
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

ModalProcessCase.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalProcessCase;
