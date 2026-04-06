/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { useAuth } from "src/hooks/authContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchInfoBranch } from "src/store/branch";
import FileDropzone from "src/helpers/fileDropzone";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import HorizontalRule from "src/helpers/horizontalRule";
import { noImage } from "src/helpers/constant";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalBranch = ({ open, setModal, RowData, submitRow }) => {
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();
  const store = useSelector((state) => state.branch);
  const modalRef = React.useRef(null);
  const container = React.useRef(null);

  const [Signature, setSignature] = React.useState("");

  React.useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      } else {
        reset(RowData);
      }
      setSignature("fileBranch");
    }
  }, [open]);

  React.useEffect(() => {
    if (!isEmpty(store.data)) {
      reset(store.data);
    }
  }, [store]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoBranch(id))
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
                : `แก้ไขรายการ: ${RowData.name}`}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              onClick={() => setModal(false)}
            >
              <MdClose />
            </button>
          </div>
          <div className="p-2 grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                รหัส
              </label>
              <Controller
                id="code"
                name="code"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    disabled={watch("id") ? true : false}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.code ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.code && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล รหัส
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
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
                    value={field.value || ""}
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

            <div className="items-center col-span-4 lg:col-span-2">
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
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
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

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="lineOa"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Line OA
              </label>
              <Controller
                id="lineOa"
                name="lineOa"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.lineOa ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.lineOa && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล Line OA
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-4">
              <label
                htmlFor="googlemaps"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Google Map
              </label>
              <Controller
                id="googlemaps"
                name="googlemaps"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.googlemaps ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.googlemaps && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล Google Map
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="priceBranchService"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ค่าบริการ
              </label>
              <Controller
                id="priceBranchService"
                name="priceBranchService"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    value={field.value || ""}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.priceBranchService
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.priceBranchService && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ค่าบริการ
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="percentWage"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ค่าแรงช่าง (%)
              </label>
              <Controller
                id="percentWage"
                name="percentWage"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    value={field.value || ""}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.percentWage ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.percentWage && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ค่าแรงช่าง (%)
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="valueFollowOneMonth"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ค่าทวงถามน้อยกว่า 1 เดือน
              </label>
              <Controller
                id="valueFollowOneMonth"
                name="valueFollowOneMonth"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    value={field.value || ""}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.valueFollowOneMonth
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.valueFollowOneMonth && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ค่าทวงถามน้อยกว่า 1 เดือน
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="valueFollowMoreThanMonth"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ค่าทวงถามมากกว่า 1 เดือน
              </label>
              <Controller
                id="valueFollowMoreThanMonth"
                name="valueFollowMoreThanMonth"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="number"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.valueFollowMoreThanMonth
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.valueFollowMoreThanMonth && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ค่าทวงถามมากกว่า 1 เดือน
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="ownerBank"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ชื่อผู้ให้เช่าบัญชี
              </label>
              <Controller
                id="ownerBank"
                name="ownerBank"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.ownerBank ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.ownerBank && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ชื่อผู้ให้เช่าบัญชี
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-1">
              <label
                htmlFor="ownerBankName"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ธนาคารบัญชี
              </label>
              <Controller
                id="ownerBankName"
                name="ownerBankName"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.ownerBankName
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.ownerBankName && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ธนาคารบัญชี
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-1">
              <label
                htmlFor="ownerBankNo"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                เลขบัญชี
              </label>
              <Controller
                id="ownerBankNo"
                name="ownerBankNo"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.ownerBankNo ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.ownerBankNo && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล เลขบัญชี
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="ownerName"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ชื่อผู้ให้เช่า
              </label>
              <Controller
                id="ownerName"
                name="ownerName"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.ownerName ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.ownerName && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ชื่อผู้ให้เช่า
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="ownerIdCard"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                เลขบัตรประชาชน
              </label>
              <Controller
                id="ownerIdCard"
                name="ownerIdCard"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="number"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.ownerIdCard ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.ownerIdCard && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล เลขบัตรประชาชน
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="nameRefOne"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                พยานคนที่ 1
              </label>
              <Controller
                id="nameRefOne"
                name="nameRefOne"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.nameRefOne ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.nameRefOne && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล พยานคนที่ 1
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="nameRefTwo"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                พยานคนที่ 2
              </label>
              <Controller
                id="nameRefTwo"
                name="nameRefTwo"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.nameRefTwo ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.nameRefTwo && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล พยานคนที่ 2
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-4">
              <label
                htmlFor="ownerAddress"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ที่อยู่
              </label>
              <Controller
                id="ownerAddress"
                name="ownerAddress"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <textarea
                    rows={2}
                    {...field}
                    type="text"
                    value={field.value || ""}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.ownerAddress ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.ownerAddress && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ที่อยู่
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-4">
              <label
                htmlFor="token_bot"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Token Bot
              </label>
              <Controller
                id="token_bot"
                name="token_bot"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.token_bot ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.token_bot && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล Token Bot
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="room_id_daylily_mobile"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Room ID: สินค้าคงคลัง (มือถือ)
              </label>
              <Controller
                id="room_id_daylily_mobile"
                name="room_id_daylily_mobile"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.room_id_daylily_mobile
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.room_id_daylily_mobile && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล สินค้าคงคลัง (มือถือ)
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="room_id_daylily"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Room ID: สรุปคงคลัง (อุปกรณ์เสริม)
              </label>
              <Controller
                id="room_id_daylily_accessibility"
                name="room_id_daylily_accessibility"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.room_id_daylily_accessibility
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.room_id_daylily_accessibility && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล สรุปคงคลัง (อุปกรณ์เสริม)
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="room_id_sale_daylily_mobile"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Room ID: สรุปการขาย (มือถือ)
              </label>
              <Controller
                id="room_id_sale_daylily_mobile"
                name="room_id_sale_daylily_mobile"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.room_id_sale_daylily_mobile
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.room_id_sale_daylily_mobile && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล สรุปการขาย (มือถือ)
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="room_id_sale_daylily_accessibility"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Room ID: สรุปการขาย (อุปกรณ์เสริม)
              </label>
              <Controller
                id="room_id_sale_daylily_accessibility"
                name="room_id_sale_daylily_accessibility"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.room_id_sale_daylily_accessibility
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.room_id_sale_daylily_accessibility && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล สรุปการขาย (อุปกรณ์เสริม)
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="room_id_sale_cash"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Room ID: ขายสด
              </label>
              <Controller
                id="room_id_sale_cash"
                name="room_id_sale_cash"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.room_id_sale_cash
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.room_id_sale_cash && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ขายสด
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="room_id_processCases"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Room ID: การดำเนินการสัญญา
              </label>
              <Controller
                id="room_id_processCases"
                name="room_id_processCases"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.room_id_processCases
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.room_id_processCases && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล การดำเนินการสัญญา
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="room_id_processBook"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Room ID: การดำเนินการจอง
              </label>
              <Controller
                id="room_id_processBook"
                name="room_id_processBook"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.room_id_processBook
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.room_id_processBook && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล การดำเนินการจอง
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="room_id_lockAppleId"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Room ID: ล็อคเครื่อง
              </label>
              <Controller
                id="room_id_lockAppleId"
                name="room_id_lockAppleId"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.room_id_lockAppleId
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.room_id_lockAppleId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ล็อคเครื่อง
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="room_id_unlockAppleId"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Room ID: ปลดล็อคเครื่อง
              </label>
              <Controller
                id="room_id_unlockAppleId"
                name="room_id_unlockAppleId"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.room_id_unlockAppleId
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.room_id_unlockAppleId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ปลดล็อคเครื่อง
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="room_id_paymentDown"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Room ID: สรุปยอดผ่อน
              </label>
              <Controller
                id="room_id_paymentDown"
                name="room_id_paymentDown"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.room_id_paymentDown
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.room_id_paymentDown && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล สรุปยอดผ่อน
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="room_id_buyProduct"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Room ID: การรับสินค้าเข้าคลัง
              </label>
              <Controller
                id="room_id_buyProduct"
                name="room_id_buyProduct"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.room_id_buyProduct
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.room_id_buyProduct && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล การรับสินค้าเข้าคลัง
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="isBranchDown"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                สาขาที่ใช้สำหรับผ่อน
              </label>
              <Controller
                name="isBranchDown"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      id="isBranchDown-1"
                      type="radio"
                      value="0"
                      checked={field.value === "0"}
                      onChange={() => field.onChange("0")}
                      className="mr-2"
                    />
                    <label htmlFor="isBranchDown-1" className="text-red-500">
                      ไม่
                    </label>
                    <input
                      {...field}
                      id="isBranchDown-2"
                      type="radio"
                      value="1"
                      checked={field.value === "1"}
                      onChange={() => field.onChange("1")}
                      className="mr-2 ml-4"
                    />
                    <label htmlFor="isBranchDown-2" className="text-green-500">
                      ใช่
                    </label>
                  </div>
                )}
              />
              {errors.online && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล สาขาที่ใช้สำหรับผ่อน
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
              <label
                htmlFor="online"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ประเภท
              </label>
              <Controller
                name="online"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      id="online-1"
                      type="radio"
                      value="0"
                      checked={field.value === "0"}
                      onChange={() => field.onChange("0")}
                      className="mr-2"
                    />
                    <label htmlFor="online-1" className="text-red-500">
                      ขายออนไลน์ไม่ได้
                    </label>
                    <input
                      {...field}
                      id="online-2"
                      type="radio"
                      value="1"
                      checked={field.value === "1"}
                      onChange={() => field.onChange("1")}
                      className="mr-2 ml-4"
                    />
                    <label htmlFor="online-2" className="text-green-500">
                      ขายออนไลน์ได้
                    </label>
                  </div>
                )}
              />
              {errors.online && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล ประเภท
                </span>
              )}
            </div>

            <div className="items-center col-span-4 lg:col-span-2">
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
            <div className="items-center col-span-4 lg:col-span-4">
              <HorizontalRule />
            </div>

            <div className="items-center col-span-4 lg:col-span-4">
              <label
                htmlFor={Signature}
                className="flex text-sm font-medium text-gray-700 mr-2"
              >
                อัพโหลดไฟล์ png, jpeg, jpg
              </label>

              {RowData.id ? (
                <div className="ml-3 flex flex-wrap items-center gap-4 lg:gap-6 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="uploadFileBranch"
                      type="radio"
                      value="uploadFileBranch"
                      checked={Signature === "uploadFileBranch"}
                      onChange={(e) => setSignature(e.target.value)}
                      className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300"
                    />
                    <label
                      htmlFor="uploadFileBranch"
                      className="text-green-500 text-sm lg:text-base cursor-pointer"
                    >
                      Logo สาขา
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="uploadFileSignatureOwner"
                      type="radio"
                      value="uploadFileSignatureOwner"
                      checked={Signature === "uploadFileSignatureOwner"}
                      onChange={(e) => setSignature(e.target.value)}
                      className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor="uploadFileSignatureOwner"
                      className="text-blue-500 text-sm lg:text-base cursor-pointer"
                    >
                      ลายเซ็น ผู้ให้เช่า
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="uploadFileSignatureRefOne"
                      type="radio"
                      value="uploadFileSignatureRefOne"
                      checked={Signature === "uploadFileSignatureRefOne"}
                      onChange={(e) => setSignature(e.target.value)}
                      className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300"
                    />
                    <label
                      htmlFor="uploadFileSignatureRefOne"
                      className="text-red-500 text-sm lg:text-base cursor-pointer"
                    >
                      ลายเซ็น พยานคนที่ 1
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="uploadFileSignatureRefTwo"
                      type="radio"
                      value="uploadFileSignatureRefTwo"
                      checked={Signature === "uploadFileSignatureRefTwo"}
                      onChange={(e) => setSignature(e.target.value)}
                      className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300"
                    />
                    <label
                      htmlFor="uploadFileSignatureRefTwo"
                      className="text-red-500 text-sm lg:text-base cursor-pointer"
                    >
                      ลายเซ็น พยานคนที่ 2
                    </label>
                  </div>
                </div>
              ) : null}

              <FileDropzone
                isOpen={open}
                name={Signature}
                acceptedFileTypes={acceptedFileTypes}
                control={control}
                maxFileSize={5}
                fileMultiple={false}
                setValue={setValue}
              />
            </div>

            <div className="items-center col-span-4 lg:col-span-4">
              <HorizontalRule />
            </div>

            {!isEmpty(watch("fileBranch")) ? (
              <div className="items-center col-span-4 lg:col-span-2 ">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-1 lg:col-span-2">
                    <p className="text-2xl text-center">Logo สาขา</p>
                  </div>
                  <div className="col-span-1 lg:col-span-2 flex justify-center">
                    {noImage(watch("fileBranch"))}
                  </div>
                </div>
              </div>
            ) : null}

            {!isEmpty(watch("fileSignatureOwner")) ? (
              <div className="items-center col-span-4 lg:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-1 lg:col-span-2">
                    <p className="text-2xl text-center">ลายเซ็น ผู้ให้เช่า</p>
                  </div>
                  <div className="col-span-1 lg:col-span-2 flex justify-center">
                    {noImage(watch("fileSignatureOwner"))}
                  </div>
                </div>
              </div>
            ) : null}

            {!isEmpty(watch("fileSignatureRefOne")) ? (
              <div className="items-center col-span-4 lg:col-span-2 ">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-1 lg:col-span-2">
                    <p className="text-2xl text-center">ลายเซ็น พยานคนที่ 1</p>
                  </div>
                  <div className="col-span-1 lg:col-span-2 flex justify-center">
                    {noImage(watch("fileSignatureRefOne"))}
                  </div>
                </div>
              </div>
            ) : null}

            {!isEmpty(watch("fileSignatureRefTwo")) ? (
              <div className="items-center col-span-4 lg:col-span-2 ">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-1 lg:col-span-2">
                    <p className="text-2xl text-center">ลายเซ็น พยานคนที่ 2</p>
                  </div>
                  <div className="col-span-1 lg:col-span-2 flex justify-center">
                    {noImage(watch("fileSignatureRefTwo"))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="items-center col-span-4 lg:col-span-4">
              <HorizontalRule />
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

ModalBranch.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalBranch;
