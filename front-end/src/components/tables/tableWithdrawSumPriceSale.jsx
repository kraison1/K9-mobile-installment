import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { formatNumberDigit } from "src/helpers/formatNumber";
import { formatDateTH } from "src/helpers/formatDate";
import { useAuth } from "src/hooks/authContext";
import { useDispatch } from "react-redux";
import { conFirm } from "src/components/alart";
import { deleteWithdrawSumPriceSale } from "src/store/withdrawSumPriceSale";

const TableProcessCase = ({
  tableHeaders,
  tableLists,
  page,
  onClick,
  pageSize,
}) => {
  const { permissions, setIsLoadingOpen } = useAuth();

  const dispatch = useDispatch();

  const onDelete = (item) => {
    conFirm(`ยืนยันการลบ ${item.code}`, "ตกลง", "ปิด", true).then((e) => {
      if (e.isConfirmed) {
        setIsLoadingOpen(true);
        dispatch(deleteWithdrawSumPriceSale(item))
          .unwrap()
          .then(() => setIsLoadingOpen(false))
          .catch(() => setIsLoadingOpen(false));
      }
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
              <td className="border p-2 font-light">{TableList?.code}</td>

              <td className="border p-2 font-light truncate">
                {` ${TableList.product?.productModel?.name || ""}, สี: ${
                  TableList.product?.productColor?.name || "-"
                }  (${TableList.product?.productBrand?.name || ""})
                `}
              </td>

              <td className="border p-2 font-light text-right">
                {`${formatNumberDigit(TableList.amountRemaining)}`}
              </td>
              <td className="border p-2 font-light text-right">
                {`${formatNumberDigit(TableList.amountWithdraw)}`}
              </td>
              <td className="border p-2 font-light text-right">
                {`${formatNumberDigit(TableList.priceSale)} `}
              </td>
              <td className="border p-2 font-light text-right">
                {permissions.includes("can-deleted") ? (
                  <span
                    className="font-light text-blue-500 cursor-pointer"
                    onClick={() => onDelete(TableList)}
                  >
                    {`${formatNumberDigit(TableList.priceSum)} `}
                  </span>
                ) : (
                  <span className="font-light">
                    {`${formatNumberDigit(TableList.priceSum)} `}
                  </span>
                )}
              </td>
              <td className="border p-2 font-light text-right">
                {TableList.create_by?.name}
              </td>

              <td
                className="border p-2 font-light text-right text-blue-600 cursor-pointer"
                onClick={() => onClick(TableList)}
              >
                {formatDateTH(TableList.create_date)}
              </td>
            </tr>
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
