import { isArray, isEmpty } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { formatNumberDigit } from "src/helpers/formatNumber";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "src/hooks/authContext";
import { printPaymentList } from "src/store/productSale";
import { noopener_noreferrer } from "src/helpers/constant";
import { warning } from "src/components/alart";

const ProductBooks = ({ data }) => {
  const { setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();
  const storeProductSale = useSelector((state) => state.productSale);

  if (!data || isEmpty(data)) {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full col-span-4 text-center text-gray-600 font-medium">
        ไม่มีข้อมูลรายการจองเครื่อง
      </div>
    );
  }

  const statusTranslations = {
    1: "เงินสด",
    2: "โอน",
  };

  const statusColors = {
    1: "bg-green-100 text-green-800",
    2: "bg-blue-100 text-blue-800",
  };

  // Calculate summary data
  const totalItems = data.reduce(
    (sum, item) => sum + parseInt(item.count, 10),
    0
  );
  const totalTransferCash = data.reduce(
    (sum, item) => sum + parseFloat(item.totalTransferCash || 0),
    0
  );
  const totalPriceCash = data.reduce(
    (sum, item) => sum + parseFloat(item.totalPriceCash || 0),
    0
  );

  // Total paid is the sum of cash and transfer payments
  const totalPaid = totalTransferCash + totalPriceCash;

  // const handlePrintPayMentList = async (payType) => {
  //   const { branchId, endDate, startDate } = storeProductSale.paramsProfit;

  //   if (branchId == 0) {
  //     warning("ไม่สามารถดาวน์โหลดทุกสาขา");
  //   } else {
  //     setIsLoadingOpen(true);
  //     dispatch(
  //       printPaymentList(`${branchId}/${startDate}/${endDate}/${payType}`)
  //     )
  //       .unwrap()
  //       .then((pdfUrl) => {
  //         setIsLoadingOpen(false);
  //         const link = document.createElement("a");
  //         link.href = pdfUrl;

  //         const isSafari = /^((?!chrome|android).)*safari/i.test(
  //           navigator.userAgent
  //         );

  //         if (isSafari) {
  //           link.download = `PaymentList-${branchId}-${startDate}-${endDate}.pdf`;
  //         } else {
  //           link.target = "_blank";
  //           link.rel = noopener_noreferrer;
  //         }

  //         link.click();
  //       })
  //       .catch((error) => {
  //         console.error("Failed to load payment list:", error);
  //         setIsLoadingOpen(false);
  //       });
  //   }
  // };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 w-full col-span-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        รายการจองเครื่อง
      </h2>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-sm">
              <th className="px-6 py-4 text-left font-semibold">
                ประเภทการชำระเงิน
              </th>
              <th className="px-6 py-4 text-right font-semibold">ธนาคาร</th>
              <th className="px-6 py-4 text-right font-semibold">
                เลขที่บัญชี
              </th>
              <th className="px-6 py-4 text-right font-semibold">ชื่อบัญชี</th>
              <th className="px-6 py-4 text-right font-semibold">
                จำนวนรายการ
              </th>
              <th className="px-6 py-4 text-right font-semibold">ยอดเงินสด</th>
              <th className="px-6 py-4 text-right font-semibold">ยอดโอน</th>
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
                    // className={`inline-block px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[item.payType] || "bg-gray-100 text-gray-800"
                    }`}
                    // onClick={() =>
                    //   handlePrintPayMentList(item.productBook_payType)
                    // }
                  >
                    {statusTranslations[item.payType] || item.payType}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-700">
                  {item.bankName || "-"}
                </td>
                <td className="px-6 py-4 text-right text-gray-700">
                  {item.bankNo || "-"}
                </td>
                <td className="px-6 py-4 text-right text-gray-700">
                  {item.bankOwner || "-"}
                </td>
                <td className="px-6 py-4 text-right text-gray-700">
                  {formatNumberDigit(item.count)}
                </td>
                <td className="px-6 py-4 text-right text-gray-700">
                  {formatNumberDigit(item.totalPriceCash)}
                </td>
                <td className="px-6 py-4 text-right text-gray-700">
                  {formatNumberDigit(item.totalTransferCash)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 text-gray-800 font-semibold">
              <td className="px-6 py-4 text-left">สรุป</td>
              <td className="px-6 py-4 text-right">-</td>
              <td className="px-6 py-4 text-right">-</td>
              <td className="px-6 py-4 text-right">-</td>
              <td className="px-6 py-4 text-right">{totalItems}</td>
              <td className="px-6 py-4 text-right">
                {formatNumberDigit(totalPriceCash)} บ.
              </td>
              <td className="px-6 py-4 text-right">
                {formatNumberDigit(totalTransferCash)} บ.
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
                  statusColors[item.productBook_payType] ||
                  "bg-gray-100 text-gray-800"
                }`}
              >
                {statusTranslations[item.productBook_payType] ||
                  item.productBook_payType}
              </span>
              <span className="text-sm text-gray-600">
                {formatNumberDigit(item.count)} รายการ
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
                <p className="text-gray-500 font-medium">จำนวนรายการ</p>
                <p className="text-gray-700">{formatNumberDigit(item.count)}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">ยอดเงินสด</p>
                <p className="text-gray-700">
                  {formatNumberDigit(item.totalPriceCash)} บ.
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">ยอดโอน</p>
                <p className="text-gray-700">
                  {formatNumberDigit(item.totalTransferCash)} บ.
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
              <p className="text-gray-700">{totalItems} รายการ</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">ยอดเงินสด</p>
              <p className="text-gray-700">
                {formatNumberDigit(totalPriceCash)} บ.
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">ยอดโอน</p>
              <p className="text-gray-700">
                {formatNumberDigit(totalTransferCash)} บ.
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
  );
};

ProductBooks.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      productBook_payType: PropTypes.string,
      productBook_bankId: PropTypes.number,
      bankName: PropTypes.string,
      bankNo: PropTypes.string,
      bankOwner: PropTypes.string,
      count: PropTypes.string,
      totalTransferCash: PropTypes.string,
      totalPriceCash: PropTypes.string,
    })
  ),
};

ProductBooks.defaultProps = {
  data: [],
};

export default ProductBooks;
