import { isEmpty } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { formatNumberDigit } from "src/helpers/formatNumber";
import {
  formatDateNumberWithoutTime,
  formatDateTimeOnlyZoneTH,
} from "src/helpers/formatDate";

const TableHeaders = [
  { name: "วันที่", w: 5, align: "text-left" },
  { name: "เวลา", w: 10, align: "text-left" },
  { name: "รุ่น", w: 10, align: "text-left" },
  { name: "imei", w: 5, align: "text-left" },
  { name: "รายการซ่อม", w: 10, align: "text-left" },
  { name: "ประเมินราคา", w: 10, align: "text-right" },
  { name: "ค่าซ่อม", w: 10, align: "text-right" },
  { name: "กำไร", w: 10, align: "text-right" },
  { name: "ประเภทซ่อม", w: 10, align: "text-left" },
  { name: "จากร้าน", w: 10, align: "text-left" },
  { name: "โดย", w: 10, align: "text-left" },
];

const ProductRepair = ({ data }) => {
  if (!data || isEmpty(data)) {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full col-span-4 text-center text-gray-600 font-medium">
        ไม่มีข้อมูลการซ่อม
      </div>
    );
  }

  // Calculate summary data
  const uniqueDates = [
    ...new Set(
      data.map((item) =>
        new Date(item.product_repair_create_date).toLocaleDateString("th-TH")
      )
    ),
  ].length;
  const totalPredictPrice = data.reduce(
    (sum, item) => sum + parseFloat(item.pricePredict || 0),
    0
  );
  const totalRepairPrice = data.reduce(
    (sum, item) => sum + parseFloat(item.priceRepair || 0),
    0
  );

  const totalProfit = data.reduce(
    (sum, item) => sum + parseFloat(item.priceEquipProfit || 0),
    0
  );

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 w-full col-span-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">รายการซ่อม</h2>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full table-auto border border-collapse border-gray-200">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-sm">
              {TableHeaders.map((header, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 border ${header.align} font-semibold`}
                  style={{ width: `${header.w}%` }}
                >
                  {header.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 border text-left text-gray-700">
                  {formatDateNumberWithoutTime(
                    item?.product_repair_create_date
                  )}
                </td>
                <td className="px-6 py-4 border text-left text-gray-700">
                  {formatDateTimeOnlyZoneTH(item?.product_repair_create_date)}
                </td>

                <td className="px-6 py-4 border text-left text-gray-700">
                  {item.product_id == null
                    ? `${item?.repairProductModel_name || ""}`
                    : `${item?.productModel_name || ""}`}
                </td>

                <td className="px-6 py-4 border text-left text-gray-700">
                  {item.product_id == null
                    ? `${item?.product_repair_imei || "-"}`
                    : `${item?.product_imei || "-"}`}
                </td>

                <td className="px-6 py-4 border text-left text-gray-700">
                  <div className="group relative w-full">
                    <p className="truncate">{item?.product_repair_note}</p>
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-sm rounded py-1 px-2 z-10">
                      {item?.product_repair_note}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 border text-right text-gray-700">
                  {formatNumberDigit(item?.pricePredict)} บ.
                </td>
                <td className="px-6 py-4 border text-right text-gray-700">
                  {formatNumberDigit(item?.priceRepair)} บ.
                </td>
                <td className="px-6 py-4 border text-right text-gray-700">
                  {formatNumberDigit(parseFloat(item?.priceEquipProfit))} บ.
                </td>
                <td className="px-6 py-4 border text-left text-gray-700">
                  {item?.typerepair}
                </td>
                <td className="px-6 py-4 border text-left text-gray-700">
                  {item?.shopName}
                </td>

                <td className="px-6 py-4 border text-left text-gray-700">
                  {item?.user_name}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 text-gray-800 font-semibold">
              <td className="px-6 py-4 border text-left"></td>
              <td className="px-6 py-4 border text-left"></td>
              <td className="px-6 py-4 border text-left"></td>
              <td className="px-6 py-4 border text-left">รวม</td>
              <td className="px-6 py-4 border text-right">
                {formatNumberDigit(data?.length || 0)}
              </td>
              <td className="px-6 py-4 border text-right">
                {formatNumberDigit(totalPredictPrice)} บ.
              </td>
              <td className="px-6 py-4 border text-right">
                {formatNumberDigit(totalRepairPrice)} บ.
              </td>
              <td className="px-6 py-4 border text-right">
                {formatNumberDigit(totalProfit)} บ.
              </td>
              <td className="px-6 py-4 border text-left"></td>
              <td className="px-6 py-4 border text-left"></td>
              <td className="px-6 py-4 border text-left"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">
                {item.product_repair_code}
              </span>
              <span className="text-sm text-gray-600">
                {formatDateNumberWithoutTime(item.product_repair_create_date)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500 font-medium">เวลา</p>
                <p className="text-gray-700">
                  {formatDateTimeOnlyZoneTH(item.product_repair_create_date)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">รุ่น</p>
                <p className="text-gray-700">
                  {item.product_id == null
                    ? item.repairProductModel_name || ""
                    : item.productModel_name || ""}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">หมายเหตุ</p>
                <p
                  className="text-gray-700 truncate max-w-[150px]"
                  title={item.product_repair_note || ""}
                >
                  {item.product_repair_note || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">ประเมินราคา</p>
                <p className="text-gray-700">
                  {formatNumberDigit(item.pricePredict)} บ.
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">ค่าซ่อม</p>
                <p className="text-gray-700">
                  {formatNumberDigit(item.priceRepair)} บ.
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">กำไร</p>
                <p className="text-gray-700">
                  {formatNumberDigit(parseFloat(item.priceEquipProfit))} บ.
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">ประเภทซ่อม</p>
                <p className="text-gray-700">{item.typerepair}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">จากร้าน</p>
                <p className="text-gray-700">{item.shopName}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">โดย</p>
                <p className="text-gray-700">{item.user_name}</p>
              </div>
            </div>
          </div>
        ))}
        {/* Mobile Summary Card */}
        <div className="bg-gray-100 rounded-xl p-4 shadow-sm mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">รวม</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500 font-medium">จำนวนวันที่สร้าง</p>
              <p className="text-gray-700">{uniqueDates} วัน</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">จำนวนรายการ</p>
              <p className="text-gray-700">{data.length} รายการ</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">ประเมินราคา</p>
              <p className="text-gray-700">
                {formatNumberDigit(totalPredictPrice)} บ.
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">ค่าซ่อม</p>
              <p className="text-gray-700">
                {formatNumberDigit(totalRepairPrice)} บ.
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">กำไร</p>
              <p className="text-gray-700 font-bold">
                {formatNumberDigit(totalProfit)} บ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductRepair.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      product_repair_id: PropTypes.number,
      product_repair_code: PropTypes.string,
      product_repair_note: PropTypes.string,
      product_repair_create_date: PropTypes.string,
      product_id: PropTypes.number,
      productModel_name: PropTypes.string,
      repairProductModel_name: PropTypes.string,
      user_name: PropTypes.string,
      pricePredict: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      priceRepair: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      typerepair: PropTypes.string,
      shopName: PropTypes.string,
    })
  ),
};

ProductRepair.defaultProps = {
  data: [],
};

export default ProductRepair;
