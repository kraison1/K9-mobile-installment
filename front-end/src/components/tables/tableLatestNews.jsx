import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { formatNumberDigit } from "src/helpers/formatNumber";
import { noImage } from "src/helpers/constant";

const TableLatestNews = ({
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
              <td className="border p-2 font-light">
                <div className="flex justify-center items-center">
                  {noImage(TableList.fileLatestNew)}
                </div>
              </td>
              <td
                className="border p-2 font-light text-blue-500 cursor-pointer"
                onClick={() => onClick(TableList)}
              >
                <p>{TableList.name}</p>
              </td>
              <td className="border p-2 font-light">
                <p>{TableList.content}</p>
              </td>
              <td className="border p-2 font-light">
                <a
                  href={TableList.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  {TableList.linkUrl || "-"}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableLatestNews.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

export default TableLatestNews;
