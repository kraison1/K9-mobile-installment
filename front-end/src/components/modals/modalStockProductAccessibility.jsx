/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";

import { isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import PropTypes from "prop-types";
import { fetchSelectProductModels } from "src/store/productModel";
import { fetchSelectProductColors } from "src/store/productColor";
import { useAuth } from "src/hooks/authContext";
import { fetchInfoProduct } from "src/store/product";
import Select from "react-select";
import HorizontalRule from "src/helpers/horizontalRule";
import FileDropzone from "src/helpers/fileDropzone";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import DragAndDropImages from "src/components/dragAndDropImages";
import {
  deleteProductImage,
  updateProductImageSeq,
} from "src/store/productImage";
import { fetchSelectProductTypesAccessibility } from "src/store/productType";
import { fetchSelectProductBrandsBy } from "src/store/productBrand";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalStockProductAccessibility = ({
  open,
  setModal,
  RowData,
  submitRow,
  getItems,
}) => {
  const { user, isLoadingOpen, setIsLoadingOpen } = useAuth();
  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [ProductModels, setProductModels] = React.useState([]);
  const [ProductTypes, setProductTypes] = React.useState([]);
  const [ProductBrand, setProductBrand] = React.useState([]);

  const [ProductColors, setProductColors] = React.useState([]);

  const dispatch = useDispatch();
  const store = useSelector((state) => state.product);
  const storeProductModel = useSelector((state) => state.productModel);
  const storeProductType = useSelector((state) => state.productType);
  const storeProductColor = useSelector((state) => state.productColor);
  const storeProductBrand = useSelector((state) => state.productBrand);

  React.useEffect(() => {
    if (!isEmpty(storeProductColor.select)) {
      setProductColors(
        storeProductColor.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, [storeProductColor.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductBrand.selectAccessibility)) {
      setProductBrand(
        storeProductBrand.selectAccessibility.map((item) => ({
          value: item.id,
          label: `${item.brandname}`,
        }))
      );
    }
  }, [storeProductBrand.selectAccessibility]);

  React.useEffect(() => {
    if (!isEmpty(storeProductModel.selectAccessibility)) {
      setProductModels(
        storeProductModel.selectAccessibility.map((item) => ({
          value: item.id,
          label: `${item.name}`,
        }))
      );
    }
  }, [storeProductModel.selectAccessibility]);

  React.useEffect(() => {
    if (!isEmpty(storeProductType.selectAccessibility)) {
      setProductTypes(
        storeProductType.selectAccessibility.map((item) => ({
          value: item.id,
          label: `${item.name}`,
        }))
      );
    }
  }, [storeProductType.selectAccessibility]);

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (isEmpty(storeProductColor.select)) {
        dispatch(fetchSelectProductColors());
      }

      if (isEmpty(storeProductModel.select)) {
        dispatch(fetchSelectProductModels(["อุปกรณ์เสริม"]));
      }

      if (isEmpty(storeProductType.selectAccessibility)) {
        dispatch(fetchSelectProductTypesAccessibility("อุปกรณ์เสริม"));
      }

      if (isEmpty(storeProductBrand.selectAccessibility)) {
        dispatch(
          fetchSelectProductBrandsBy({
            catalog: ["อุปกรณ์เสริม"],
          })
        );
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
    dispatch(fetchInfoProduct(id))
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
    submitRow({ ...data, createByUserId: user.id });
  };

  const submitSwitch = (items) => {
    setIsLoadingOpen(true);
    dispatch(updateProductImageSeq(items))
      .unwrap()
      .then(() => {
        const { page } = store.paramsAccessibility;
        getItems(page);
        fetchInfo(RowData.id);
        setIsLoadingOpen(false);
      })
      .catch(() => setIsLoadingOpen(false));
  };

  const onDelete = (item) => {
    setIsLoadingOpen(true);
    dispatch(deleteProductImage(item.id))
      .unwrap()
      .then(() => {
        fetchInfo(RowData.id);
        setIsLoadingOpen(false);
      })
      .catch(() => setIsLoadingOpen(false));
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
        className="relative w-full max-w-6xl"
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
          <div className="p-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="items-center col-span-3 lg:col-span-2">
              <label
                htmlFor="randomCode"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                สุ่มรหัสสินค้า
              </label>
              <Controller
                name="randomCode"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-2 gap-x-4">
                    <div className="flex items-center">
                      <input
                        {...field}
                        id="randomCode-0"
                        type="radio"
                        value="0"
                        checked={field.value === "0"}
                        onChange={() => field.onChange("0")}
                        className="mr-2"
                      />
                      <label htmlFor="randomCode-0" className="text-red-400">
                        ใช้ที่มากับสินค้า
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...field}
                        id="randomCode-1"
                        type="radio"
                        value="1"
                        checked={field.value === "1"}
                        onChange={() => field.onChange("1")}
                        className="mr-2"
                      />
                      <label htmlFor="randomCode-1" className="text-blue-400">
                        สร้างรหัสใหม่
                      </label>
                    </div>
                  </div>
                )}
              />
              {errors.randomCode && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล สุ่มรหัสสินค้า
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              {watch("randomCode") === "1" ? null : (
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    รหัสสินค้า
                  </label>
                  <Controller
                    id="code"
                    name="code"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="code"
                        type="text"
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.code ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                  {errors.code && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล รหัสสินค้า
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor="productTypeId"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ประเภท
              </label>
              <Controller
                id="productTypeId"
                name="productTypeId"
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
                      id="productTypeId"
                      options={ProductTypes}
                      placeholder="กรุณาเลือกประเภท"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={
                        ProductTypes.find(
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
              {errors.productTypeId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ประเภท
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor="productBrandId"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                แบรนด์
              </label>
              <Controller
                id="productBrandId"
                name="productBrandId"
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
                      id="productBrandId"
                      options={ProductBrand}
                      placeholder="กรุณาเลือกแบรนด์"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={
                        ProductBrand.find(
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
              {errors.productBrandId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล แบรนด์
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor="productModelId"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                รุ่น
              </label>
              <Controller
                id="productModelId"
                name="productModelId"
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
                      id="productModelId"
                      options={ProductModels}
                      placeholder="กรุณาเลือกรุ่น"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={
                        ProductModels.find(
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
              {errors.productModelId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล รุ่น
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor="productColorId"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                สี
              </label>
              <Controller
                id="productColorId"
                name="productColorId"
                control={control}
                rules={{ required: false }}
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 11 }),
                      }}
                      id="productColorId"
                      options={ProductColors}
                      placeholder="กรุณาเลือกสี"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={
                        ProductColors.find(
                          (option) => option.value === field.value
                        ) || ""
                      }
                      onChange={(selectedOption) => {
                        field.onChange(
                          selectedOption ? selectedOption.value : 0
                        );
                      }}
                    />
                  );
                }}
              />
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                จำนวน
              </label>
              <Controller
                id="amount"
                name="amount"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="amount"
                    disabled
                    type="number"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.amount ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor="priceCostBuy"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ราคาต้นทุน (บาท/ชิ้น)
              </label>
              <Controller
                id="priceCostBuy"
                name="priceCostBuy"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="priceCostBuy"
                    type="number"
                    disabled
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.priceCostBuy ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errors.priceCostBuy && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ราคาต้นทุน
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor="priceWholeSale"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ราคาขายส่ง (บาท/ชิ้น)
              </label>
              <Controller
                id="priceWholeSale"
                name="priceWholeSale"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="priceWholeSale"
                    type="number"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.priceWholeSale
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errors.priceWholeSale && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ราคาขายส่ง
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-1">
              <label
                htmlFor="priceWholeSale"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ราคาขายปลีก (บาท/ชิ้น)
              </label>
              <Controller
                id="priceSale"
                name="priceSale"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="priceSale"
                    type="number"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.priceSale ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errors.priceSale && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ราคาขายปลีก
                </span>
              )}
            </div>

            {import.meta.env.VITE_SYSTEM_NAME == "THUNDER" ? (
              <div className="items-center col-span-3 lg:col-span-3">
                <label
                  htmlFor="buyFormShop"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ซื้อจากร้านค้า
                </label>
                <Controller
                  id="buyFormShop"
                  name="buyFormShop"
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="buyFormShop"
                      type="text"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.buyFormShop
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
                {errors.buyFormShop && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล ซื้อจากร้านค้า
                  </span>
                )}
              </div>
            ) : null}

            <div className="items-center col-span-3 lg:col-span-3">
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-2 gap-x-4">
                    <div className="flex items-center">
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
                    </div>

                    <div className="flex items-center">
                      <input
                        {...field}
                        id="active-1"
                        type="radio"
                        value="1"
                        checked={field.value === "1"}
                        onChange={() => field.onChange("1")}
                        className="mr-2"
                      />
                      <label htmlFor="active-1" className="text-blue-400">
                        เปิดใช้งาน
                      </label>
                    </div>
                  </div>
                )}
              />
              {errors.active && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล สถานะ
                </span>
              )}
            </div>

            <div className="items-center col-span-3 lg:col-span-3">
              <HorizontalRule />
            </div>

            <div className="items-center col-span-3 lg:col-span-3">
              <label
                htmlFor="uploadFileProducts"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                อัพโหลดไฟล์ png, jpeg, jpg
              </label>
              <FileDropzone
                isOpen={open}
                name="uploadFileProducts"
                acceptedFileTypes={acceptedFileTypes}
                control={control}
                maxFileSize={5}
                fileMultiple={true}
                setValue={setValue}
              />
            </div>

            <div className="items-center col-span-3 lg:col-span-3">
              <HorizontalRule />
            </div>

            {!isEmpty(watch("productImages")) ? (
              <div className="items-center col-span-3 lg:col-span-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-2 lg:col-span-2">
                    <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                  </div>
                  <div className="col-span-2 lg:col-span-2">
                    <DragAndDropImages
                      images={watch("productImages")}
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

ModalStockProductAccessibility.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
  getItems: PropTypes.func,
};

export default ModalStockProductAccessibility;
