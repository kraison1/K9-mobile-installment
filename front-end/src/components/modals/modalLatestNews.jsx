/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
import { useAuth } from "src/hooks/authContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchInfoLatestNews } from "src/store/latestNews";
import FileDropzone from "src/helpers/fileDropzone";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import HorizontalRule from "src/helpers/horizontalRule";
import { noImage } from "src/helpers/constant";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalLatestNews = ({ open, setModal, RowData, submitRow }) => {
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();
  const store = useSelector((state) => state.latestNews);
  const modalRef = React.useRef(null);
  const container = React.useRef(null);

  React.useEffect(() => {
    if (open && modalRef.current) {
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
    dispatch(fetchInfoLatestNews(id))
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
                ? "เพิ่มข่าวใหม่"
                : `แก้ไขข่าว: ${RowData.name}`}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              onClick={() => setModal(false)}
            >
              <MdClose />
            </button>
          </div>
          <div className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="items-center col-span-1 lg:col-span-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ชื่อข่าว
              </label>
              <Controller
                id="name"
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ชื่อข่าว
                </span>
              )}
            </div>

            <div className="items-center col-span-1 lg:col-span-1">
              <label
                htmlFor="linkUrl"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ลิงก์ (ถ้ามี)
              </label>
              <Controller
                id="linkUrl"
                name="linkUrl"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="url"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.linkUrl ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.linkUrl && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ลิงก์ที่ถูกต้อง
                </span>
              )}
            </div>

            <div className="items-center col-span-2 lg:col-span-2">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                เนื้อหาข่าว
              </label>
              <Controller
                id="content"
                name="content"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <textarea
                    {...field}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.content ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    rows={4}
                  />
                )}
              />
              {errors.content && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล เนื้อหาข่าว
                </span>
              )}
            </div>

            <div className="items-center col-span-2 lg:col-span-1">
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

            <div className="items-center col-span-2 lg:col-span-2">
              <HorizontalRule />
            </div>

            <div className="items-center col-span-2 lg:col-span-2">
              <label
                htmlFor="uploadFileLatestNew"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                อัพโหลดไฟล์ png, jpeg, jpg
              </label>
              <FileDropzone
                isOpen={open}
                name="uploadFileLatestNew"
                acceptedFileTypes={acceptedFileTypes}
                control={control}
                maxFileSize={5}
                fileMultiple={false}
                setValue={setValue}
              />
            </div>

            <div className="items-center col-span-2 lg:col-span-2">
              <HorizontalRule />
            </div>

            {!isEmpty(watch("fileLatestNew")) ? (
              <div className="items-center col-span-2 lg:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-1 lg:col-span-2">
                    <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                  </div>
                  <div className="col-span-1 lg:col-span-2 flex justify-center">
                    {noImage(watch("fileLatestNew"))}
                  </div>
                </div>
              </div>
            ) : null}
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

ModalLatestNews.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalLatestNews;
