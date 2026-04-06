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
import { fetchScanProduct, fetchSelectProduct } from "src/store/product";
import { fetchSelectTransport } from "src/store/transport";
import { th } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import {
  fetchSelectCustomer,
  fetchSelectMirrorCustomer,
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
import { error } from "../alart";

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
  const [MirrorCustomers, setMirrorCustomers] = React.useState([]);
  const [Transports, setTransports] = React.useState([]);
  const [RateFinances, setRateFinances] = React.useState([]);
  const [defaultPrice, setDefaultPrice] = React.useState([]);

  const [ContactCode, setContactCode] = React.useState("");
  const storeProduct = useSelector((state) => state.product);
  const storeCustomer = useSelector((state) => state.customer);
  const storeTransport = useSelector((state) => state.transport);
  const storeRateFinance = useSelector((state) => state.rateFinance);
  const storeBank = useSelector((state) => state.bank);

  const storeDefaultProductPrice = useSelector(
    (state) => state.defaultProductPrice
  );

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
        }))
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
        }))
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
        }))
      );
    }
  }, [storeTransport.select]);

  React.useEffect(() => {
    if (!isEmpty(storeDefaultProductPrice.select)) {
      setDefaultPrice(
        storeDefaultProductPrice.select.map((item) => ({
          label: item.label,
          value: item.value,
        }))
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
        }))
      );
    }
  }, [storeRateFinance.select]);

  React.useEffect(() => {
    if (!isEmpty(storeCustomer.select)) {
      setCustomers(
        storeCustomer.select.map((item) => ({
          value: item.id,
          label: `${item.name} ${item.lastname} (${item.citizenIdCard})`,
        }))
      );
    }
  }, [storeCustomer.select]);

  React.useEffect(() => {
    if (!isEmpty(storeCustomer.selectMirror)) {
      setMirrorCustomers(
        storeCustomer.selectMirror.map((item) => ({
          value: item.id,
          label: `${item.name} ${item.lastname} (${item.citizenIdCard})`,
        }))
      );
    }
  }, [storeCustomer.selectMirror]);

  const loadOptionsCustomer = React.useCallback(
    debounce((inputValue, callback) => {
      if (!inputValue) {
        callback([]);
        return;
      }

      dispatch(
        fetchSelectCustomer({
          branchId: user.branchId,
          customerType: ["1", "3"],
          search: inputValue,
        })
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
    [dispatch, user.branchId]
  );

  const loadOptionsMirrorCustomer = React.useCallback(
    debounce((inputValue, callback) => {
      if (!inputValue) {
        callback([]);
        return;
      }

      dispatch(
        fetchSelectMirrorCustomer({
          branchId: user.branchId,
          customerType: ["1", "3"],
          search: inputValue,
        })
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
    [dispatch, user.branchId]
  );

  const changeTypePrice = (priceType) => {
    if (isNumber(watch("productId"))) {
      const product = Products.find((e) => e.value == watch("productId"));

      setValue(
        "priceSale",
        priceType == "1" ? product.priceWholeSale : product.priceSale
      );
    }
  };

  const loadOptionsProduct = React.useCallback(
    debounce((inputValue, callback) => {
      if (!inputValue) {
        callback([]);
        return;
      }

      dispatch(
        fetchScanProduct({
          branchId: user.branchId,
          catalog: "มือถือ",
          search: inputValue,
          active: "1",
        })
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
                (opt) => !prev.some((p) => p.value === opt.value)
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
    [dispatch, user.branchId]
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

  const debouncedFetch = React.useCallback(
    debounce((inputValue, callback) => {
      const productSaleLists = getValues("productSaleLists") || [];
      const existingProduct = productSaleLists.find(
        (item) => item.code === inputValue
      );

      if (existingProduct) {
        const updatedproductBuyLists = productSaleLists.map((item) =>
          item.code === inputValue ? { ...item, amount: item.amount + 1 } : item
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
        })
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
    [dispatch]
  );

  React.useEffect(() => {
    if (open && modalRef.current) {
      if (RowData.isMobileSale == "1") {
        if (isNumber(RowData.productBookId)) {
          dispatch(
            fetchSelectProduct({
              branchId: user.branchId,
              catalog: "มือถือ",
              search: RowData.product?.imei || "",
              active: RowData.product == undefined ? "1" : "6",
            })
          );

          dispatch(
            fetchSelectCustomer({
              branchId: user.branchId,
              customerType: ["1", "3"],
              search: RowData.customerId,
            })
          );

          dispatch(
            fetchSelectMirrorCustomer({
              branchId: user.branchId,
              customerType: ["1", "3"],
              search: RowData.customerMirrorId,
            })
          );
        } else if (isNumber(RowData.productSavingId)) {
          dispatch(
            fetchSelectProduct({
              branchId: user.branchId,
              catalog: "มือถือ",
              search: RowData.product?.imei || "",
              active: RowData.product == undefined ? "1" : "7",
            })
          );

          dispatch(
            fetchSelectCustomer({
              branchId: user.branchId,
              customerType: ["1", "3"],
              search: RowData.customerId,
            })
          );

          dispatch(
            fetchSelectMirrorCustomer({
              branchId: user.branchId,
              customerType: ["1", "3"],
              search: RowData.customerMirrorId,
            })
          );
        } else {
          // console.log(RowData);

          dispatch(
            fetchSelectProduct({
              branchId: user.branchId,
              catalog: "มือถือ",
              search: RowData.id == undefined ? "" : RowData.product.imei,
              active: RowData.id == undefined ? "1" : "3",
            })
          );

          dispatch(
            fetchSelectCustomer({
              branchId: user.branchId,
              customerType: ["1", "3"],
              search: RowData.id == undefined ? "" : RowData.customerId,
            })
          );

          dispatch(
            fetchSelectMirrorCustomer({
              branchId: user.branchId,
              customerType: ["1", "3"],
              search: RowData.id == undefined ? "" : RowData.customerMirrorId,
            })
          );
        }
      }

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
            Number(values.priceRegAppleId || 0)
        ) - Number(values.priceDiscount || 0);
    } else {
      total =
        Number(
          Number(values.priceAdjusted || 0) +
            Number(values.priceReRider || 0) +
            Number(values.priceRegAppleId || 0)
        ) - Number(values.priceDiscount || 0);
    }

    const priceEquipSum = calculateProductSaleListsTotal(
      values.productSaleLists || []
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
    [setValue] // เพิ่ม setValue เพราะใช้งานในนี้
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
        watch("valueEqual")
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
          Math.floor(priceSumAdjusted / valueMonth)
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
                : watch("payPerMonth")
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
                : watch("payPerMonth")
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
    valueEqual
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
        className={`relative w-full max-w-4xl`}
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
                  <div className="col-span-4">
                    <h2 className="text-red-500">สิทธิการแก้ไขสัญญา</h2>
                  </div>

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

            {watch("id") ? (
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
                            "0"
                          )
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
                          selectedOption ? selectedOption.value : ""
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
                      {watch("isMobileSale") === "1" &&
                        watch("isCash") == "1" && (
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

                      {watch("isMobileSale") === "1" &&
                        watch("isCash") == "0" && (
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

              {(import.meta.env.VITE_SYSTEM_NAME == "THUNDER" &&
                watch("saleType") == "1") ||
              (import.meta.env.VITE_SYSTEM_NAME == "THUNDER" &&
                watch("saleType") == "2") ? (
                <div className="items-center col-span-4 lg:col-span-1">
                  <label
                    htmlFor="priceType"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    ใช้ราคา
                  </label>
                  <Controller
                    name="priceType"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <div>
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
                              ? true
                              : false
                          }
                        />
                        <label htmlFor="priceType-1" className="text-red-500">
                          ราคาส่ง
                        </label>
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
                          className="mr-2 ml-4"
                          disabled={
                            watch("saleType") == 3 || watch("saleType") == 4
                              ? true
                              : false
                          }
                        />
                        <label htmlFor="priceType-2" className="text-green-500">
                          ราคาปลีก
                        </label>
                      </div>
                    )}
                  />
                  {errors.priceType && (
                    <span className="text-red-500 text-xs mt-1">
                      กรุณาเลือกข้อมูล ใช้ราคา
                    </span>
                  )}
                </div>
              ) : null}

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
                                        (option) => option.value === field.value
                                      ) || ""
                                    }
                                    onChange={(selectedOption) => {
                                      field.onChange(
                                        selectedOption?.value || ""
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
                        rules={{ required: true }}
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
                            value={
                              Customers.find(
                                (option) => option.value === field.value
                              ) || ""
                            }
                            onChange={(selectedOption) => {
                              field.onChange(selectedOption?.value || "");
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

                    {watch("saleType") == "3" ||
                    watch("saleType").includes("4") ? (
                      <div className="items-center col-span-4">
                        <label
                          htmlFor="customerMirrorId"
                          className="block text-sm font-medium text-gray-700 mr-2"
                        >
                          ลูกค้า/บัตรประชาชน/เลขผู้เสียภาษี (สัญญาร่วม)
                        </label>
                        <Controller
                          id="customerMirrorId"
                          name="customerMirrorId"
                          control={control}
                          rules={{ required: false }}
                          render={({ field }) => (
                            <AsyncSelect
                              {...field}
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 11 }),
                              }}
                              id="customerMirrorId"
                              defaultOptions={MirrorCustomers}
                              loadOptions={loadOptionsMirrorCustomer}
                              placeholder="กรุณาเลือกลูกค้า"
                              isClearable
                              isSearchable
                              classNamePrefix="react-select"
                              value={
                                MirrorCustomers.find(
                                  (option) => option.value === field.value
                                ) || ""
                              }
                              onChange={(selectedOption) => {
                                if (
                                  selectedOption?.value == watch("customerId")
                                ) {
                                  error("ไม่สามารถเลือก คู่สัญญาซ้ำ");
                                } else {
                                  field.onChange(selectedOption?.value || "");
                                }
                              }}
                            />
                          )}
                        />

                        {errors.customerMirrorId && (
                          <span className="text-red-500 text-xs mt-1">
                            กรุณาใส่ข้อมูล ลูกค้า / บัตรประชาชน
                          </span>
                        )}
                      </div>
                    ) : null}

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
                                        watch("create_date") || null
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
                                (option) => option.value === field.value
                              )}
                              onChange={(selectedOption) => {
                                reset({
                                  ...RowData,
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
                                        selectedOption.priceDownPayment
                                      );

                                      setValue(
                                        "priceDownPaymentPercent",
                                        selectedOption.priceDownPaymentPercent
                                      );

                                      setValue(
                                        "payPerMonth",
                                        selectedOption.payPerMonth
                                      );

                                      const findRateFinance = RateFinances.find(
                                        (e) =>
                                          e.valueMonth ==
                                          selectedOption.valueMonth
                                      );

                                      if (!isEmpty(findRateFinance)) {
                                        setValue(
                                          "rateFinanceId",
                                          findRateFinance.value
                                        );

                                        setValue(
                                          "valueMonth",
                                          findRateFinance.valueMonth
                                        );

                                        const valueEqual =
                                          watch("useCalType") == "1"
                                            ? findRateFinance.valueEqual
                                            : 1;

                                        setValue("valueEqual", valueEqual);

                                        calInitProduct(
                                          selectedOption.priceSale,
                                          selectedOption.priceDownPayment,
                                          selectedOption.priceDownPaymentPercent,
                                          valueEqual
                                        );
                                      }
                                    }

                                    if (watch("priceType") == "1") {
                                      setValue(
                                        "priceSale",
                                        selectedOption.priceWholeSale
                                      );
                                    } else {
                                      setValue(
                                        "priceSale",
                                        selectedOption.priceSale
                                      );
                                    }

                                    setValue(
                                      "priceWholeSale",
                                      selectedOption.priceWholeSale
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
                                    (option) => option.value === field.value
                                  ) || ""
                                }
                                onChange={(selectedOption) => {
                                  field.onChange(selectedOption?.value || "");

                                  if (!isEmpty(selectedOption)) {
                                    setValue(
                                      "valueMonth",
                                      selectedOption
                                        ? selectedOption.valueMonth
                                        : ""
                                    );

                                    const valueEqual =
                                      watch("useCalType") == "1"
                                        ? selectedOption.valueEqual
                                        : 1;
                                    setValue("valueEqual", valueEqual);

                                    const product = Products.find(
                                      (e) => e.value == watch("productId")
                                    );

                                    calInitProduct(
                                      product.priceSale,
                                      product.priceDownPayment,
                                      product.priceDownPaymentPercent,
                                      valueEqual
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
                                      watch("valueEqual")
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
                                        watch("valueEqual")
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

                    {isNumber(watch("rateFinanceId")) &&
                    permissions.includes("view-profit-loss") ? (
                      <div className="items-center col-span-4 lg:col-span-4">
                        <label
                          htmlFor="priceSumAdjusted"
                          className="block text-sm font-medium text-gray-700 mr-2"
                        >
                          รวมราคาจัด (บ.)
                        </label>
                        <Controller
                          id="priceSumAdjusted"
                          name="priceSumAdjusted"
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <input
                              {...field}
                              disabled
                              id="priceSumAdjusted"
                              type="number"
                              className={`mt-1 block w-full px-3 py-2 border ${
                                errors.priceSumAdjusted
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
                            />
                          )}
                        />
                        {errors.priceDownPayment && (
                          <span className="text-red-500 text-xs mt-1">
                            กรุณาใส่ข้อมูลร รวมราคาจัด
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="items-center col-span-4 lg:col-span-4"></div>
                    )}

                    {isNumber(watch("productId")) ? (
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

                    {isNumber(watch("productId")) ? (
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
                                              `productSaleLists[${k}].priceSale`
                                            )
                                        ) || 0
                                      }
                                      onChange={(v) => {
                                        if (v == null) {
                                          setValue(
                                            `productSaleLists[${k}].priceSale`,
                                            watch(
                                              `productSaleLists[${k}].defaultPriceSale`
                                            )
                                          );
                                        } else {
                                          setValue(
                                            `productSaleLists[${k}].priceSale`,
                                            v.value
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
                                              `productSaleLists[${k}].isFree`
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
                                                `productSaleLists[${k}].defaultPriceSale`
                                              )
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
                                                  0
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
                                              0
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
                                        (_, index) => index !== k
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
                          priceTotalPaid - priceCash
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
                          priceTotalPaid - priceTransferCash
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
                          priceReRider - priceReRiderCash
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
                          priceReRider - priceReRiderTransferCash
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
                          watch("priceRegAppleId")
                        );
                        setValue(
                          "priceRegAppleIdTransferCash",
                          priceRegAppleId - priceRegAppleIdCash
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
                          e.target.value
                        );
                        field.onChange(priceRegAppleIdTransferCash); // อัพเดตค่าใน form
                        const priceRegAppleId = Number(
                          watch("priceRegAppleId")
                        );
                        setValue(
                          "priceRegAppleIdCash",
                          priceRegAppleId - priceRegAppleIdTransferCash
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
                          priceEquipSum - priceEquipCash
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
                          priceEquipSum - priceEquipTransferCash
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

            <div className="items-center col-span-4">
              <HorizontalRule />
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
