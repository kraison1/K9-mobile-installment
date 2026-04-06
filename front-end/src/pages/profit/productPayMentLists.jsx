import { isArray, isEmpty } from "lodash";
import PropTypes, { string } from "prop-types";
import React from "react";
import { formatNumberDigit } from "src/helpers/formatNumber";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "src/hooks/authContext";
import { printPaymentList } from "src/store/productSale";
import { noopener_noreferrer } from "src/helpers/constant";
import { warning } from "src/components/alart";

const ProductPayMentLists = ({ data, type }) => {
  const { setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();
  const storeProductSale = useSelector((state) => state.productSale);

  if (!data || isEmpty(data)) {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full col-span-2 text-center text-gray-600 font-medium">
        ไม่มีข้อมูลค่าบริการดูแลรายเดือน
      </div>
    );
  }

  const statusTranslations = {
    FAIL_PAIR: "ยังไม่ชำระ", // ไม่จ่ายเลย
    FULL_PAIR: "ชำระครบ (ไม่มีค่าปรับ)", // จ่ายครบแบบไม่มีค่าปรับ
    FULL_WITH_PENALTY: "ชำระครบ (มีค่าปรับ)", // จ่ายครบแบบมีค่าปรับ
    NOT_FULL_PAIR: "ชำระไม่ครบ (ไม่มีค่าปรับ)", // ยังจ่ายไม่ครบแบบไม่มีค่าปรับ
    PARTIAL_PENALTY_INCOMPLETE: "ชำระไม่ครบ (ค่าปรับไม่ครบ)", // ยังจ่ายไม่ครบแบบค่าปรับไม่ครบ
    ERROR: "ข้อมูลผิดพลาด", // กันเคสข้อมูลเพี้ยน
  };

  const statusColors = {
    FAIL_PAIR: "bg-red-100 text-red-800", // ยังไม่ชำระ = แดง
    FULL_PAIR: "bg-green-100 text-green-800", // ชำระครบไม่มีค่าปรับ = เขียว
    FULL_WITH_PENALTY: "bg-blue-100 text-blue-800", // ชำระครบแต่มีค่าปรับ = น้ำเงิน
    NOT_FULL_PAIR: "bg-yellow-100 text-yellow-800", // ชำระไม่ครบ (ไม่มีค่าปรับ) = เหลือง
    PARTIAL_PENALTY_INCOMPLETE: "bg-orange-100 text-orange-800", // ชำระไม่ครบ (ค่าปรับไม่ครบ) = ส้ม
    ERROR: "bg-gray-100 text-gray-800", // ข้อมูลผิดพลาด = เทา
  };

  // 1) ลำดับกลุ่มสถานะตามที่ต้องการ
  const STATUS_ORDER = {
    FULL_PAIR: 1,
    FULL_WITH_PENALTY: 2,
    NOT_FULL_PAIR: 3,
    PARTIAL_PENALTY_INCOMPLETE: 4,
    FAIL_PAIR: 5,
    ERROR: 6,
  };

  // 2) เรียงข้อมูลก่อนแสดงผล
  const sortedData = [...data].sort((a, b) => {
    const oa = STATUS_ORDER[a.paymentStatus] ?? 999;
    const ob = STATUS_ORDER[b.paymentStatus] ?? 999;
    return oa - ob;
  });

  // 3) รวมยอดสรุปจากค่าที่ backend ส่งมา (ต่อสถานะ)
  const totals = sortedData.reduce(
    (acc, item) => {
      acc.items += parseInt(item.recordCount ?? 0, 10);
      acc.price += parseFloat(item.totalPrice ?? 0);
      acc.penalty += parseFloat(item.totalPenalty ?? 0);
      acc.expected += parseFloat(item.totalExpected ?? 0);
      acc.paid += parseFloat(item.totalPricePay ?? 0);
      return acc;
    },
    { items: 0, price: 0, penalty: 0, expected: 0, paid: 0 }
  );

  const handlePrintPayMentList = async (paymentStatus) => {
    const { branchId, endDate, startDate } =
      type === "summaryPaymentlist"
        ? storeProductSale.paramsSummaryProfit
        : storeProductSale.paramsProfit;

    if (branchId == 0) {
      warning("ไม่สามารถดาวน์โหลดทุกสาขา");
      return;
    }

    try {
      setIsLoadingOpen(true);
      const pdfUrl = await dispatch(
        printPaymentList(`${branchId}/${startDate}/${endDate}/${paymentStatus}`)
      ).unwrap();

      setIsLoadingOpen(false);

      const link = document.createElement("a");
      link.href = pdfUrl;

      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );
      if (isSafari) {
        link.download = `PaymentList-${branchId}-${startDate}-${endDate}.pdf`;
      } else {
        link.target = "_blank";
        link.rel = noopener_noreferrer;
      }
      link.click();
    } catch (error) {
      console.error("Failed to load payment list:", error);
      setIsLoadingOpen(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 w-full col-span-2">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        รายการค่าบริการดูแลรายเดือน
      </h2>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-sm">
              <th className="px-6 py-4 text-left font-semibold">สถานะการชำระเงิน</th>
              <th className="px-6 py-4 text-right font-semibold">จำนวนรายการ</th>
              <th className="px-6 py-4 text-right font-semibold">ยอดหลัก</th>
              <th className="px-6 py-4 text-right font-semibold">ค่าปรับ</th>
              <th className="px-6 py-4 text-right font-semibold">ยอดต้องชำระ</th>
              <th className="px-6 py-4 text-right font-semibold">ชำระแล้ว</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                      statusColors[item.paymentStatus] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                    onClick={() => handlePrintPayMentList(item.paymentStatus)}
                  >
                    {statusTranslations[item.paymentStatus] ||
                      item.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-700">
                  {formatNumberDigit(item.recordCount)}
                </td>
                <td className="px-6 py-4 text-right text-gray-700">
                  {formatNumberDigit(item.totalPrice)} บ.
                </td>
                <td className="px-6 py-4 text-right text-gray-700">
                  {formatNumberDigit(item.totalPenalty)} บ.
                </td>
                <td className="px-6 py-4 text-right text-gray-700">
                  {formatNumberDigit(item.totalExpected)} บ.
                </td>
                <td className="px-6 py-4 text-right text-gray-700">
                  {formatNumberDigit(item.totalPricePay)} บ.
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 text-gray-800 font-semibold">
              <td className="px-6 py-4 text-left">สรุป</td>
              <td className="px-6 py-4 text-right">{totals.items}</td>
              <td className="px-6 py-4 text-right">
                {formatNumberDigit(totals.price)} บ.
              </td>
              <td className="px-6 py-4 text-right">
                {formatNumberDigit(totals.penalty)} บ.
              </td>
              <td className="px-6 py-4 text-right">
                {formatNumberDigit(totals.expected)} บ.
              </td>
              <td className="px-6 py-4 text-right">
                {formatNumberDigit(totals.paid)} บ.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {sortedData.map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-center mb-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[item.paymentStatus] ||
                  "bg-gray-100 text-gray-800"
                }`}
                onClick={() => handlePrintPayMentList(item.paymentStatus)}
              >
                {statusTranslations[item.paymentStatus] || item.paymentStatus}
              </span>
              <span className="text-sm text-gray-600">
                {formatNumberDigit(item.recordCount)} รายการ
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500 font-medium">ยอดหลัก</p>
                <p className="text-gray-700">
                  {formatNumberDigit(item.totalPrice)} บ.
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">ค่าปรับ</p>
                <p className="text-gray-700">
                  {formatNumberDigit(item.totalPenalty)} บ.
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">ยอดต้องชำระ</p>
                <p className="text-gray-700">
                  {formatNumberDigit(item.totalExpected)} บ.
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">ชำระแล้ว</p>
                <p className="text-gray-700">
                  {formatNumberDigit(item.totalPricePay)} บ.
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Mobile Summary Card */}
        <div className="bg-gray-100 rounded-xl p-4 shadow-sm mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">สรุป</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500 font-medium">จำนวนรายการ</p>
              <p className="text-gray-700">{totals.items} รายการ</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">ยอดหลัก</p>
              <p className="text-gray-700">
                {formatNumberDigit(totals.price)} บ.
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">ค่าปรับ</p>
              <p className="text-gray-700">
                {formatNumberDigit(totals.penalty)} บ.
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">ยอดต้องชำระ</p>
              <p className="text-gray-700">
                {formatNumberDigit(totals.expected)} บ.
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">ชำระแล้ว</p>
              <p className="text-gray-700">
                {formatNumberDigit(totals.paid)} บ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductPayMentLists.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      paymentStatus: PropTypes.string,
      recordCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      totalPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),       // ยอดหลัก
      totalPenalty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),     // ค่าปรับ
      totalPricePay: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),    // ชำระแล้ว
      totalExpected: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),    // ยอดต้องชำระ (price + penalty)
    })
  ),
  type: string,
};

ProductPayMentLists.defaultProps = {
  data: [],
  type: "profit",
};

export default ProductPayMentLists;
