/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty, isNumber, debounce } from "lodash";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { MdClose, MdOutlineClose } from "react-icons/md";
import PropTypes from "prop-types";
import React from "react";
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

  const [Transports, setTransports] = React.useState([]);
  const [defaultPrice, setDefaultPrice] = React.useState([]);

  const [Provinces, setProvinces] = React.useState([]);
  const [Districts, setDistricts] = React.useState([]);
  const [Subdistricts, setSubdistricts] = React.useState([]);

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

      dispatch(fetchSelectBank(RowData.isMobileSale == "1" ? "1" : "3"));

      modalRef.current.focus();

      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      } else {
        reset(RowData);
      }
    }
  }, [open]);

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
      reset({
        ...store.data,
        create_date: store.data?.create_date
          ? new Date(store.data?.create_date)
          : new Date(),
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

  const { fields: fieldsProductSaleLists } = useFieldArray({
    control,
    name: "productSaleLists",
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
        className={`relative max-w-4xl`}
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

            {import.meta.env.VITE_SYSTEM_NAME == "THUNDER" &&
            watch("isMobileSale") == "0" ? (
              <div className="items-center col-span-4 lg:col-span-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="items-center col-span-3 lg:col-span-1">
                    <label
                      htmlFor="imei"
                      className="block text-sm font-medium text-gray-700 mr-2"
                    >
                      เลข IMEI{" "}
                      <span className="text-[14px] text-red-400">
                        (* ถ้าไม่มี &quot;-&quot;)
                      </span>
                    </label>
                    <Controller
                      id="imei"
                      name="imei"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="imei"
                          type="text"
                          className={`mt-1 block w-full px-3 py-2 border ${
                            errors.imei ? "border-red-500" : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                      )}
                    />

                    {errors.imei && (
                      <span className="text-red-500 text-xs mt-1">
                        กรุณาใส่ข้อมูล เลข IMEI
                      </span>
                    )}
                  </div>
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

              {watch("isMobileSale") == "0" ? (
                <div className="items-center col-span-4">
                  <div className="grid grid-cols-1 gap-2">
                    {!RowData.id && (
                      <div className="items-center col-span-1">
                        <label
                          htmlFor="ContactCode"
                          className="block text-sm font-medium text-gray-700 mr-2"
                        >
                          ใส่รหัสสินค้า เพื่อเพิ่มของแถม
                        </label>
                        <input
                          id="ContactCode"
                          onKeyDown={(e) => handleScanner(e)}
                          type="text"
                          value={ContactCode}
                          onChange={(e) => handleSearch(e.target.value)}
                          className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                        />
                      </div>
                    )}

                    <div className="items-center col-span-1">
                      <div className="grid grid-cols-1 gap-4">
                        {fieldsProductSaleLists?.map((v, k) => (
                          <div
                            key={v.id}
                            className="grid grid-cols-1 gap-3 p-4 border rounded-lg bg-white shadow-sm"
                          >
                            <div className="col-span-1">
                              <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                                <div className="col-span-2 lg:col-span-1">
                                  <label
                                    htmlFor={`productName-${k}`}
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    ชื่อสินค้า
                                  </label>
                                  <Controller
                                    name={`productSaleLists[${k}].productName`}
                                    control={control}
                                    render={({ field }) => (
                                      <input
                                        {...field}
                                        id={`productName-${k}`}
                                        type="text"
                                        disabled
                                        value={field.value || ""}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                        className={`w-full px-3 py-2 border ${
                                          errors.productSaleLists?.[k]
                                            ?.productName
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                      />
                                    )}
                                  />
                                  {errors.productSaleLists?.[k]
                                    ?.productName && (
                                    <span className="text-red-500 text-xs">
                                      กรุณาใส่ข้อมูล ชื่อสินค้า
                                    </span>
                                  )}
                                </div>

                                <div className="col-span-2 lg:col-span-1">
                                  <label
                                    htmlFor={`amount-${k}`}
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    จำนวน
                                  </label>
                                  <Controller
                                    name={`productSaleLists[${k}].amount`}
                                    control={control}
                                    render={({ field }) => (
                                      <input
                                        {...field}
                                        id={`amount-${k}`}
                                        type="number"
                                        value={field.value || 0}
                                        disabled
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                        className={`w-full px-3 py-2 border ${
                                          errors.productSaleLists?.[k]?.amount
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                      />
                                    )}
                                  />
                                  {errors.productSaleLists?.[k]?.amount && (
                                    <span className="text-red-500 text-xs">
                                      กรุณาใส่ข้อมูล จำนวน
                                    </span>
                                  )}
                                </div>

                                <div className="col-span-2 lg:col-span-1">
                                  {watch(`productSaleLists[${k}].isFree`) ==
                                  "0" ? (
                                    <>
                                      <label
                                        htmlFor={`priceDiscount-${k}`}
                                        className="block text-sm font-medium text-gray-700"
                                      >
                                        ส่วนลด
                                      </label>
                                      <Controller
                                        name={`productSaleLists[${k}].priceDiscount`}
                                        control={control}
                                        render={({ field }) => (
                                          <input
                                            {...field}
                                            id={`priceDiscount-${k}`}
                                            type="number"
                                            value={field.value}
                                            onChange={(e) =>
                                              field.onChange(e.target.value)
                                            }
                                            className={`w-full px-3 py-2 border ${
                                              errors.productSaleLists?.[k]
                                                ?.priceDiscount
                                                ? "border-red-500"
                                                : "border-gray-300"
                                            } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                          />
                                        )}
                                      />
                                      {errors.productSaleLists?.[k]
                                        ?.priceDiscount && (
                                        <span className="text-red-500 text-xs">
                                          กรุณาใส่ข้อมูล ส่วนลด
                                        </span>
                                      )}
                                    </>
                                  ) : null}
                                </div>

                                {watch(`productSaleLists[${k}].catalog`) ==
                                "อุปกรณ์เสริม" ? (
                                  <div className="col-span-2 lg:col-span-1">
                                    <label
                                      htmlFor={`priceSale-${k}`}
                                      className="block text-sm font-medium text-gray-700"
                                    >
                                      ราคาขายต่อหน่วย
                                    </label>
                                    <Select
                                      id="defaultPrice"
                                      options={defaultPrice}
                                      placeholder="กรุณาเลือกราคา"
                                      isClearable
                                      isSearchable
                                      classNamePrefix="react-select"
                                      value={
                                        defaultPrice.find(
                                          (option) =>
                                            option.value ==
                                            watch(
                                              `productSaleLists[${k}].priceSale`,
                                            ),
                                        ) || 0
                                      }
                                      onChange={(v) => {
                                        if (v == null) {
                                          setValue(
                                            `productSaleLists[${k}].priceSale`,
                                            watch(
                                              `productSaleLists[${k}].defaultPriceSale`,
                                            ),
                                          );
                                        } else {
                                          setValue(
                                            `productSaleLists[${k}].priceSale`,
                                            v.value,
                                          );
                                        }
                                      }}
                                    />

                                    {errors.productSaleLists?.[k]
                                      ?.priceSale && (
                                      <span className="text-red-500 text-xs">
                                        กรุณาใส่ข้อมูล ราคาขาย
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="col-span-2 lg:col-span-1">
                                    <label
                                      htmlFor={`priceSale-${k}`}
                                      className="block text-sm font-medium text-gray-700"
                                    >
                                      ราคาขายต่อหน่วย
                                    </label>

                                    <Controller
                                      name={`productSaleLists[${k}].priceSale`}
                                      control={control}
                                      render={({ field }) => (
                                        <input
                                          {...field}
                                          id={`priceSale-${k}`}
                                          type="number"
                                          disabled={
                                            watch(
                                              `productSaleLists[${k}].isFree`,
                                            ) !== "0"
                                          }
                                          value={field.value || 0}
                                          onChange={(e) =>
                                            field.onChange(e.target.value)
                                          }
                                          className={`w-full px-3 py-2 border ${
                                            errors.productSaleLists?.[k]
                                              ?.priceSale
                                              ? "border-red-500"
                                              : "border-gray-300"
                                          } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                        />
                                      )}
                                    />
                                  </div>
                                )}

                                <div className="col-span-1 items-center place-content-center">
                                  <Controller
                                    name={`productSaleLists[${k}].isFree`}
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                      <div>
                                        <input
                                          {...field}
                                          id={`isFree-${k}`}
                                          type="radio"
                                          value="0"
                                          checked={field.value == "0"}
                                          onChange={() => {
                                            setValue(
                                              `productSaleLists[${k}].priceSale`,
                                              watch(
                                                `productSaleLists[${k}].defaultPriceSale`,
                                              ),
                                            );
                                            field.onChange("0");
                                          }}
                                          className="mr-2"
                                        />
                                        <label
                                          htmlFor="isFree-0"
                                          className="text-green-400"
                                        >
                                          ซื้อ
                                        </label>

                                        {import.meta.env.VITE_SYSTEM_NAME ==
                                        "THUNDER" ? (
                                          <>
                                            <input
                                              {...field}
                                              id={`isFree-${k}-1`}
                                              type="radio"
                                              value="1"
                                              checked={field.value == "1"}
                                              onChange={() => {
                                                setValue(
                                                  `productRepairLists[${k}].priceSale`,
                                                  0,
                                                );
                                                field.onChange("1");
                                              }}
                                              className="mr-2 ml-4"
                                            />
                                            <label
                                              htmlFor={`isFree-${k}-1`}
                                              className="text-red-400"
                                            >
                                              แถม
                                            </label>
                                          </>
                                        ) : null}

                                        <input
                                          {...field}
                                          id={`isFree-${k}-2`}
                                          type="radio"
                                          value="2"
                                          checked={field.value == "2"}
                                          onChange={() => {
                                            setValue(
                                              `productSaleLists[${k}].priceSale`,
                                              0,
                                            );
                                            field.onChange("2");
                                          }}
                                          className="mr-2 ml-4"
                                        />
                                        <label
                                          htmlFor={`isFree-${k}-2`}
                                          className="text-blue-400"
                                        >
                                          เครม
                                        </label>
                                      </div>
                                    )}
                                  />
                                </div>

                                <div className="col-span-3">
                                  <button
                                    type="button"
                                    className="w-full py-2 text-red-500 hover:bg-red-50 rounded-md border border-red-200 flex items-center justify-center"
                                    onClick={() => {
                                      const currentList =
                                        watch("productSaleLists");
                                      const updatedList = currentList.filter(
                                        (_, index) => index !== k,
                                      );
                                      setValue("productSaleLists", updatedList);
                                    }}
                                  >
                                    <MdOutlineClose className="text-xl" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="items-center col-span-4">
                <HorizontalRule />
              </div>

              <div className="items-center col-span-4 lg:col-span-2">
                {watch("isMobileSale") == "1" &&
                RowData.isCash == "0" ? null : (import.meta.env
                    .VITE_SYSTEM_NAME == "THUNDER" &&
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

            <div className="items-center col-span-4">
              <label
                htmlFor="uploadFileProductSale"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                อัพโหลดไฟล์ png, jpeg, jpg
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

            {!isEmpty(watch("productSaleImages")) ? (
              <div className="items-center col-span-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-2 lg:col-span-2">
                    <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                  </div>
                  <div className="col-span-2 lg:col-span-2">
                    <DragAndDropImages
                      images={watch("productSaleImages")}
                      submitSwitch={() => {}}
                      onDelete={() => {}}
                      showDelete={false}
                    />
                  </div>
                </div>
              </div>
            ) : null}
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
