/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { fetchSelectBranch } from "src/store/branch";
import { useAuth } from "src/hooks/authContext";

import { isEmpty } from "lodash";
import { error } from "../alart";
import Select from "react-select";

const ModalProductSaleTransfer = ({ open, setModal, RowData, submitRow }) => {
  const { user, isLoadingOpen } = useAuth();
  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [Branches, setBranches] = React.useState([]);

  const dispatch = useDispatch();
  const storeBranch = useSelector((state) => state.branch);

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
    if (open && modalRef.current) {
      if (isEmpty(storeBranch.select)) {
        dispatch(fetchSelectBranch());
      }
      modalRef.current.focus();
      reset(RowData);
    }
  }, [open]);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
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
                : `โอนย้ายสัญญา: ${RowData.code}`}
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
          <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="items-center sm:col-span-2 md:col-span-1">
              <label
                htmlFor="branchId"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                จากสาขา
              </label>
              <Controller
                id="branchId"
                name="branchId"
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
                      id="branchId"
                      isDisabled
                      options={Branches}
                      placeholder="กรุณาเลือกจากสาขา"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={
                        Branches.find(
                          (option) => option.value === field.value
                        ) || ""
                      }
                      onChange={(selectedOption) => {
                        field.onChange(
                          selectedOption ? selectedOption.value : ""
                        );
                      }}
                    />
                  );
                }}
              />
              {errors.branchId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล จากสาขา
                </span>
              )}
            </div>

            <div className="items-center sm:col-span-2 md:col-span-1">
              <label
                htmlFor="toBranchId"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ไปยังสาขา
              </label>
              <Controller
                id="toBranchId"
                name="toBranchId"
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
                      id="toBranchId"
                      options={Branches.filter(
                        (e) => e.value !== user.branchId
                      )}
                      placeholder="กรุณาเลือกจากสาขา"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={
                        Branches.find(
                          (option) => option.value === field.value
                        ) || ""
                      }
                      onChange={(selectedOption) => {
                        if (selectedOption.value === user.branchId) {
                          error("ไม่สามารถเลือกสาขาตัวเอง");
                          field.onChange(""); // รีเซ็ตการเลือกหากซ้ำ
                        } else {
                          field.onChange(
                            selectedOption ? selectedOption.value : ""
                          );
                        }
                      }}
                    />
                  );
                }}
              />
              {errors.toBranchId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ไปยังสาขา
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end items-center p-4 md:p-5 border-t border-gray-200 rounded-b">
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

ModalProductSaleTransfer.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalProductSaleTransfer;
