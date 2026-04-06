import { isArray, isEmpty } from "lodash";
import PropTypes, { string } from "prop-types";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { warning } from "src/components/alart";
import { noopener_noreferrer } from "src/helpers/constant";
import { formatNumberDigit } from "src/helpers/formatNumber";
import { useAuth } from "src/hooks/authContext";
import { printPaymentList } from "src/store/productSale";

const ProductPaymentImages = ({ data, type }) => {
  const { setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();
  const storeProductSale = useSelector((state) => state.productSale);

  if (!data || isEmpty(data)) {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full col-span-2 text-center text-gray-600 font-medium">
        ไม่มีข้อมูลประเภทการจ่าย
      </div>
    );
  }

  const payTypeTranslations = {
    1: "เงินสด",
    2: "โอนเงิน",
  };

  const payTypeColors = {
    1: "bg-blue-100 text-blue-800",
    2: "bg-purple-100 text-purple-800",
  };

  // Calculate summary data
  const totalRecords = data.reduce(
    (sum, item) => sum + parseInt(item.recordCount, 10),
    0
  );
  const totalPrice = data.reduce(
    (sum, item) => sum + parseFloat(item.totalPrice),
    0
  );

  const handlePrintPayMentList = async (paymentStatus) => {
    const { branchId, endDate, startDate } =
      type == "summaryPaymentlist"
        ? storeProductSale.paramsSummaryProfit
        : storeProductSale.paramsProfit;

    if (branchId == 0) {
      warning("ไม่สามารถดาวน์โหลดทุกสาขา");
    } else {
      setIsLoadingOpen(true);
      dispatch(
        printPaymentList(`${branchId}/${startDate}/${endDate}/${paymentStatus}`)
      )
        .unwrap()
        .then((pdfUrl) => {
          setIsLoadingOpen(false);
          const link = document.createElement("a");
          link.href = pdfUrl;

          // ตรวจสอบว่าเป็น Safari หรือไม่
          const isSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent
          );

          if (isSafari) {
            // สำหรับ Safari: ใช้ download attribute และชื่อไฟล์
            link.download = `PaymentList-${branchId}-${startDate}-${endDate}.pdf`;
          } else {
            // สำหรับเบราว์เซอร์อื่น: เปิดในแท็บใหม่
            link.target = "_blank";
            link.rel = noopener_noreferrer;
          }

          link.click();
        })
        .catch((error) => {
          console.error("Failed to load payment list:", error);
          setIsLoadingOpen(false);
        });
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 w-full col-span-2">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        รายการประเภทการจ่าย
      </h2>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-sm">
              <th className="px-6 py-4 text-left font-semibold">
                ประเภทการจ่าย
              </th>
              <th className="px-6 py-4 text-left font-semibold">ธนาคาร</th>
              <th className="px-6 py-4 text-left font-semibold">เลขที่บัญชี</th>
              <th className="px-6 py-4 text-left font-semibold">ชื่อบัญชี</th>
              <th className="px-6 py-4 text-right font-semibold">
                จำนวนรายการ
              </th>
              <th className="px-6 py-4 text-right font-semibold">ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                      payTypeColors[item.payType] || "bg-gray-100 text-gray-800"
                    }`}
                    onClick={() => handlePrintPayMentList(item.payType)}
                  >
                    {payTypeTranslations[item.payType] || item.payType}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {item.bankName || "-"}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {item.bankNo || "-"}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {item.bankOwner || "-"}
                </td>
                <td className="px-6 py-4 text-right text-gray-700">
                  {formatNumberDigit(item.recordCount)}
                </td>
                <td className="px-6 py-4 text-right text-gray-700">
                  {formatNumberDigit(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 text-gray-800 font-semibold">
              <td className="px-6 py-4 text-left">สรุป</td>
              <td className="px-6 py-4"></td>
              <td className="px-6 py-4"></td>
              <td className="px-6 py-4"></td>
              <td className="px-6 py-4 text-right">
                {formatNumberDigit(totalRecords)}
              </td>
              <td className="px-6 py-4 text-right">
                {formatNumberDigit(totalPrice)} บ.
              </td>
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
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  payTypeColors[item.payType] || "bg-gray-100 text-gray-800"
                }`}
                onClick={() => handlePrintPayMentList(item.payType)}
              >
                {payTypeTranslations[item.payType] || item.payType}
              </span>
              <span className="text-sm text-gray-600">
                {formatNumberDigit(item.recordCount)} รายการ
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {item.bankName && (
                <div>
                  <p className="text-gray-500 font-medium">ธนาคาร</p>
                  <p className="text-gray-700">{item.bankName}</p>
                </div>
              )}
              {item.bankNo && (
                <div>
                  <p className="text-gray-500 font-medium">เลขที่บัญชี</p>
                  <p className="text-gray-700">{item.bankNo}</p>
                </div>
              )}
              {item.bankOwner && (
                <div>
                  <p className="text-gray-500 font-medium">ชื่อบัญชี</p>
                  <p className="text-gray-700">{item.bankOwner}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 font-medium">ยอดรวม</p>
                <p className="text-gray-700">
                  {formatNumberDigit(item.totalPrice)} บ.
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
              <p className="text-gray-700">
                {formatNumberDigit(totalRecords)} รายการ
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">ยอดรวม</p>
              <p className="text-gray-700">
                {formatNumberDigit(totalPrice)} บ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductPaymentImages.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      payType: PropTypes.string,
      bankId: PropTypes.number,
      bankName: PropTypes.string,
      bankNo: PropTypes.string,
      bankOwner: PropTypes.string,
      totalPrice: PropTypes.string,
      recordCount: PropTypes.string,
    })
  ),
  type: string,
};

ProductPaymentImages.defaultProps = {
  data: [],
  type: "profit",
};

export default ProductPaymentImages;
