import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import {
  formatNumberDigit,
  formatNumberDigit2,
} from "src/helpers/formatNumber";
import {
  formatDateNumberWithoutTime,
  formatDateTimeOnlyZoneTH,
} from "src/helpers/formatDate";

const TableProductClaims = ({
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
                style={{ width: `${TableList.w}%` }}
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
              <td className="border p-2 font-light text-left">
                {formatDateNumberWithoutTime(TableList.create_date)}
              </td>
              <td className="border p-2 font-light text-left">
                {formatDateTimeOnlyZoneTH(TableList.create_date)}
              </td>
              <td
                className="border p-2 font-light text-blue-500 cursor-pointer"
                onClick={() => onClick(TableList)}
              >
                {TableList.product?.code}
              </td>
              <td className="border p-2 font-light">
                {TableList.product?.productModel?.name ||
                  TableList.productModel?.name ||
                  "-"}
              </td>

              <td className="border p-2 font-light text-right">
                {formatNumberDigit(TableList.amount || 0)}
              </td>

              <td className="border p-2 font-light text-right">
                {formatNumberDigit2(TableList.priceCostBuy || 0)}
              </td>

              <td className="border p-2 font-light">
                {TableList.create_by?.name || "-"}
              </td>

              <td className="border p-2 font-light">
                {TableList.update_by?.name || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableProductClaims.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

export default TableProductClaims;
