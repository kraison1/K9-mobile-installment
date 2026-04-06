// TableStockProduct.jsx
import React from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { formatNumberDigit } from "src/helpers/formatNumber";
import {
  formatDateNumberWithoutTime,
  formatDateTimeOnlyZoneTH,
} from "src/helpers/formatDate";

const TableStockProduct = ({
  tableHeaders,
  tableLists,
  onClick,
  page,
  pageSize,
}) => {
  const isThunder = import.meta.env.VITE_SYSTEM_NAME == "THUNDER";

  const formatValue = (key, value) => {
    // เงื่อนไขที่คุณระบุ
    if (value === "มือสอง") return "มือ 2"; // hand
    if (value === "มือหนึ่ง") return "มือ 1"; // hand
    // if (value === "ครบกล่องตรงอีมี่") return "มี"; // boxType

    return String(value);
  };

  // ✅ แปลง obj เป็น JSON และ merge เข้า field ที่ตารางใช้งาน
  const extrackObj = (row) => {
    let before = null;

    // parse obj (รองรับทั้ง string และ object/null)
    if (row?.obj) {
      try {
        const parsed =
          typeof row.obj === "string" ? JSON.parse(row.obj) : row.obj;
        before = parsed?.before || null;
      } catch (e) {
        before = null;
      }
    }

    // ถ้าไม่มี before ก็คืนค่าตามเดิม
    if (!before) return row;

    // เตรียม product เดิม (อาจไม่มี ถ้าไม่ join product ตอน "ซื้อเข้า")
    const prod = row.product || {};

    // คืน row ใหม่ โดยให้ค่าจาก product เดิมชนะ และใช้ before เป็น fallback
    return {
      ...row,
      // บางที่ใน UI อ้าง row.code โดยตรง — เติมให้มี
      code: row.code || prod.code || before.code || "",

      product: {
        ...prod,
        // Fallback จาก before.*
        code: before.code ?? prod.code ?? "",
        imei: before.imei ?? prod.imei ?? "",
        batteryHealth: before.batteryHealth ?? prod.batteryHealth ?? 0,
        boxType: formatValue("boxType", before.boxType ?? prod.boxType ?? ""),
        hand: formatValue("hand", before.hand ?? prod.hand ?? ""),
        machineCondition: before.machineCondition ?? prod.machineCondition ?? 0,
        priceCostBuy: before.priceCostBuy ?? prod.priceCostBuy ?? 0,
        priceSale: before.priceSale ?? prod.priceSale ?? 0,
        create_date: before.create_date ?? prod.create_date ?? row.create_date,
        buyFormShop: before.buyFormShop ?? prod.buyFormShop ?? row.buyFormShop,

        // ชื่อแบรนด์/รุ่น/สี/ความจุ ถ้าไม่ join จะไม่มีชื่อ (มีแต่ id ใน before)
        // คุณอาจเลือกแสดงเป็น id ชั่วคราว หรือปล่อยว่าง
        productBrand:
          prod.productBrand ??
          (before.productBrandName
            ? { name: before.productBrandName }
            : prod.productBrand),
        productModel:
          prod.productModel ??
          (before.productModelName
            ? { name: before.productModelName }
            : prod.productModel),
        productColor:
          prod.productColor ??
          (before.productColorName
            ? { name: before.productColorName }
            : prod.productColor),
        productStorage:
          prod.productStorage ??
          (before.productStorageName
            ? { name: before.productStorageName }
            : prod.productStorage),
        productType:
          prod.productType ??
          (before.productTypeName
            ? { name: before.productTypeName }
            : prod.productType),

        // ถ้าอยาก fallback เป็น “ID” ชั่วคราว ให้ uncomment ข้างล่างนี้แทน (แล้วแก้ข้อความใน UI ตามต้องการ)
        // productBrand: prod.productBrand ?? { name: before.productBrandId ? `#${before.productBrandId}` : "" },
        // productModel: prod.productModel ?? { name: before.productModelId ? `#${before.productModelId}` : "" },
        // productColor: prod.productColor ?? { name: before.productColorId ? `#${before.productColorId}` : "" },
        // productStorage: prod.productStorage ?? { name: before.productStorageId ? `#${before.productStorageId}` : "" },
        // productType: prod.productType ?? { name: before.productTypeId ? `#${before.productTypeId}` : "" },
      },
    };
  };

  return (
    <div className="overflow-x-auto">
      <table className="rounded-sm text-left border border-collapse border-1 table-auto w-full truncate">
        <thead className="text-gray-900">
          <tr className="bg-white">
            {tableHeaders.map((TableList, k) => (
              <th
                key={k}
                className={`${
                  isEmpty(TableList.align) ? "" : `${TableList.align}`
                } border bg-gray-300 p-2`}
              >
                {TableList.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableLists.map((rawRow, k) => {
            // ✅ ใช้ extrackObj ที่นี่ ให้ทุกแถวมีข้อมูลพร้อมใช้
            const TableList = extrackObj(rawRow);

            return (
              <tr className="bg-white" key={k}>
                <td className="border p-2 font-light text-right">
                  {formatNumberDigit((page - 1) * pageSize + k + 1)}
                </td>

                <td className="border p-2 font-light text-center">
                  <p
                    className="font-light text-blue-500 cursor-pointer"
                    onClick={() => onClick(TableList)}
                  >
                    <p>{TableList.code}</p>
                  </p>
                </td>

                <td className="border p-2 font-light truncate text-center">
                  {`${TableList.product?.productModel?.name || ""}`}
                </td>

                <td className="border p-2 font-light truncate text-center">
                  {`${TableList.product?.productStorage?.name || ""}`}
                </td>

                <td className="border p-2 font-light truncate text-center">
                  {`${TableList.product?.productColor?.name || ""}`}
                </td>

                <td className="border p-2 font-light truncate text-center">
                  {`${TableList.product?.batteryHealth || 0}%`}
                </td>

                <td className="border p-2 font-light truncate text-center">
                  {TableList.product?.boxType}
                </td>

                <td className="border p-2 font-light text-center">
                  <p>{TableList.product?.hand}</p>
                </td>

                <td className="border p-2 font-light truncate text-center">
                  {`${TableList.product?.productBrand?.name || ""}`}
                </td>

                <td className="border p-2 font-light text-center">
                  <p>{TableList.product?.imei}</p>
                </td>

                <td className="border p-2 font-light truncate text-center">
                  {`${TableList?.product?.machineCondition || 0}%`}
                </td>

                {isThunder ? (
                  <>
                    <td className="border p-2 font-light truncate">
                      {TableList?.product?.buyFormShop || ""}
                    </td>
                    <td className="border p-2 font-light truncate">
                      <p>
                        {formatDateNumberWithoutTime(
                          TableList?.product?.create_date
                        ) || ""}
                      </p>
                      <p>
                        {formatDateTimeOnlyZoneTH(
                          TableList?.product?.create_date
                        ) || ""}
                      </p>
                    </td>
                    <td className="border p-2 font-light truncate text-right">
                      {formatNumberDigit(TableList?.product?.priceCostBuy || 0)}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border p-2 font-light truncate">
                      <p>
                        {formatDateNumberWithoutTime(
                          TableList?.product?.create_date
                        ) || ""}
                      </p>
                      <p>
                        {formatDateTimeOnlyZoneTH(
                          TableList?.product?.create_date
                        ) || ""}
                      </p>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

TableStockProduct.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  onSelectItems: PropTypes.func,
  selectedItems: PropTypes.array,
  onSelectAll: PropTypes.func,
};

export default TableStockProduct;
