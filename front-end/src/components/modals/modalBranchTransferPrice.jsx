/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "src/hooks/authContext";
import { fetchInfoBranchTransferPrice } from "src/store/branchTransferPrice";
import Select from "react-select";
import HorizontalRule from "src/helpers/horizontalRule";
import FileDropzone from "src/helpers/fileDropzone";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import { noImage } from "src/helpers/constant";
import { fetchSelectBank } from "src/store/bank";
import { fetchSelectBranch } from "src/store/branch";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalBranchTransferPrice = ({ open, setModal, RowData, submitRow }) => {
  const { user, isLoadingOpen, setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();

  const store = useSelector((state) => state.branchTransferPrice);
  const [Banks, setBanks] = React.useState([]);
  const [OldStatus, setOldStatus] = React.useState(RowData.status);
  const storeBank = useSelector((state) => state.bank);
  const [Branches, setBranches] = React.useState([]);
  const storeBranch = useSelector((state) => state.branch);

  const modalRef = React.useRef(null);
  const container = React.useRef(null);

  React.useEffect(() => {
    if (!isEmpty(storeBank.selectPayBranchTransferPrice)) {
      setBanks(
        storeBank.selectPayBranchTransferPrice.map((item) => ({
          value: item.id,
          label: `${item.bankOwner}, ${item.bankName} (${item.bankNo})`,
        }))
      );
    } else {
      setBanks([]);
    }
  }, [storeBank.selectPayBranchTransferPrice]);

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (isEmpty(storeBank.selectPayBranchTransferPrice)) {
        if (RowData.branchId == user.branchId) {
          dispatch(fetchSelectBank("7"));
        } else {
          dispatch(fetchSelectBank("8"));
        }
      }

      if (isEmpty(storeBranch.select)) {
        dispatch(fetchSelectBranch());
      }

      modalRef.current.focus();
      setOldStatus(RowData.status);
      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      } else {
        reset(RowData);
      }
    }
  }, [open]);

  React.useEffect(() => {
    if (!isEmpty(storeBranch.select)) {
      setBranches(
        storeBranch.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, [storeBranch.select]);

  React.useEffect(() => {
    if (!isEmpty(store.data)) {
      reset(store.data);
    }
  }, [store]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoBranchTransferPrice(id))
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

          <fieldset disabled={OldStatus == 1 ? false : true}>
            <div className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {user.branchId == watch("branchId") ? (
                <div className="items-center col-span-2">
                  <label
                    htmlFor="bankId"
                    className="text-sm font-medium text-gray-700"
                  >
                    ต้องโอนเข้าบัญชี
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

                          setValue("infoBank", selectedOption?.label || "");
                        }}
                      />
                    )}
                  />

                  {errors.bankId && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล ต้องโอนเข้าบัญชี
                    </span>
                  )}
                </div>
              ) : (
                <div className="items-center col-span-2">
                  <p className="text-red-500">{`ต้องโอนเข้าบัญชี: ${
                    watch("infoBank") || "-"
                  }`}</p>
                </div>
              )}

              {user.branchId == watch("fromBranchId") ? (
                <div className="items-center col-span-2">
                  <label
                    htmlFor="fromBankId"
                    className="text-sm font-medium text-gray-700"
                  >
                    บัญชีในการโอน
                  </label>
                  <Controller
                    id="fromBankId"
                    name="fromBankId"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 11 }),
                        }}
                        id="fromBankId"
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
                          setValue("fromInfoBank", selectedOption?.label || "");
                        }}
                      />
                    )}
                  />

                  {errors.fromBankId && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล บัญชีในการโอน
                    </span>
                  )}
                </div>
              ) : (
                <div className="items-center col-span-2">
                  <p className="text-red-500">{`รับจากบัญชี: ${
                    watch("fromInfoBank") || "-"
                  }`}</p>
                </div>
              )}

              {user.branchId == watch("branchId") ? (
                <div className="items-center col-span-2">
                  <label
                    htmlFor="fromBranchId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    รับยอดจากสาขา
                  </label>
                  <Controller
                    id="fromBranchId"
                    name="fromBranchId"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 11 }),
                        }}
                        id="fromBranchId"
                        options={Branches.filter(
                          (e) => e.value !== user.branchId
                        )}
                        placeholder="กรุณาเลือกรับยอดจากสาขา"
                        isClearable
                        isSearchable
                        classNamePrefix="react-select"
                        value={
                          Branches.find(
                            (option) => option.value === field.value
                          ) || ""
                        }
                        onChange={(selectedOption) =>
                          field.onChange(
                            selectedOption ? selectedOption.value : ""
                          )
                        }
                      />
                    )}
                  />
                  {errors.fromBranchId && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล รับยอดจากสาขา
                    </span>
                  )}
                </div>
              ) : null}

              <div className="items-center col-span-1 lg:col-span-1">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ชื่อ
                </label>
                <Controller
                  id="name"
                  name="name"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="name"
                      type="text"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
                {errors.name && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ชื่อ
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
                      disabled={
                        user.branchId == watch("branchId") ? false : true
                      }
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

              {watch("fromBranchId") == user.branchId ? (
                <div className="items-center col-span-2 lg:col-span-1">
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
                          id="status-2"
                          type="radio"
                          value="2"
                          checked={field.value === "2"}
                          onChange={() => field.onChange("2")}
                          className="mr-2"
                        />
                        <label htmlFor="status-2" className="text-green-400">
                          ยืนยัน
                        </label>
                        <input
                          {...field}
                          id="status-3"
                          type="radio"
                          value="3"
                          checked={field.value === "3"}
                          onChange={() => field.onChange("3")}
                          className="mr-2 ml-4"
                        />
                        <label htmlFor="status-3" className="text-red-400">
                          ปฏิเสธ
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

              <div className="items-center col-span-2 lg:col-span-2">
                <HorizontalRule />
              </div>

              {user.branchId == watch("fromBranchId") ? (
                <div className="items-center col-span-2 lg:col-span-2">
                  <label
                    htmlFor="uploadfilePrice"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    อัพโหลดไฟล์ png, jpeg, jpg
                  </label>
                  <FileDropzone
                    isOpen={open}
                    name="uploadfilePrice"
                    acceptedFileTypes={acceptedFileTypes}
                    control={control}
                    maxFileSize={5}
                    fileMultiple={false}
                    setValue={setValue}
                  />
                </div>
              ) : null}

              <div className="items-center col-span-2 lg:col-span-2">
                <HorizontalRule />
              </div>

              {!isEmpty(watch("filePrice")) ? (
                <div className="items-center col-span-2 lg:col-span-2 ">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="col-span-1 lg:col-span-2">
                      <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                    </div>
                    <div className="col-span-1 lg:col-span-2 flex justify-center">
                      {noImage(watch("filePrice"))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </fieldset>

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

ModalBranchTransferPrice.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalBranchTransferPrice;
