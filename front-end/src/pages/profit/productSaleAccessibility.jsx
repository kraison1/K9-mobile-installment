import { isArray, isEmpty } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { formatNumberDigit } from "src/helpers/formatNumber";
import { renderSaleSection } from "./saleRenderUtils";
import { calculateTotalSums } from "src/helpers/formatNumber";
import { useDispatch, useSelector } from "react-redux";
import { warning } from "src/components/alart";
import { useAuth } from "src/hooks/authContext";
import { printAccessibilityList } from "src/store/productSale";
import { noopener_noreferrer } from "src/helpers/constant";

const ProductSaleAccessibility = ({ data }) => {
  const { setIsLoadingOpen } = useAuth();

  const storeProductSale = useSelector((state) => state.productSale);
  const dispatch = useDispatch();

  const printListAccessibility = () => {
    const { branchId, endDate, startDate } = storeProductSale.paramsProfit;

    if (branchId == 0) {
      warning("ไม่สามารถดาวน์โหลดทุกสาขา");
    } else {
      setIsLoadingOpen(true);
      dispatch(printAccessibilityList(`${branchId}/${startDate}/${endDate}`))
        .unwrap()
        .then((pdfUrl) => {
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
        })
        .catch((error) => {
          console.error("Failed to load payment list:", error);
          setIsLoadingOpen(false);
        });
    }
  };

  if (!data || isEmpty(data)) {
    return (
      <div
        className="bg-white shadow-xl rounded-2xl p-6 w-full col-span-2 text-center text-gray-600 font-medium"
        role="alert"
        aria-label="ไม่มีข้อมูลยอดขายมือถือ"
      >
        ไม่มีข้อมูลยอดขายมือถือ
      </div>
    );
  }

  const { productSales = [], ...infoProductSale } = data;

  const notCancelled = productSales.filter((p) => p.isCancel === "0");
  const cancelled = productSales.filter((p) => p.isCancel === "1");

  const result = calculateTotalSums(notCancelled);

  return (
    <div
      className="bg-white shadow-xl rounded-2xl p-6 w-full col-span-2"
      role="region"
      aria-label="สรุปยอด ขายมือถือ"
    >
      <h2
        className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between"
        aria-label={`สรุปยอดขาย ${infoProductSale.typeLabel || "(มือถือ)"}`}
      >
        <span>สรุปยอดขาย {infoProductSale.typeLabel || "(มือถือ)"}</span>

        <button
          type="button"
          onClick={() => printListAccessibility()}
          className="bg-blue-500 text-white rounded-md text-lg p-1"
        >
          Export PDF
        </button>
      </h2>
      {infoProductSale.branchName && (
        <p
          className="text-gray-600 mb-4"
          aria-label={`สาขา: ${infoProductSale.branchName}`}
        >
          สาขา: {infoProductSale.branchName}
        </p>
      )}

      <div className="space-y-6">
        {renderSaleSection(
          notCancelled,
          "รายการที่ไม่ยกเลิก",
          false,
          true,
          "accessibility"
        )}
        {renderSaleSection(cancelled, "รายการที่ยกเลิก", true, true, null)}
        <div className="mt-6 border-t pt-4">
          <h3
            className="text-lg font-semibold text-gray-800 mb-3"
            aria-label="สรุปทั้งหมด"
          >
            สรุปทั้งหมด
          </h3>
          {/* Desktop Summary Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table
              className="w-full table-auto"
              role="grid"
              aria-label="สรุปทั้งหมด table"
            >
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase text-sm">
                  <th
                    className="px-6 py-4 text-left font-semibold"
                    scope="col"
                    aria-label="รายการ"
                  >
                    รายการ
                  </th>
                  <th
                    className="px-6 py-4 text-right font-semibold"
                    scope="col"
                    aria-label="จำนวนรายการ"
                  >
                    จำนวนรายการ
                  </th>
                  <th
                    className="px-6 py-4 text-right font-semibold"
                    scope="col"
                    aria-label="จำนวนสัญญา"
                  >
                    จำนวนสัญญา
                  </th>
                  <th
                    className="px-6 py-4 text-right font-semibold"
                    scope="col"
                    aria-label="ยอดรวมเงินสด"
                  >
                    รวมเงินสด
                  </th>
                  <th
                    className="px-6 py-4 text-right font-semibold"
                    scope="col"
                    aria-label="ยอดรวมโอน"
                  >
                    รวมโอน
                  </th>
                  <th
                    className="px-6 py-4 text-right font-semibold"
                    scope="col"
                    aria-label="ยอดชำระรวม"
                  >
                    รวม
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className="bg-gray-100 text-gray-800 font-semibold"
                  role="row"
                  aria-label="ทั้งหมด"
                >
                  <td
                    className="px-6 py-4 text-left"
                    role="cell"
                    aria-label="ทั้งหมด"
                  >
                    ทั้งหมด
                  </td>
                  <td
                    className="px-6 py-4 text-right"
                    role="cell"
                    aria-label={`จำนวนรายการ: ${
                      infoProductSale.totalCount || 0
                    }`}
                  >
                    {formatNumberDigit(infoProductSale.totalCount || 0)}
                  </td>
                  <td
                    className="px-6 py-4 text-right"
                    role="cell"
                    aria-label={`จำนวนสัญญา: ${
                      infoProductSale.contractCount || 0
                    }`}
                  >
                    {formatNumberDigit(infoProductSale.contractCount || 0)}
                  </td>
                  <td
                    className="px-6 py-4 text-right text-green-600"
                    role="cell"
                    aria-label={`ยอดรวมเงินสด: ${formatNumberDigit(
                      result.totalCash || 0
                    )} บ.`}
                  >
                    {formatNumberDigit(result.totalCash || 0)} บ.
                  </td>
                  <td
                    className="px-6 py-4 text-right text-blue-600"
                    role="cell"
                    aria-label={`ยอดรวมโอน: ${formatNumberDigit(
                      result.totalTransfer || 0
                    )} บ.`}
                  >
                    {formatNumberDigit(result.totalTransfer || 0)} บ.
                  </td>
                  <td
                    className="px-6 py-4 text-right"
                    role="cell"
                    aria-label={`ยอดชำระรวม: ${formatNumberDigit(
                      infoProductSale.contractTotalPaid || 0
                    )} บ.`}
                  >
                    {formatNumberDigit(infoProductSale.contractTotalPaid || 0)}{" "}
                    บ.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Mobile Summary Card */}
          <div className="lg:hidden space-y-4">
            <div
              className="bg-gray-100 rounded-xl p-4 shadow-sm"
              role="article"
              aria-label="สรุปทั้งหมด"
            >
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p
                    className="text-gray-500 font-medium"
                    aria-label="จำนวนรายการ"
                  >
                    จำนวนรายการ
                  </p>
                  <p
                    className="text-gray-700"
                    aria-label={`จำนวนรายการ: ${
                      infoProductSale.totalCount || 0
                    }`}
                  >
                    {formatNumberDigit(infoProductSale.totalCount || 0)} รายการ
                  </p>
                </div>
                <div>
                  <p
                    className="text-gray-500 font-medium"
                    aria-label="จำนวนสัญญา"
                  >
                    จำนวนสัญญา
                  </p>
                  <p
                    className="text-gray-700"
                    aria-label={`จำนวนสัญญา: ${
                      infoProductSale.contractCount || 0
                    }`}
                  >
                    {formatNumberDigit(infoProductSale.contractCount || 0)}{" "}
                    สัญญา
                  </p>
                </div>
                <div>
                  <p
                    className="text-gray-500 font-medium"
                    aria-label="ยอดชำระรวม"
                  >
                    ยอดชำระรวม
                  </p>
                  <p
                    className="text-gray-700"
                    aria-label={`ยอดชำระรวม: ${formatNumberDigit(
                      infoProductSale.contractTotalPaid || 0
                    )} บ.`}
                  >
                    {formatNumberDigit(infoProductSale.contractTotalPaid || 0)}{" "}
                    บ.
                  </p>
                </div>
                <div>
                  <p
                    className="text-gray-500 font-medium"
                    aria-label="ยอดรวมเงินสด"
                  >
                    ยอดรวมเงินสด
                  </p>
                  <p
                    className="text-green-600"
                    aria-label={`ยอดรวมเงินสด: ${formatNumberDigit(
                      result.totalCash || 0
                    )} บ.`}
                  >
                    {formatNumberDigit(result.totalCash || 0)} บ.
                  </p>
                </div>
                <div>
                  <p
                    className="text-gray-500 font-medium"
                    aria-label="ยอดรวมโอน"
                  >
                    ยอดรวมโอน
                  </p>
                  <p
                    className="text-blue-600"
                    aria-label={`ยอดรวมโอน: ${formatNumberDigit(
                      result.totalTransfer || 0
                    )} บ.`}
                  >
                    {formatNumberDigit(result.totalTransfer || 0)} บ.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductSaleAccessibility.propTypes = {
  data: PropTypes.shape({
    productSales: PropTypes.arrayOf(
      PropTypes.shape({
        payType: PropTypes.string,
        bankName: PropTypes.string,
        bankNo: PropTypes.string,
        bankOwner: PropTypes.string,
        count: PropTypes.string,
        sumCash: PropTypes.string,
        sumTransfer: PropTypes.string,
        isCancel: PropTypes.string,
      })
    ),
    typeLabel: PropTypes.string,
    branchName: PropTypes.string,
    totalCount: PropTypes.number,
    contractCount: PropTypes.string,
    contractTotalPaid: PropTypes.string,
  }),
};

ProductSaleAccessibility.defaultProps = {
  data: {
    productSales: [],
    typeLabel: "",
    branchName: "",
    totalCount: 0,
    contractCount: "0",
    contractTotalPaid: "0",
  },
};

export default ProductSaleAccessibility;
