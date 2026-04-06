/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdClose } from "react-icons/md";
import PropTypes from "prop-types";
import { useAuth } from "src/hooks/authContext";
import { fetchInfoProductLogs } from "src/store/productLog";
import { isEmpty } from "lodash";
import { useLocation } from "react-router-dom";
import DragAndDropImages from "src/components/dragAndDropImages";
import FileDropzone from "src/helpers/fileDropzone";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import HorizontalRule from "src/helpers/horizontalRule";
import { useForm } from "react-hook-form";
import {
  deleteProductImage,
  updateProductImageSeq,
} from "src/store/productImage";
import { updateProductBuy } from "src/store/product";
import { formatDateTimeZoneTH } from "src/helpers/formatDate";
import { formatNumberDigit } from "src/helpers/formatNumber";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

/* -------------------- Labels -------------------- */
const FIELD_LABELS = {
  // identity
  catalog: "หมวดหมู่",
  code: "รหัสสินค้า",
  imei: "IMEI",

  // NEW: สเปคสินค้า (ชื่อจะมาจาก RowData.product.*.name)
  productBrand: "ยี่ห้อ",
  productModel: "รุ่น",
  productColor: "สี",
  productStorage: "ความจุ",
  productType: "ชนิดสินค้า",

  // condition
  batteryHealth: "แบตฯ (%)",
  machineCondition: "สภาพเครื่อง (%)",
  hand: "สภาพการใช้งาน",
  boxType: "อุปกรณ์/กล่อง",
  simType: "รองรับซิม",
  simName: "ชื่อซิม",
  freeGift: "ของแถม",

  // warranty
  buyFormShop: "ซื้อจากร้าน",
  shopInsurance: "ประกันร้าน",
  shopCenterInsurance: "ประกันศูนย์",
  shopCenterInsuranceDate: "วันหมดประกันศูนย์",

  // finance
  isFinance: "ผ่อนชำระ",
  payPerMonth: "ผ่อนต่อเดือน",
  valueMonth: "จำนวนเดือนผ่อน",

  // money
  priceCostBuy: "ทุนซื้อเข้า",
  priceRepair: "ค่าซ่อม",
  priceCommission: "ค่าคอมมิชชั่น",
  priceReRider: "ค่าขนส่ง",
  priceRegAppleId: "ค่าลงทะเบียน Apple ID",
  priceETC: "ค่าใช้จ่ายอื่นๆ",
  priceWholeSale: "ราคาส่ง",
  priceSale: "ราคาขาย",
  priceDownPaymentPercent: "เปอร์เซ็นต์ดาวน์",
  priceDownPayment: "เงินดาวน์",

  // meta
  amount: "จำนวน",
  active: "สถานะใช้งาน",
  note: "หมายเหตุ",
  create_date: "วันที่สร้าง",
  branchId: "สาขา",

  // ที่ไม่แสดงอยู่แล้ว (กำหนด label ไว้เฉย ๆ)
  refOldStockNumber: "รหัสสต็อกเก่า",
  lotNumber: "ล็อต",
};

/* -------------------- Visibility -------------------- */
const EXTRA_HIDE_KEYS = new Set([
  "priceSumSale",
  "priceSumWithdraw",
  "amountSale",
  "amountFree",
  "amountClaim",
  "amountWithdraw",
  "amountRemaining",
  "fileProduct",
  "randomCode",
  "id",
  "returnShopForm",
  "returnCustomerForm",
  "priceDownPaymentPercent",
  "priceWholeSale",
  "priceSale",
  "priceDownPayment",
  "isFinance",
  "branchId",
  "payPerMonth",
  "valueMonth",
  // ซ่อนตามคำขอ
  "lotNumber",
  "refOldStockNumber",
  "active",
]);

const shouldHideKey = (key) => {
  if (!key) return false;
  if (EXTRA_HIDE_KEYS.has(key)) return true;
  if (key === "branchId") return false; // Always show branchId
  return /id$/i.test(key); // ซ่อน keys ที่ลงท้ายด้วย id (เช่น productBrandId)
};

/* -------------------- Formatters -------------------- */
const isNumeric = (v) =>
  typeof v === "number" ||
  (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v)));

const isISODate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v);

const baht = (v) => {
  if (!isNumeric(v)) return v ?? "";
  const n = Number(v);
  return n.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const percent = (v) => {
  if (!isNumeric(v)) return v ?? "";
  const n = Number(v);
  return `${n}%`;
};

const dateTH = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const yesNo = (v) => {
  if (v === "1" || v === 1 || v === true || v === "ใช่" || v === "มี")
    return "มี/ใช่";
  if (v === "0" || v === 0 || v === false || v === "ไม่" || v === "ไม่มี")
    return "ไม่มี";
  return v ?? "";
};

// IMEI: ไม่แบ่ง 3 หลัก, ถ้าหลายค่าให้คั่นด้วย ", "
const splitDigitsIntoImeis = (digits) => {
  const out = [];
  let i = 0;
  while (i + 15 <= digits.length) {
    out.push(digits.slice(i, i + 15));
    i += 15;
  }
  const rem = digits.slice(i);
  if (rem.length >= 11) out.push(rem);
  return out;
};
const formatImei = (value) => {
  if (value == null) return "";
  const raw = Array.isArray(value) ? value.join(",") : String(value);
  const allDigits = raw.replace(/\D+/g, "");
  if (!allDigits) return "";
  if (allDigits.length === 15) return allDigits;
  if (allDigits.length > 15) return splitDigitsIntoImeis(allDigits).join(", ");
  return allDigits;
};

const MONEY_KEYS = new Set([
  "priceCostBuy",
  "priceWholeSale",
  "priceSale",
  "priceDownPayment",
  "priceRepair",
  "priceCommission",
  "priceReRider",
  "priceRegAppleId",
  "priceETC",
  "priceSumSale",
  "priceSumWithdraw",
]);

const PERCENT_KEYS = new Set([
  "batteryHealth",
  "machineCondition",
  "priceDownPaymentPercent",
]);
const DATE_KEYS = new Set(["shopCenterInsuranceDate", "create_date"]);

const formatValue = (key, value) => {
  if (value === null || value === undefined || value === "") return "";

  const lower = String(key).toLowerCase();
  if (lower === "imei") return formatImei(value);

  if (MONEY_KEYS.has(key)) return `${baht(value)} บาท`;
  if (PERCENT_KEYS.has(key)) return percent(value);
  if (DATE_KEYS.has(key) || isISODate(value)) return dateTH(value);
  if (["shopInsurance", "isFinance"].includes(key)) return yesNo(value);
  if (isNumeric(value)) return Number(value).toLocaleString("th-TH");

  // กรณีมือหนึ่ง-มือสอง
  if (value === "มือสอง") return "มือ 2";
  if (value === "มือหนึ่ง") return "มือ 1";

  return String(value);
};

const labelOf = (key) => FIELD_LABELS[key] || key;

/* -------------------- Grouping (การ์ด 2 คอลัมน์) -------------------- */
const GROUPS = [
  {
    key: "identity",
    title: "ข้อมูลตัวตนสินค้า",
    keys: ["catalog", "code", "imei"],
    accent: "border-indigo-200",
  },
  {
    key: "specs",
    title: "สเปคสินค้า",
    keys: [], // เติม runtime
    accent: "border-sky-200",
  },
  {
    key: "condition",
    title: "สภาพ/อุปกรณ์",
    keys: [
      "hand",
      "machineCondition",
      "batteryHealth",
      "boxType",
      "simType",
      "simName",
      "freeGift",
    ],
    accent: "border-emerald-200",
  },
  {
    key: "warranty",
    title: "ประกัน",
    keys: [
      "buyFormShop",
      "shopInsurance",
      "shopCenterInsurance",
      "shopCenterInsuranceDate",
    ],
    accent: "border-amber-200",
  },
  {
    key: "money",
    title: "ยอดเงิน",
    keys: [
      "priceCostBuy",
      "priceRepair",
      "priceCommission",
      "priceReRider",
      "priceRegAppleId",
      "priceETC",
    ],
    accent: "border-rose-200",
  },
  {
    key: "repairs",
    title: "ประวัติการซ่อม",
    keys: [],
    accent: "border-slate-200",
  },
  {
    key: "transfer",
    title: "โอน/รับ สินค้า",
    keys: [],
    accent: "border-slate-200",
  },

  {
    key: "meta",
    title: "อื่น ๆ",
    keys: ["amount", "note", "create_date", "branchId"],
    accent: "border-slate-200",
  },
];

/* -------------------- Small UI helpers -------------------- */
const FieldRow = ({ k, before, after }) => {
  const hasBefore = !(before === null || before === undefined || before === "");
  const hasAfter = !(after === null || after === undefined || after === "");
  const isDifferent = JSON.stringify(before) !== JSON.stringify(after);
  const isIMEI = String(k).toLowerCase() === "imei";
  const mono = isIMEI ? "font-mono" : "";

  if (!hasAfter) {
    return (
      <div className="grid grid-cols-12 gap-2 py-1">
        <div className="col-span-4 text-slate-600">{labelOf(k)}</div>
        <div className={`col-span-8 ${mono}`}>
          {formatValue(k, hasBefore ? before : "")}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-2 py-1">
      <div className="col-span-4 text-slate-600">{labelOf(k)}</div>
      <div className={`col-span-8 flex flex-wrap gap-2 items-baseline ${mono}`}>
        {hasBefore && isDifferent ? (
          <span className="line-through decoration-1 text-slate-400">
            {formatValue(k, before)}
          </span>
        ) : null}
        <span
          className={
            isDifferent ? "text-green-700 font-medium" : "text-slate-800"
          }
        >
          {isDifferent ? "→ " : ""}
          {formatValue(k, after)}
        </span>
        {isDifferent ? (
          <span className="ml-1 inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-[10px]">
            เปลี่ยนแปลง
          </span>
        ) : null}
      </div>
    </div>
  );
};

const Card = ({ title, accent, children }) => (
  <div className={`rounded-xl border ${accent} bg-white shadow-sm`}>
    <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
    </div>
    <div className="px-4 py-3">{children}</div>
  </div>
);

const RepairRow = ({ r }) => {
  return (
    <div className="relative">
      {/* timeline dot */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                วันที่ซ่อม
              </th>
              <th scope="col" className="px-6 py-3">
                รายการซ่อม
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                ต้นทุนซ่อม
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                ต้นทุนเครื่องสุทธิ
              </th>
            </tr>
          </thead>
          <tbody>
            {(r || []).map((e, k) => {
              const priceEquipCost = Number(e.priceEquipCost) || 0;
              const mobilePriceCost = Number(e.mobilePriceCost) || 0;

              return (
                <tr className="bg-white border-b" key={k}>
                  <td className="px-6 py-4">
                    {formatDateTimeZoneTH(e.create_date)}
                  </td>
                  <td className="px-6 py-4">{e?.note || ""}</td>
                  <td className="px-6 py-4 text-right">
                    {formatNumberDigit(priceEquipCost)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {formatNumberDigit(mobilePriceCost)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* -------------------- Component -------------------- */
const ModalStockProductLog = ({ open, setModal, RowData }) => {
  const location = useLocation();

  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const [Before, setBefore] = React.useState(null);
  const [After, setAfter] = React.useState(null);

  const [ProductImages, setProductImages] = React.useState([]);
  const [ProductRepairs, setProductRepairs] = React.useState([]); // ✅ NEW
  const [LatestTransfer, setLatestTransfer] = React.useState(null); // ✅ NEW

  const modalRef = React.useRef(null);
  const container = React.useRef(null);

  const dispatch = useDispatch();
  const store = useSelector((state) => state.productLog);

  React.useEffect(() => {
    if (open && modalRef.current) {
      setProductImages([]);
      setProductRepairs([]); // ✅ reset
      modalRef.current.focus();
      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      }
    }
  }, [open]);

  // parse และ enrich ชื่อสเปคจาก RowData.product
  React.useEffect(() => {
    if (!isEmpty(store.data)) {
      try {
        const { obj, product } = store.data;

        setProductImages(product?.productImages ?? []);
        setProductRepairs(product?.productRepairs ?? []); // ✅ NEW

        setLatestTransfer(product?.latestTransferProductBranchList ?? null);

        const parsed = typeof obj === "string" ? JSON.parse(obj) : obj;
        const b = parsed?.before || null;
        const aRaw = parsed?.after || null;

        // ใช้ catalog ปัจจุบัน (after > before)
        const catalogNow = (aRaw?.catalog ?? b?.catalog ?? "").toString();

        // สร้าง derived fields จาก RowData.product.*.name
        const p = RowData?.product || {};

        const derivedBase = {
          productBrand: p?.productBrand?.name || "",
          productModel: p?.productModel?.name || "",
          productColor: p?.productColor?.name || "",
        };
        const derivedConditional =
          catalogNow === "มือถือ"
            ? {
                productStorage: p?.productStorage?.name || "",
                productType: p?.productType?.name || "",
              }
            : {};

        // merge ลง After เพื่อให้ renderer เห็นค่า "หลัง"
        const a = aRaw
          ? { ...aRaw, ...derivedBase, ...derivedConditional }
          : { ...derivedBase, ...derivedConditional };

        setBefore(b || null);
        setAfter(a || null);
      } catch {
        setBefore(null);
        setAfter(null);
        setProductRepairs([]); // ✅ safe
      }
    }
  }, [store, RowData]);

  const getTitle = () => {
    if (location.pathname === "/products/mobileBuy") {
      return "ประวัติการซื้อเข้า";
    }
    return "ประวัติการเคลื่อนไหวสินค้า";
  };

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoProductLogs(id))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const { handleSubmit, control, setValue, reset } = useForm({
    defaultValues: { uploadFileProduct: [] },
  });

  const onSubmit = (data) => {
    setIsLoadingOpen(true);

    dispatch(
      updateProductBuy({
        id: RowData.product.id,
        code: RowData.product.code,
        ...data,
      }),
    )
      .unwrap()
      .then(() => {
        reset({ uploadFileProduct: [] });
        dispatch(fetchInfoProductLogs(RowData.id));
        setIsLoadingOpen(false);
      })
      .catch(() => setIsLoadingOpen(false));
  };

  const submitSwitch = (items) => {
    setIsLoadingOpen(true);
    dispatch(updateProductImageSeq(items))
      .unwrap()
      .then(() => {
        dispatch(fetchInfoProductLogs(RowData.id));
        setIsLoadingOpen(false);
      })
      .catch(() => setIsLoadingOpen(false));
  };

  const onDelete = (item) => {
    setIsLoadingOpen(true);
    dispatch(deleteProductImage(item.id))
      .unwrap()
      .then(() => {
        dispatch(fetchInfoProductLogs(RowData.id));
        setIsLoadingOpen(false);
      })
      .catch(() => setIsLoadingOpen(false));
  };

  // ดึงคีย์ที่ไม่ถูกซ่อน
  const visibleKeys = React.useMemo(() => {
    const keys = new Set([
      ...(Before ? Object.keys(Before) : []),
      ...(After ? Object.keys(After) : []),
    ]);
    return Array.from(keys).filter((k) => !shouldHideKey(k));
  }, [Before, After]);

  // จัด key ลงกลุ่ม + เติมคีย์สเปคตามเงื่อนไข
  const grouped = React.useMemo(() => {
    const byGroup = {};
    GROUPS.forEach((g) => (byGroup[g.key] = []));

    // เตรียมลิสต์สเปค (brand/model/color เสมอ; storage/type เฉพาะมือถือ)
    const specsKeys = ["productBrand", "productModel", "productColor"];
    const shouldShowStorageType =
      (After?.catalog ?? Before?.catalog) === "มือถือ";
    if (shouldShowStorageType) specsKeys.push("productStorage", "productType");

    // ใส่คีย์ให้แต่ละกลุ่ม
    GROUPS.forEach((g) => {
      const baseKeys = g.key === "specs" ? specsKeys : g.keys;
      baseKeys.forEach((k) => {
        if (visibleKeys.includes(k)) byGroup[g.key].push(k);
      });
    });

    // คีย์ที่ยังไม่ถูกจัดกลุ่ม → โยนไป "อื่น ๆ"
    const allInGroups = new Set([
      ...GROUPS.flatMap((g) => (g.key === "specs" ? specsKeys : g.keys)),
    ]);
    visibleKeys.forEach((k) => {
      if (!allInGroups.has(k)) byGroup.meta.push(k);
    });

    return byGroup;
  }, [visibleKeys, Before, After]);

  const renderTransfer = () => {
    // latestTransferProductBranchList (object เดี่ยว)
    const t = LatestTransfer?.transferProductBranch;

    if (!t) {
      return (
        <div className="text-sm text-slate-500">
          ยังไม่มีประวัติการโอนสินค้า
        </div>
      );
    }

    return (
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                จากสาขา
              </th>
              <th scope="col" className="px-6 py-3">
                ไปยังสาขา
              </th>
              <th scope="col" className="px-6 py-3">
                เมื่อ
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b">
              <td className="px-6 py-4">{t?.branch?.name || "-"}</td>
              <td className="px-6 py-4">{t?.toBranch?.name || "-"}</td>
              <td className="px-6 py-4">
                {t?.create_date ? formatDateTimeZoneTH(t.create_date) : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderRepairs = () => {
    const list = Array.isArray(ProductRepairs) ? [...ProductRepairs] : [];
    if (list.length === 0) {
      return (
        <div className="text-sm text-slate-500">ยังไม่มีประวัติการซ่อม</div>
      );
    }

    return <RepairRow r={list} />;
  };

  const renderGroup = (g) => {
    if (g.key === "repairs") {
      return (
        <Card key={g.key} title={g.title} accent={g.accent}>
          {renderRepairs()}
        </Card>
      );
    }

    if (g.key === "transfer") {
      return (
        <Card key={g.key} title={g.title} accent={g.accent}>
          {renderTransfer()}
        </Card>
      );
    }

    const keys = grouped[g.key];
    if (!keys || keys.length === 0) return null;

    return (
      <Card key={g.key} title={g.title} accent={g.accent}>
        <div className="divide-y divide-slate-100">
          {keys.map((k) => (
            <div key={k} className="py-2">
              <FieldRow k={k} before={Before?.[k]} after={After?.[k]} />
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      className={`${
        open
          ? "fixed inset-0 z-30 flex justify-center items-start md:items-center p-4"
          : "hidden"
      }`}
      onKeyDown={(e) => (e.key === "Escape" ? setModal(false) : null)}
      onClick={() => setModal(false)}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`relative w-full max-w-4xl`}
        ref={container}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px]" />

        {/* Panel */}
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto overscroll-contain"
          ref={container}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b px-5 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-slate-900">
                  {getTitle()}
                </h3>
              </div>
              <button
                type="button"
                className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg w-9 h-9 inline-flex justify-center items-center"
                onClick={() => setModal(false)}
                aria-label="ปิด"
                title="ปิด"
              >
                <MdClose size={18} />
              </button>
            </div>
          </div>

          {/* Content: การ์ด 2 คอลัมน์ */}
          <div className="p-4 md:p-6">
            {Before || After ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {GROUPS.map(renderGroup)}

                <div className="col-span-2">
                  <label
                    htmlFor="uploadFileProduct"
                    className="block text-sm font-medium text-gray-700 mr-2"
                  >
                    อัพโหลดไฟล์ png, jpeg, jpg
                  </label>
                  <FileDropzone
                    isOpen={open}
                    name="uploadFileProduct"
                    acceptedFileTypes={acceptedFileTypes}
                    control={control}
                    maxFileSize={5}
                    fileMultiple={true}
                    setValue={setValue}
                  />
                </div>

                <div className="col-span-2">
                  <HorizontalRule />
                </div>

                {!isEmpty(ProductImages) ? (
                  <div className="col-span-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <p className="text-2xl">รูปที่เคยอัพโหลด</p>
                      </div>
                      <div className="col-span-2">
                        <DragAndDropImages
                          images={ProductImages}
                          submitSwitch={submitSwitch}
                          onDelete={onDelete}
                          showDelete={true}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-slate-500">ไม่พบข้อมูล</div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center p-4 lg:p-5 border-t border-gray-200 rounded-b">
            {location.pathname === "/products/mobileBuy" ? (
              <button
                disabled={isLoadingOpen}
                type="submit"
                className="py-2 px-5 ml-3 text-sm text-white bg-blue-400 rounded-lg border border-blue-400 hover:bg-blue-500"
              >
                ยืนยัน
              </button>
            ) : null}

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

ModalStockProductLog.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
};

export default ModalStockProductLog;
