import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import {
  formatNumberDigit,
  formatNumberDigit2,
} from "src/helpers/formatNumber";
import { formatDateTH } from "src/helpers/formatDate";
import { conFirm } from "src/components/alart";
import { deleteExpenses } from "src/store/expenses";
import { useAuth } from "src/hooks/authContext";
import { useDispatch } from "react-redux";

const TableExpenses = ({
  tableHeaders,
  tableLists,
  onClick,
  page,
  pageSize,
}) => {
  const { permissions, setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();

  const onDelete = (item) => {
    conFirm(`ยืนยันการลบ ${item.code}`, "ตกลง", "ปิด", true).then((e) => {
      if (e.isConfirmed) {
        setIsLoadingOpen(true);
        dispatch(deleteExpenses(item))
          .unwrap()
          .then(() => setIsLoadingOpen(false))
          .catch(() => setIsLoadingOpen(false));
      }
    });
  };

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
              <td
                className="border p-2 font-light text-blue-500 cursor-pointer"
                onClick={() => onClick(TableList)}
              >
                {TableList.code}
              </td>

              <td className="border p-2 font-light">
                {TableList.expenseType.name}
              </td>
              <td className="border p-2 font-light">
                {TableList.payType == "1" ? (
                  "-"
                ) : (
                  <p>{`${TableList.bank?.bankOwner}, ${TableList.bank?.bankName} (${TableList.bank?.bankNo})`}</p>
                )}
              </td>
              <td className="border p-2 font-light text-right">
                {formatNumberDigit2(TableList.price)}
              </td>
              <td className="border p-2 font-light">
                {TableList.create_by.name}
              </td>
              <td className="border p-2 font-light text-left">
                {permissions.includes("can-deleted") ? (
                  <p
                    className="font-light text-blue-500 cursor-pointer"
                    onClick={() => onDelete(TableList)}
                  >
                    {formatDateTH(TableList.create_date)}
                  </p>
                ) : (
                  <p className="font-light">
                    {formatDateTH(TableList.create_date)}
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableExpenses.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

export default TableExpenses;
