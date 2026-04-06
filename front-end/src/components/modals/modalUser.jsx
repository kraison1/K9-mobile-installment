/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSelectGroup } from "src/store/userGroup";
import { fetchSelectBranch } from "src/store/branch";
import { useAuth } from "src/hooks/authContext";
import { fetchInfoUser } from "src/store/user";
import Select from "react-select";

const ModalUser = ({ open, setModal, RowData, submitRow }) => {
  const { user, isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();

  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [UserGroups, setUserGroups] = React.useState([]);
  const [Branches, setBranches] = React.useState([]);

  const dispatch = useDispatch();
  const storeUserGroup = useSelector((state) => state.userGroup);
  const storeBranch = useSelector((state) => state.branch);
  const store = useSelector((state) => state.user);

  React.useEffect(() => {
    if (!isEmpty(storeUserGroup.select)) {
      setUserGroups(
        storeUserGroup.select.map((item) => ({
          value: item.id,
          label: item.name,
          type: item.type,
        }))
      );
    }
  }, [storeUserGroup.select]);

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

      if (isEmpty(storeUserGroup.select)) {
        dispatch(fetchSelectGroup());
      }

      modalRef.current.focus();
      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      } else {
        reset({
          ...RowData,
          branchId: user.branchId,
        });
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
    dispatch(fetchInfoUser(id))
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
  } = useForm({
    defaultValues: RowData,
  });

  const onSubmit = (data) => {
    submitRow({ ...data, permissions: Permissions });
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
                  : `แก้ไขรายการ: ${RowData.name}`
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
          <div className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="items-center sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ชื่อผู้ใช้งาน
              </label>
              <Controller
                id="username"
                name="username"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="username"
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.username && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ชื่อผู้ใช้งาน
                </span>
              )}
            </div>

            <div className="items-center sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                รหัสผ่าน
              </label>
              <Controller
                id="password"
                name="password"
                control={control}
                rules={{ required: isEmpty(RowData.id) ? false : true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="password"
                    type="password"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.password && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล รหัสผ่าน
                </span>
              )}
            </div>

            <div className="items-center sm:col-span-2 lg:col-span-1">
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

            <div className="items-center sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="lastname"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                นามสกุล
              </label>
              <Controller
                id="lastname"
                name="lastname"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="lastname"
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.lastname ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.lastname && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล นามสกุล
                </span>
              )}
            </div>

            <div className="items-center sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="tel"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                เบอร์ติดต่อ
              </label>
              <Controller
                id="tel"
                name="tel"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="tel"
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.tel ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.tal && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล เบอร์ติดต่อ
                </span>
              )}
            </div>

            <div className="items-center sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="branchId"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ตำแหน่งผู้ใช้งาน
              </label>

              <Controller
                id="userGroupId"
                name="userGroupId"
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
                      id="userGroupId"
                      options={UserGroups}
                      placeholder="กรุณาเลือกกลุ่มผู้ใช้"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={
                        UserGroups.find(
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
              {errors.userGroupId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ตำแหน่งผู้ใช้งาน
                </span>
              )}
            </div>

            {permissions.includes("view-all-branches") ? (
              <div className="items-center sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="branchId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  สาขา
                </label>
                <Controller
                  id="branchId"
                  name="branchId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 11 }),
                      }}
                      id="branchId"
                      options={Branches}
                      placeholder="กรุณาเลือกสาขา"
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
                {errors.branchId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล สาขา
                  </span>
                )}
              </div>
            ) : null}

            <div className="items-center sm:col-span-2 lg:col-span-1">
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

ModalUser.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalUser;
