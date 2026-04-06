import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import {
  formatNumberDigit,
  formatNumberDigit2,
} from "src/helpers/formatNumber";

const TableRateFinanceDown = ({
  tableHeaders,
  tableLists,
  onClick,
  page,
  pageSize,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="rounded-sm text-left border border-collapse border-1 w-full truncate">
        <thead className="text-gray-900">
          <tr className="bg-white">
            {tableHeaders.map((TableList, k) => (
              <th
                key={k}
                className={`${
                  isEmpty(TableList.align) ? "" : `${TableList.align}`
                } border bg-gray-300 p-2`}
                style={{ width: `${TableList.w}เท่า` }}
              >
                {TableList.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableLists.map((TableList, k) => (
            <tr className="bg-white" key={k}>
              <td className="border p-2 font-light">
                {formatNumberDigit((page - 1) * pageSize + k + 1)}
              </td>

              <td
                className="border p-2 font-light text-blue-500 cursor-pointer"
                onClick={() => onClick(TableList)}
              >
                {TableList.productModel?.name || "-"}
              </td>

              <td className="border p-2 font-light text-right">
                {TableList.productStorage?.name || "-"}
              </td>

              <td className="border p-2 font-light text-right">
                {formatNumberDigit2(TableList.priceHandOne)}
              </td>
              <td className="border p-2 font-light text-right">
                {formatNumberDigit2(TableList.priceStartHandTwo)}
              </td>
              <td className="border p-2 font-light text-right">
                {formatNumberDigit2(TableList.priceEndHandTwo)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableRateFinanceDown.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

export default TableRateFinanceDown;
