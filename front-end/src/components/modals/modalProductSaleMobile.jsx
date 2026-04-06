/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty, isNumber, debounce, set } from "lodash";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { MdClose, MdOutlineClose } from "react-icons/md";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import {
  deleteProductSale,
  fetchInfoProductSale,
  notifyContactAgain,
} from "src/store/productSale";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "src/hooks/authContext";
import {
  fetchInfoProduct,
  fetchScanProduct,
  fetchSelectProduct,
} from "src/store/product";
import { fetchSelectTransport } from "src/store/transport";
import { th } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import {
  addCustomer,
  fetchInfoCustomer,
  fetchSelectCustomer,
  fetchSelectReseller,
  // fetchSelectMirrorCustomer,
  updateCustomer,
} from "src/store/customer";
import { fetchSelectRateFinance } from "src/store/rateFinance";
import { formatNumberDigit2 } from "src/helpers/formatNumber";
import { handleScanner } from "src/helpers/disabledHandleScanner";
import FileDropzone from "src/helpers/fileDropzone";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import HorizontalRule from "src/helpers/horizontalRule";
import dayjs from "src/helpers/dayjsConfig";
import { fetchSelectDefaultProductPrice } from "src/store/defaultProductPrice";
import { fetchSelectBank } from "src/store/bank";
import DragAndDropImages from "src/components/dragAndDropImages";
import { DefaultValuesCustomer } from "src/pages/customers";
import { fetchSelectProvince } from "src/store/province";
import { fetchSelectSubdistrict } from "src/store/subdistrict";
import { fetchSelectDistrict } from "src/store/district";
import { fetchSelectProductColors } from "src/store/productColor";
import { fetchSelectProductModels } from "src/store/productModel";
import { fetchSelectProductStorages } from "src/store/productStorage";
import { fetchSelectShopInsurance } from "src/store/shopInsurance";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

const ModalSale = ({ open, setModal, RowData, submitRow }) => {
  const { user, isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();
  const dispatch = useDispatch();
  const store = useSelector((state) => state.productSale);
  const modalRef = React.useRef(null);
  const container = React.useRef(null);
  const [Products, setProducts] = React.useState([]);
  const [Banks, setBanks] = React.useState([]);
  const [Customers, setCustomers] = React.useState([]);
  // const [MirrorCustomers, setMirrorCustomers] = React.useState([]);

  const [priceSale, setPriceSale] = React.useState(0);
  const [priceWholeSale, setPiceWholeSale] = React.useState(0);

  const [ProductModels, setProductModels] = React.useState([]);
  const [ProductStorages, setProductStorages] = React.useState([]);
  const [ProductColors, setProductColors] = React.useState([]);
  const [RateFinances, setRateFinances] = React.useState([]);
  const [Resellers, setResellers] = React.useState([]);

  const [Transports, setTransports] = React.useState([]);
  const [defaultPrice, setDefaultPrice] = React.useState([]);

  const [Provinces, setProvinces] = React.useState([]);
  const [Districts, setDistricts] = React.useState([]);
  const [Subdistricts, setSubdistricts] = React.useState([]);
  const [ShopInsurance, setShopInsurance] = React.useState([]);

  const [ContactCode, setContactCode] = React.useState("");
  const storeProduct = useSelector((state) => state.product);
  const storeCustomer = useSelector((state) => state.customer);
  const storeTransport = useSelector((state) => state.transport);
  const storeRateFinance = useSelector((state) => state.rateFinance);
  const storeBank = useSelector((state) => state.bank);

  const storeProductModel = useSelector((state) => state.productModel);
  const storeProductStorage = useSelector((state) => state.productStorage);
  const storeProductColor = useSelector((state) => state.productColor);

  const storeProvince = useSelector((state) => state.province);
  const storeDistrict = useSelector((state) => state.district);
  const storeSubdistricts = useSelector((state) => state.subdistrict);
  const storeShopInsurance = useSelector((state) => state.shopInsurance);

  const storeDefaultProductPrice = useSelector(
    (state) => state.defaultProductPrice,
  );

  const {
    handleSubmit: handleSubmitCustomer,
    control: controlCustomer,
    formState: { errors: errorsCustomer },
    setValue: setValueCustomer,
    reset: resetCustomer,
    watch: watchCustomer,
    trigger: triggerCustomer,
  } = useForm({
    defaultValues: {
      ...DefaultValuesCustomer,
      customerType: RowData?.isCash == "1" ? "3" : "1",
    },
  });

  const {
    handleSubmit: handleSubmitProduct,
    control: controlProduct,
    formState: { errors: errorsProduct },
    setValue: setValueProduct,
    reset: resetProduct,
    watch: watchProduct,
  } = useForm({
    defaultValues: {},
  });

  React.useEffect(() => {
    if (!isEmpty(storeProvince.select)) {
      setProvinces(
        storeProvince.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
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
        })),
      );
    }
  }, [storeDistrict.select]);

  React.useEffect(() => {
    const selectedProvinceId = watchCustomer("mDistrictId");
    if (selectedProvinceId) {
      dispatch(fetchSelectSubdistrict(selectedProvinceId));
    }
  }, [watchCustomer("mDistrictId")]);

  React.useEffect(() => {
    if (!isEmpty(storeSubdistricts.select)) {
      setSubdistricts(
        storeSubdistricts.select.map((item) => ({
          value: item.id,
          label: item.name,
          postcode: item.postcode,
        })),
      );
    }
  }, [storeSubdistricts.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProduct.select)) {
      setProducts(
        storeProduct.select.map((item) => ({
          value: item.id,
          label: `${item.code} / ${item.imei}`,
          priceSale: item.priceSale,
          priceDownPayment: item.priceDownPayment,
          priceDownPaymentPercent: item.priceDownPaymentPercent,
          priceWholeSale: item.priceWholeSale,
          payPerMonth: item.payPerMonth,
          valueMonth: item.valueMonth,
        })),
      );
    } else {
      setProducts([]);
    }
  }, [storeProduct.select]);

  React.useEffect(() => {
    if (!isEmpty(storeBank.select)) {
      setBanks(
        storeBank.select.map((item) => ({
          value: item.id,
          label: `${item.bankOwner}, ${item.bankName} (${item.bankNo})`,
        })),
      );
    } else {
      setBanks([]);
    }
  }, [storeBank.select]);

  React.useEffect(() => {
    if (!isEmpty(storeTransport.select)) {
      setTransports(
        storeTransport.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    }
  }, [storeTransport.select]);

  React.useEffect(() => {
    if (!isEmpty(storeDefaultProductPrice.select)) {
      setDefaultPrice(
        storeDefaultProductPrice.select.map((item) => ({
          label: item.label,
          value: item.value,
        })),
      );
    }
  }, [storeDefaultProductPrice.select]);

  React.useEffect(() => {
    if (!isEmpty(storeRateFinance.select)) {
      setRateFinances(
        storeRateFinance.select.map((item) => ({
          value: item.id,
          label: item.name,
          valueMonth: item.valueMonth,
          valueEqual: item.valueEqual,
        })),
      );
    }
  }, [storeRateFinance.select]);

  React.useEffect(() => {
    if (!isEmpty(storeCustomer.select)) {
      setCustomers(
        storeCustomer.select.map((c) => ({
          value: c.id,
          label: `${c.name} ${c.lastname} (${c.citizenIdCard})`,
          customer: c, // เก็บ object ไว้เติมฟอร์ม
        })),
      );
    }
  }, [storeCustomer.select]);

  React.useEffect(() => {
    if (!isEmpty(storeCustomer.selectReseller)) {
      setResellers(
        storeCustomer.selectReseller.map((c) => ({
          value: c.id,
          label: `${c.name} ${c.lastname} (${c.citizenIdCard})`,
          customer: c, // เก็บ object ไว้เติมฟอร์ม
        })),
      );
    }
  }, [storeCustomer.selectReseller]);

  // React.useEffect(() => {
  //   if (!isEmpty(storeCustomer.selectMirror)) {
  //     setMirrorCustomers(
  //       storeCustomer.selectMirror.map((item) => ({
  //         value: item.id,
  //         label: `${item.name} ${item.lastname} (${item.citizenIdCard})`,
  //       }))
  //     );
  //   }
  // }, [storeCustomer.selectMirror]);

  const loadOptionsCustomer = React.useCallback(
    debounce((inputValue, callback) => {
      if (!inputValue) {
        callback([]);
        return;
      }

      dispatch(
        fetchSelectCustomer({
          branchId: user.branchId,
          customerType: ["1", "3", "4"],
          search: inputValue,
        }),
      )
        .unwrap()
        .then((result) => {
          const options = result.map((customer) => ({
            value: customer.id,
            label: `${customer.name} ${customer.lastname} (${customer.citizenIdCard})`,
          }));
          callback(options);
        })
        .catch((error) => {
          console.error("Load options error:", error);
          callback([]);
        });
    }, 500),
    [dispatch, user.branchId],
  );

  const loadOptionsReseller = React.useCallback(
    debounce((inputValue, callback) => {
      if (!inputValue) {
        callback([]);
        return;
      }

      dispatch(
        fetchSelectReseller({
          branchId: user.branchId,
          customerType: ["1", "3", "4"],
          search: inputValue,
        }),
      )
        .unwrap()
        .then((result) => {
          const options = result.map((customer) => ({
            value: customer.id,
            label: `${customer.name} ${customer.lastname} (${customer.citizenIdCard})`,
          }));
          callback(options);
        })
        .catch((error) => {
          console.error("Load options error:", error);
          callback([]);
        });
    }, 500),
    [dispatch, user.branchId],
  );

  // const loadOptionsMirrorCustomer = React.useCallback(
  //   debounce((inputValue, callback) => {
  //     if (!inputValue) {
  //       callback([]);
  //       return;
  //     }

  //     dispatch(
  //       fetchSelectMirrorCustomer({
  //         branchId: user.branchId,
  //         customerType: ["1", "3"],
  //         search: inputValue,
  //       })
  //     )
  //       .unwrap()
  //       .then((result) => {
  //         const options = result.map((customer) => ({
  //           value: customer.id,
  //           label: `${customer.name} ${customer.lastname} (${customer.citizenIdCard})`,
  //         }));
  //         callback(options);
  //       })
  //       .catch((error) => {
  //         console.error("Load options error:", error);
  //         callback([]);
  //       });
  //   }, 500),
  //   [dispatch, user.branchId]
  // );

  const changeTypePrice = (priceType) => {
    if (isNumber(watch("productId"))) {
      if (watch("isClaim") == "1") {
        setValue("priceSale", 0);
      } else {
        const product = Products.find((e) => e.value == watch("productId"));

        setValue(
          "priceSale",
          priceType == "1" ? product.priceWholeSale : product.priceSale,
        );
      }
    }
  };

  const loadOptionsProduct = React.useCallback(
    debounce((inputValue, callback) => {
      if (!inputValue) {
        callback([]);
        return;
      }

      let active = "1";

      if (isNumber(RowData.productBookId)) {
        active = isEmpty(RowData.product) ? "1" : "6";
      }

      if (isNumber(RowData.productSavingId)) {
        active = isEmpty(RowData.product) ? "1" : "7";
      }

      dispatch(
        fetchScanProduct({
          branchId: user.branchId,
          catalog: "มือถือ",
          search: inputValue,
          active: active,
        }),
      )
        .unwrap()
        .then((result) => {
          if (!isEmpty(result)) {
            const options = result?.map((item) => ({
              value: item.id,
              label: `${item.code} / ${item.imei}`,
              priceSale: item.priceSale,
              priceDownPayment: item.priceDownPayment,
              priceDownPaymentPercent: item.priceDownPaymentPercent,
              priceWholeSale: item.priceWholeSale,
              payPerMonth: item.payPerMonth,
              valueMonth: item.valueMonth,
            }));
            setProducts((prev) => {
              const newOptions = options.filter(
                (opt) => !prev.some((p) => p.value === opt.value),
              );
              return [...prev, ...newOptions];
            });
            callback(options);
          } else {
            callback([]);
          }
        })
        .catch((error) => {
          console.error("Load options error:", error);
          callback([]);
        });
    }, 500),
    [dispatch, user.branchId],
  );

  const handleSearch = (value) => {
    setContactCode(value);
    if (!isEmpty(value)) {
      debouncedFetch(value, () => {});
    }
  };

  const calculateProductSaleListsTotal = (items) => {
    const total = items.reduce((sum, item) => {
      // ตรวจสอบเงื่อนไข isFree
      const priceSale = item.isFree === "1" ? 0 : item.priceSale;
      // คูณกับ amount (แปลงเป็น number ถ้าจำเป็น)
      const itemTotal =
        priceSale * Number(item.amount) - Number(item.priceDiscount);
      return sum + itemTotal;
    }, 0);

    return total;
  };

  React.useEffect(() => {
    if (!isEmpty(storeProductStorage.select)) {
      setProductStorages(
        storeProductStorage.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    } else {
      dispatch(fetchSelectProductStorages());
    }
  }, [storeProductStorage.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductColor.select)) {
      setProductColors(
        storeProductColor.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    } else {
      dispatch(fetchSelectProductColors());
    }
  }, [storeProductColor.select]);

  React.useEffect(() => {
    if (!isEmpty(storeProductModel.select)) {
      setProductModels(
        storeProductModel.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      );
    } else {
      dispatch(fetchSelectProductModels(["มือถือ"]));
    }
  }, [storeProductModel.select]);

  const debouncedFetch = React.useCallback(
    debounce((inputValue, callback) => {
      const productSaleLists = getValues("productSaleLists") || [];
      const existingProduct = productSaleLists.find(
        (item) => item.code === inputValue,
      );

      if (existingProduct) {
        const updatedproductBuyLists = productSaleLists.map((item) =>
          item.code === inputValue
            ? { ...item, amount: item.amount + 1 }
            : item,
        );
        setValue("productSaleLists", updatedproductBuyLists, {
          shouldDirty: true,
        });
        callback(existingProduct);
        setContactCode("");
        return;
      }

      setIsLoadingOpen(true);
      dispatch(
        fetchScanProduct({
          branchId: user.branchId,
          search: inputValue.trim(),
          catalog: watch("isMobileSale") == "1" ? "อุปกรณ์เสริม" : "",
          active: "1",
        }),
      )
        .unwrap()
        .then((result) => {
          if (!result?.message_error) {
            const newProduct = {
              code: inputValue,
              productName: `${result.productBrand?.name || ""}, ${
                result.productModel?.name || ""
              }, ${result.productColor?.name || ""}`,
              productId: result.id,
              catalog: result.catalog,
              amount: 1,
              priceDiscount: 0,
              defaultPriceSale: result.priceSale,
              // priceSale: watch("isMobileSale") == "1" ? 0 : result.priceSale,
              priceSale: result.priceSale,
              priceCostBuy: result.priceCostBuy,
              // isFree: watch("isMobileSale") == "1" ? "1" : "0",
              isFree: "0",
            };
            setValue("productSaleLists", [...productSaleLists, newProduct], {
              shouldDirty: true,
            });
            callback(newProduct);
            setContactCode("");
          } else {
            setContactCode("");
            callback(null);
          }
        })
        .catch((error) => {
          console.error("Load options error:", error);
          callback(null);
        })
        .finally(() => setIsLoadingOpen(false));
    }, 500),
    [dispatch],
  );

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (RowData.isMobileSale == "1") {
        if (isEmpty(storeDistrict.select)) {
          dispatch(fetchSelectProvince());
        }

        if (isNumber(RowData.productBookId)) {
          dispatch(
            fetchSelectProduct({
              branchId: user.branchId,
              catalog: "มือถือ",
              search: RowData.product?.imei || "",
              active: RowData.product == undefined ? "1" : "6",
            }),
          );

          dispatch(
            fetchSelectCustomer({
              branchId: user.branchId,
              customerType: ["1", "3", "4"],
              search: RowData.customerId,
            }),
          );

          dispatch(
            fetchSelectReseller({
              branchId: user.branchId,
              customerType: ["1", "3", "4"],
              search: RowData.resellerId,
            }),
          );

          // dispatch(
          //   fetchSelectMirrorCustomer({
          //     branchId: user.branchId,
          //     customerType: ["1", "3"],
          //     search: RowData.customerMirrorId,
          //   })
          // );
        } else if (isNumber(RowData.productSavingId)) {
          dispatch(
            fetchSelectProduct({
              branchId: user.branchId,
              catalog: "มือถือ",
              search: RowData.product?.imei || "",
              active: RowData.product == undefined ? "1" : "7",
            }),
          );

          dispatch(
            fetchSelectCustomer({
              branchId: user.branchId,
              customerType: ["1", "3", "4"],
              search: RowData.customerId,
            }),
          );

          dispatch(
            fetchSelectReseller({
              branchId: user.branchId,
              customerType: ["1", "3", "4"],
              search: RowData.resellerId,
            }),
          );

          // dispatch(
          //   fetchSelectMirrorCustomer({
          //     branchId: user.branchId,
          //     customerType: ["1", "3"],
          //     search: RowData.customerMirrorId,
          //   })
          // );
        } else {
          // console.log(RowData);

          if (RowData.customerId) {
            dispatch(fetchInfoCustomer(RowData.customerId)).then((res) => {
              const { payload } = res;

              if (!isEmpty(payload)) {
                resetCustomer(payload);
              }
            });
          } else {
            resetCustomer({
              ...DefaultValuesCustomer,
              customerType: RowData?.isCash == "1" ? "3" : "1",
            });
          }

          if (RowData.productId) {
            dispatch(fetchInfoProduct(RowData.productId)).then((res) => {
              const { payload } = res;

              if (!isEmpty(payload)) {
                resetProduct(payload);
              } else {
                resetProduct(payload);
              }
            });
          }

          dispatch(
            fetchSelectProduct({
              branchId: user.branchId,
              catalog: "มือถือ",
              search: RowData.id == undefined ? "" : RowData.product.imei,
              active: RowData.id == undefined ? "1" : "3",
            }),
          );

          dispatch(
            fetchSelectCustomer({
              branchId: user.branchId,
              customerType: ["1", "3", "4"],
              search: RowData.id == undefined ? "" : RowData.customerId,
            }),
          );

          dispatch(
            fetchSelectReseller({
              branchId: user.branchId,
              customerType: ["1", "3", "4"],
              search: RowData.resellerId,
            }),
          );

          // dispatch(
          //   fetchSelectMirrorCustomer({
          //     branchId: user.branchId,
          //     customerType: ["1", "3"],
          //     search: RowData.id == undefined ? "" : RowData.customerMirrorId,
          //   })
          // );
        }
      }
      resetCustomer({
        ...DefaultValuesCustomer,
        customerType: RowData?.isCash == "1" ? "3" : "1",
      });

      if (isEmpty(storeDefaultProductPrice.select)) {
        dispatch(fetchSelectDefaultProductPrice());
      }

      if (isEmpty(storeTransport.select)) {
        dispatch(fetchSelectTransport());
      }

      if (isEmpty(storeRateFinance.select)) {
        dispatch(fetchSelectRateFinance());
      }

      if (isEmpty(storeShopInsurance.select)) {
        dispatch(fetchSelectShopInsurance());
      }

      dispatch(fetchSelectBank(RowData.isMobileSale == "1" ? "1" : "3"));

      modalRef.current.focus();

      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      } else {
        reset(RowData);
      }
    }
  }, [open]);

  React.useEffect(() => {
    if (!isEmpty(storeShopInsurance.select)) {
      setShopInsurance(storeShopInsurance.select);
    }
  }, [storeShopInsurance.select]);

  const notifyContact = (type) => {
    setIsLoadingOpen(true);
    dispatch(notifyContactAgain({ id: watch("id"), type }))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  React.useEffect(() => {
    if (!isEmpty(store.data)) {
      // let rateFinanceId = store.data.rateFinanceId;
      // if (store.data?.id && RowData?.id) {
      //   const rateFinance = RateFinances.find(
      //     (e) => e.valueMonth == store.data?.valueMonth
      //   );
      //   rateFinanceId = rateFinance?.value || "";
      // }
      const productSaleImages =
        store.data.productSaleImages.filter((file) => file.type == "1") || [];

      const productSaleImagesCustomer =
        store.data.productSaleImages.filter((file) => file.type == "2") || [];

      reset({
        ...store.data,
        create_date: store.data?.create_date
          ? new Date(store.data?.create_date)
          : new Date(),
        productSaleImages: productSaleImages,
        productSaleImagesCustomer: productSaleImagesCustomer,
      });
    }
  }, [store]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoProductSale(id))
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
    getValues,
  } = useForm({
    defaultValues: RowData,
  });

  const { fields } = useFieldArray({
    control,
    name: "productPayMentLists",
  });

  const calculateTotal = React.useCallback((values, onTotalCalculated) => {
    let total = 0;
    if (values.saleType === "1" || values.saleType === "2") {
      total =
        Number(
          Number(values.priceSale || 0) +
            Number(values.priceReRider || 0) +
            Number(values.priceRegAppleId || 0),
        ) - Number(values.priceDiscount || 0);
    } else {
      total =
        Number(
          Number(values.priceAdjusted || 0) +
            Number(values.priceReRider || 0) +
            Number(values.priceRegAppleId || 0),
        ) - Number(values.priceDiscount || 0);
    }

    const priceEquipSum = calculateProductSaleListsTotal(
      values.productSaleLists || [],
    );

    setValue("priceEquipSum", priceEquipSum);

    total += priceEquipSum;
    onTotalCalculated(total);
  }, []);

  const debouncedCalculate = React.useCallback(
    debounce((values) => {
      calculateTotal(values, (total) => {
        setValue("priceTotalPaid", total, { shouldValidate: false });
      });
    }, 300),
    [setValue], // เพิ่ม setValue เพราะใช้งานในนี้
  );

  // Watch เฉพาะ fields ที่เกี่ยวข้อง
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      // เช็คว่า field ที่เปลี่ยนเกี่ยวข้องกับการคำนวณหรือไม่
      const relevantFields = [
        "saleType",
        "priceSale",
        "priceType",
        "priceReRider",
        "priceRegAppleId",
        "priceAdjusted",
        "priceDiscount",
        "priceBeforeAdjusted",
        "productSaleLists",
        "isMobileSale",
        "productId",
        "priceDownType",
      ];

      const isRelevantField =
        relevantFields.includes(name) || // กรณี field หลัก
        (name && name.startsWith("productSaleLists")); // กรณี nested field เช่น productSaleLists[0].priceSale

      if (isRelevantField) {
        debouncedCalculate(value);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedCalculate]); // dependencies เดิม + debouncedCalculate

  const changePriceDownType = () => {
    if (isNumber(watch("productId"))) {
      const product = Products.find((e) => e.value == watch("productId"));

      calInitProduct(
        product.priceSale,
        product.priceDownPayment,
        product.priceDownPaymentPercent,
        watch("valueEqual"),
      );
    }
  };

  // ฟังก์ชันปัดหลักหน่วยของจำนวนเต็ม
  const roundUnitDigit = (num) => {
    const unitDigit = num % 10; // หาหลักหน่วย
    const base = Math.floor(num / 10) * 10; // ตัดหลักหน่วย
    if (unitDigit <= 5) {
      return base; // ปัดเป็น 0
    } else {
      return base + 10; // ปัดเป็น 10
    }
  };

  const listFinance = () => {
    if (import.meta.env.VITE_SYSTEM_NAME == "THUNDER") {
      if (isNumber(watch("rateFinanceId"))) {
        const priceSumAdjusted = watch("priceSumAdjusted"); // เช่น 65016
        const valueMonth = watch("valueMonth"); // เช่น 6

        // คำนวณผลหารต่อเดือนและปัดหลักหน่วย
        const monthlyPayment = roundUnitDigit(
          Math.floor(priceSumAdjusted / valueMonth),
        ); // เช่น 10836 -> 10840
        const adjustedTotal = monthlyPayment * valueMonth; // เช่น 10840 * 6 = 65040

        const generatePaymentList = () =>
          Array.from({ length: valueMonth }, (_, i) => ({
            datePay: dayjs(watch("caseDate"))
              .add(i + 1, "month")
              .format("YYYY-MM-DD"),
            price: formatNumberDigit2(
              watch("useCalType") === "1"
                ? monthlyPayment // ใช้ผลหารที่ปัดแล้ว
                : watch("payPerMonth"),
            ),
          }));

        // อัปเดต priceSumAdjusted และ productPayMentLists
        setValue("priceSumAdjusted", adjustedTotal);
        setValue("productPayMentLists", generatePaymentList());
      }
    } else {
      if (isNumber(watch("rateFinanceId"))) {
        const priceSumAdjusted = watch("priceSumAdjusted"); // เช่น 58000
        const valueMonth = watch("valueMonth"); // เช่น 6

        const generatePaymentList = () =>
          Array.from({ length: valueMonth }, (_, i) => ({
            datePay: dayjs(watch("caseDate"))
              .add(i + 1, "month")
              .format("YYYY-MM-DD"),
            price: formatNumberDigit2(
              watch("useCalType") === "1"
                ? dynamicRound(priceSumAdjusted / valueMonth) // คำนวณต่อเดือนและปรับ
                : watch("payPerMonth"),
            ),
          }));

        // ปรับ priceSumAdjusted ให้ครอบคลุมการชำระทั้งหมด
        const adjustedTotal =
          dynamicRound(priceSumAdjusted / valueMonth) * valueMonth;
        setValue("priceSumAdjusted", adjustedTotal);
        setValue("productPayMentLists", generatePaymentList());
      }
    }
  };

  // ฟังก์ชัน dynamicRound
  const dynamicRound = (num) => (num % 1 > 0 ? Math.ceil(num) + 2 : num);

  const calInitProduct = (
    priceSale,
    priceDownPayment,
    priceDownPaymentPercent,
    valueEqual,
  ) => {
    let priceAdjusted = Number(priceDownPayment);
    if (watch("priceDownType") == "1") {
      // ใช้ %
      // Calculate the initial priceAdjusted
      priceAdjusted =
        (Number(priceSale) / 100) * Number(priceDownPaymentPercent);

      // Check if the number ends in "00"
      if (priceAdjusted % 100 != 0) {
        priceAdjusted = Math.ceil(priceAdjusted / 100) * 100;
      }

      setValue("priceDownPayment", Number(priceAdjusted));
    } else {
      setValue("priceDownPayment", Number(priceDownPayment));
    }

    const sum = Number(priceSale) - Number(priceAdjusted);
    setValue("priceAdjusted", priceAdjusted);

    setValue("priceBeforeAdjusted", sum || 0);
    if (watch("useCalType") == "1") {
      setValue("priceSumAdjusted", sum * Number(valueEqual));
    } else {
      // ยอดก่อนจัด
      const calSum = sum * Number(valueEqual);
      // ยอดหลังจัด
      const calSumMonth =
        Number(watch("payPerMonth")) * Number(watch("valueMonth"));
      // ยอดหลังจัด
      setValue("priceSumAdjusted", calSumMonth + calSum);
    }

    listFinance();
  };

  const onSubmit = async (data) => {
    const customerSubmitHandler = async (customerData) => {
      if (customerData.id) {
        await dispatch(updateCustomer(customerData)).unwrap();
        submitRow(data);
      } else {
        const result = await dispatch(addCustomer(customerData)).unwrap();
        if (!isEmpty(result.data)) {
          resetCustomer(result.data);
          submitRow({
            ...data,
            customerId: result.data.id,
          });
        }
      }
    };

    const isValid = await triggerCustomer();
    if (isValid) {
      await handleSubmitCustomer(customerSubmitHandler)();
    }
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
        className={`relative w-full`}
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
          <div className="p-2 grid grid-cols-1 lg:grid-cols-4 gap-4">
            {permissions.includes("edit-contract") && watch("id") ? (
              <div className="items-center col-span-4 lg:col-span-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {["3", "4"].includes(watch("saleType")) ? (
                    <div className="col-span-4">
                      <h2 className="text-red-500">สิทธิการแก้ไขสัญญา</h2>
                    </div>
                  ) : null}

                  {watch("isMobileSale") == "1" &&
                  ["3", "4"].includes(watch("saleType")) ? (
                    <div className="items-center col-span-3 md:col-span-3 lg:col-span-3">
                      <label
                        htmlFor="randomCode"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        สุ่มรหัสสัญญา
                      </label>
                      <Controller
                        name="randomCode"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-4">
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
                              <label
                                htmlFor="randomCode-0"
                                className="text-red-400"
                              >
                                ใช้สัญญาเดิม
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
                              <label
                                htmlFor="randomCode-1"
                                className="text-blue-400"
                              >
                                สร้างสัญญาใหม่
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
                  ) : null}

                  {watch("isMobileSale") == "1" &&
                  ["3", "4"].includes(watch("saleType")) ? (
                    <div className="items-center col-span-1 md:col-span-1 lg:col-span-1">
                      {watch("randomCode") === "1" ? null : (
                        <div>
                          <label
                            htmlFor="code"
                            className="block text-sm font-medium text-gray-700 mr-2"
                          >
                            รหัสสัญญา
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
                                  errors.code
                                    ? "border-red-500"
                                    : "border-gray-300"
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
                  ) : null}

                  {watch("isMobileSale") == "1" &&
                  ["3", "4"].includes(watch("saleType")) ? (
                    <div className="items-center col-span-4 lg:col-span-2">
                      <label
                        htmlFor="create_date"
                        className="block text-sm font-medium text-gray-700"
                      >
                        แก้ไขวันที่ทำรายการ
                      </label>
                      <Controller
                        name="create_date"
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <DatePicker
                            selected={field.value}
                            locale={th}
                            onChange={(date) => field.onChange(date)}
                            timeZone="Asia/Bangkok"
                            dateFormat="dd/MM/yyyy HH:mm"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={1}
                            className="w-full p-1.5 border border-gray-300 rounded-md mt-1"
                            placeholderText="เลือกวันที่และเวลา"
                            minDate={dayjs()
                              .subtract(1, "month")
                              .startOf("month")
                              .toDate()}
                            maxDate={dayjs().toDate()}
                          />
                        )}
                      />

                      {errors.create_date && (
                        <p className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล วันที่ทำรายการ
                        </p>
                      )}
                    </div>
                  ) : null}

                  {watch("isMobileSale") == "1" &&
                  watch("id") &&
                  ["3", "4"].includes(watch("saleType")) ? (
                    <div className="grid justify-items-end col-span-4 lg:col-span-2">
                      <label
                        htmlFor="caseDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        แก้ไขวันที่นัดชำระ
                      </label>
                      <Controller
                        name="caseDate"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <DatePicker
                            selected={field.value}
                            locale={th}
                            onChange={(date) => {
                              field.onChange(date);
                              listFinance();
                            }}
                            dateFormat="dd/MM/yyyy"
                            timeZone="Asia/Bangkok"
                            className="w-full p-1.5 border border-gray-300 rounded-md mt-1"
                            placeholderText="เลือกวันที่"
                            minDate={dayjs().subtract(5, "month").toDate()}
                            maxDate={dayjs().add(10, "days").toDate()} // ห้ามเลือกวันที่7 วันจากปัจจุบัน
                          />
                        )}
                      />
                    </div>
                  ) : null}

                  <div className="items-center col-span-4">
                    <HorizontalRule />
                  </div>
                </div>
              </div>
            ) : null}

            {watch("id") && ["3", "4"].includes(watch("saleType")) ? (
              <div className="items-center col-span-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => notifyContact("lock")}
                    type="button"
                    className="w-full py-2 px-5 text-sm text-white bg-blue-400 rounded-lg border border-blue-400 hover:bg-blue-500"
                  >
                    แจ้งเตือน Lock สัญญา
                  </button>
                  <button
                    type="button"
                    onClick={() => notifyContact("unlock")}
                    className="w-full py-2 px-5 text-sm text-white bg-yellow-400 rounded-lg border border-yellow-400 hover:bg-yellow-500"
                  >
                    แจ้งเตือน Unlock สัญญา
                  </button>
                </div>
              </div>
            ) : null}

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
                      disabled={
                        watch("saleType") == 2 || watch("saleType") == 4
                          ? true
                          : false
                      }
                      checked={field.value === "1"}
                      onChange={() => {
                        field.onChange("1");
                        if (isNaN(RowData.id)) {
                          setValue("bankId", null);
                          setValue("priceCash", 0);
                          setValue("priceTransferCash", 0);
                        }
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
                        if (isNaN(RowData.id)) {
                          setValue("bankId", null);
                          setValue("priceCash", 0);
                          setValue("priceTransferCash", 0);
                        }
                      }}
                      className="mr-2 ml-4"
                    />
                    <label htmlFor="payType-2" className="text-green-500">
                      เงินโอน
                    </label>

                    <input
                      {...field}
                      id="payType-3"
                      type="radio"
                      value="3"
                      disabled={
                        watch("saleType") == 2 || watch("saleType") == 4
                          ? true
                          : false
                      }
                      checked={field.value === "3"}
                      onChange={() => {
                        field.onChange("3");
                        if (isNaN(RowData.id)) {
                          setValue("bankId", null);
                          setValue("priceCash", 0);
                          setValue("priceTransferCash", 0);
                        }
                      }}
                      className="mr-2 ml-4"
                    />
                    <label htmlFor="payType-3" className="text-yellow-500">
                      สด+โอน
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

            {permissions.includes("edit-appleId") &&
            watch("isMobileSale") == "1" &&
            watch("saleType") == "1" &&
            watch("saleType") == "2" ? (
              <div className="items-center col-span-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                  <div className="items-center col-span-3 lg:col-span-1">
                    <label
                      htmlFor="shopAppID"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      AppleID ร้าน
                    </label>
                    <Controller
                      id="shopAppID"
                      name="shopAppID"
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="shopAppID"
                          type="text"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.shopAppID
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                      )}
                    />
                  </div>

                  <div className="items-center col-span-3 lg:col-span-1">
                    <label
                      htmlFor="shopPass"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      รหัสผ่าน ร้าน
                    </label>
                    <Controller
                      id="shopPass"
                      name="shopPass"
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="shopPass"
                          type="text"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.shopPass
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                      )}
                    />
                  </div>

                  <div className="items-center col-span-3 lg:col-span-1">
                    <label
                      htmlFor="shopPin"
                      className="block text-sm font-medium text-blue-700 mr-2 cursor-pointer"
                      onClick={() =>
                        setValue(
                          "shopPin",
                          String(Math.floor(Math.random() * 10000)).padStart(
                            4,
                            "0",
                          ),
                        )
                      }
                    >
                      รหัสล็อคหน้าจอ ร้าน
                    </label>
                    <Controller
                      id="shopPin"
                      name="shopPin"
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="shopPin"
                          disabled
                          type="text"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.rentPin
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {watch("payType") == "2" || watch("payType") == "3" ? (
              <div className="items-center col-span-4 lg:col-span-4">
                <label
                  htmlFor="bankId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  โอนเข้าธนาคาร
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
                        Banks.find((option) => option.value === field.value) ||
                        ""
                      }
                      onChange={(selectedOption) => {
                        field.onChange(
                          selectedOption ? selectedOption.value : "",
                        );
                      }}
                    />
                  )}
                />

                {errors.bankId && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาใส่ข้อมูล โอนเข้าธนาคาร
                  </span>
                )}
              </div>
            ) : null}

            <fieldset
              disabled={RowData.id ? true : false}
              className="items-center col-span-4 grid grid-cols-1 lg:grid-cols-4 gap-4"
            >
              <div className="items-center col-span-4 lg:col-span-3">
                <label
                  htmlFor="saleType"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ประเภทการขาย
                </label>
                <Controller
                  name="saleType"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                      {watch("isCash") == "1" && (
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center">
                            <input
                              {...field}
                              id="saleType-1"
                              type="radio"
                              value="1"
                              checked={field.value === "1"}
                              onChange={() => {
                                reset({
                                  ...RowData,
                                  saleType: "1",
                                  payType: "1",
                                  priceType: "1",
                                });
                              }}
                              className="mr-2"
                            />
                            <label
                              htmlFor="saleType-1"
                              className="text-red-500 whitespace-nowrap"
                            >
                              ขายหน้าร้าน
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              {...field}
                              id="saleType-2"
                              type="radio"
                              value="2"
                              checked={field.value === "2"}
                              onChange={() => {
                                reset({
                                  ...RowData,
                                  saleType: "2",
                                  payType: "2",
                                  priceType: "2",
                                });
                              }}
                              className="mr-2"
                            />
                            <label
                              htmlFor="saleType-2"
                              className="text-green-500 whitespace-nowrap"
                            >
                              ขายออนไลน์
                            </label>
                          </div>
                        </div>
                      )}

                      {watch("isCash") == "0" && (
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center">
                            <input
                              {...field}
                              id="saleType-3"
                              type="radio"
                              value="3"
                              checked={field.value === "3"}
                              onChange={() => {
                                reset({
                                  ...RowData,
                                  saleType: "3",
                                  payType: "2",
                                  priceType: "2",
                                });
                              }}
                              className="mr-2"
                            />
                            <label
                              htmlFor="saleType-3"
                              className="text-green-500 whitespace-nowrap"
                            >
                              เช่าหน้าร้าน
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              {...field}
                              id="saleType-4"
                              type="radio"
                              value="4"
                              checked={field.value === "4"}
                              onChange={() => {
                                reset({
                                  ...RowData,
                                  saleType: "4",
                                  payType: "2",
                                  priceType: "2",
                                });
                              }}
                              className="mr-2"
                            />
                            <label
                              htmlFor="saleType-4"
                              className="text-green-500 whitespace-nowrap"
                            >
                              เช่าออนไลน์
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                />
                {errors.saleType && (
                  <span className="text-red-500 text-xs mt-1">
                    กรุณาเลือกข้อมูล ประเภทการขาย
                  </span>
                )}
              </div>

              {watch("isMobileSale") == "1" ? (
                <div className="items-center col-span-4">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {watch("saleType") == "2" ? (
                      <div className="items-center col-span-4 lg:col-span-4">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                          <div className="items-center col-span-4 lg:col-span-2">
                            <label
                              htmlFor="transportId"
                              className="block text-sm font-medium text-gray-700 mr-2"
                            >
                              ขนส่ง
                            </label>
                            <Controller
                              id="transportId"
                              name="transportId"
                              control={control}
                              rules={{ required: false }}
                              render={({ field }) => {
                                return (
                                  <Select
                                    {...field}
                                    id="transportId"
                                    options={Transports}
                                    placeholder="กรุณาเลือกขนส่ง"
                                    isClearable
                                    isSearchable
                                    classNamePrefix="react-select"
                                    value={
                                      Transports.find(
                                        (option) =>
                                          option.value === field.value,
                                      ) || ""
                                    }
                                    onChange={(selectedOption) => {
                                      field.onChange(
                                        selectedOption?.value || "",
                                      );
                                    }}
                                  />
                                );
                              }}
                            />
                          </div>

                          <div className="items-center col-span-4 lg:col-span-2">
                            <label
                              htmlFor="tackingNumber"
                              className="block text-sm font-medium text-gray-700 mr-2"
                            >
                              เลขติดตามสินค้า
                            </label>
                            <Controller
                              id="tackingNumber"
                              name="tackingNumber"
                              control={control}
                              rules={{ required: false }}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  id="tackingNumber"
                                  type="text"
                                  className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.tackingNumber
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className="items-center col-span-4">
                      <label
                        htmlFor="customerId"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        ลูกค้า/บัตรประชาชน/เลขผู้เสียภาษี
                      </label>
                      <Controller
                        id="customerId"
                        name="customerId"
                        control={control}
                        rules={{ required: false }}
                        render={({ field }) => (
                          <AsyncSelect
                            {...field}
                            menuPortalTarget={document.body}
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 11 }),
                            }}
                            id="customerId"
                            defaultOptions={Customers}
                            loadOptions={loadOptionsCustomer}
                            placeholder="กรุณาเลือกลูกค้า"
                            isClearable
                            isSearchable
                            classNamePrefix="react-select"
                            noOptionsMessage={({ inputValue }) =>
                              inputValue?.trim()
                                ? `ไม่พบข้อมูล "${inputValue.trim()}" — กรอกฟิลด์ด้านล่างเพื่อสร้างลูกค้าใหม่`
                                : "พิมพ์เพื่อค้นหา"
                            }
                            value={
                              Customers.find(
                                (option) => option.value === field.value,
                              ) || ""
                            }
                            onChange={(selectedOption) => {
                              if (selectedOption) {
                                const { customer } = selectedOption;
                                resetCustomer(customer);
                                field.onChange(selectedOption?.value || "");
                              } else {
                                resetCustomer({
                                  ...DefaultValuesCustomer,
                                  customerType:
                                    watch("isCash") == "1" ? "3" : "1",
                                });
                                field.onChange("");
                              }
                            }}
                          />
                        )}
                      />

                      {errors.customerId && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล ลูกค้า / บัตรประชาชน
                        </span>
                      )}
                    </div>

                    <div className="items-center col-span-4">
                      <fieldset
                        disabled={watch("customerId") ? true : false}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                      >
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
                            control={controlCustomer}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <input
                                {...field}
                                id="name"
                                type="text"
                                className={`mt-1 block w-full px-3 py-2 border ${
                                  errorsCustomer.name
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                              />
                            )}
                          />
                          {errorsCustomer.name && (
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
                            control={controlCustomer}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <input
                                {...field}
                                id="lastname"
                                type="text"
                                className={`mt-1 block w-full px-3 py-2 border ${
                                  errorsCustomer.lastname
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                              />
                            )}
                          />
                          {errorsCustomer.lastname && (
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
                            {watch("customerType") == "1" ||
                            watch("customerType") == "3"
                              ? "เลขประจำตัวประชาชน"
                              : "เลขผู้เสียภาษี/เลขประจำตัวประชาชน"}
                          </label>
                          <Controller
                            id="citizenIdCard"
                            name="citizenIdCard"
                            control={controlCustomer}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <input
                                {...field}
                                id="citizenIdCard"
                                type="number"
                                className={`mt-1 block w-full px-3 py-2 border ${
                                  errorsCustomer.citizenIdCard
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                              />
                            )}
                          />
                          {errorsCustomer.citizenIdCard && (
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
                            control={controlCustomer}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <input
                                {...field}
                                id="tel"
                                type="text"
                                className={`mt-1 block w-full px-3 py-2 border ${
                                  errorsCustomer.tel
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                              />
                            )}
                          />
                          {errorsCustomer.tal && (
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
                            control={controlCustomer}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <input
                                {...field}
                                id="facebook"
                                type="text"
                                className={`mt-1 block w-full px-3 py-2 border ${
                                  errorsCustomer.facebook
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                              />
                            )}
                          />
                          {errorsCustomer.facebook && (
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
                                  errorsCustomer.googleMap
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                              />
                            )}
                          />
                          {errorsCustomer.googleMap && (
                            <span className="text-red-500 text-xs mt-1">
                              กรุณาใส่ข้อมูล ที่อยู่
                            </span>
                          )}
                        </div>
                        <div className="items-center sm:col-span-2 lg:col-span-2">
                          <label
                            htmlFor="address"
                            className="block text-sm font-medium text-gray-700 mr-2"
                          >
                            ที่อยู่
                          </label>
                          <Controller
                            id="address"
                            name="address"
                            control={controlCustomer}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <input
                                {...field}
                                id="address"
                                type="text"
                                className={`mt-1 block w-full px-3 py-2 border ${
                                  errorsCustomer.address
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                              />
                            )}
                          />
                          {errorsCustomer.address && (
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
                            control={controlCustomer}
                            rules={{ required: true }}
                            render={({ field }) => {
                              return (
                                <Select
                                  {...field}
                                  menuPortalTarget={document.body}
                                  styles={{
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 11,
                                    }),
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
                                      (option) => option.value === field.value,
                                    ) || ""
                                  }
                                  onChange={(selectedOption) => {
                                    field.onChange(
                                      selectedOption
                                        ? selectedOption.value
                                        : "",
                                    );

                                    setValue("mDistrictId", "");
                                    setValue("mSubdistrictId", "");
                                    setValue("zipCode", "");
                                  }}
                                />
                              );
                            }}
                          />
                          {errorsCustomer.mProvinceId && (
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
                            control={controlCustomer}
                            rules={{ required: true }}
                            render={({ field }) => {
                              return (
                                <Select
                                  {...field}
                                  menuPortalTarget={document.body}
                                  styles={{
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 11,
                                    }),
                                  }}
                                  id="mDistrictId"
                                  isDisabled={
                                    !isNumber(watchCustomer("mProvinceId"))
                                  }
                                  options={Districts}
                                  placeholder="กรุณาเลือกอำเภอ"
                                  isClearable
                                  isSearchable
                                  classNamePrefix="react-select"
                                  value={
                                    Districts.find(
                                      (option) => option.value === field.value,
                                    ) || ""
                                  }
                                  onChange={(selectedOption) => {
                                    field.onChange(
                                      selectedOption
                                        ? selectedOption.value
                                        : "",
                                    );

                                    setValue("mSubdistrictId", "");
                                    setValue("zipCode", "");
                                  }}
                                />
                              );
                            }}
                          />
                          {errorsCustomer.mDistrictId && (
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
                            control={controlCustomer}
                            rules={{ required: true }}
                            render={({ field }) => {
                              return (
                                <Select
                                  {...field}
                                  menuPortalTarget={document.body}
                                  styles={{
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 11,
                                    }),
                                  }}
                                  id="mSubdistrictId"
                                  isDisabled={
                                    !isNumber(watchCustomer("mDistrictId"))
                                  }
                                  options={Subdistricts}
                                  placeholder="กรุณาเลือกตำบล"
                                  isClearable
                                  isSearchable
                                  classNamePrefix="react-select"
                                  value={
                                    Subdistricts.find(
                                      (option) => option.value === field.value,
                                    ) || ""
                                  }
                                  onChange={(selectedOption) => {
                                    field.onChange(
                                      selectedOption
                                        ? selectedOption.value
                                        : "",
                                    );
                                    setValueCustomer(
                                      "zipCode",
                                      selectedOption
                                        ? selectedOption.postcode
                                        : "",
                                    );
                                  }}
                                />
                              );
                            }}
                          />
                          {errorsCustomer.mSubdistrictId && (
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
                            control={controlCustomer}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <input
                                {...field}
                                id="zipCode"
                                type="number"
                                disabled
                                className={`mt-1 block w-full px-3 py-2 border ${
                                  errorsCustomer.zipCode
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                              />
                            )}
                          />
                          {errorsCustomer.zipCode && (
                            <span className="text-red-500 text-xs mt-1">
                              กรุณาใส่ข้อมูล ไปรษณีย์
                            </span>
                          )}
                        </div>
                      </fieldset>
                    </div>

                    <div className="items-center col-span-4">
                      <HorizontalRule />
                    </div>

                    <div className="col-span-2"></div>
                    <div className="items-center col-span-4">
                      <label
                        htmlFor="isClaim"
                        className="block text-sm font-medium text-gray-700 mr-2"
                      >
                        รายการนี้เครมสินค้า
                      </label>
                      <Controller
                        name="isClaim"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center">
                                <input
                                  {...field}
                                  id="isClaim-0"
                                  type="radio"
                                  value="0"
                                  checked={field.value === "0"}
                                  className="mr-2"
                                  onChange={() => {
                                    setValue("isClaim", "0");
                                    setValue(
                                      "priceTotalPaid",
                                      watch("priceType") == "1"
                                        ? priceWholeSale
                                        : priceSale,
                                    );
                                    setValueProduct("priceSale", priceSale);
                                    setValueProduct(
                                      "priceWholeSale",
                                      priceWholeSale,
                                    );
                                  }}
                                />
                                <label
                                  htmlFor="isClaim-0"
                                  className="text-green-500 whitespace-nowrap"
                                >
                                  ไม่
                                </label>
                              </div>

                              <div className="flex items-center">
                                <input
                                  {...field}
                                  id="isClaim-1"
                                  type="radio"
                                  value="1"
                                  checked={field.value === "1"}
                                  className="mr-2"
                                  onChange={() => {
                                    setValue("isClaim", "1");
                                    setValue("priceTotalPaid", 0);
                                    setValueProduct("priceSale", 0);
                                    setValueProduct("priceWholeSale", 0);
                                  }}
                                />
                                <label
                                  htmlFor="isClaim-1"
                                  className="text-red-500 whitespace-nowrap"
                                >
                                  ใช่
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                      {errors.isClaim && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาเลือกข้อมูล รายการนี้เครมสินค้า
                        </span>
                      )}
                    </div>

                    <div className="items-center col-span-4">
                      <label
                        htmlFor="productId"
                        className="flex text-sm font-medium text-gray-700 mr-2"
                      >
                        หมายเลขเครื่อง/หมายเลข IMEI
                        {watch("saleType") == "3" ||
                        watch("saleType") === "4" ? (
                          <Controller
                            name="useCalType"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <div className="flex ml-3">
                                <input
                                  {...field}
                                  id="useCalType-1"
                                  type="radio"
                                  value="1"
                                  checked={field.value === "1"}
                                  onChange={() => {
                                    reset({
                                      ...RowData,
                                      useCalType: "1",
                                      bankId: watch("bankId"),
                                      randomCode: watch("randomCode"),
                                      code: watch("code"),
                                      create_date: new Date(
                                        watch("create_date") || null,
                                      ),
                                      customerId: watch("customerId"),
                                      customerMirrorId:
                                        watch("customerMirrorId"),
                                      saleType: watch("saleType"),
                                      payType: watch("payType"),
                                      priceType: watch("priceType"),
                                    });
                                  }}
                                  className="mr-2"
                                />
                                <label
                                  htmlFor="useCalType-1"
                                  className="text-red-500"
                                >
                                  การคำนวณแบบอัตโนมัติ
                                </label>
                                <input
                                  {...field}
                                  id="useCalType-2"
                                  type="radio"
                                  value="2"
                                  checked={field.value === "2"}
                                  onChange={() => {
                                    reset({
                                      ...RowData,
                                      useCalType: "2",
                                      bankId: watch("bankId"),
                                      customerId: watch("customerId"),
                                      customerMirrorId:
                                        watch("customerMirrorId"),
                                      saleType: watch("saleType"),
                                      payType: watch("payType"),
                                      priceType: watch("priceType"),
                                    });
                                  }}
                                  className="mr-2 ml-4"
                                />
                                <label
                                  htmlFor="useCalType-2"
                                  className="text-green-500"
                                >
                                  การคำนวณแบบปรับเอง
                                </label>
                              </div>
                            )}
                          />
                        ) : null}
                      </label>
                      <Controller
                        id={`productId`}
                        name={`productId`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => {
                          return (
                            <AsyncSelect
                              {...field}
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 11,
                                }),
                              }}
                              id={`productId`}
                              defaultOptions={Products}
                              loadOptions={loadOptionsProduct}
                              onKeyDown={(e) => handleScanner(e)}
                              placeholder="กรุณาเลือกสินค้า"
                              isClearable
                              isSearchable
                              classNamePrefix="react-select"
                              value={Products.find(
                                (option) => option.value === field.value,
                              )}
                              onChange={(selectedOption) => {
                                if (selectedOption?.value) {
                                  dispatch(
                                    fetchInfoProduct(selectedOption.value),
                                  ).then((res) => {
                                    const { payload } = res;

                                    if (!isEmpty(payload)) {
                                      resetProduct(payload);
                                    }
                                  });
                                }

                                reset({
                                  ...RowData,
                                  isClaim: watch("isClaim"),
                                  productId: selectedOption?.value,
                                  bankId: watch("bankId"),
                                  useCalType: watch("useCalType"),
                                  customerId: watch("customerId"),
                                  customerMirrorId: watch("customerMirrorId"),
                                  saleType: watch("saleType"),
                                  payType: watch("payType"),
                                  priceType: watch("priceType"),
                                });

                                setTimeout(() => {
                                  if (!isEmpty(selectedOption)) {
                                    if (
                                      watch("saleType") == "3" ||
                                      watch("saleType") == "4"
                                    ) {
                                      setValue(
                                        "priceDownPayment",
                                        selectedOption.priceDownPayment,
                                      );

                                      setValue(
                                        "priceDownPaymentPercent",
                                        selectedOption.priceDownPaymentPercent,
                                      );

                                      setValue(
                                        "payPerMonth",
                                        selectedOption.payPerMonth,
                                      );

                                      const findRateFinance = RateFinances.find(
                                        (e) =>
                                          e.valueMonth ==
                                          selectedOption.valueMonth,
                                      );

                                      if (!isEmpty(findRateFinance)) {
                                        setValue(
                                          "rateFinanceId",
                                          findRateFinance.value,
                                        );

                                        setValue(
                                          "valueMonth",
                                          findRateFinance.valueMonth,
                                        );

                                        const valueEqual =
                                          watch("useCalType") == "1"
                                            ? findRateFinance.valueEqual
                                            : 1;

                                        setValue("valueEqual", valueEqual);

                                        calInitProduct(
                                          watch("isClaim") == "1"
                                            ? 0
                                            : selectedOption.priceSale,
                                          watch("isClaim") == "1"
                                            ? 0
                                            : selectedOption.priceDownPayment,
                                          selectedOption.priceDownPaymentPercent,
                                          valueEqual,
                                        );
                                      }
                                    }

                                    setPiceWholeSale(
                                      selectedOption.priceWholeSale,
                                    );

                                    setPriceSale(selectedOption.priceSale);

                                    if (watch("priceType") == "1") {
                                      setValue(
                                        "priceSale",
                                        watch("isClaim") == "1"
                                          ? 0
                                          : selectedOption.priceWholeSale,
                                      );
                                    } else {
                                      setValue(
                                        "priceSale",
                                        watch("isClaim") == "1"
                                          ? 0
                                          : selectedOption.priceSale,
                                      );
                                    }

                                    setValue(
                                      "priceWholeSale",
                                      watch("isClaim") == "1"
                                        ? 0
                                        : selectedOption.priceWholeSale,
                                    );

                                    listFinance();
                                  }
                                }, 200);
                              }}
                            />
                          );
                        }}
                      />
                      {errors.productId && (
                        <span className="text-red-500 text-xs mt-1">
                          กรุณาใส่ข้อมูล หมายเลขเครื่อง/หมายเลข IMEI
                        </span>
                      )}
                    </div>

                    {watch("productId") ? (
                      <fieldset disabled className="items-center col-span-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* <div className="items-center col-span-3 lg:col-span-3">
                            <label
                              htmlFor="buyFormShop"
                              className="block text-sm font-medium text-gray-700 mr-2"
                            >
                              ซื้อจากร้านค้า
                            </label>
                            <Controller
                              id="buyFormShop"
                              name="buyFormShop"
                              control={controlProduct}
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
                          </div> */}

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
                                      menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 11,
                                      }),
                                    }}
                                    isDisabled={
                                      watch("id") == null ? false : true
                                    }
                                    id="productModelId"
                                    options={ProductModels}
                                    placeholder="กรุณาเลือกรุ่น"
                                    isSearchable
                                    classNamePrefix="react-select"
                                    value={
                                      ProductModels.find(
                                        (option) =>
                                          option.value === field.value,
                                      ) || ""
                                    }
                                    onChange={(selectedOption) => {
                                      field.onChange(
                                        selectedOption
                                          ? selectedOption.value
                                          : "",
                                      );
                                      setValue(
                                        "productBrandId",
                                        selectedOption
                                          ? selectedOption.productBrandId
                                          : "",
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
                                      menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 11,
                                      }),
                                    }}
                                    id="productStorageId"
                                    options={ProductStorages}
                                    placeholder="กรุณาเลือกความจุ"
                                    isSearchable
                                    classNamePrefix="react-select"
                                    value={
                                      ProductStorages.find(
                                        (option) =>
                                          option.value === field.value,
                                      ) || ""
                                    }
                                    onChange={(selectedOption) => {
                                      field.onChange(
                                        selectedOption
                                          ? selectedOption.value
                                          : "",
                                      );
                                    }}
                                  />
                                );
                              }}
                            />
                            {errors.productStorageId && (
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
                                      menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 11,
                                      }),
                                    }}
                                    id="productColorId"
                                    options={ProductColors}
                                    placeholder="กรุณาเลือกสี"
                                    isSearchable
                                    classNamePrefix="react-select"
                                    value={
                                      ProductColors.find(
                                        (option) =>
                                          option.value === field.value,
                                      ) || ""
                                    }
                                    onChange={(selectedOption) => {
                                      field.onChange(
                                        selectedOption
                                          ? selectedOption.value
                                          : "",
                                      );
                                    }}
                                  />
                                );
                              }}
                            />
                            {errors.productColorId && (
                              <span className="text-red-500 text-xs mt-1">
                                กรุณาใส่ข้อมูล สี
                              </span>
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
                                      errors.imei
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                  />
                                </div>
                              )}
                            />
                            {errors.imei && (
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
                                    errors.batteryHealth
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                />
                              )}
                            />
                            {errors.batteryHealth && (
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
                                    errors.machineCondition
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                />
                              )}
                            />
                            {errors.machineCondition && (
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
                                      onChange={() =>
                                        field.onChange("มือหนึ่ง")
                                      }
                                      className="mr-2"
                                    />
                                    <label
                                      htmlFor="hand-0"
                                      className="text-red-400"
                                    >
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
                                    <label
                                      htmlFor="hand-1"
                                      className="text-blue-400"
                                    >
                                      มือสอง
                                    </label>
                                  </div>
                                </div>
                              )}
                            />
                            {errors.boxType && (
                              <span className="text-red-500 text-xs mt-1">
                                กรุณาเลือกข้อมูล สถาพสินค้า
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
                                        setValue("simName", ""); // กำหนดค่า simName เมื่อ simType เป็น 0
                                      }}
                                      className="mr-2"
                                    />
                                    <label
                                      htmlFor="simType-0"
                                      className="text-red-400"
                                    >
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
                                        setValue("simName", ""); // ตั้งค่า simName ให้เป็นค่าว่างเมื่อ simType เป็น 1
                                      }}
                                      className="mr-2"
                                    />
                                    <label
                                      htmlFor="simType-1"
                                      className="text-blue-400"
                                    >
                                      ใช่
                                    </label>
                                  </div>
                                </div>
                              )}
                            />
                            {errors.simType && (
                              <span className="text-red-500 text-xs mt-1">
                                กรุณาเลือกข้อมูล ใช้ได้ทุกซิม
                              </span>
                            )}
                          </div>

                          <div className="items-center col-span-3 lg:col-span-1">
                            {watch("simType") === "ไม่" && ( // ตรวจสอบว่า simType เป็น 0 ถึงจะแสดง
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
                                      errors.simName
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                  />
                                )}
                              />
                            )}
                            {errors.simName && (
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
                                    <label
                                      htmlFor="boxType-0"
                                      className="text-red-400"
                                    >
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
                                    <label
                                      htmlFor="boxType-1"
                                      className="text-blue-400"
                                    >
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
                            {errors.boxType && (
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
                            {errors.shopCenterInsurance && (
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
                                  {ShopInsurance.map((insurance) => (
                                    <div
                                      key={insurance.name}
                                      className="flex items-center"
                                    >
                                      <input
                                        {...field}
                                        id={`shopInsurance-${insurance.name}`}
                                        type="radio"
                                        value={insurance.name}
                                        checked={field.value === insurance.name}
                                        onChange={() =>
                                          field.onChange(insurance.name)
                                        }
                                        className="mr-2"
                                      />
                                      <label
                                        htmlFor={`shopInsurance-${insurance.name}`}
                                        className={insurance.color}
                                      >
                                        {insurance.name}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            />

                            {errors.shopInsurance && (
                              <span className="text-red-500 text-xs mt-1">
                                กรุณาเลือกข้อมูล ประกันร้าน
                              </span>
                            )}
                          </div>

                          {watch("shopCenterInsurance") === "มี" ? (
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
                                rules={{ required: false }}
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
                              {errors.shopCenterInsuranceDate && (
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
                                    <label
                                      htmlFor="freeGift-0"
                                      className="text-red-400"
                                    >
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
                                      onChange={() =>
                                        field.onChange("หัวชาร์จ")
                                      }
                                      className="mr-2"
                                    />
                                    <label
                                      htmlFor="freeGift-2"
                                      className="text-blue-400"
                                    >
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
                                      onChange={() =>
                                        field.onChange("สายชาร์จ")
                                      }
                                      className="mr-2"
                                    />
                                    <label
                                      htmlFor="freeGift-3"
                                      className="text-blue-400"
                                    >
                                      สายชาร์จ
                                    </label>
                                  </div>

                                  <div className="flex items-center">
                                    <input
                                      {...field}
                                      id="freeGift-1"
                                      type="radio"
                                      value="หัวชาร์จ+สายชาร์จ"
                                      checked={
                                        field.value === "หัวชาร์จ+สายชาร์จ"
                                      }
                                      onChange={() =>
                                        field.onChange("หัวชาร์จ+สายชาร์จ")
                                      }
                                      className="mr-2"
                                    />
                                    <label
                                      htmlFor="freeGift-1"
                                      className="text-green-400"
                                    >
                                      หัวชาร์จ+สายชาร์จ
                                    </label>
                                  </div>
                                </div>
                              )}
                            />
                            {errors.freeGift && (
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
                              ราคาต้นทุน (บาท/หน่วย)
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
                                  type="number"
                                  className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.priceCostBuy
                                      ? "border-red-500"
                                      : "border-gray-300"
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

                          {user.type != "ไฟแนนซ์" ? (
                            <div className="items-center col-span-3 lg:col-span-1">
                              <label
                                htmlFor="priceWholeSale"
                                className="block text-sm font-medium text-gray-700 mr-2"
                              >
                                ราคาขายส่ง (บาท/หน่วย)
                              </label>
                              <Controller
                                id="priceWholeSale"
                                name="priceWholeSale"
                                control={controlProduct}
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
                          ) : null}

                          <div className="items-center col-span-3 lg:col-span-1">
                            <label
                              htmlFor="priceWholeSale"
                              className="block text-sm font-medium text-gray-700 mr-2"
                            >
                              ราคาขายปลีก (บาท/หน่วย)
                            </label>
                            <Controller
                              id="priceSale"
                              name="priceSale"
                              control={controlProduct}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  id="priceSale"
                                  type="number"
                                  className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.priceSale
                                      ? "border-red-500"
                                      : "border-gray-300"
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

                          {user.type != "ไฟแนนซ์" &&
                          ["3", "4"].includes(watch("saleType")) ? (
                            <div className="items-center col-span-3 lg:col-span-1">
                              <div className="grid grid-cols-1 gap-4">
                                <div className="items-center col-span-2 lg:col-span-1">
                                  <label
                                    htmlFor="priceCommission"
                                    className="block text-sm font-medium text-gray-700 mr-2"
                                  >
                                    ค่าคอม (บาท)
                                  </label>
                                  <Controller
                                    id="priceCommission"
                                    name="priceCommission"
                                    control={controlProduct}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                      <input
                                        {...field}
                                        id="priceCommission"
                                        type="number"
                                        className={`mt-1 block w-full px-3 py-2 border ${
                                          errors.priceCommission
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                      />
                                    )}
                                  />
                                  {errors.priceCommission && (
                                    <span className="text-red-500 text-xs mt-1">
                                      กรุณาใส่ข้อมูล ค่าคอม
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {user.type != "ไฟแนนซ์" &&
                          ["3", "4"].includes(watch("saleType")) ? (
                            <div className="items-center col-span-3 lg:col-span-1">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {user.type != "ไฟแนนซ์" ? (
                                  <div className="items-center col-span-3 lg:col-span-1">
                                    <label
                                      htmlFor="priceDownPayment"
                                      className="block text-sm font-medium text-gray-700 mr-2"
                                    >
                                      ค่าเปิดใช้เครื่อง
                                    </label>
                                    <Controller
                                      id="priceDownPayment"
                                      name="priceDownPayment"
                                      control={controlProduct}
                                      rules={{ required: true }}
                                      render={({ field }) => (
                                        <input
                                          {...field}
                                          id="priceDownPayment"
                                          type="number"
                                          className={`mt-1 block w-full px-3 py-2 border ${
                                            errors.priceDownPayment
                                              ? "border-red-500"
                                              : "border-gray-300"
                                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                        />
                                      )}
                                    />
                                    {errors.priceDownPayment && (
                                      <span className="text-red-500 text-xs mt-1">
                                        กรุณาใส่ข้อมูล ค่าเปิดใช้เครื่อง
                                      </span>
                                    )}
                                  </div>
                                ) : null}

                                <div className="items-center col-span-3 lg:col-span-1">
                                  <label
                                    htmlFor="priceDownPaymentPercent"
                                    className="block text-sm font-medium text-gray-700 mr-2"
                                  >
                                    ค่าเปิดใช้เครื่อง (%)
                                  </label>
                                  <Controller
                                    id="priceDownPaymentPercent"
                                    name="priceDownPaymentPercent"
                                    control={controlProduct}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                      <input
                                        {...field}
                                        id="priceDownPaymentPercent"
                                        type="number"
                                        className={`mt-1 block w-full px-3 py-2 border ${
                                          errors.priceDownPaymentPercent
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                      />
                                    )}
                                  />
                                  {errors.priceDownPaymentPercent && (
                                    <span className="text-red-500 text-xs mt-1">
                                      กรุณาใส่ข้อมูล ค่าเปิดใช้เครื่อง %
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {user.type != "ไฟแนนซ์" &&
                          ["3", "4"].includes(watch("saleType")) ? (
                            <div className="items-center col-span-3 lg:col-span-1">
                              <label
                                htmlFor="payPerMonth"
                                className="block text-sm font-medium text-gray-700 mr-2"
                              >
                                ค่าดูแลต่อเดือน
                              </label>
                              <Controller
                                id="payPerMonth"
                                name="payPerMonth"
                                control={controlProduct}
                                rules={{ required: true }}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    id="payPerMonth"
                                    type="number"
                                    className={`mt-1 block w-full px-3 py-2 border ${
                                      errors.payPerMonth
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                  />
                                )}
                              />
                              {errors.payPerMonth && (
                                <span className="text-red-500 text-xs mt-1">
                                  กรุณาใส่ข้อมูล ค่าดูแลต่อเดือน
                                </span>
                              )}
                            </div>
                          ) : null}

                          {["3", "4"].includes(watch("saleType")) ? (
                            <div className="items-center col-span-2 border p-1 border-gray-300 rounded-md">
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
                                      <div
                                        key={rate.id}
                                        className="flex items-center"
                                      >
                                        <input
                                          {...field}
                                          id={`valueMonth-${rate.valueMonth}`}
                                          type="radio"
                                          value={rate.valueMonth.toString()}
                                          checked={
                                            field.value ===
                                            rate.valueMonth.toString()
                                          }
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
                              {errors.valueMonth && (
                                <span className="text-red-500 text-xs mt-1">
                                  กรุณาเลือกข้อมูล จำนวนเดือนที่เช่า
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </fieldset>
                    ) : null}

                    {(isNumber(watch("productId")) &&
                      watch("saleType") == "3") ||
                    (isNumber(watch("productId")) &&
                      watch("saleType") == "4") ? (
                      <div className="items-center col-span-4">
                        <label
                          htmlFor="rateFinanceId"
                          className="block text-sm font-medium text-gray-700 mr-2"
                        >
                          เรทเช่า
                        </label>
                        <Controller
                          id={`rateFinanceId`}
                          name={`rateFinanceId`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => {
                            return (
                              <Select
                                {...field}
                                menuPortalTarget={document.body}
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 11,
                                  }),
                                }}
                                id={`rateFinanceId`}
                                options={RateFinances}
                                placeholder="กรุณาเลือกเรทเช่า"
                                isClearable
                                isSearchable
                                classNamePrefix="react-select"
                                value={
                                  RateFinances.find(
                                    (option) => option.value === field.value,
                                  ) || ""
                                }
                                onChange={(selectedOption) => {
                                  field.onChange(selectedOption?.value || "");

                                  if (!isEmpty(selectedOption)) {
                                    setValue(
                                      "valueMonth",
                                      selectedOption
                                        ? selectedOption.valueMonth
                                        : "",
                                    );

                                    const valueEqual =
                                      watch("useCalType") == "1"
                                        ? selectedOption.valueEqual
                                        : 1;
                                    setValue("valueEqual", valueEqual);

                                    const product = Products.find(
                                      (e) => e.value == watch("productId"),
                                    );

                                    calInitProduct(
                                      product.priceSale,
                                      product.priceDownPayment,
                                      product.priceDownPaymentPercent,
                                      valueEqual,
                                    );
                                  }
                                }}
                              />
                            );
                          }}
                        />
                        {errors.rateFinanceId && (
                          <span className="text-red-500 text-xs mt-1">
                            กรุณาใส่ข้อมูล เรทเช่า
                          </span>
                        )}
                      </div>
                    ) : null}

                    {isNumber(watch("rateFinanceId")) ? (
                      <div className="items-center col-span-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                          <div className="items-center col-span-3 lg:col-span-1">
                            <label
                              htmlFor="rentAppID"
                              className="block text-sm font-medium text-gray-700 mr-2"
                            >
                              AppleID ลูกค้า
                            </label>
                            <Controller
                              id="rentAppID"
                              name="rentAppID"
                              control={control}
                              rules={{ required: false }}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  id="rentAppID"
                                  type="text"
                                  value={field.value || ""}
                                  className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.rentAppID
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                />
                              )}
                            />
                          </div>

                          <div className="items-center col-span-3 lg:col-span-1">
                            <label
                              htmlFor="rentPass"
                              className="block text-sm font-medium text-gray-700 mr-2"
                            >
                              รหัสผ่าน ลูกค้า
                            </label>
                            <Controller
                              id="rentPass"
                              name="rentPass"
                              control={control}
                              rules={{ required: false }}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  id="rentPass"
                                  type="text"
                                  value={field.value || ""}
                                  className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.rentPass
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                />
                              )}
                            />
                          </div>

                          <div className="items-center col-span-3 lg:col-span-1">
                            <label
                              htmlFor="rentPin"
                              className="block text-sm font-medium text-gray-700 mr-2"
                            >
                              รหัสล็อคหน้าจอ ลูกค้า
                            </label>
                            <Controller
                              id="rentPin"
                              name="rentPin"
                              control={control}
                              rules={{ required: false }}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  id="rentPin"
                                  type="text"
                                  value={field.value || ""}
                                  className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.rentPin
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {isNumber(watch("rateFinanceId")) ? (
                      <div className="items-center col-span-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                          <div className="items-center col-span-2 lg:col-span-1">
                            <label
                              htmlFor="priceSale"
                              className="block text-sm font-medium text-gray-700 mr-2"
                            >
                              ราคาขาย (บ.)
                            </label>
                            <Controller
                              id="priceSale"
                              name="priceSale"
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  disabled
                                  id="priceSale"
                                  type="number"
                                  className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.priceSale
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                />
                              )}
                            />
                            {errors.priceSale && (
                              <span className="text-red-500 text-xs mt-1">
                                กรุณาใส่ข้อมูลราคาขาย
                              </span>
                            )}
                          </div>

                          <div className="items-center col-span-2 lg:col-span-1">
                            <label
                              htmlFor="priceDownPayment"
                              className="text-sm font-medium text-gray-700 mr-2 flex"
                            >
                              ค่าเปิดใช้เครื่อง
                              <Controller
                                name="priceDownType"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                  <div className="flex ml-3">
                                    <input
                                      {...field}
                                      id="priceDownType-1"
                                      type="radio"
                                      value="1"
                                      checked={field.value === "1"}
                                      onChange={() => {
                                        field.onChange("1");
                                        changePriceDownType();
                                      }}
                                      className="mr-2"
                                    />
                                    <label
                                      htmlFor="priceDownType-1"
                                      className="text-red-500"
                                    >
                                      ใช้แบบ %
                                    </label>
                                    <input
                                      {...field}
                                      id="priceDownType-2"
                                      type="radio"
                                      value="2"
                                      checked={field.value === "2"}
                                      onChange={() => {
                                        field.onChange("2");
                                        changePriceDownType();
                                      }}
                                      className="mr-2 ml-4"
                                    />
                                    <label
                                      htmlFor="priceDownType-2"
                                      className="text-green-500"
                                    >
                                      ใช้แบบ จำนวนเต็ม
                                    </label>
                                  </div>
                                )}
                              />
                            </label>
                            <Controller
                              id="priceDownPayment"
                              name="priceDownPayment"
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  id="priceDownPayment"
                                  type="number"
                                  disabled={
                                    watch("useCalType") == "1" ? true : false
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value
                                      ? Number(e.target.value)
                                      : 0;
                                    field.onChange(value);
                                    calInitProduct(
                                      watch("priceSale"),
                                      value,
                                      watch("priceDownPaymentPercent"),
                                      watch("valueEqual"),
                                    );
                                  }}
                                  className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.priceDownPayment
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                />
                              )}
                            />
                            {errors.priceDownPayment && (
                              <span className="text-red-500 text-xs mt-1">
                                กรุณาใส่ข้อมูลค่าเปิดใช้เครื่อง
                              </span>
                            )}
                          </div>

                          {watch("useCalType") == "1" ? (
                            <div className="items-center col-span-2 lg:col-span-1">
                              <label
                                htmlFor="priceBeforeAdjusted"
                                className="block text-sm font-medium text-gray-700 mr-2"
                              >
                                ยอดก่อนจัด (บ.)
                              </label>
                              <Controller
                                id="priceBeforeAdjusted"
                                name="priceBeforeAdjusted"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    disabled
                                    id="priceBeforeAdjusted"
                                    type="number"
                                    className={`mt-1 block w-full px-3 py-2 border ${
                                      errors.priceBeforeAdjusted
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                  />
                                )}
                              />
                              {errors.priceBeforeAdjusted && (
                                <span className="text-red-500 text-xs mt-1">
                                  กรุณาใส่ข้อมูลร ยอดก่อนจัด
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="items-center col-span-2 lg:col-span-1">
                              <label
                                htmlFor="payPerMonth"
                                className="block text-sm font-medium text-gray-700 mr-2"
                              >
                                ค่าบริการดูแลรายเดือน
                              </label>
                              <Controller
                                id="payPerMonth"
                                name="payPerMonth"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    id="payPerMonth"
                                    type="number"
                                    value={field.value}
                                    className={`mt-1 block w-full px-3 py-2 border ${
                                      errors.payPerMonth
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                                    onChange={(e) => {
                                      const value = e.target.value
                                        ? Number(e.target.value)
                                        : 0;
                                      field.onChange(value);

                                      calInitProduct(
                                        watch("priceSale"),
                                        watch("priceDownPayment"),
                                        watch("priceDownPaymentPercent"),
                                        watch("valueEqual"),
                                      );
                                    }}
                                  />
                                )}
                              />
                              {errors.priceBeforeAdjusted && (
                                <span className="text-red-500 text-xs mt-1">
                                  กรุณาใส่ข้อมูลร ค่าบริการดูแลรายเดือน
                                </span>
                              )}
                            </div>
                          )}

                          <div className="col-span-4 lg:col-span-1 flex flex-col items-end">
                            <label
                              htmlFor="create_date"
                              className="block text-sm font-medium text-gray-700 text-right w-full"
                            >
                              วันที่ทำรายการ
                            </label>
                            <Controller
                              name="create_date"
                              control={control}
                              rules={{ required: false }}
                              render={({ field }) => (
                                <DatePicker
                                  selected={field.value}
                                  locale={th}
                                  onChange={(date) => field.onChange(date)}
                                  timeZone="Asia/Bangkok"
                                  dateFormat="dd/MM/yyyy HH:mm"
                                  showTimeSelect
                                  timeFormat="HH:mm"
                                  timeIntervals={1}
                                  className="w-full p-1.5 border border-gray-300 rounded-md mt-1 text-right"
                                  placeholderText="เลือกวันที่และเวลา"
                                  minDate={dayjs()
                                    .subtract(1, "month")
                                    .startOf("month")
                                    .toDate()}
                                  maxDate={dayjs().toDate()}
                                />
                              )}
                            />

                            {errors.create_date && (
                              <p className="text-red-500 text-xs mt-1 text-right w-full">
                                กรุณาใส่ข้อมูล วันที่ทำรายการ
                              </p>
                            )}
                          </div>

                          <div className="col-span-2">
                            <ul className="space-y-3">
                              {fields.map((v, k) => (
                                <li
                                  key={k}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                                >
                                  <span className="text-sm font-medium text-gray-700">
                                    งวดที่ {k + 1} - ชำระวันที่:{" "}
                                    <span className="text-blue-600">
                                      {dayjs(v.datePay).format("DD/MM/YYYY")}
                                    </span>
                                  </span>
                                  <span className="text-sm font-semibold text-green-600">
                                    {formatNumberDigit2(v.price)} บาท
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className="items-center col-span-4">
                      <HorizontalRule />
                    </div>

                    {isNumber(watch("productId")) &&
                    ["3", "4"].includes(watch("saleType")) ? (
                      <div className="items-center col-span-4 lg:col-span-2">
                        <div>
                          <label
                            htmlFor="priceReRider"
                            className="block text-sm font-medium text-gray-700 mr-2"
                          >
                            รับค่าส่ง (บ.)
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
                                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                              />
                            )}
                          />
                          {errors.priceReRider && (
                            <span className="text-red-500 text-xs mt-1">
                              กรุณาใส่ข้อมูล รับค่าส่ง
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {isNumber(watch("productId")) &&
                    ["3", "4"].includes(watch("saleType")) ? (
                      <div className="items-center col-span-4 lg:col-span-2">
                        <div>
                          <label
                            htmlFor="priceReRiderCustomer"
                            className="block text-sm font-medium text-gray-700 mr-2"
                          >
                            รับค่าส่งจาก ลค. (บ.)
                          </label>
                          <Controller
                            id="priceReRiderCustomer"
                            name="priceReRiderCustomer"
                            control={control}
                            rules={{ required: false }}
                            render={({ field }) => (
                              <input
                                {...field}
                                id="priceReRiderCustomer"
                                type="number"
                                className={`mt-1 block w-full px-3 py-2 border ${
                                  errors.priceReRiderCustomer
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                              />
                            )}
                          />
                          {errors.priceReRiderCustomer && (
                            <span className="text-red-500 text-xs mt-1">
                              กรุณาใส่ข้อมูล รับค่าส่งจาก ลค.
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {isNumber(watch("productId")) ? (
                      <div className="items-center col-span-4 lg:col-span-2">
                        <label
                          htmlFor="priceRegAppleId"
                          className="block text-sm font-medium text-gray-700 mr-2"
                        >
                          ค่าสมัครอีเมล/AppleID/อื่น ๆ (บ.)
                        </label>
                        <Controller
                          id="priceRegAppleId"
                          name="priceRegAppleId"
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <input
                              {...field}
                              id="priceRegAppleId"
                              type="number"
                              className={`mt-1 block w-full px-3 py-2 border ${
                                errors.priceRegAppleId
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                            />
                          )}
                        />
                        {errors.priceRegAppleId && (
                          <span className="text-red-500 text-xs mt-1">
                            กรุณาใส่ข้อมูล AppleID
                          </span>
                        )}
                      </div>
                    ) : null}

                    {isNumber(watch("productId")) ? (
                      <div className="items-center col-span-4 lg:col-span-2">
                        <label
                          htmlFor="priceETC"
                          className="block text-sm font-medium text-gray-700 mr-2"
                        >
                          ค่าบริการอื่น ๆ ต้นทุน (บ.)
                        </label>
                        <Controller
                          id="priceETC"
                          name="priceETC"
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <input
                              {...field}
                              id="priceETC"
                              type="number"
                              className={`mt-1 block w-full px-3 py-2 border ${
                                errors.priceETC
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                            />
                          )}
                        />
                        {errors.priceETC && (
                          <span className="text-red-500 text-xs mt-1">
                            กรุณาใส่ข้อมูล ค่าบริการอื่น ๆ ต้นทุน
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="items-center col-span-4">
                <HorizontalRule />
              </div>

              <div className="items-center col-span-4 lg:col-span-2">
                {watch("isMobileSale") == "1" && RowData.isCash == "0" ? (
                  <div>
                    <label
                      htmlFor="priceDiscount"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      ส่วนลด (บ.)
                    </label>
                    <Controller
                      id="priceDiscount"
                      name="priceDiscount"
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="priceDiscount"
                          type="number"
                          disabled={
                            isNumber(RowData.productBookId)
                              ? true
                              : isNumber(RowData.productSavingId)
                                ? true
                                : false
                          }
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.priceDiscount
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                        />
                      )}
                    />
                  </div>
                ) : (import.meta.env.VITE_SYSTEM_NAME == "THUNDER" &&
                    watch("saleType") == "1") ||
                  (import.meta.env.VITE_SYSTEM_NAME == "THUNDER" &&
                    watch("saleType") == "2") ? (
                  <div className="col-span-4 lg:col-span-2 justify-self-end text-right">
                    <label
                      htmlFor="priceType"
                      className="block text-sm font-medium text-gray-700 mr-2 text-left"
                    >
                      ราคาขาย
                    </label>

                    <Controller
                      name="priceType"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <div className="flex justify-end items-center gap-4">
                          <div className="flex items-center">
                            <input
                              {...field}
                              id="priceType-1"
                              type="radio"
                              value="1"
                              checked={field.value === "1"}
                              onChange={() => {
                                field.onChange("1");
                                changeTypePrice("1");
                              }}
                              className="mr-2"
                              disabled={
                                watch("saleType") == 3 || watch("saleType") == 4
                              }
                            />
                            <label
                              htmlFor="priceType-1"
                              className="text-red-500"
                            >
                              ราคาส่ง
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              {...field}
                              id="priceType-2"
                              type="radio"
                              value="2"
                              checked={field.value === "2"}
                              onChange={() => {
                                field.onChange("2");
                                changeTypePrice("2");
                              }}
                              className="mr-2"
                              disabled={
                                watch("saleType") == 3 || watch("saleType") == 4
                              }
                            />
                            <label
                              htmlFor="priceType-2"
                              className="text-green-500"
                            >
                              ราคาปลีก
                            </label>
                          </div>
                        </div>
                      )}
                    />

                    {errors.priceType && (
                      <span className="text-red-500 text-xs mt-1 block text-right">
                        กรุณาเลือกข้อมูล ใช้ราคา
                      </span>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="items-center col-span-4 lg:col-span-2">
                <label
                  htmlFor="priceTotalPaid"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  รวมยอดที่จ่ายก่อนรับ (บ.)
                </label>
                <Controller
                  id="priceTotalPaid"
                  name="priceTotalPaid"
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <input
                      disabled
                      {...field}
                      id="priceTotalPaid"
                      type="number"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceTotalPaid
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
              </div>

              <div className="items-center col-span-4 lg:col-span-2">
                <label
                  htmlFor="resellerId"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  ตัวแทนจำหน่าย
                </label>
                <Controller
                  id="resellerId"
                  name="resellerId"
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <AsyncSelect
                      {...field}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 11 }),
                      }}
                      id="resellerId"
                      defaultOptions={Resellers}
                      loadOptions={loadOptionsReseller}
                      placeholder="กรุณาเลือกตัวแทนจำหน่าย"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={
                        Resellers.find(
                          (option) => option.value === field.value,
                        ) || ""
                      }
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption?.value || "");
                      }}
                    />
                  )}
                />
              </div>

              {isNumber(watch("resellerId")) ? (
                <div className="items-center col-span-4 lg:col-span-2">
                  <label
                    htmlFor="priceReseller"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    ค่าคอมตัวแทน (บ.)
                  </label>
                  <Controller
                    id="priceReseller"
                    name="priceReseller"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="priceReseller"
                        type="number"
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.priceReseller
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                      />
                    )}
                  />
                  {errors.priceReseller && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาใส่ข้อมูลค่าคอมตัวแทน
                    </span>
                  )}
                </div>
              ) : null}
            </fieldset>

            <div className="items-center col-span-4">
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
                rules={{ required: false }}
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
            </div>

            {watch("payType") == "3" && watch("isMobileSale") == "1" ? (
              <div className="items-center col-span-4 lg:col-span-2">
                <label
                  htmlFor="priceCash"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  เงินสด (บ.)
                </label>
                <Controller
                  id="priceCash"
                  name="priceCash"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceCash"
                      type="number"
                      onChange={(e) => {
                        const priceCash = Number(e.target.value);
                        field.onChange(priceCash); // อัพเดตค่าใน form
                        const priceTotalPaid = Number(watch("priceTotalPaid"));
                        setValue(
                          "priceTransferCash",
                          priceTotalPaid - priceCash,
                        ); // อัพเดต priceTransferCash
                      }}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceCash ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
              </div>
            ) : null}

            {watch("payType") == "3" && watch("isMobileSale") == "1" ? (
              <div className="items-center col-span-4 lg:col-span-2">
                <label
                  htmlFor="priceTransferCash"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  เงินโอน (บ.)
                </label>
                <Controller
                  id="priceTransferCash"
                  name="priceTransferCash"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceTransferCash"
                      type="number"
                      onChange={(e) => {
                        const priceTransferCash = Number(e.target.value);
                        field.onChange(priceTransferCash); // อัพเดตค่าใน form
                        const priceTotalPaid = Number(watch("priceTotalPaid"));
                        setValue(
                          "priceCash",
                          priceTotalPaid - priceTransferCash,
                        ); // อัพเดต priceCash
                      }}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceTransferCash
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
              </div>
            ) : null}

            {watch("payType") == "3" && watch("priceReRider") > 0 ? (
              <div className="items-center col-span-4 lg:col-span-2">
                <label
                  htmlFor="priceReRiderCash"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  เงินสดรับค่าส่ง (บ.)
                </label>
                <Controller
                  id="priceReRiderCash"
                  name="priceReRiderCash"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceReRiderCash"
                      type="number"
                      onChange={(e) => {
                        const priceReRiderCash = Number(e.target.value);
                        field.onChange(priceReRiderCash); // อัพเดตค่าใน form
                        const priceReRider = Number(watch("priceReRider"));
                        setValue(
                          "priceReRiderTransferCash",
                          priceReRider - priceReRiderCash,
                        ); // อัพเดต priceReRiderTransferCash
                      }}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceReRiderCash
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
              </div>
            ) : null}

            {watch("payType") == "3" && watch("priceReRider") > 0 ? (
              <div className="items-center col-span-4 lg:col-span-2">
                <label
                  htmlFor="priceReRiderTransferCash"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  เงินโอนรับค่าส่ง (บ.)
                </label>
                <Controller
                  id="priceReRiderTransferCash"
                  name="priceReRiderTransferCash"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceReRiderTransferCash"
                      type="number"
                      onChange={(e) => {
                        const priceReRiderTransferCash = Number(e.target.value);
                        field.onChange(priceReRiderTransferCash); // อัพเดตค่าใน form
                        const priceReRider = Number(watch("priceReRider"));
                        setValue(
                          "priceReRiderCash",
                          priceReRider - priceReRiderTransferCash,
                        ); // อัพเดต priceReRiderCash
                      }}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceReRiderTransferCash
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
              </div>
            ) : null}

            {watch("payType") == "3" && watch("priceRegAppleId") > 0 ? (
              <div className="items-center col-span-4 lg:col-span-2">
                <label
                  htmlFor="priceRegAppleIdCash"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  เงินสดค่าสมัครอีเมล/AppleID/อื่น ๆ (บ.)
                </label>
                <Controller
                  id="priceRegAppleIdCash"
                  name="priceRegAppleIdCash"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceRegAppleIdCash"
                      type="number"
                      onChange={(e) => {
                        const priceRegAppleIdCash = Number(e.target.value);
                        field.onChange(priceRegAppleIdCash); // อัพเดตค่าใน form
                        const priceRegAppleId = Number(
                          watch("priceRegAppleId"),
                        );
                        setValue(
                          "priceRegAppleIdTransferCash",
                          priceRegAppleId - priceRegAppleIdCash,
                        ); // อัพเดต priceRegAppleIdTransferCash
                      }}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceRegAppleIdCash
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
              </div>
            ) : null}

            {watch("payType") == "3" && watch("priceRegAppleId") > 0 ? (
              <div className="items-center col-span-4 lg:col-span-2">
                <label
                  htmlFor="priceRegAppleIdTransferCash"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  เงินโอนค่าสมัครอีเมล/AppleID/อื่น ๆ (บ.)
                </label>
                <Controller
                  id="priceRegAppleIdTransferCash"
                  name="priceRegAppleIdTransferCash"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceRegAppleIdTransferCash"
                      type="number"
                      onChange={(e) => {
                        const priceRegAppleIdTransferCash = Number(
                          e.target.value,
                        );
                        field.onChange(priceRegAppleIdTransferCash); // อัพเดตค่าใน form
                        const priceRegAppleId = Number(
                          watch("priceRegAppleId"),
                        );
                        setValue(
                          "priceRegAppleIdCash",
                          priceRegAppleId - priceRegAppleIdTransferCash,
                        ); // อัพเดต priceRegAppleIdCash
                      }}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceRegAppleIdTransferCash
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
              </div>
            ) : null}

            {watch("payType") == "3" && watch("priceEquipSum") > 0 ? (
              <div className="items-center col-span-4 lg:col-span-2">
                <label
                  htmlFor="priceEquipCash"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  เงินสดอุปกรณ์ (บ.)
                </label>
                <Controller
                  id="priceEquipCash"
                  name="priceEquipCash"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceEquipCash"
                      type="number"
                      onChange={(e) => {
                        const priceEquipCash = Number(e.target.value);
                        field.onChange(priceEquipCash); // อัพเดตค่าใน form
                        const priceEquipSum = Number(watch("priceEquipSum"));
                        setValue(
                          "priceEquipTransferCash",
                          priceEquipSum - priceEquipCash,
                        ); // อัพเดต priceEquipTransferCash
                      }}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceEquipCash
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
              </div>
            ) : null}

            {watch("payType") == "3" && watch("priceEquipSum") > 0 ? (
              <div className="items-center col-span-4 lg:col-span-2">
                <label
                  htmlFor="priceEquipTransferCash"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  เงินโอนอุปกรณ์ (บ.)
                </label>
                <Controller
                  id="priceEquipTransferCash"
                  name="priceEquipTransferCash"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="priceEquipTransferCash"
                      type="number"
                      onChange={(e) => {
                        const priceEquipTransferCash = Number(e.target.value);
                        field.onChange(priceEquipTransferCash); // อัพเดตค่าใน form
                        const priceEquipSum = Number(watch("priceEquipSum"));
                        setValue(
                          "priceEquipCash",
                          priceEquipSum - priceEquipTransferCash,
                        ); // อัพเดต priceEquipCash
                      }}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.priceEquipTransferCash
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                    />
                  )}
                />
              </div>
            ) : null}

            <div className="col-span-4">
              <div className="items-center grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Customer Picture */}
                <div className="items-center col-span-1">
                  <div className="items-center grid grid-cols-1 gap-4">
                    <div className="items-center col-span-1">
                      <label
                        htmlFor="uploadFileProductSaleCustomer"
                        className="block text-sm font-medium text-red-700 mr-2"
                      >
                        รูปลูกค้า (png, jpeg, jpg)
                      </label>
                      <FileDropzone
                        isOpen={open}
                        name="uploadFileProductSaleCustomer"
                        acceptedFileTypes={acceptedFileTypes}
                        control={control}
                        maxFileSize={5}
                        fileMultiple={true}
                        setValue={setValue}
                      />
                    </div>

                    <div className="items-center col-span-1">
                      <HorizontalRule />
                    </div>

                    {!isEmpty(watch("productSaleImagesCustomer")) || [] ? (
                      <div className="items-center col-span-1">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="col-span-1">
                            <p className="text-lg">รูปที่เคยอัพโหลด</p>
                          </div>
                          <div className="col-span-1">
                            <DragAndDropImages
                              images={watch("productSaleImagesCustomer") || []}
                              submitSwitch={() => {}}
                              onDelete={() => {}}
                              showDelete={false}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Right Column: Proof of Payment */}
                <div className="items-center col-span-1">
                  <div className="items-center grid grid-cols-1 gap-4">
                    <div className="items-center col-span-1">
                      <label
                        htmlFor="uploadFileProductSale"
                        className="block text-sm font-medium text-blue-700 mr-2"
                      >
                        หลักฐานการชำระ (png, jpeg, jpg)
                      </label>
                      <FileDropzone
                        isOpen={open}
                        name="uploadFileProductSale"
                        acceptedFileTypes={acceptedFileTypes}
                        control={control}
                        maxFileSize={5}
                        fileMultiple={true}
                        setValue={setValue}
                      />
                    </div>

                    <div className="items-center col-span-1">
                      <HorizontalRule />
                    </div>

                    {!isEmpty(watch("productSaleImages")) || [] ? (
                      <div className="items-center col-span-1">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="col-span-1">
                            <p className="text-lg">รูปที่เคยอัพโหลด</p>
                          </div>
                          <div className="col-span-1">
                            <DragAndDropImages
                              images={watch("productSaleImages") || []}
                              submitSwitch={() => {}}
                              onDelete={() => {}}
                              showDelete={false}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* {!isNaN(RowData.id) ? null : ( */}
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
          {/* )} */}

          {/* <button
            disabled={isLoadingOpen}
            onClick={() => {
              setIsLoadingOpen(true);
              dispatch(deleteProductSale(RowData.id))
                .unwrap()
                .then(() => setIsLoadingOpen(false))
                .catch(() => setIsLoadingOpen(false));
            }}
            className="py-2 px-5 ml-3 text-sm text-white bg-blue-400 rounded-lg border border-blue-400 hover:bg-blue-500"
          >
            ลบ
          </button> */}
        </div>
      </form>
    </div>
  );
};

ModalSale.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
};

export default ModalSale;
