import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import {
  formatNumberDigit,
  formatNumberDigit2,
} from "src/helpers/formatNumber";
import {
  formatDateNumberWithoutTime,
  formatDateTH,
  formatDateTimeOnlyZoneTH,
} from "src/helpers/formatDate";
import { useAuth } from "src/hooks/authContext";
import { useDispatch } from "react-redux";
import {
  contractProductSale,
  deleteProductSale,
  slipProductSale,
} from "src/store/productSale";
import { noopener_noreferrer } from "src/helpers/constant";
import React, { useState } from "react";
import { MdExpandMore, MdChevronRight } from "react-icons/md";
import dayjs from "src/helpers/dayjsConfig";
import { conFirm } from "../alart";
import { computeDebtView } from "src/helpers/computeDebtView";
import ModalPayDown from "src/components/modals/modelPayDown";

const TableProductSale = ({
  tableHeaders,
  tableLists,
  onClick,
  page,
  pageSize,
  isMobileSale,
  isCash,
}) => {
  const { setIsLoadingOpen, permissions } = useAuth();
  const dispatch = useDispatch();
  const [expandedRows, setExpandedRows] = useState({});
  const [Modal, setModal] = React.useState(false);
  const [contactCodeFromUrl, setContactCodeFromUrl] = React.useState(null);

  const printContract = (item) => {
    setIsLoadingOpen(true);
    dispatch(
      item.saleType == "3" || item.saleType == "4"
        ? contractProductSale({
            id: item.id,
            financeId: null,
          })
        : slipProductSale(item.id),
    )
      .unwrap()
      .then((pdfUrl) => {
        setIsLoadingOpen(false);
        const link = document.createElement("a");
        link.href = pdfUrl;

        // ตรวจสอบว่าเป็น Safari หรือไม่
        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent,
        );

        if (isSafari) {
          // สำหรับ Safari: ใช้ download attribute และชื่อไฟล์
          link.download = `${
            item.saleType == "3" || item.saleType == "4"
              ? "เอกสารสัญญาเลขที่"
              : "สลิป"
          }-${item.code}.pdf`;
        } else {
          // สำหรับเบราว์เซอร์อื่น: เปิดในแท็บใหม่
          link.target = "_blank";
          link.rel = noopener_noreferrer;
        }

        link.click();
      })
      .catch((error) => {
        console.error("Failed to load contract:", error);
        setIsLoadingOpen(false);
      });
  };

  const paymentLast = (paymentLists) => {
    let lastPayment = null;
    const paymentListsSorted = paymentLists.filter(
      (payment) => payment.isPaySuccess != "1",
    );

    if (paymentListsSorted.length > 0) {
      lastPayment = paymentListsSorted[0];
    }

    return lastPayment
      ? formatDateNumberWithoutTime(lastPayment.datePay)
      : "ครบสัญญา";
  };

  const productSaleListsIsFree = (items) => {
    if (isEmpty(items)) {
      return "";
    }
    return items
      .filter((item) => item.isFree === "1")
      .map((item) => `(${item.productName})`)
      .join(", ");
  };

  const fetchPayDown = (code) => {
    setContactCodeFromUrl(code);
    setModal(true);
  };

  const productSaleListsIsFreeCost = (items) => {
    if (isEmpty(items)) {
      return 0;
    }
    return items
      .filter((item) => item.isFree === "1")
      .reduce((total, item) => {
        return total + (parseFloat(item.priceCostBuy) || 0);
      }, 0);
  };

  const handleDeleteProductSale = (item) => {
    conFirm(
      `ยืนยันการลบ : ${item.code} \nยอด ${formatNumberDigit2(
        item.priceTotalPaid,
      )} บ.`,
      "ตกลง",
      "ปิด",
      true,
    ).then((e) => {
      if (e.isConfirmed) {
        setIsLoadingOpen(true);
        dispatch(deleteProductSale(item))
          .unwrap()
          .then(() => setIsLoadingOpen(false))
          .catch(() => setIsLoadingOpen(false));
      }
    });
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getRowColor = (paymentLists) => {
    if (
      paymentLists.some(
        (payment) =>
          payment.isPaySuccess === "3" ||
          payment.isPaySuccess === "8" ||
          payment.isPaySuccess === "9",
      )
    ) {
      return "bg-red-100";
    } else if (paymentLists.some((payment) => payment.isPaySuccess === "2")) {
      return "bg-yellow-100";
    } else if (
      paymentLists.every(
        (payment) =>
          payment.isPaySuccess === "1" || payment.isPaySuccess === "7",
      )
    ) {
      return "bg-green-100";
    }
    return "bg-white";
  };

  return (
    <div className="overflow-x-auto">
      <ModalPayDown
        open={Modal}
        setModal={setModal}
        contactCodeFromUrl={contactCodeFromUrl}
      />

      <table className="rounded-sm text-left border border-collapse border-1 w-full text-sm">
        <thead className="text-gray-900">
          <tr className="bg-white">
            {tableHeaders.map((TableList, k) => (
              <th
                key={k}
                className={`${
                  isEmpty(TableList?.align) ? "" : `${TableList?.align}`
                } border bg-gray-300 p-2`}
                style={{ width: `${TableList?.w || "auto"}% ||` }}
              >
                {TableList?.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableLists.map((TableList, k) => {
            const priceText = isCash
              ? formatNumberDigit(TableList.priceTotalPaid)
              : formatNumberDigit(TableList.priceDownPayment);

            return (
              <React.Fragment key={k}>
                <tr
                  className={`${getRowColor(
                    TableList.productPayMentLists,
                  )} hover:bg-blue-50 hover:bg-opacity-75 transition-colors duration-150`}
                >
                  <td className="border p-2 font-light">
                    <span className="flex items-center justify-center w-full">
                      {formatNumberDigit((page - 1) * pageSize + k + 1)}
                    </span>
                  </td>
                  {import.meta.env.VITE_SYSTEM_NAME == "THUNDER" &&
                  isMobileSale ? (
                    <td className="border p-2 font-light text-left">
                      <p>
                        {formatDateNumberWithoutTime(TableList.create_date)}
                      </p>
                      <p>{formatDateTimeOnlyZoneTH(TableList.create_date)}</p>
                    </td>
                  ) : null}

                  <td
                    className="border p-2 font-light text-blue-500 cursor-pointer text-left"
                    onClick={() =>
                      isMobileSale
                        ? printContract(TableList)
                        : onClick(TableList)
                    }
                  >
                    {TableList.code}
                  </td>

                  {import.meta.env.VITE_SYSTEM_NAME == "THUNDER" &&
                  isMobileSale ? (
                    <td className="border p-2 font-light text-left">
                      {`${
                        TableList.processManageFinance?.create_by?.username ||
                        TableList.create_by?.branch?.name
                      }`}
                    </td>
                  ) : null}

                  {isMobileSale ? (
                    <React.Fragment>
                      <td
                        className="border p-2 font-light text-blue-500 cursor-pointer text-left"
                        onClick={() => onClick(TableList)}
                      >
                        {`ชื่อ: ${TableList.customer?.name}`}
                        <br />
                        {`นามสกุล: ${TableList.customer?.lastname}`}
                        <br />
                        {`เบอร์: ${TableList.customer?.tel}`}
                      </td>

                      <td className="border p-2 font-light text-left">
                        <p>{`รุ่น: ${TableList.product?.productModel?.name}`}</p>

                        {import.meta.env.VITE_SYSTEM_NAME ==
                        "THUNDER" ? null : (
                          <p> {`รหัสสินค้า: ${TableList.product?.code}`}</p>
                        )}

                        {import.meta.env.VITE_SYSTEM_NAME ==
                        "THUNDER" ? null : (
                          <p> {`IMEI: ${TableList.product?.imei}`}</p>
                        )}
                      </td>
                      <td className="border p-2 font-light text-left">
                        {TableList.product?.productStorage?.name}
                      </td>

                      <td className="border p-2 font-light text-left">
                        {TableList.product?.productColor?.name}
                      </td>

                      <td className="border p-2 font-light text-left">
                        {`${TableList.product?.batteryHealth} %`}
                      </td>

                      <td className="border p-2 font-light text-left">
                        {TableList.product?.boxType == "ครบกล่องตรงอีมี่"
                          ? "มี"
                          : TableList.product?.boxType}
                      </td>

                      <td className="border p-2 font-light text-left">
                        {TableList?.hand == "มือสอง" ? "มือ 2" : "มือ 1"}
                      </td>

                      <td className="border p-2 font-light text-left whitespace-pre-line">
                        {TableList.product?.shopCenterInsurance == "มี"
                          ? `หมดประกันศูนย์\n${formatDateNumberWithoutTime(
                              TableList.product?.shopCenterInsuranceDate,
                            )}`
                          : `หมดประกันร้าน\n${formatDateNumberWithoutTime(
                              dayjs(TableList.create_date).add(
                                Number(TableList.product?.shopInsurance),
                                "day",
                              ),
                            )}`}
                      </td>

                      <td className="border p-2 font-light text-left">
                        {TableList.product?.imei}
                      </td>

                      {!isCash ? (
                        <td className={`border p-2 font-light text-right`}>
                          {formatNumberDigit(TableList.priceRepair)}
                        </td>
                      ) : null}

                      {/* {!isCash ? ( */}
                        <td className={`border p-2 font-light text-right`}>
                          <p>{TableList.reseller?.code || ""}</p>
                          <p>
                            {formatNumberDigit(
                              Number(TableList.priceReseller || 0),
                            )}
                          </p>
                        </td>
                      {/* ) : null} */}

                      <td className={`border p-2 font-light text-right`}>
                        {formatNumberDigit(
                          Number(TableList.product?.priceCostBuy || 0) +
                            Number(TableList.product?.priceRepair || 0),
                        )}
                      </td>

                      <td
                        className={`border p-2 font-light text-right cursor-pointer text-blue-500`}
                      >
                        {TableList.productSaleImages?.length > 0 ? (
                          <a
                            href={`${import.meta.env.VITE_APP_API_URL}/${
                              TableList.productSaleImages[0]?.name
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textAlign: "-webkit-center" }}
                          >
                            {priceText}
                          </a>
                        ) : (
                          priceText
                        )}
                      </td>

                      {!isCash ? (
                        <td
                          className={`border p-2 font-light text-right text-blue-500 cursor-pointer`}
                          onClick={() => fetchPayDown(TableList.code)}
                        >
                          {`${formatNumberDigit(
                            TableList.priceSumInvoices,
                          )} / ${formatNumberDigit(
                            TableList.priceSumPayInvoices,
                          )}`}
                        </td>
                      ) : null}

                      {!isCash ? (
                        <td className="border p-2 font-light text-right">
                          <button
                            onClick={() => toggleRow(TableList.id)}
                            className="flex items-center justify-center w-full text-blue-500 hover:text-blue-700 focus:outline-none transition-colors duration-200"
                          >
                            <span className="mr-2">
                              {paymentLast(TableList.productPayMentLists)}
                            </span>
                            {expandedRows[TableList.id] ? (
                              <MdExpandMore size={20} />
                            ) : (
                              <MdChevronRight size={20} />
                            )}
                          </button>
                        </td>
                      ) : null}

                      {!isCash ? (
                        <td className="border p-2 font-light text-right">
                          {(() => {
                            const { totals } = computeDebtView(TableList);
                            // แสดง: ค่าทวงถามทั้งหมด / จ่ายค่าทวงถามแล้ว
                            return `${formatNumberDigit(
                              totals.totalDebt,
                            )} / ${formatNumberDigit(totals.totalDebtPaid)}`;
                          })()}
                        </td>
                      ) : null}
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <td className="border p-2 font-light text-left">
                        {productSaleListsIsFree(
                          TableList.productSaleLists || [],
                        )}
                      </td>

                      <td className="border p-2 font-light text-right">
                        {formatNumberDigit(
                          productSaleListsIsFreeCost(
                            TableList.productSaleLists || [],
                          ),
                        )}
                      </td>

                      <td
                        className="border p-2 font-light text-right text-blue-500 cursor-pointer"
                        onClick={() => printContract(TableList)}
                      >
                        {formatNumberDigit(TableList?.priceTotalPaid)}
                      </td>
                    </React.Fragment>
                  )}

                  {permissions.includes("can-deleted") ? (
                    <td
                      className="border p-2 font-light text-blue-500 cursor-pointer"
                      onClick={() => handleDeleteProductSale(TableList)}
                    >
                      {import.meta.env.VITE_SYSTEM_NAME == "THUNDER" ? (
                        <>
                          <p className="text-blue-500">
                            {TableList.create_by?.name}
                          </p>

                          {isMobileSale && !isCash ? (
                            <p className="text-red-400">{`${
                              TableList.processManageFinance?.create_by?.name ||
                              "-"
                            }`}</p>
                          ) : null}
                        </>
                      ) : (
                        TableList.create_by?.name
                      )}
                    </td>
                  ) : (
                    <td className="border p-2 font-light">
                      {import.meta.env.VITE_SYSTEM_NAME == "THUNDER" ? (
                        <>
                          <p className="text-blue-500">
                            {TableList.create_by?.name}
                          </p>

                          {isMobileSale ? (
                            <p className="text-red-400">{`${
                              TableList.processManageFinance?.create_by?.name ||
                              "-"
                            }`}</p>
                          ) : null}
                        </>
                      ) : (
                        TableList.create_by?.name
                      )}
                    </td>
                  )}

                  {isMobileSale ? null : (
                    <td className="border p-2 font-light text-right">
                      {formatDateTH(TableList.create_date)}
                    </td>
                  )}
                </tr>

                {expandedRows[TableList.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={tableHeaders.length + 1} className="p-0">
                      <div className="p-4 bg-white shadow-md rounded-lg">
                        <table className="w-full border-separate border-spacing-0 rounded-md overflow-hidden text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                              <th className="border-t border-l border-b border-r border-gray-300 p-2 text-right font-semibold w-10">
                                งวด
                              </th>
                              <th className="border-t border-b border-r border-gray-300 p-2 text-right font-semibold w-24">
                                วันที่ชำระ
                              </th>
                              <th className="border-t border-b border-r border-gray-300 p-2 text-right font-semibold w-20">
                                ราคา
                              </th>
                              <th className="border-t border-b border-r border-gray-300 p-2 text-right font-semibold w-20">
                                ชำระแล้ว
                              </th>
                              <th className="border-t border-b border-r border-gray-300 p-2 text-right font-semibold w-20">
                                ค่าติดตาม
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {TableList.productPayMentLists.map(
                              (payment, idx) => (
                                <tr
                                  key={idx}
                                  className={`${
                                    payment.isPaySuccess === "1" ||
                                    payment.isPaySuccess === "7"
                                      ? "bg-green-50"
                                      : payment.isPaySuccess === "2"
                                        ? "bg-yellow-50"
                                        : payment.isPaySuccess === "3" ||
                                            payment.isPaySuccess === "8" ||
                                            payment.isPaySuccess === "9"
                                          ? "bg-red-50"
                                          : "bg-white"
                                  } hover:bg-blue-100 hover:bg-opacity-50 transition-colors duration-150 border-t border-gray-200`}
                                >
                                  <td className="border-b border-l border-r border-gray-300 p-2 text-right">
                                    {payment.payNo}
                                  </td>
                                  <td className="border-b border-r border-gray-300 p-2 text-right">
                                    {formatDateNumberWithoutTime(
                                      payment.datePay,
                                    )}
                                  </td>
                                  <td className="border-b border-r border-gray-300 p-2 text-right">
                                    {formatNumberDigit(payment.price)}
                                  </td>
                                  <td className="border-b border-r border-gray-300 p-2 text-right">
                                    {formatNumberDigit(payment.pricePay)}
                                  </td>
                                  <td className="border-b border-r border-gray-300 p-2 text-right">
                                    {formatNumberDigit(payment.priceDebt)}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

TableProductSale.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  isMobileSale: PropTypes.bool,
  isCash: PropTypes.bool,
};

export default TableProductSale;
