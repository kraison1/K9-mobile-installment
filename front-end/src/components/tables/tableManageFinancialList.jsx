import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { formatNumberDigit } from "src/helpers/formatNumber";
import {
  formatDateNumberWithoutTime,
  formatDateTH,
  formatDateTimeOnlyZoneTH,
  formatDateTimeZoneTH,
} from "src/helpers/formatDate";
import React from "react";
import { useDispatch } from "react-redux";
import ModalCustomer from "src/components/modals/modalCustomer"; // Component
import { useAuth } from "src/hooks/authContext";
import { updateCustomer } from "src/store/customer";
import ModalStockProduct from "src/components/modals/modalStockProduct";
import { updateProduct } from "src/store/product";
import { conFirm } from "../alart";
import ModalProductSale from "src/components/modals/modalProductSale";
import ModalManageFinancialList from "src/components/modals/modalManageFinancialList";
import { updateProcessManageFinance } from "src/store/manageFinancial";
import { DefaultValuesDowns, handleSubMitRow } from "src/pages/downs";
import { contractProductSale } from "src/store/productSale";
import { noopener_noreferrer } from "src/helpers/constant";

const TableManageFinancialList = ({
  tableHeaders,
  tableLists,
  page,
  onClick,
  pageSize,
}) => {
  const { user, setIsLoadingOpen, isLoadingOpen } = useAuth();
  const dispatch = useDispatch();

  const [RowData, setRowData] = React.useState({});
  const [Modal, setModal] = React.useState(false);

  const [RowDataSale, setRowDataSale] = React.useState({});
  const [ModalSale, setModalSale] = React.useState(false);

  // Use a different name for the state variable
  const [isModalCustomerOpen, setIsModalCustomerOpen] = React.useState(false);
  const [rowDataCustomer, setRowDataCustomer] = React.useState({});

  const [isModalProductOpen, setIsModalProductOpen] = React.useState(false);
  const [rowDataProduct, setRowDataProduct] = React.useState({});

  // Use an object to track open state for each row by ID
  const [openDropdowns, setOpenDropdowns] = React.useState({});
  const dropdownRef = React.useRef(null);

  // Handle clicking outside to close all dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdowns({}); // Close all dropdowns
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle dropdown for a specific row
  const toggleDropdown = (id) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the state for this ID
    }));
  };

  const editRowProduct = (e) => {
    setRowDataProduct({
      imei: e.product_imei,
      id: e.process_manage_finance_productId,
    });
    setIsModalProductOpen(true);
  };

  const editRowCustomer = (e) => {
    setRowDataCustomer({
      name: e.customer_name,
      id: e.process_manage_finance_customerId,
    });
    setIsModalCustomerOpen(true);
  };

  const printContract = (item) => {
    setIsLoadingOpen(true);
    dispatch(
      contractProductSale({
        id: null,
        financeId: item.process_manage_finance_id,
      })
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
          link.download = `เอกสารสัญญาเลขที่-${item.code}.pdf`;
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

  const submitRowCustomer = (e) => {
    const updatedData = {
      ...e,
      updateByUserId: user.id,
      branchId: user.branchId,
    };
    dispatch(updateCustomer(updatedData))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
    setIsModalCustomerOpen(false);
  };

  const submitRowProduct = (e) => {
    delete e.productImages;
    e = { ...e, updateByUserId: user.id };
    dispatch(updateProduct(e))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
    setIsModalProductOpen(false);
  };

  const submitRow = (e) => {
    conFirm(
      `ยืนยันการปฏิเสธ ${e.process_manage_finance_code} ?`,
      "ตกลง",
      "ปิด",
      true
    ).then((result) => {
      if (result.isConfirmed) {
        if (!isNaN(e.process_manage_finance_id)) {
          dispatch(
            updateProcessManageFinance({
              id: e.process_manage_finance_id,
              status: "3",
            })
          )
            .unwrap()
            .then(() => setIsLoadingOpen(false))
            .catch(() => setIsLoadingOpen(false));
        }
      }
    });
  };

  const submitRowUpdate = (e) => {
    setIsLoadingOpen(true);
    if (!isNaN(e.process_manage_finance_id)) {
      dispatch(updateProcessManageFinance(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    }
  };

  const mapColor = (status) => {
    let color = "text-blue-600";
    if (status == "2") {
      color = "text-green-600";
    } else if (status == "3") {
      color = "text-red-600";
    }
    return color;
  };

  const addRowNote = (e) => {
    setModal(true);
    setRowData({
      id: e.process_manage_finance_id,
      code: e.process_manage_finance_code,
    });
  };

  const editRow = (e) => {
    setModalSale(true);
    setRowDataSale({
      ...DefaultValuesDowns,
      payType: "2",
      bankId: "",
      processManageFinanceId: Number(e.process_manage_finance_id),
      customerId: e?.process_manage_finance_customerId || "",
      product: {
        id: e.product_id,
        productModelId: e.productModel_id,
        imei: e.product_imei,
      },
      saleType: "3",
      useCalType: "2",
      priceDiscount: e.process_manage_finance_priceDown,
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="rounded-sm text-left border border-collapse border-1 w-full text-sm">
        <thead className="text-gray-900">
          <tr className="bg-white">
            {tableHeaders.map((TableList, k) => (
              <th
                key={k}
                className={`${
                  isEmpty(TableList.align) ? "" : `${TableList.align}`
                } border bg-gray-300 p-2`}
                style={{ width: `${TableList.w}%` }}
              >
                {TableList.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableLists.map((TableList, k) => (
            <tr
              className={`${
                TableList.valueDebtMonth > 0 ? "bg-red-50" : "bg-white"
              } hover:bg-blue-50 hover:bg-opacity-75 transition-colors duration-150`}
              key={k}
            >
              <td className="border p-2 font-light">
                <span className="flex items-center justify-center w-full">
                  {formatNumberDigit((page - 1) * pageSize + k + 1)}
                </span>
              </td>
              <td
                className={`border p-2 font-light ${
                  TableList.process_manage_finance_status === "2"
                    ? "cursor-pointer text-blue-500"
                    : ""
                }`}
                onClick={() =>
                  TableList.process_manage_finance_status === "2"
                    ? printContract(TableList)
                    : null
                }
              >
                {TableList?.process_manage_finance_code}
              </td>

              <td
                className={`border p-2 font-light ${
                  TableList.process_manage_finance_status === "1"
                    ? "cursor-pointer text-blue-500"
                    : ""
                }`}
                onClick={() =>
                  TableList.process_manage_finance_status === "1"
                    ? editRowProduct(TableList)
                    : null
                }
              >
                <p>{`รุ่น: ${TableList.productModel_name}`}</p>
                <p>{`รหัสสินค้า: ${TableList.product_code}`}</p>
                <p>{`IMEI: ${TableList.product_imei}`}</p>
              </td>
              <td className="border p-2 font-light">
                <p>{`แบต: ${TableList.product_batteryHealth} %`}</p>
                <p>{`ความจุ: ${TableList.productStorage_name}`}</p>
                <p>{`สี: ${TableList.productColor_name}`}</p>
              </td>

              <td
                className={`border p-2 font-light ${
                  TableList.process_manage_finance_status === "1"
                    ? "cursor-pointer text-blue-500"
                    : ""
                }`}
                onClick={() =>
                  TableList.process_manage_finance_status === "1"
                    ? editRowCustomer(TableList)
                    : null
                }
              >
                <p>{`ชื่อ: ${TableList.customer_name} ${TableList.customer_lastname}`}</p>
                <p>{`เบอร์: ${TableList.customer_tel}`}</p>
              </td>

              <td className="border p-2 font-light text-right">
                {`${formatNumberDigit(
                  TableList.process_manage_finance_priceCost
                )}`}
              </td>

              <td className="border p-2 font-light text-right">
                {`${formatNumberDigit(
                  TableList.process_manage_finance_priceDown
                )}`}
              </td>

              <td className="border p-2 font-light text-right">
                {`${formatNumberDigit(
                  TableList.process_manage_finance_priceCommission
                )}`}
              </td>

              <td className="border p-2 font-light text-right">
                {`${formatNumberDigit(
                  TableList.process_manage_finance_priceBranchService
                )}`}
              </td>

              <td className="border p-2 font-light text-right">
                {`${formatNumberDigit(
                  TableList.process_manage_finance_priceReceive
                )}`}
              </td>

              <td className="border p-2 font-light text-right">
                {TableList.create_by_name}
              </td>
              <td className="border p-2 font-light text-right">
                {formatDateNumberWithoutTime(
                  TableList.process_manage_finance_create_date
                )}
              </td>

              <td className="border p-2 font-light text-right">
                {formatDateTimeOnlyZoneTH(
                  TableList.process_manage_finance_create_date
                )}
              </td>

              <td className="border p-2 font-light text-right">
                {TableList?.approve_by_name || ""}
              </td>

              <td className="border p-2 font-light text-right">
                <p>{TableList.process_manage_finance_note}</p>

                <div className="col-span-3 lg:col-span-1 relative">
                  {/* Hamburger Button */}
                  {user.type == "ไฟแนนซ์" ? (
                    <p
                      className={`${mapColor(
                        TableList.process_manage_finance_status
                      )}`}
                    >
                      {TableList.status_str}
                    </p>
                  ) : (
                    <p
                      onClick={() => toggleDropdown(TableList.id || k)}
                      className="rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-105"
                      aria-label="Menu"
                    >
                      <p
                        className={`${mapColor(
                          TableList.process_manage_finance_status
                        )} ${
                          TableList.process_manage_finance_status == "1"
                            ? "cursor-pointer"
                            : ""
                        }`}
                      >
                        {TableList.status_str}
                      </p>
                    </p>
                  )}

                  {/* Dropdown Menu */}
                  {(TableList.id
                    ? openDropdowns[TableList.id]
                    : openDropdowns[k]) && (
                    <div
                      ref={dropdownRef}
                      className={`absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-200 ease-in-out origin-top animate-dropdown`}
                      style={{
                        zIndex: 11,
                      }}
                    >
                      {TableList.process_manage_finance_status == "1" ? (
                        <ul className="py-2 space-y-1">
                          <li>
                            <button
                              onClick={() => {
                                addRowNote(TableList);
                                toggleDropdown(TableList.id || k); // Close dropdown after click
                              }}
                              className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                                isLoadingOpen
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={isLoadingOpen}
                            >
                              {TableList.process_manage_finance_status == "1"
                                ? "เพิ่ม note"
                                : "เพิ่ม note"}
                            </button>
                          </li>

                          <li>
                            <button
                              onClick={() => {
                                editRow(TableList);
                                toggleDropdown(TableList.id || k); // Close dropdown after click
                              }}
                              className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                                isLoadingOpen
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={isLoadingOpen}
                            >
                              ค่าเปิดใช้เครื่อง
                            </button>
                          </li>

                          <li>
                            <button
                              onClick={() => {
                                submitRow(TableList);
                                toggleDropdown(TableList.id || k); // Close dropdown after click
                              }}
                              className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                                isLoadingOpen
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={isLoadingOpen}
                            >
                              ปฏิเสธ
                            </button>
                          </li>
                        </ul>
                      ) : null}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalProductSale
        open={ModalSale}
        setModal={setModalSale}
        RowData={RowDataSale}
        submitRow={handleSubMitRow({
          setIsLoadingOpen: setIsLoadingOpen,
          dispatch: dispatch,
          user: user,
          setModal: setModalSale,
        })}
      />

      <ModalCustomer
        open={isModalCustomerOpen}
        setModal={setIsModalCustomerOpen}
        RowData={rowDataCustomer}
        setRowData={setRowDataCustomer}
        submitRow={submitRowCustomer}
      />

      <ModalManageFinancialList
        open={Modal}
        setModal={setModal}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRowUpdate}
      />

      <ModalStockProduct
        open={isModalProductOpen}
        setModal={setIsModalProductOpen}
        RowData={rowDataProduct}
        setRowData={setRowDataProduct}
        submitRow={submitRowProduct}
      />
    </div>
  );
};

TableManageFinancialList.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

export default TableManageFinancialList;
