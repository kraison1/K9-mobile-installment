import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { formatNumberDigit } from "src/helpers/formatNumber";
import { formatDateTH } from "src/helpers/formatDate";
import ModalBook from "src/components/modals/modalProductBook";
import React from "react";

const TableProcessBook = ({
  tableHeaders,
  tableLists,
  page,
  onClick,
  pageSize,
}) => {
  const [Modal, setModal] = React.useState(false);
  const [RowData, setRowData] = React.useState({});

  const editRow = (e) => {
    const { productBook, ...res } = e;
    setModal(true);
    setRowData(productBook);
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
                className="border p-2 font-light text-blue-500 cursor-pointer"
                onClick={() => editRow(TableList)}
              >
                {TableList?.productBook?.code}
              </td>

              <td className="border p-2 font-light">
                {!isEmpty(TableList.productBook.product) && (
                  <React.Fragment>
                    <p>
                      {`รุ่น: ${TableList.productBook.product?.productModel?.name}`}
                    </p>
                    <p>
                      {" "}
                      {`รหัสสินค้า: ${TableList.productBook.product?.code}`}
                    </p>
                    <p> {`IMEI: ${TableList.productBook.product?.imei}`}</p>
                  </React.Fragment>
                )}
              </td>
              <td className="border p-2 font-light">
                {TableList.productBook?.product?.productColor?.name}
              </td>
              <td className="border p-2 font-light">
                {TableList.productBook?.product?.productStorage?.name}
              </td>
              <td className="border p-2 font-light text-right">
                {`${formatNumberDigit(TableList.sumPrice)}`}
              </td>

              <td className="border p-2 font-light text-right">
                {`${formatNumberDigit(TableList.priceReturnCustomer)} `}
              </td>

              <td className="border p-2 font-light text-right">
                {TableList.productBook?.customer?.name} {TableList.productBook?.customer?.lastname} {TableList.productBook?.customer?.tel}
              </td>

              <td className="border p-2 font-light text-right">
                {TableList.create_by?.name}
              </td>
              <td className="border p-2 font-light text-right">
                {formatDateTH(TableList.create_date)}
              </td>

              <td
                className="border p-2 font-light text-right text-blue-600 cursor-pointer"
                onClick={() => onClick(TableList)}
              >
                {TableList.bookStatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalBook
        open={Modal}
        setModal={setModal}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={() => {}}
      />
    </div>
  );
};

TableProcessBook.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

export default TableProcessBook;
