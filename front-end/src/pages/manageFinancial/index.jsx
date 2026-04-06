/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { isEmpty, isNumber, debounce } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "src/hooks/authContext";
import {
  addCustomer,
  fetchSearchCitizenIdCard,
  updateCustomer,
} from "src/store/customer";
import { fetchSelectProvince } from "src/store/province";
import { fetchSelectDistrict } from "src/store/district";
import { fetchSelectSubdistrict } from "src/store/subdistrict";
import FileDropzone from "src/helpers/fileDropzone";
import Select from "react-select";
import HorizontalRule from "src/helpers/horizontalRule";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import { error, success } from "src/components/alart";
import { DefaultValuesCustomer } from "../customers";
import DragAndDropImages from "src/components/dragAndDropImages";
import { fetchSelectProductModels } from "src/store/productModel";
import { fetchSelectProductStorages } from "src/store/productStorage";
import { fetchSelectProductColors } from "src/store/productColor";
import { fetchSelectRateFinanceDownPrice } from "src/store/rateFinanceDown";
import { useNavigate } from "react-router-dom";
import { handleScanner } from "src/helpers/disabledHandleScanner";
import DatePicker from "react-datepicker";
import { th } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { DefaultValuesProduct } from "../stocks/product";
import { addProduct, updateProduct } from "src/store/product";
import { addProcessManageFinance } from "src/store/manageFinancial";
import { formatNumberDigit } from "src/helpers/formatNumber";
import { fetchSelectRateFinance } from "src/store/rateFinance";
import { fetchSelectProductTypes } from "src/store/productType";
import { fetchSelectProductBrandsBy } from "src/store/productBrand";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ManageFinancial = () => {
  const navigate = useNavigate();
  const { setIsLoadingOpen } = useAuth();
  const [Provinces, setProvinces] = React.useState([]);
  const [Districts, setDistricts] = React.useState([]);
  const [Subdistricts, setSubdistricts] = React.useState([]);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSearchComplete, setIsSearchComplete] = React.useState(false);
  const storeProductType = useSelector((state) => state.productType);

  const [ProductModels, setProductModels] = React.useState([]);
  const [ProductTypes, setProductTypes] = React.useState([]);
  const [ProductBrand, setProductBrand] = React.useState([]);
  const [ProductStorages, setProductStorages] = React.useState([]);
  const [ProductColors, setProductColors] = React.useState([]);
  const [PriceStart, setPriceStart] = React.useState(0);
  const [PriceEnd, setPriceEnd] = React.useState(0);
  const [RateFinances, setRateFinances] = React.useState([]);

  const dispatch = useDispatch();
  const storeProvince = useSelector((state) => state.province);
  const storeDistrict = useSelector((state) => state.district);
  const storeSubdistricts = useSelector((state) => state.subdistrict);
  const storeProductBrand = useSelector((state) => state.productBrand);
  const storeProductModel = useSelector((state) => state.productModel);
  const storeProductStorage = useSelector((state) => state.productStorage);
  const storeProductColor = useSelector((state) => state.productColor);
  const storeRateFinance = useSelector((state) => state.rateFinance);

  // ฟอร์มสำหรับข้อมูลลูกค้า
  const {
    handleSubmit: handleSubmitCustomer,
    control: controlCustomer,
    formState: { errors },
    setValue: setValueCustomer,
    reset: resetCustomer,
    watch: watchCustomer,
  } = useForm({
    defaultValues: DefaultValuesCustomer,
  });

  // ฟอร์มสำหรับข้อมูลทรัพย์สิน
  const {
    handleSubmit: handleSubmitProduct,
    control: controlProduct,
    formState: { errors: errorsProduct },
    setValue: setValueProduct,
    reset: resetProduct,
    watch: watchProduct,
  } = useForm({
    defaultValues: { ...DefaultValuesProduct, isFinance: 1 },
  });

  const citizenIdCard = watchCustomer("citizenIdCard");

  React.useEffect(() => {
    if (!isEmpty(storeProductColor.select)) {
      setProductColors(
        storeProductColor.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    } else {
      dispatch(fetchSelectProductColors());
    }
  }, [storeProductColor.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductStorage.select)) {
      setProductStorages(
        storeProductStorage.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    } else {
      dispatch(fetchSelectProductStorages());
    }
  }, [storeProductStorage.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductType.select)) {
      setProductTypes(
        storeProductType.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    } else {
      dispatch(fetchSelectProductTypes("มือถือ"));
    }
  }, [storeProductType.select]);

  React.useEffect(() => {
    if (!isEmpty(storeRateFinance.select)) {
      setRateFinances(
        storeRateFinance.select.map((item) => ({
          value: item.id,
          label: item.name,
          valueMonth: item.valueMonth,
          valueEqual: item.valueEqual,
        }))
      );
    } else {
      dispatch(fetchSelectRateFinance());
    }
  }, [storeRateFinance.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductModel.select)) {
      setProductModels(
        storeProductModel.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    } else {
      dispatch(fetchSelectProductModels(["มือถือ"]));
    }
  }, [storeProductModel.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductBrand.selectMobile)) {
      setProductBrand(
        storeProductBrand.selectMobile.map((item) => ({
          value: item.id,
          label: item.brandname,
        }))
      );
    } else {
      dispatch(
        fetchSelectProductBrandsBy({
          catalog: ["มือถือ"],
        })
      );
    }
  }, [storeProductBrand.selectMobile]);

  // ฟังก์ชันค้นหาเลขบัตรประชาชน
  const searchCitizenId = React.useCallback(
    debounce((citizenId) => {
      if (citizenId && citizenId.length === 13 && /^\d+$/.test(citizenId)) {
        setIsLoadingOpen(true);
        handleSearchCitizenIdCard(citizenId);
      }
    }, 1000),
    [dispatch, resetCustomer, setIsLoadingOpen]
  );

  const handleSearchCitizenIdCard = (citizenId) => {
    setIsLoadingOpen(true);
    dispatch(fetchSearchCitizenIdCard(citizenId)).then((res) => {
      const { payload } = res;
      if (isEmpty(payload.message_error)) {
        if (isEmpty(payload)) {
          success("ลูกค้าใหม่");
          resetCustomer({
            ...DefaultValuesCustomer,
            citizenIdCard: citizenId,
          });
        } else {
          success("ลูกค้าเก่า");
          resetCustomer({
            ...payload,
            citizenIdCard: citizenId,
          });
        }

        setIsSearchComplete(true);
      }

      setIsLoadingOpen(false);
    });
  };

  // ตรวจสอบเลขบัตรประชาชนและเรียกค้นหาด้วย debounce
  React.useEffect(() => {
    if (
      citizenIdCard &&
      citizenIdCard.length === 13 &&
      /^\d+$/.test(citizenIdCard)
    ) {
      searchCitizenId(citizenIdCard);
    } else {
      setIsSearchComplete(false);
    }

    // ยกเลิก debounce เมื่อ component unmount
    return () => {
      searchCitizenId.cancel();
    };
  }, [citizenIdCard, searchCitizenId]);

  React.useEffect(() => {
    if (!isEmpty(storeProvince.select)) {
      setProvinces(
        storeProvince.select.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    } else {
      dispatch(fetchSelectProvince());
    }
  }, [storeProvince.select]);

  React.useEffect(() => {
    const selectedProvinceId = watchCustomer("mProvinceId");
    if (selectedProvinceId) {
      dispatch(fetchSelectDistrict(selectedProvinceId));
    }
  }, [watchCustomer("mProvinceId")]);

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
    const selectedDistrictId = watchCustomer("mDistrictId");
    if (selectedDistrictId) {
      dispatch(fetchSelectSubdistrict(selectedDistrictId));
    }
  }, [watchCustomer("mDistrictId")]);

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
    if (
      watchProduct("productModelId") &&
      watchProduct("productStorageId") &&
      watchProduct("hand") &&
      currentStep == 2
    ) {
      setIsLoadingOpen(true);

      dispatch(
        fetchSelectRateFinanceDownPrice({
          productModelId: watchProduct("productModelId"),
          productStorageId: watchProduct("productStorageId"),
          hand: watchProduct("hand"),
        })
      ).then((res) => {
        const { payload } = res;
        setPriceStart(payload.data?.priceStart || 0);
        setPriceEnd(payload.data?.priceEnd || 0);

        setValueProduct("priceCostBuy", payload.data?.priceStart || 0);
        setValueProduct("priceCostBuy", payload.data?.priceStart || 0);
        setValueProduct(
          "priceDownPayment",
          payload.data?.priceDownPayment || 0
        );
        setValueProduct("payPerMonth", payload.data?.payPerMonth || 0);
        setValueProduct("priceSale", payload.data?.priceStart || 0);
        setValueProduct("priceWholeSale", payload.data?.priceStart || 0);

        setIsLoadingOpen(false);
      });
    }
  }, [
    watchProduct("productModelId"),
    watchProduct("productStorageId"),
    watchProduct("hand"),
  ]);

  const onSubmitCustomer = (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      dispatch(addCustomer(e))
        .then((res) => {
          const { payload } = res;
          if (!isEmpty(payload.data)) {
            resetCustomer(payload.data);
            handleNext();
          }
        })
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
    } else {
      dispatch(updateCustomer(e))
        .then((res) => {
          const { payload } = res;
          if (!isEmpty(payload.data)) {
            resetCustomer(payload.data);
            handleNext();
          }
        })
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
    }
  };

  const onSubmitProduct = (e) => {
    if (watchProduct("priceSale") > PriceEnd) {
      error("คุณใส่ ราคาขายเกินกำหนด");
    } else {
      setIsLoadingOpen(true);
      if (isNaN(e.id)) {
        dispatch(addProduct(e))
          .then((res) => {
            const { payload } = res;
            if (!isEmpty(payload.data)) {
              resetProduct(payload.data);
              handleNext();
            }
          })
          .then(() => setIsLoadingOpen(false))
          .catch(() => setIsLoadingOpen(false));
      } else {
        dispatch(updateProduct(e))
          .then((res) => {
            const { payload } = res;
            if (!isEmpty(payload.data)) {
              resetProduct(payload.data);
              handleNext();
            }
          })
          .then(() => setIsLoadingOpen(false))
          .catch(() => setIsLoadingOpen(false));
      }
    }
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const steps = [
    { id: 1, name: "ข้อมูลลูกค้า" },
    { id: 2, name: "ข้อมูลทรัพย์สิน" },
    { id: 3, name: "ตรวจสอบข้อมูลก่อนทำสัญญา" },
  ];

  const handleSubmitFinancial = () => {
    dispatch(
      addProcessManageFinance({
        customerId: watchCustomer("id"),
        productId: watchProduct("id"),
      })
    )
      .then(() => {
        navigate("/manageFinancialList");
      })
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const customerInfo = ({ isSearch, isUpload }) => {
    return (
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label
            htmlFor="citizenIdCard"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            เลขประจำตัวประชาชน
          </label>
          <div className="flex gap-2">
            <Controller
              id="citizenIdCard"
              name="citizenIdCard"
              control={controlCustomer}
              rules={{
                required: true,
              }}
              render={({ field }) => (
                <input
                  {...field}
                  id="citizenIdCard"
                  type="text"
                  className={`flex-1 px-3 py-2 border ${
                    errors.citizenIdCard ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                />
              )}
            />

            {isSearch ? (
              <button
                type="button"
                onClick={() =>
                  handleSearchCitizenIdCard(watchCustomer("citizenIdCard"))
                }
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                ค้นหา
              </button>
            ) : null}
          </div>
          {errors.citizenIdCard && (
            <span className="text-red-500 text-xs mt-1">
              กรุณาใส่ข้อมูล เลขประจำตัวประชาชน
            </span>
          )}
        </div>

        {isSearchComplete && (
          <React.Fragment>
            <div className="col-span-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ชื่อ
              </label>
              <Controller
                id="name"
                name="name"
                control={controlCustomer}
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="name"
                    type="text"
                    className={`w-full px-3 py-2 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ชื่อ
                </span>
              )}
            </div>

            <div className="col-span-1">
              <label
                htmlFor="lastname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                นามสกุล
              </label>
              <Controller
                id="lastname"
                name="lastname"
                control={controlCustomer}
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="lastname"
                    type="text"
                    className={`w-full px-3 py-2 border ${
                      errors.lastname ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errors.lastname && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล นามสกุล
                </span>
              )}
            </div>

            <div className="col-span-1">
              <label
                htmlFor="tel"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                เบอร์ติดต่อ
              </label>
              <Controller
                id="tel"
                name="tel"
                control={controlCustomer}
                rules={{
                  required: true,
                }}
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

            <div className="col-span-1">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ที่อยู่
              </label>
              <Controller
                id="address"
                name="address"
                control={controlCustomer}
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="address"
                    type="text"
                    className={`w-full px-3 py-2 border ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
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
                htmlFor="facebook"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                Facebook
              </label>
              <Controller
                id="facebook"
                name="facebook"
                control={controlCustomer}
                rules={{
                  required: true,
                }}
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
                control={controlCustomer}
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
                  กรุณาใส่ข้อมูล ที่อยู่
                </span>
              )}
            </div>

            <div className="col-span-1">
              <label
                htmlFor="mProvinceId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                จังหวัด
              </label>
              <Controller
                id="mProvinceId"
                name="mProvinceId"
                control={controlCustomer}
                rules={{
                  required: true,
                }}
                render={({ field }) => (
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
                      setValueCustomer("mDistrictId", "");
                      setValueCustomer("mSubdistrictId", "");
                      setValueCustomer("zipCode", "");
                    }}
                  />
                )}
              />
              {errors.mProvinceId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล จังหวัด
                </span>
              )}
            </div>

            <div className="col-span-1">
              <label
                htmlFor="mDistrictId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                อำเภอ
              </label>
              <Controller
                id="mDistrictId"
                name="mDistrictId"
                control={controlCustomer}
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <Select
                    {...field}
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 11 }),
                    }}
                    id="mDistrictId"
                    isDisabled={!isNumber(watchCustomer("mProvinceId"))}
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
                      setValueCustomer("mSubdistrictId", "");
                      setValueCustomer("zipCode", "");
                    }}
                  />
                )}
              />
              {errors.mDistrictId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล อำเภอ
                </span>
              )}
            </div>

            <div className="col-span-1">
              <label
                htmlFor="mSubdistrictId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ตำบล
              </label>
              <Controller
                id="mSubdistrictId"
                name="mSubdistrictId"
                control={controlCustomer}
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <Select
                    {...field}
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 11 }),
                    }}
                    id="mSubdistrictId"
                    isDisabled={!isNumber(watchCustomer("mDistrictId"))}
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
                      setValueCustomer(
                        "zipCode",
                        selectedOption ? selectedOption.postcode : ""
                      );
                    }}
                  />
                )}
              />
              {errors.mSubdistrictId && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ตำบล
                </span>
              )}
            </div>

            <div className="col-span-1">
              <label
                htmlFor="zipCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ไปรษณีย์
              </label>
              <Controller
                id="zipCode"
                name="zipCode"
                control={controlCustomer}
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="zipCode"
                    type="text"
                    disabled
                    className={`w-full px-3 py-2 border ${
                      errors.zipCode ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                  />
                )}
              />
              {errors.zipCode && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ไปรษณีย์
                </span>
              )}
            </div>

            <div className="col-span-1 md:col-span-2">
              <HorizontalRule />
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <h2 className="text-lg font-semibold">บุคคลอ้างอิงที่ 1</h2>
                </div>
                <div className="col-span-1">
                  <label
                    htmlFor="nameRefOne"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ชื่อ
                  </label>
                  <Controller
                    id="nameRefOne"
                    name="nameRefOne"
                    control={controlCustomer}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="nameRefOne"
                        type="text"
                        className={`w-full px-3 py-2 border ${
                          errors.nameRefOne
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                  {errors.nameRefOne && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล ชื่อ
                    </span>
                  )}
                </div>
                <div className="col-span-1">
                  <label
                    htmlFor="lastnameRefOne"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    นามสกุล
                  </label>
                  <Controller
                    id="lastnameRefOne"
                    name="lastnameRefOne"
                    control={controlCustomer}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="lastnameRefOne"
                        type="text"
                        className={`w-full px-3 py-2 border ${
                          errors.lastnameRefOne
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                  {errors.lastnameRefOne && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล นามสกุล
                    </span>
                  )}
                </div>
                <div className="col-span-1">
                  <label
                    htmlFor="relaRefOne"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ความสัมพันธ์
                  </label>
                  <Controller
                    id="relaRefOne"
                    name="relaRefOne"
                    control={controlCustomer}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="relaRefOne"
                        type="text"
                        className={`w-full px-3 py-2 border ${
                          errors.relaRefOne
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                  {errors.relaRefOne && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล ความสัมพันธ์
                    </span>
                  )}
                </div>
                <div className="col-span-1">
                  <label
                    htmlFor="telRefOne"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    เบอร์ติดต่อ
                  </label>
                  <Controller
                    id="telRefOne"
                    name="telRefOne"
                    control={controlCustomer}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="telRefOne"
                        type="text"
                        className={`w-full px-3 py-2 border ${
                          errors.telRefOne
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="col-span-1 md:col-span-2">
                  <h2 className="text-lg font-semibold">บุคคลอ้างอิงที่ 2</h2>
                </div>
                <div className="col-span-1">
                  <label
                    htmlFor="nameRefTwo"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ชื่อ
                  </label>
                  <Controller
                    id="nameRefTwo"
                    name="nameRefTwo"
                    control={controlCustomer}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="nameRefTwo"
                        type="text"
                        className={`w-full px-3 py-2 border ${
                          errors.nameRefTwo
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                  {errors.nameRefTwo && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล ชื่อ
                    </span>
                  )}
                </div>
                <div className="col-span-1">
                  <label
                    htmlFor="lastnameRefTwo"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    นามสกุล
                  </label>
                  <Controller
                    id="lastnameRefTwo"
                    name="lastnameRefTwo"
                    control={controlCustomer}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="lastnameRefTwo"
                        type="text"
                        className={`w-full px-3 py-2 border ${
                          errors.lastnameRefTwo
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                  {errors.lastnameRefTwo && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล นามสกุล
                    </span>
                  )}
                </div>
                <div className="col-span-1">
                  <label
                    htmlFor="relaRefTwo"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ความสัมพันธ์
                  </label>
                  <Controller
                    id="relaRefTwo"
                    name="relaRefTwo"
                    control={controlCustomer}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="relaRefTwo"
                        type="text"
                        className={`w-full px-3 py-2 border ${
                          errors.relaRefTwo
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                  {errors.relaRefTwo && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูล ความสัมพันธ์
                    </span>
                  )}
                </div>
                <div className="col-span-1">
                  <label
                    htmlFor="telRefTwo"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    เบอร์ติดต่อ
                  </label>
                  <Controller
                    id="telRefTwo"
                    name="telRefTwo"
                    control={controlCustomer}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="telRefTwo"
                        type="text"
                        className={`w-full px-3 py-2 border ${
                          errors.telRefTwo
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
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

            <div className="col-span-1 md:col-span-2">
              <HorizontalRule />
            </div>

            {isUpload ? (
              <div className="col-span-1 md:col-span-2">
                <label
                  htmlFor="uploadFileCustomers"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  อัพโหลดไฟล์ png, jpeg, jpg{" "}
                  <span className="text-red-400">
                    * ต้องนำรูปภาพบัตรประชาชนเป็นรูปแรก
                  </span>
                </label>
                <FileDropzone
                  isOpen={true}
                  name="uploadFileCustomers"
                  acceptedFileTypes={acceptedFileTypes}
                  control={controlCustomer}
                  maxFileSize={5}
                  fileMultiple={true}
                  setValue={setValueCustomer}
                />
              </div>
            ) : null}

            {isUpload ? (
              <div className="col-span-1 md:col-span-2">
                <HorizontalRule />
              </div>
            ) : null}

            {!isEmpty(watchCustomer("customerImages")) && (
              <div className="col-span-1 md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-xl font-semibold">รูปที่เคยอัพโหลด</p>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <DragAndDropImages
                      images={watchCustomer("customerImages")}
                      submitSwitch={() => {}}
                      onDelete={() => {}}
                      showDelete={false}
                    />
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    );
  };

  const productInfo = ({ isUpload }) => {
    return (
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => {
              return (
                <Select
                  {...field}
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 11 }),
                  }}
                  isDisabled={watchProduct("id") == null ? false : true}
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
                    field.onChange(selectedOption ? selectedOption.value : "");
                  }}
                />
              );
            }}
          />
          {errors.productModelId && (
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
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => {
              return (
                <Select
                  {...field}
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 11 }),
                  }}
                  isDisabled={watchProduct("id") == null ? false : true}
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
                    field.onChange(selectedOption ? selectedOption.value : "");
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
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => {
              return (
                <Select
                  {...field}
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 11 }),
                  }}
                  isDisabled={watchProduct("id") == null ? false : true}
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
                    field.onChange(selectedOption ? selectedOption.value : "");
                    setValueProduct(
                      "productBrandId",
                      selectedOption ? selectedOption.productBrandId : ""
                    );
                  }}
                />
              );
            }}
          />
          {errorsProduct.productModelId && (
            <span className="text-red-500 text-xs mt-1">
              กรุณาใส่ข้อมูล รุ่น
            </span>
          )}
        </div>

        <div className="items-center col-span-3 lg:col-span-1">
          <label
            htmlFor="productStorageId"
            className="block text-sm font-medium text-gray-700 mr-2"
          >
            ความจุ
          </label>
          <Controller
            id="productStorageId"
            name="productStorageId"
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => {
              return (
                <Select
                  {...field}
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 11 }),
                  }}
                  id="productStorageId"
                  options={ProductStorages}
                  placeholder="กรุณาเลือกความจุ"
                  isClearable
                  isSearchable
                  classNamePrefix="react-select"
                  value={
                    ProductStorages.find(
                      (option) => option.value === field.value
                    ) || ""
                  }
                  onChange={(selectedOption) => {
                    field.onChange(selectedOption ? selectedOption.value : "");
                  }}
                />
              );
            }}
          />
          {errorsProduct.productStorageId && (
            <span className="text-red-500 text-xs mt-1">
              กรุณาใส่ข้อมูล ความจุ
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
            control={controlProduct}
            rules={{ required: true }}
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
                    field.onChange(selectedOption ? selectedOption.value : "");
                  }}
                />
              );
            }}
          />
          {errorsProduct.productColorId && (
            <span className="text-red-500 text-xs mt-1">กรุณาใส่ข้อมูล สี</span>
          )}
        </div>

        <div className="items-center col-span-3 lg:col-span-1">
          <label
            htmlFor="imei"
            className="block text-sm font-medium text-gray-700 mr-2"
          >
            หมายเลขเครื่อง/หมายเลข IMEI
          </label>
          <Controller
            id="imei"
            name="imei"
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => (
              <div className="relative flex mt-1 gap-2">
                <input
                  {...field}
                  id="imei"
                  type="text"
                  onKeyDown={(e) => handleScanner(e)}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errorsProduct.imei ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                />
              </div>
            )}
          />
          {errorsProduct.imei && (
            <span className="text-red-500 text-xs mt-1">
              กรุณาใส่ข้อมูล หมายเลขเครื่อง/หมายเลข IMEI
            </span>
          )}
        </div>

        <div className="items-center col-span-3 lg:col-span-1">
          <label
            htmlFor="batteryHealth"
            className="block text-sm font-medium text-gray-700 mr-2"
          >
            สุขภาพแบต %
          </label>
          <Controller
            id="batteryHealth"
            name="batteryHealth"
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => (
              <input
                {...field}
                id="batteryHealth"
                type="number"
                className={`mt-1 block w-full px-3 py-2 border ${
                  errorsProduct.batteryHealth
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
              />
            )}
          />
          {errorsProduct.batteryHealth && (
            <span className="text-red-500 text-xs mt-1">
              กรุณาใส่ข้อมูล สุขภาพแบต
            </span>
          )}
        </div>

        <div className="items-center col-span-3 lg:col-span-1">
          <label
            htmlFor="machineCondition"
            className="block text-sm font-medium text-gray-700 mr-2"
          >
            สภาพเครื่อง %
          </label>
          <Controller
            id="machineCondition"
            name="machineCondition"
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => (
              <input
                {...field}
                id="machineCondition"
                type="number"
                className={`mt-1 block w-full px-3 py-2 border ${
                  errorsProduct.machineCondition
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
              />
            )}
          />
          {errorsProduct.machineCondition && (
            <span className="text-red-500 text-xs mt-1">
              กรุณาใส่ข้อมูล สภาพเครื่อง
            </span>
          )}
        </div>

        <div className="items-center col-span-3 lg:col-span-1 border p-1 border-gray-300 rounded-md">
          <label
            htmlFor="hand"
            className="block text-sm font-medium text-gray-700 mr-2"
          >
            สินค้า
          </label>
          <Controller
            name="hand"
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => (
              <div className="grid  grid-cols-1 lg:grid-cols-4 gap-y-2 gap-x-4">
                <div className="flex items-center">
                  <input
                    {...field}
                    id="hand-0"
                    type="radio"
                    value="มือหนึ่ง"
                    checked={field.value === "มือหนึ่ง"}
                    onChange={() => field.onChange("มือหนึ่ง")}
                    className="mr-2"
                  />
                  <label htmlFor="hand-0" className="text-red-400">
                    มือหนึ่ง
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...field}
                    id="hand-1"
                    type="radio"
                    value="มือสอง"
                    checked={field.value === "มือสอง"}
                    onChange={() => field.onChange("มือสอง")}
                    className="mr-2"
                  />
                  <label htmlFor="hand-1" className="text-blue-400">
                    มือสอง
                  </label>
                </div>
              </div>
            )}
          />
          {errorsProduct.boxType && (
            <span className="text-red-500 text-xs mt-1">
              กรุณาเลือกข้อมูล สภาพสินค้า
            </span>
          )}
        </div>

        <div className="items-center col-span-3 lg:col-span-1 border p-1 border-gray-300 rounded-md">
          <label
            htmlFor="simType"
            className="block text-sm font-medium text-gray-700 mr-2"
          >
            ใช้ได้ทุกซิม
          </label>
          <Controller
            name="simType"
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => (
              <div className="grid grid-cols-4 gap-y-2 gap-x-4">
                <div className="flex items-center">
                  <input
                    {...field}
                    id="simType-0"
                    type="radio"
                    value="ไม่"
                    checked={field.value === "ไม่"}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setValueProduct("simName", ""); // กำหนดค่า simName เมื่อ simType เป็น 0
                    }}
                    className="mr-2"
                  />
                  <label htmlFor="simType-0" className="text-red-400">
                    ไม่
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...field}
                    id="simType-1"
                    type="radio"
                    value="ใช่"
                    checked={field.value === "ใช่"}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setValueProduct("simName", ""); // ตั้งค่า simName ให้เป็นค่าว่างเมื่อ simType เป็น 1
                    }}
                    className="mr-2"
                  />
                  <label htmlFor="simType-1" className="text-blue-400">
                    ใช่
                  </label>
                </div>
              </div>
            )}
          />
          {errorsProduct.simType && (
            <span className="text-red-500 text-xs mt-1">
              กรุณาเลือกข้อมูล ใช้ได้ทุกซิม
            </span>
          )}
        </div>

        <div className="items-center col-span-3 lg:col-span-1">
          {watchProduct("simType") === "ไม่" && ( // ตรวจสอบว่า simType เป็น 0 ถึงจะแสดง
            <Controller
              id="simName"
              name="simName"
              control={controlProduct}
              rules={{
                validate: (value) => value.trim() !== "", // ตรวจสอบว่า simName ต้องไม่ว่าง
              }}
              render={({ field }) => (
                <input
                  {...field}
                  id="simName"
                  type="text"
                  placeholder="ใช้ได้เฉพาะ"
                  className={`block w-full px-2 py-4 border ${
                    errorsProduct.simName ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                />
              )}
            />
          )}
          {errorsProduct.simName && (
            <span className="text-red-500 text-xs mt-1">
              กรุณาใส่ข้อมูล เครือข่าย
            </span>
          )}
        </div>

        <div className="items-center col-span-3 lg:col-span-2 border p-1 border-gray-300 rounded-md">
          <label
            htmlFor="boxType"
            className="block text-sm font-medium text-gray-700 mr-2"
          >
            กล่อง
          </label>
          <Controller
            name="boxType"
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => (
              <div className="grid  grid-cols-1 lg:grid-cols-4 gap-y-2 gap-x-4">
                <div className="flex items-center">
                  <input
                    {...field}
                    id="boxType-0"
                    type="radio"
                    value="ไม่มี"
                    checked={field.value === "ไม่มี"}
                    onChange={() => field.onChange("ไม่มี")}
                    className="mr-2"
                  />
                  <label htmlFor="boxType-0" className="text-red-400">
                    ไม่มี
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...field}
                    id="boxType-1"
                    type="radio"
                    value="มี"
                    checked={field.value === "มี"}
                    onChange={() => field.onChange("มี")}
                    className="mr-2"
                  />
                  <label htmlFor="boxType-1" className="text-blue-400">
                    มี
                  </label>
                </div>

                {/* <div className="flex items-center">
                  <input
                    {...field}
                    id="boxType-2"
                    type="radio"
                    value="ครบกล่องตรงอีมี่"
                    checked={field.value === "ครบกล่องตรงอีมี่"}
                    onChange={() => field.onChange("ครบกล่องตรงอีมี่")}
                    className="mr-2"
                  />
                  <label htmlFor="boxType-2" className="text-green-400">
                    ครบกล่องตรงอีมี่
                  </label>
                </div> */}
              </div>
            )}
          />
          {errorsProduct.boxType && (
            <span className="text-red-500 text-xs mt-1">
              กรุณาเลือกข้อมูล กล่อง
            </span>
          )}
        </div>

        <div className="items-center col-span-3 lg:col-span-1 border p-1 border-gray-300 rounded-md">
          <label
            htmlFor="shopCenterInsurance"
            className="block text-sm font-medium text-gray-700 mr-2"
          >
            ประกันศูนย์
          </label>
          <Controller
            name="shopCenterInsurance"
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => (
              <div className="grid grid-cols-4 gap-y-2 gap-x-4">
                <div className="flex items-center">
                  <input
                    {...field}
                    id="shopCenterInsurance-0"
                    type="radio"
                    value="ไม่มี"
                    checked={field.value === "ไม่มี"}
                    onChange={() => field.onChange("ไม่มี")}
                    className="mr-2"
                  />
                  <label
                    htmlFor="shopCenterInsurance-0"
                    className="text-red-400"
                  >
                    ไม่มี
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...field}
                    id="shopCenterInsurance-1"
                    type="radio"
                    value="มี"
                    checked={field.value === "มี"}
                    onChange={() => field.onChange("มี")}
                    className="mr-2"
                  />
                  <label
                    htmlFor="shopCenterInsurance-1"
                    className="text-blue-400"
                  >
                    มี
                  </label>
                </div>
              </div>
            )}
          />
          {errorsProduct.shopCenterInsurance && (
            <span className="text-red-500 text-xs mt-1">
              กรุณาเลือกข้อมูล ประกันศูนย์
            </span>
          )}
        </div>

        <div className="items-center col-span-3 lg:col-span-2 border p-1 border-gray-300 rounded-md">
          <label
            htmlFor="shopInsurance"
            className="block text-sm font-medium text-gray-700 mr-2"
          >
            ประกันร้าน (วัน)
          </label>
          <Controller
            name="shopInsurance"
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => (
              <div className="grid grid-cols-4 gap-y-2 gap-x-4">
                <div className="flex items-center">
                  <input
                    {...field}
                    id="shopInsurance-0"
                    type="radio"
                    value="0"
                    checked={field.value === "0"}
                    onChange={() => field.onChange("0")}
                    className="mr-2"
                  />
                  <label htmlFor="shopInsurance-0" className="text-red-400">
                    0
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...field}
                    id="shopInsurance-7"
                    type="radio"
                    value="7"
                    checked={field.value === "7"}
                    onChange={() => field.onChange("7")}
                    className="mr-2"
                  />
                  <label htmlFor="shopInsurance-7" className="text-blue-400">
                    7
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...field}
                    id="shopInsurance-15"
                    type="radio"
                    value="15"
                    checked={field.value === "15"}
                    onChange={() => field.onChange("15")}
                    className="mr-2"
                  />
                  <label htmlFor="shopInsurance-15" className="text-yellow-400">
                    15
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...field}
                    id="shopInsurance-30"
                    type="radio"
                    value="30"
                    checked={field.value === "30"}
                    onChange={() => field.onChange("30")}
                    className="mr-2"
                  />
                  <label htmlFor="shopInsurance-30" className="text-green-400">
                    30
                  </label>
                </div>
              </div>
            )}
          />
          {errorsProduct.shopInsurance && (
            <span className="text-red-500 text-xs mt-1">
              กรุณาเลือกข้อมูล ประกันร้าน
            </span>
          )}
        </div>

        {watchProduct("shopCenterInsurance") === "มี" ? (
          <div className="items-center col-span-3 lg:col-span-1 border p-1 border-gray-300 rounded-md">
            <label
              htmlFor="shopCenterInsuranceDate"
              className="block text-sm font-medium text-gray-700 mr-2"
            >
              วันที่หมดประกันศูนย์
            </label>
            <Controller
              name="shopCenterInsuranceDate"
              control={controlProduct}
              rules={{ required: true }}
              render={({ field }) => (
                <DatePicker
                  showIcon
                  locale={th}
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  dateFormat="dd/MM/yyyy"
                  timeZone="Asia/Bangkok"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholderText="เลือกวันที่"
                />
              )}
            />
            {errorsProduct.shopCenterInsuranceDate && (
              <span className="text-red-500 text-xs mt-1">
                กรุณาเลือกข้อมูล วันที่หมดประกันศูนย์
              </span>
            )}
          </div>
        ) : null}

        <div className="items-center col-span-3 lg:col-span-3 border p-1 border-gray-300 rounded-md">
          <label
            htmlFor="freeGift"
            className="block text-sm font-medium text-gray-700 mr-2"
          >
            ชุดชาร์จ
          </label>
          <Controller
            name="freeGift"
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => (
              <div className="grid  grid-cols-1 lg:grid-cols-4 gap-y-2 gap-x-4">
                <div className="flex items-center">
                  <input
                    {...field}
                    id="freeGift-0"
                    type="radio"
                    value="ไม่มี"
                    checked={field.value === "ไม่มี"}
                    onChange={() => field.onChange("ไม่มี")}
                    className="mr-2"
                  />
                  <label htmlFor="freeGift-0" className="text-red-400">
                    ไม่มี
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...field}
                    id="freeGift-2"
                    type="radio"
                    value="หัวชาร์จ"
                    checked={field.value === "หัวชาร์จ"}
                    onChange={() => field.onChange("หัวชาร์จ")}
                    className="mr-2"
                  />
                  <label htmlFor="freeGift-2" className="text-blue-400">
                    หัวชาร์จ
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...field}
                    id="freeGift-3"
                    type="radio"
                    value="สายชาร์จ"
                    checked={field.value === "สายชาร์จ"}
                    onChange={() => field.onChange("สายชาร์จ")}
                    className="mr-2"
                  />
                  <label htmlFor="freeGift-3" className="text-blue-400">
                    สายชาร์จ
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...field}
                    id="freeGift-1"
                    type="radio"
                    value="หัวชาร์จ+สายชาร์จ"
                    checked={field.value === "หัวชาร์จ+สายชาร์จ"}
                    onChange={() => field.onChange("หัวชาร์จ+สายชาร์จ")}
                    className="mr-2"
                  />
                  <label htmlFor="freeGift-1" className="text-green-400">
                    หัวชาร์จ+สายชาร์จ
                  </label>
                </div>
              </div>
            )}
          />
          {errorsProduct.freeGift && (
            <span className="text-red-500 text-xs mt-1">
              กรุณาเลือกข้อมูล ชุดชาร์จ
            </span>
          )}
        </div>

        <div className="items-center col-span-3 lg:col-span-3">
          <HorizontalRule />
        </div>

        <div className="items-center col-span-3 lg:col-span-1">
          <label
            htmlFor="priceCostBuy"
            className="block text-sm font-medium text-gray-700 mr-2"
          >
            ราคาขาย (บาท/หน่วย)
            {watchProduct("hand") == "มือสอง" ? (
              <span className="text-red-400 mr-2">
                {` ราคาอยู่ระหว่าง: ${formatNumberDigit(
                  PriceStart
                )} บ. - ${formatNumberDigit(PriceEnd)} บ.`}
              </span>
            ) : null}
          </label>
          <Controller
            id="priceCostBuy"
            name="priceCostBuy"
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => (
              <input
                {...field}
                id="priceCostBuy"
                disabled={watchProduct("hand") == "มือหนึ่ง" ? true : false}
                type="number"
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : "";
                  field.onChange(value);
                  setValueProduct("priceSale", value);
                  setValueProduct("priceWholeSale", value);
                }}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errorsProduct.priceCostBuy
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
              />
            )}
          />
          {errorsProduct.priceCostBuy || watchProduct("priceCostBuy") <= 0 ? (
            <span className="text-red-500 text-xs mt-1">
              กรุณาใส่ข้อมูล ราคาขาย
            </span>
          ) : null}
        </div>

        <div className="items-center col-span-3 lg:col-span-3 border p-1 border-gray-300 rounded-md">
          <label
            htmlFor="valueMonth"
            className="block text-sm font-medium text-gray-700 mr-2"
          >
            จำนวนเดือนที่เช่า
          </label>
          <Controller
            name="valueMonth"
            control={controlProduct}
            rules={{ required: true }}
            render={({ field }) => (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-2 gap-x-4">
                {RateFinances.map((rate) => (
                  <div key={rate.id} className="flex items-center">
                    <input
                      {...field}
                      id={`valueMonth-${rate.valueMonth}`}
                      type="radio"
                      value={rate.valueMonth.toString()}
                      checked={field.value === rate.valueMonth.toString()}
                      className="mr-2"
                    />
                    <label
                      htmlFor={`valueMonth-${rate.valueMonth}`}
                      className={
                        rate.valueMonth === 6
                          ? "text-red-400"
                          : rate.valueMonth === 10
                          ? "text-green-400"
                          : "text-blue-400"
                      }
                    >
                      {rate.valueMonth} เดือน
                    </label>
                  </div>
                ))}
              </div>
            )}
          />
          {errorsProduct.valueMonth && (
            <span className="text-red-500 text-xs mt-1">
              กรุณาเลือกข้อมูล จำนวนเดือนที่เช่า
            </span>
          )}
        </div>

        <div className="items-center col-span-3 lg:col-span-3">
          <HorizontalRule />
        </div>

        {isUpload ? (
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
              control={controlProduct}
              maxFileSize={5}
              fileMultiple={true}
              setValue={setValueProduct}
            />
          </div>
        ) : null}

        {isUpload ? (
          <div className="items-center col-span-3 lg:col-span-3">
            <HorizontalRule />
          </div>
        ) : null}

        {!isEmpty(watchProduct("productImages")) ? (
          <div className="items-center col-span-3 lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="col-span-2 lg:col-span-2">
                <p className="text-2xl">รูปที่เคยอัพโหลด</p>
              </div>
              <div className="col-span-2 lg:col-span-2">
                <div className="col-span-2 lg:col-span-2">
                  <DragAndDropImages
                    images={watchProduct("productImages")}
                    submitSwitch={() => {}}
                    onDelete={() => {}}
                    showDelete={false}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const renderStepIndicator = () => {
    switch (currentStep) {
      case 1:
        return customerInfo({
          isSearch: false,
          isUpload: true,
        });
      case 2:
        return productInfo({
          isUpload: true,
        });
      case 3:
        return (
          // <fieldset disabled className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <fieldset disabled>
            {customerInfo({
              isSearch: false,
              isUpload: false,
            })}

            {productInfo({
              isUpload: false,
            })}
          </fieldset>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full grid grid-cols-1 gap-5">
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            เพิ่มรายการใหม่
          </h3>
        </div>

        <div className="flex items-center justify-center my-6 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.id
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.id}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? "text-indigo-600" : "text-gray-600"
                  }`}
                >
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block w-16 h-1 mx-4 ${
                      currentStep > step.id ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <fieldset>
          {renderStepIndicator()}
          <div className="flex justify-between p-4 border-t">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
              >
                กลับ
              </button>
            )}
            <div className="ml-auto flex gap-2">
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={
                    currentStep == 1
                      ? handleSubmitCustomer(onSubmitCustomer)
                      : handleSubmitProduct(onSubmitProduct)
                  }
                  // onClick={() => handleNext()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  // disabled={!isSearchComplete}
                >
                  ถัดไป
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmitFinancial()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                >
                  ยืนยันทำสัญญา
                </button>
              )}
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default ManageFinancial;
