import React from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { formatNumberDigit } from "src/helpers/formatNumber";
import {
  formatDateTHWithOutTime,
  formatDateTimeOnlyZoneTH,
} from "src/helpers/formatDate";
import { MdOutlineInfo } from "react-icons/md";
import ModalPayDown from "src/components/modals/modelPayDown";

const TableProcessCase = ({
  tableHeaders,
  tableLists,
  page,
  onClick,
  pageSize,
}) => {
  const [Modal, setModal] = React.useState(false);
  const [contactCodeFromUrl, setContactCodeFromUrl] = React.useState(null);

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
            <React.Fragment key={k}>
              <tr
                className={`${
                  TableList.valueDebtMonth > 0 ? "bg-red-50" : "bg-white"
                } hover:bg-blue-50 hover:bg-opacity-75 transition-colors duration-150`}
              >
                <td className="border p-2 font-light">
                  <span className="flex items-center justify-center w-full">
                    {formatNumberDigit((page - 1) * pageSize + k + 1)}
                  </span>
                </td>
                <td
                  className="border p-2 font-light text-blue-500 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModal(true);
                    setContactCodeFromUrl(TableList?.productSale.code);
                  }}
                >
                  {TableList?.productSale?.code}
                </td>
                <td className="border p-2 font-light">
                  <p>
                    {`รุ่น: ${TableList.productSale?.product?.productModel?.name}`}
                  </p>
                  <p>
                    {" "}
                    {`รหัสสินค้า: ${TableList.productSale?.product?.code}`}
                  </p>
                  <p> {`IMEI: ${TableList.productSale?.product?.imei}`}</p>
                </td>
                <td className="border p-2 font-light">
                  {TableList.productSale?.product?.productColor?.name}
                </td>
                <td className="border p-2 font-light">
                  {TableList.productSale?.product?.productStorage?.name}
                </td>

                <td className="border p-2 font-light text-right">
                  {`${formatNumberDigit(TableList.priceDownPayment)}`}
                </td>

                <td className="border p-2 font-light text-right">
                  {`${formatNumberDigit(TableList.valueDebtMonth)}`}
                </td>

                <td className="border p-2 font-light text-right">
                  {`${formatNumberDigit(TableList.priceRemaining)}`}
                </td>

                <td className="border p-2 font-light text-right">
                  {`${formatNumberDigit(TableList.sumPriceDebt)}`}
                </td>

                <td className="border p-2 font-light text-right">
                  {`${formatNumberDigit(TableList.priceEndCase)}`}
                </td>

                <td className="border p-2 font-light text-right">
                  {`${formatNumberDigit(TableList.priceReRider)}`}
                </td>

                <td className="border p-2 font-light text-right">
                  {`${formatNumberDigit(TableList.priceReturnCustomer)}`}
                </td>

                <td className="border p-2 font-light text-right">
                  {`${formatNumberDigit(TableList.pricePayRider)}`}
                </td>

                <td className="border p-2 font-light text-right">
                  <p>{TableList.create_by?.name}</p>
                </td>
                <td className="border p-2 font-light text-right">
                  <p>{formatDateTHWithOutTime(TableList.create_date)}</p>
                  <p>{formatDateTimeOnlyZoneTH(TableList.create_date)}</p>
                </td>
                <td
                  className="border p-2 font-light text-right text-blue-600 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(TableList);
                  }}
                >
                  {TableList.caseStatus}
                </td>
              </tr>

              <tr className="transition-all duration-500 ease-in-out">
                <td colSpan="16" className="p-4 bg-gray-50 border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <MdOutlineInfo size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">หมายเหตุ</p>
                      <p className="text-gray-600">{TableList.note}</p>
                    </div>
                  </div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableProcessCase.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

export default TableProcessCase;
