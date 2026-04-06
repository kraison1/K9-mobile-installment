import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { formatNumberDigit } from "src/helpers/formatNumber";
import {
  formatDateTH,
  formatDateNumberWithoutTime,
} from "src/helpers/formatDate";
import React, { useState, useRef, useEffect } from "react";
import { MdMenu } from "react-icons/md";
import { useAuth } from "src/hooks/authContext";
import { useDispatch, useSelector } from "react-redux";
import { conFirm } from "../alart";
import { addProcessSaving } from "src/store/processSaving";

const TableProductSaving = ({
  tableHeaders,
  tableLists,
  onClick,
  page,
  pageSize,
}) => {
  const dispatch = useDispatch();
  const { user, isLoadingOpen, setIsLoadingOpen } = useAuth();

  // Use an object to track open state for each row by ID
  const [openDropdowns, setOpenDropdowns] = useState({});
  const dropdownRef = useRef(null);

  // Handle clicking outside to close all dropdowns
  useEffect(() => {
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

  const cancelCase = (savingStatus, type, TableList) => {
    conFirm(`${savingStatus} ${TableList.code}`, "ตกลง", "ปิด", true).then(
      (e) => {
        if (e.isConfirmed) {
          setIsLoadingOpen(true);
          dispatch(
            addProcessSaving({
              id: TableList.id,
              savingStatus: savingStatus,
              savingType: type,
            })
          )
            .unwrap()
            .then(() => setIsLoadingOpen(false))
            .catch(() => setIsLoadingOpen(false));

          // Handle confirmation logic
        }
      }
    );
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
              className="bg-white hover:bg-blue-50 hover:bg-opacity-75 transition-colors duration-150"
              key={TableList.id || k} // Use ID if available, fallback to index
            >
              <td className="border p-2 font-light">
                <span className="flex items-center justify-center w-full">
                  {formatNumberDigit((page - 1) * pageSize + k + 1)}
                </span>
              </td>
              <td
                className="border p-2 font-light text-blue-500 cursor-pointer"
                onClick={() => onClick(TableList)}
              >
                {TableList.code}
              </td>
              <td className="border p-2 font-light">
                {!isEmpty(TableList.product) && (
                  <React.Fragment>
                    <p>{`รุ่น: ${TableList.product?.productModel?.name}`}</p>
                    <p> {`รหัสสินค้า: ${TableList.product?.code}`}</p>
                    <p> {`IMEI: ${TableList.product?.imei}`}</p>
                  </React.Fragment>
                )}
              </td>
              <td className="border p-2 font-light">
                {TableList.product?.productColor?.name}
              </td>
              <td className="border p-2 font-light">
                {TableList.product?.productStorage?.name}
              </td>
              <td className="border p-2 font-light text-right">
                <p
                  className="text-blue-500 cursor-pointer"
                  onClick={() =>
                    window.open(
                      `/savings/paySaving?ContactCode=${TableList.code}`,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  {formatNumberDigit(
                    Number(TableList.priceCash || 0) +
                      Number(TableList.priceTransferCash || 0) +
                      Number(TableList.priceSumPay || 0)
                  )}
                </p>
              </td>

              <td className="border p-2 font-light">
                <p>{`ชื่อ: ${TableList.customer?.name}`}</p>
                <p>{`นามสกุล: ${TableList.customer?.lastname}`}</p>
                <p>{`เบอร์: ${TableList.customer?.tel}`}</p>
              </td>
              <td className="border p-2 font-light">
                {TableList.create_by?.name}
              </td>
              <td className="border p-2 font-light">
                <div className="col-span-3 lg:col-span-1 relative">
                  {/* Hamburger Button */}
                  <button
                    onClick={() => toggleDropdown(TableList.id || k)}
                    className="rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-105"
                    aria-label="Menu"
                  >
                    <p className="text-blue-500">{`ทำรายการ ${formatDateNumberWithoutTime(
                      TableList.create_date
                    )}`}</p>
                  </button>

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
                      <ul className="py-2 space-y-1">
                        <li>
                          <button
                            onClick={() => {
                              cancelCase(`ยึดออม`, 2, TableList);
                              toggleDropdown(TableList.id || k); // Close dropdown after click
                            }}
                            className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                              isLoadingOpen
                                ? "opacity-60 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={isLoadingOpen}
                          >
                            ยึดออม
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              cancelCase(`คืนออม`, 3, TableList);
                              toggleDropdown(TableList.id || k); // Close dropdown after click
                            }}
                            className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                              isLoadingOpen
                                ? "opacity-60 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={isLoadingOpen}
                          >
                            คืนออม
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              cancelCase(`ค่าเปิดใช้เครื่อง`, 4, TableList);
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
                      </ul>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableProductSaving.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

export default TableProductSaving;
