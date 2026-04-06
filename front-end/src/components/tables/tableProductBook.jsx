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
import { addProcessBook } from "src/store/processBook";

const TableProductBook = ({
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

  const cancelCase = (bookStatus, type, TableList) => {
    conFirm(`${bookStatus} ${TableList.code}`, "ตกลง", "ปิด", true).then(
      (e) => {
        if (e.isConfirmed) {
          setIsLoadingOpen(true);
          dispatch(
            addProcessBook({
              id: TableList.id,
              bookStatus: bookStatus,
              bookType: type,
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
                    <p>
                      {`รุ่น: ${TableList.product?.productModel?.name}`}
                    </p>
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
                {formatNumberDigit(TableList.priceCash)}
              </td>
              <td className="border p-2 font-light text-right">
                {formatNumberDigit(TableList.priceTransferCash)}
              </td>
              <td className="border p-2 font-light">
                {`ชื่อ: ${TableList.customer?.name}`}
                <br />
                {`นามสกุล: ${TableList.customer?.lastname}`}
                <br />
                {`เบอร์: ${TableList.customer?.tel}`}
              </td>
              <td className="border p-2 font-light">
                {TableList.create_by?.name}
              </td>
              <td className="border p-2 font-light">
                <div className="col-span-3 lg:col-span-1 relative">
                  {/* Hamburger Button */}
                  {user.type == "admin-external" ? (
                    <p className="text-blue-500">{`นัดชำระ ${formatDateNumberWithoutTime(
                      TableList.caseDate
                    )}`}</p>
                  ) : (
                    <button
                      onClick={() => toggleDropdown(TableList.id || k)}
                      className="rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-105"
                      aria-label="Menu"
                    >
                      <p className="text-blue-500">{`นัดชำระ ${formatDateNumberWithoutTime(
                        TableList.caseDate
                      )}`}</p>
                    </button>
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
                      <ul className="py-2 space-y-1">
                        <li>
                          <button
                            onClick={() => {
                              cancelCase(`ยึดจอง`, 2, TableList);
                              toggleDropdown(TableList.id || k); // Close dropdown after click
                            }}
                            className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                              isLoadingOpen
                                ? "opacity-60 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={isLoadingOpen}
                          >
                            ยึดจอง
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              cancelCase(`คืนจอง`, 3, TableList);
                              toggleDropdown(TableList.id || k); // Close dropdown after click
                            }}
                            className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                              isLoadingOpen
                                ? "opacity-60 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={isLoadingOpen}
                          >
                            คืนจอง
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

                        <li>
                          <button
                            onClick={() => {
                              cancelCase(`เปลื่ยนเป็นออม`, 5, TableList);
                              toggleDropdown(TableList.id || k); // Close dropdown after click
                            }}
                            className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                              isLoadingOpen
                                ? "opacity-60 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={isLoadingOpen}
                          >
                            เปลื่ยนเป็นออม
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                <p>{`ทำรายการ: ${formatDateTH(TableList.create_date)}`}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableProductBook.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

export default TableProductBook;
