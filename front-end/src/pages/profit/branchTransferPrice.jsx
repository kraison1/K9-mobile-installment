import { isArray, isEmpty } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { formatNumberDigit } from "src/helpers/formatNumber";

const BranchTransferPrice = ({ data }) => {
  if (!data || isEmpty(data)) {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full col-span-4 text-center text-gray-600 font-medium">
        ไม่มีข้อมูลรายการจองเครื่อง
      </div>
    );
  }

  const statusTranslations = {
    1: "รอดำเนินการ",
    2: "ยืนยัน",
    3: "ปฏิเสธ",
  };

  const statusColors = {
    1: "bg-yellow-100 text-yellow-800",
    2: "bg-green-100 text-green-800",
    3: "bg-red-100 text-red-800",
  };

  // Group data by status
  const groupedData = {
    1: data.filter((item) => item.status === "1"),
    2: data.filter((item) => item.status === "2"),
    3: data.filter((item) => item.status === "3"),
  };

  // Calculate summary data per status
  const summaryByStatus = {
    1: {
      totalItems: groupedData["1"].reduce(
        (sum, item) => sum + parseInt(item.count, 10),
        0
      ),
      totalPrice: groupedData["1"].reduce(
        (sum, item) => sum + parseFloat(item.totalPrice || 0),
        0
      ),
    },
    2: {
      totalItems: groupedData["2"].reduce(
        (sum, item) => sum + parseInt(item.count, 10),
        0
      ),
      totalPrice: groupedData["2"].reduce(
        (sum, item) => sum + parseFloat(item.totalPrice || 0),
        0
      ),
    },
    3: {
      totalItems: groupedData["3"].reduce(
        (sum, item) => sum + parseInt(item.count, 10),
        0
      ),
      totalPrice: groupedData["3"].reduce(
        (sum, item) => sum + parseFloat(item.totalPrice || 0),
        0
      ),
    },
  };

  // Calculate overall summary
  const totalItems = data.reduce(
    (sum, item) => sum + parseInt(item.count, 10),
    0
  );
  const totalPaid = data.reduce(
    (sum, item) => sum + parseFloat(item.totalPrice || 0),
    0
  );

  const renderSection = (status, items, summary) => {
    if (items.length === 0) {
      return null;
    }

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {statusTranslations[status]} ({summary.totalItems} รายการ)
        </h3>
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-sm">
                <th className="px-6 py-4 text-left font-semibold">ตั้งเบิกจาก</th>
                <th className="px-6 py-4 text-left font-semibold">เบิก</th>
                <th className="px-6 py-4 text-left font-semibold">สถานะ</th>
                <th className="px-6 py-4 text-right font-semibold">
                  จำนวนรายการ
                </th>
                <th className="px-6 py-4 text-right font-semibold">ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-left text-gray-700">
                    {item.branchName}
                  </td>
                  <td className="px-6 py-4 text-left text-gray-700">
                    {item.fromBranchName}
                  </td>
                  <td className="px-6 py-4 text-left">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[item.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusTranslations[item.status] || item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    {formatNumberDigit(item.count)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    {formatNumberDigit(item.totalPrice)} บ.
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 text-gray-800 font-semibold">
                <td className="px-6 py-4 text-left">
                  สรุป {statusTranslations[status]}
                </td>
                <td className="px-6 py-4 text-left">-</td>
                <td className="px-6 py-4 text-left">-</td>
                <td className="px-6 py-4 text-right">
                  {formatNumberDigit(summary.totalItems)}
                </td>
                <td className="px-6 py-4 text-right">
                  {formatNumberDigit(summary.totalPrice)} บ.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-800">
                  {item.branchName}
                </span>
                <span className="text-sm text-gray-600">
                  {formatNumberDigit(item.count)} รายการ
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">ตั้งเบิกจาก</p>
                  <p className="text-gray-700">{item.branchName}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">เบิก</p>
                  <p className="text-gray-700">{item.fromBranchName}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">สถานะ</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[item.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {statusTranslations[item.status] || item.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">จำนวนรายการ</p>
                  <p className="text-gray-700">
                    {formatNumberDigit(item.count)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">ยอดรวม</p>
                  <p className="text-gray-700">
                    {formatNumberDigit(item.totalPrice)} บ.
                  </p>
                </div>
              </div>
            </div>
          ))}
          {/* Mobile Summary Card for Status */}
          <div className="bg-gray-100 rounded-xl p-4 shadow-sm mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              สรุป {statusTranslations[status]}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500 font-medium">จำนวนรายการ</p>
                <p className="text-gray-700">
                  {formatNumberDigit(summary.totalItems)} รายการ
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">ยอดรวม</p>
                <p className="text-gray-700">
                  {formatNumberDigit(summary.totalPrice)} บ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 w-full col-span-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        รายการค่าใช้จ่าย
      </h2>

      {/* Render sections for each status */}
      {["1", "2", "3"].map((status) =>
        renderSection(status, groupedData[status], summaryByStatus[status])
      )}

      {/* Overall Summary */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          สรุปทั้งหมด
        </h3>
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-sm">
                <th className="px-6 py-4 text-left font-semibold">สรุป</th>
                <th className="px-6 py-4 text-right font-semibold">
                  จำนวนรายการ
                </th>
                <th className="px-6 py-4 text-right font-semibold">ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-100 text-gray-800 font-semibold">
                <td className="px-6 py-4 text-left">ทั้งหมด</td>
                <td className="px-6 py-4 text-right">
                  {formatNumberDigit(totalItems)}
                </td>
                <td className="px-6 py-4 text-right">
                  {formatNumberDigit(totalPaid)} บ.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Mobile Summary Card */}
        <div className="lg:hidden space-y-4">
          <div className="bg-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              สรุปทั้งหมด
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500 font-medium">จำนวนรายการ</p>
                <p className="text-gray-700">
                  {formatNumberDigit(totalItems)} รายการ
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">ยอดรวม</p>
                <p className="text-gray-700 font-bold">
                  {formatNumberDigit(totalPaid)} บ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

BranchTransferPrice.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      branchId: PropTypes.number,
      branchName: PropTypes.string,
      fromBranchId: PropTypes.number,
      fromBranchName: PropTypes.string,
      status: PropTypes.string,
      totalPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      count: PropTypes.string,
    })
  ),
};

BranchTransferPrice.defaultProps = {
  data: [],
};

export default BranchTransferPrice;
