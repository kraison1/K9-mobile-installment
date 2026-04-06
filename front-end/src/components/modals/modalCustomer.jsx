/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty, isFunction, isNumber } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "src/hooks/authContext";
import { fetchInfoCustomer } from "src/store/customer";
import {
  fetchSelectIdCardProvince,
  fetchSelectProvince,
} from "src/store/province";
import {
  fetchSelectDistrict,
  fetchSelectIdCardDistrict,
} from "src/store/district";
import {
  fetchSelectIdCardSubdistrict,
  fetchSelectSubdistrict,
} from "src/store/subdistrict";
import FileDropzone from "src/helpers/fileDropzone";
import DragAndDropImages from "src/components/dragAndDropImages";
import Select from "react-select";
import HorizontalRule from "src/helpers/horizontalRule";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import { deleteCustomImage, updateCustomImageSeq } from "src/store/customImage";
import { conFirm } from "../alart";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalCustomer = ({
  open,
  setModal,
  RowData,
  submitRow,
  getItems,
  isSee = false,
}) => {
  const { user, isLoadingOpen, setIsLoadingOpen } = useAuth();

  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [Provinces, setProvinces] = React.useState([]);
  const [Districts, setDistricts] = React.useState([]);
  const [Subdistricts, setSubdistricts] = React.useState([]);
  const dispatch = useDispatch();

  const [IdCardProvinces, setIdCardProvinces] = React.useState([]);
  const [IdCardDistricts, setIdCardDistricts] = React.useState([]);
  const [IdCardSubdistricts, setIdCardSubdistricts] = React.useState([]);

  const storeProvince = useSelector((state) => state.province);
  const storeDistrict = useSelector((state) => state.district);
  const storeSubdistricts = useSelector((state) => state.subdistrict);
  const store = useSelector((state) => state.customer);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    defaultValues: RowData,
  });

  React.useEffect(() => {
    if (!isEmpty(storeProvince.select)) {
      setProvinces(
        storeProvince.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, [storeProvince.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProvince.selectIdCard)) {
      setIdCardProvinces(
        storeProvince.selectIdCard.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, [storeProvince.selectIdCard]);

  React.useEffect(() => {
    const selectedProvinceId = watch("mProvinceId");
    if (selectedProvinceId) {
      dispatch(fetchSelectDistrict(selectedProvinceId));
    }
  }, [watch("mProvinceId")]);

  React.useEffect(() => {
    const selectedProvinceId = watch("idCardProvinceId");
    if (selectedProvinceId) {
      dispatch(fetchSelectIdCardDistrict(selectedProvinceId));
    }
  }, [watch("idCardProvinceId")]);

  React.useEffect(() => {
    if (!isEmpty(storeDistrict.select)) {
      setDistricts(
        storeDistrict.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, [storeDistrict.select]);

  React.useEffect(() => {
    if (!isEmpty(storeDistrict.selectIdCard)) {
      setIdCardDistricts(
        storeDistrict.selectIdCard.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, [storeDistrict.selectIdCard]);

  React.useEffect(() => {
    const selectedProvinceId = watch("mDistrictId");
    if (selectedProvinceId) {
      dispatch(fetchSelectSubdistrict(selectedProvinceId));
    }
  }, [watch("mDistrictId")]);

  React.useEffect(() => {
    const selectedProvinceId = watch("idCardDistrictId");
    if (selectedProvinceId) {
      dispatch(fetchSelectIdCardSubdistrict(selectedProvinceId));
    }
  }, [watch("idCardDistrictId")]);

  React.useEffect(() => {
    if (!isEmpty(storeSubdistricts.select)) {
      setSubdistricts(
        storeSubdistricts.select.map((item) => ({
          value: item.id,
          label: item.name,
          postcode: item.postcode,
        }))
      );
    }
  }, [storeSubdistricts.select]);

  React.useEffect(() => {
    if (!isEmpty(storeSubdistricts.selectIdCard)) {
      setIdCardSubdistricts(
        storeSubdistricts.selectIdCard.map((item) => ({
          value: item.id,
          label: item.name,
          postcode: item.postcode,
        }))
      );
    }
  }, [storeSubdistricts.selectIdCard]);

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (isEmpty(storeDistrict.select)) {
        dispatch(fetchSelectProvince());
      }

      if (isEmpty(storeDistrict.selectIdCard)) {
        dispatch(fetchSelectIdCardProvince());
      }

      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      } else {
        reset(RowData);
      }
      modalRef.current.focus();
    }
  }, [open]);

  React.useEffect(() => {
    if (!isEmpty(store.data)) {
      reset(store.data);
    }
  }, [store]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoCustomer(id))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const onSubmit = (data) => {
    submitRow({ ...data, branchId: user.id });
  };

  const submitSwitch = (items) => {
    setIsLoadingOpen(true);
    dispatch(updateCustomImageSeq(items))
      .unwrap()
      .then(() => {
        const { page } = store.params;
        if (isFunction(getItems)) {
          getItems(page);
        }
        fetchInfo(RowData.id);
        setIsLoadingOpen(false);
      })
      .catch(() => setIsLoadingOpen(false));
  };

  const onDelete = (item) => {
    conFirm(`ยืนยันการลบรูปภาพของ ${RowData.code}`, "ตกลง", "ปิด", true).then(
      (e) => {
        if (e.isConfirmed) {
          setIsLoadingOpen(true);
          dispatch(deleteCustomImage(item.id))
            .unwrap()
            .then(() => {
              fetchInfo(RowData.id);
              setIsLoadingOpen(false);
            })
            .catch(() => setIsLoadingOpen(false));
        }
      }
    );
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
          <fieldset disabled={isSee}>
            <div className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {user.type !== "ไฟแนนซ์" ? (
                <div className="items-center col-span-2">
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
              ) : null}

              {user.type !== "ไฟแนนซ์" ? (
                <div className="items-center col-span-2">
                  <label
                    htmlFor="customerType"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    ประเภท
                  </label>
                  <Controller
                    name="customerType"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <div>
                        <input
                          {...field}
                          id="customerType-1"
                          type="radio"
                          value="1"
                          checked={field.value === "1"}
                          onChange={() => field.onChange("1")}
                          className="mr-2"
                        />
                        <label
                          htmlFor="customerType-1"
                          className="text-red-400"
                        >
                          ลูกค้าผ่อน
                        </label>

                        <input
                          {...field}
                          id="customerType-3"
                          type="radio"
                          value="3"
                          checked={field.value === "3"}
                          onChange={() => field.onChange("3")}
                          className="mr-2 ml-4"
                        />
                        <label
                          htmlFor="customerType-3"
                          className="text-blue-400"
                        >
                          ลูกค้าหน้าร้าน
                        </label>

                        <input
                          {...field}
                          id="customerType-2"
                          type="radio"
                          value="2"
                          checked={field.value === "2"}
                          onChange={() => field.onChange("2")}
                          className="mr-2 ml-4"
                        />
                        <label
                          htmlFor="customerType-2"
                          className="text-green-400"
                        >
                          ร้านค้า
                        </label>

                        <input
                          {...field}
                          id="customerType-4"
                          type="radio"
                          value="4"
                          checked={field.value === "4"}
                          onChange={() => field.onChange("4")}
                          className="mr-2 ml-4"
                        />
                        <label
                          htmlFor="customerType-4"
                          className="text-purple-400"
                        >
                          ตัวแทน
                        </label>
                      </div>
                    )}
                  />
                  {errors.customerType && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาเลือกข้อมูล ประเภท
                    </span>
                  )}
                </div>
              ) : null}

              <div className="items-center col-span-2 lg:col-span-2">
                <HorizontalRule />
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
                  htmlFor="citizenIdCard"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  {watch("customerType") == "1" || watch("customerType") == "3"
                    ? "เลขประจำตัวประชาชน"
                    : "เลขผู้เสียภาษี"}
                </label>
                <Controller
                  id="citizenIdCard"
                  name="citizenIdCard"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="citizenIdCard"
                      type="number"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.citizenIdCard
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
                {errors.citizenIdCard && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล
                    {`${
                      watch("customerType") == "1" ||
                      watch("customerType") == "3"
                        ? "เลขประจำตัวประชาชน"
                        : "เลขผู้เสียภาษี"
                    }`}
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
                  htmlFor="facebook"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  Facebook
                </label>
                <Controller
                  id="facebook"
                  name="facebook"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="facebook"
                      type="text"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.facebook ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
                {errors.facebook && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล Facebook
                  </span>
                )}
              </div>
              <div className="items-center sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="googleMap"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  Google Map
                </label>
                <Controller
                  id="googleMap"
                  name="googleMap"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="googleMap"
                      type="text"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.googleMap ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
                {errors.googleMap && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล Google Map
                  </span>
                )}
              </div>
              <div className="items-center sm:col-span-2 lg:col-span-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ที่อยู่ปัจจุบัน
                </label>
                <Controller
                  id="address"
                  name="address"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="address"
                      type="text"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
                {errors.address && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ที่อยู่
                  </span>
                )}
              </div>
              <div className="items-center sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="mProvinceId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  จังหวัด
                </label>
                <Controller
                  id="mProvinceId"
                  name="mProvinceId"
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
                        id="mProvinceId"
                        options={Provinces}
                        placeholder="กรุณาเลือกจังหวัด"
                        isClearable
                        isSearchable
                        classNamePrefix="react-select"
                        menuPlacement="auto"
                        value={
                          Provinces.find(
                            (option) => option.value === field.value
                          ) || ""
                        }
                        onChange={(selectedOption) => {
                          field.onChange(
                            selectedOption ? selectedOption.value : ""
                          );

                          setValue("mDistrictId", "");
                          setValue("mSubdistrictId", "");
                          setValue("zipCode", "");
                        }}
                      />
                    );
                  }}
                />
                {errors.mProvinceId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล จังหวัด
                  </span>
                )}
              </div>
              <div className="items-center sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="mDistrictId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  อำเภอ
                </label>
                <Controller
                  id="mDistrictId"
                  name="mDistrictId"
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
                        id="mDistrictId"
                        isDisabled={!isNumber(watch("mProvinceId"))}
                        options={Districts}
                        placeholder="กรุณาเลือกอำเภอ"
                        isClearable
                        isSearchable
                        classNamePrefix="react-select"
                        value={
                          Districts.find(
                            (option) => option.value === field.value
                          ) || ""
                        }
                        onChange={(selectedOption) => {
                          field.onChange(
                            selectedOption ? selectedOption.value : ""
                          );

                          setValue("mSubdistrictId", "");
                          setValue("zipCode", "");
                        }}
                      />
                    );
                  }}
                />
                {errors.mDistrictId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล อำเภอ
                  </span>
                )}
              </div>
              <div className="items-center sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="mSubdistrictId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ตำบล
                </label>
                <Controller
                  id="mSubdistrictId"
                  name="mSubdistrictId"
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
                        id="mSubdistrictId"
                        isDisabled={!isNumber(watch("mDistrictId"))}
                        options={Subdistricts}
                        placeholder="กรุณาเลือกตำบล"
                        isClearable
                        isSearchable
                        classNamePrefix="react-select"
                        value={
                          Subdistricts.find(
                            (option) => option.value === field.value
                          ) || ""
                        }
                        onChange={(selectedOption) => {
                          field.onChange(
                            selectedOption ? selectedOption.value : ""
                          );
                          setValue(
                            "zipCode",
                            selectedOption ? selectedOption.postcode : ""
                          );
                        }}
                      />
                    );
                  }}
                />
                {errors.mSubdistrictId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ตำบล
                  </span>
                )}
              </div>
              <div className="items-center sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ไปรษณีย์
                </label>
                <Controller
                  id="zipCode"
                  name="zipCode"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="zipCode"
                      type="number"
                      disabled
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.zipCode ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />
                {errors.zipCode && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ไปรษณีย์
                  </span>
                )}
              </div>

              <div className="items-center col-span-2 lg:col-span-2">
                <HorizontalRule />
              </div>

              <div className="items-center sm:col-span-2 lg:col-span-2">
                <label
                  htmlFor="idCardAddress"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ที่อยู่ตามบัตรประชาชน
                </label>

                <Controller
                  id="idCardAddress"
                  name="idCardAddress"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="idCardAddress"
                      type="text"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.idCardAddress
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />

                {errors.idCardAddress && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ที่อยู่ตามบัตรประชาชน
                  </span>
                )}
              </div>

              <div className="items-center sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="idCardProvinceId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  จังหวัด
                </label>

                <Controller
                  id="idCardProvinceId"
                  name="idCardProvinceId"
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
                        id="idCardProvinceId"
                        options={IdCardProvinces}
                        placeholder="กรุณาเลือกจังหวัด"
                        isClearable
                        isSearchable
                        classNamePrefix="react-select"
                        menuPlacement="auto"
                        value={
                          IdCardProvinces.find(
                            (option) => option.value === field.value
                          ) || ""
                        }
                        onChange={(selectedOption) => {
                          field.onChange(
                            selectedOption ? selectedOption.value : ""
                          );

                          setValue("idCardDistrictId", "");
                          setValue("idCardSubdistrictId", "");
                          setValue("idCardZipCode", "");
                        }}
                      />
                    );
                  }}
                />

                {errors.idCardProvinceId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล จังหวัด
                  </span>
                )}
              </div>

              <div className="items-center sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="idCardDistrictId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  อำเภอ
                </label>

                <Controller
                  id="idCardDistrictId"
                  name="idCardDistrictId"
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
                        id="idCardDistrictId"
                        isDisabled={!isNumber(watch("idCardProvinceId"))}
                        options={IdCardDistricts}
                        placeholder="กรุณาเลือกอำเภอ"
                        isClearable
                        isSearchable
                        classNamePrefix="react-select"
                        value={
                          IdCardDistricts.find(
                            (option) => option.value === field.value
                          ) || ""
                        }
                        onChange={(selectedOption) => {
                          field.onChange(
                            selectedOption ? selectedOption.value : ""
                          );

                          setValue("idCardSubdistrictId", "");
                          setValue("idCardZipCode", "");
                        }}
                      />
                    );
                  }}
                />

                {errors.idCardDistrictId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล อำเภอ
                  </span>
                )}
              </div>

              <div className="items-center sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="idCardSubdistrictId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ตำบล
                </label>

                <Controller
                  id="idCardSubdistrictId"
                  name="idCardSubdistrictId"
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
                        id="idCardSubdistrictId"
                        isDisabled={!isNumber(watch("idCardDistrictId"))}
                        options={IdCardSubdistricts}
                        placeholder="กรุณาเลือกตำบล"
                        isClearable
                        isSearchable
                        classNamePrefix="react-select"
                        value={
                          IdCardSubdistricts.find(
                            (option) => option.value === field.value
                          ) || ""
                        }
                        onChange={(selectedOption) => {
                          field.onChange(
                            selectedOption ? selectedOption.value : ""
                          );
                          setValue(
                            "idCardZipCode",
                            selectedOption ? selectedOption.postcode : ""
                          );
                        }}
                      />
                    );
                  }}
                />

                {errors.idCardSubdistrictId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ตำบล
                  </span>
                )}
              </div>

              <div className="items-center sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="idCardZipCode"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ไปรษณีย์
                </label>

                <Controller
                  id="idCardZipCode"
                  name="idCardZipCode"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="idCardZipCode"
                      type="number"
                      disabled
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.idCardZipCode
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  )}
                />

                {errors.idCardZipCode && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ไปรษณีย์
                  </span>
                )}
              </div>

              <div className="items-center col-span-2 lg:col-span-2">
                <HorizontalRule />
              </div>

              {watch("customerType") == "1" ? (
                <div className="items-center sm:col-span-2 lg:col-span-2">
                  <div className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="items-center sm:col-span-2 lg:col-span-2">
                      <h2>บุคคลอ้างอิงที่ 1</h2>
                    </div>

                    <div className="items-center sm:col-span-2 lg:col-span-1">
                      <label
                        htmlFor="nameRefOne"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        ชื่อ
                      </label>
                      <Controller
                        id="nameRefOne"
                        name="nameRefOne"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="nameRefOne"
                            type="text"
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.nameRefOne
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                          />
                        )}
                      />
                      {errors.nameRefOne && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล ชื่อ
                        </span>
                      )}
                    </div>
                    <div className="items-center sm:col-span-2 lg:col-span-1">
                      <label
                        htmlFor="lastnameRefOne"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        นามสกุล
                      </label>
                      <Controller
                        id="lastnameRefOne"
                        name="lastnameRefOne"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="lastnameRefOne"
                            type="text"
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.lastnameRefOne
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                          />
                        )}
                      />
                      {errors.lastnameRefOne && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล นามสกุล
                        </span>
                      )}
                    </div>

                    <div className="items-center sm:col-span-2 lg:col-span-1">
                      <label
                        htmlFor="relaRefOne"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        ความสัมพันธ์
                      </label>
                      <Controller
                        id="relaRefOne"
                        name="relaRefOne"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="relaRefOne"
                            type="text"
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.relaRefOne
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                          />
                        )}
                      />
                      {errors.relaRefOne && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล ความสัมพันธ์
                        </span>
                      )}
                    </div>

                    <div className="items-center sm:col-span-2 lg:col-span-1">
                      <label
                        htmlFor="telRefOne"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        เบอร์ติดต่อ
                      </label>
                      <Controller
                        id="telRefOne"
                        name="telRefOne"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="telRefOne"
                            type="number"
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.telRefOne
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                          />
                        )}
                      />
                      {errors.telRefOne && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล เบอร์ติดต่อ
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="items-center col-span-2 lg:col-span-2">
                    <HorizontalRule />
                  </div>

                  <div className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="items-center sm:col-span-2 lg:col-span-2">
                      <h2>บุคคลอ้างอิงที่ 2</h2>
                    </div>

                    <div className="items-center sm:col-span-2 lg:col-span-1">
                      <label
                        htmlFor="nameRefTwo"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        ชื่อ
                      </label>
                      <Controller
                        id="nameRefTwo"
                        name="nameRefTwo"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="nameRefTwo"
                            type="text"
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.nameRefTwo
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                          />
                        )}
                      />
                      {errors.nameRefTwo && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล ชื่อ
                        </span>
                      )}
                    </div>
                    <div className="items-center sm:col-span-2 lg:col-span-1">
                      <label
                        htmlFor="lastnameRefTwo"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        นามสกุล
                      </label>
                      <Controller
                        id="lastnameRefTwo"
                        name="lastnameRefTwo"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="lastnameRefTwo"
                            type="text"
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.lastnameRefTwo
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                          />
                        )}
                      />
                      {errors.lastnameRefTwo && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล นามสกุล
                        </span>
                      )}
                    </div>

                    <div className="items-center sm:col-span-2 lg:col-span-1">
                      <label
                        htmlFor="relaRefTwo"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        ความสัมพันธ์
                      </label>
                      <Controller
                        id="relaRefTwo"
                        name="relaRefTwo"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="relaRefTwo"
                            type="text"
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.relaRefTwo
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                          />
                        )}
                      />
                      {errors.relaRefTwo && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล ความสัมพันธ์
                        </span>
                      )}
                    </div>

                    <div className="items-center sm:col-span-2 lg:col-span-1">
                      <label
                        htmlFor="telRefTwo"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        เบอร์ติดต่อ
                      </label>
                      <Controller
                        id="telRefTwo"
                        name="telRefTwo"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="telRefTwo"
                            type="number"
                            className={`mt-1 block w-full px-3 py-2 border ${
                              errors.telRefTwo
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                          />
                        )}
                      />
                      {errors.telRefTwo && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล เบอร์ติดต่อ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="items-center col-span-2 lg:col-span-2">
                <HorizontalRule />
              </div>

              <div className="items-center col-span-2 lg:col-span-2">
                <label
                  htmlFor="uploadFileCustomers"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  อัพโหลดไฟล์ png, jpeg, jpg
                </label>
                <FileDropzone
                  isOpen={open}
                  name="uploadFileCustomers"
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
              {!isEmpty(watch("customerImages")) ? (
                <div className="items-center col-span-2 lg:col-span-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="col-span-2 lg:col-span-2">
                      <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                    </div>
                    <div className="col-span-2 lg:col-span-2">
                      <DragAndDropImages
                        images={watch("customerImages")}
                        submitSwitch={submitSwitch}
                        onDelete={onDelete}
                        showDelete={true}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </fieldset>

          {isSee ? null : (
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
          )}
        </div>
      </form>
    </div>
  );
};

ModalCustomer.propTypes = {
  open: PropTypes.bool,
  isSee: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
  getItems: PropTypes.func,
};

export default ModalCustomer;
