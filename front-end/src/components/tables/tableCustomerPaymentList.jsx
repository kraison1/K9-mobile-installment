import PropTypes from "prop-types";
import { formatNumberDigit2 } from "src/helpers/formatNumber";
import { formatDateTH } from "src/helpers/formatDate";
import ModalPayDown from "src/components/modals/modelPayDown";
import React from "react";

const TableCustomerPaymentList = ({
  tableHeaders,
  tableLists,
  onClick,
  page,
  pageSize,
}) => {
  const [Modal, setModal] = React.useState(false);
  const [contactCodeFromUrl, setContactCodeFromUrl] = React.useState(null);

  const getTypeLabel = (type) => {
    switch (type) {
      case "1":
        return <span className="text-blue-500">ค่าดูแล</span>;
      case "2":
        return <span className="text-green-500">ออม</span>;
      default:
        return "-";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "0":
        return <span className="text-yellow-500">รอยืนยัน</span>;
      case "1":
        return <span className="text-green-500">ยืนยัน</span>;
      case "2":
        return <span className="text-red-500">ยกเลิก</span>;
      default:
        return "-";
    }
  };

  const navigator = (item) => {
    if (item.type == "1") {
      setModal(true);
      setContactCodeFromUrl(item?.productSale.code);
    } else {
      window.open(
        `/savings/paySaving?ContactCode=${item.productSaving?.code}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <div className="overflow-x-auto">
      <ModalPayDown
        open={Modal}
        setModal={setModal}
        contactCodeFromUrl={contactCodeFromUrl}
      />

      <table className="rounded-sm text-left border border-collapse border-1 w-full truncate">
        <thead className="text-gray-900">
          <tr className="bg-white">
            {tableHeaders.map((header, k) => (
              <th
                key={k}
                className={`${header.align || ""} border bg-gray-300 p-2`}
                style={{ width: `${header.w}%` }}
              >
                {header.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableLists.map((item, k) => (
            <tr
              key={item.id}
              className="bg-white hover:bg-gray-50 cursor-pointer"
            >
              <td className="border p-2 font-light">
                {(page - 1) * pageSize + k + 1}
              </td>
              <td
                className="border p-2 font-light text-blue-500"
                onClick={() => onClick(item)}
              >
                {item.code}
              </td>
              <td className="border p-2 font-light">
                {getTypeLabel(item.type)}
              </td>
              <td
                className="border p-2 font-light text-blue-500"
                onClick={() => navigator(item)}
              >
                {item.productSale?.code || item.productSaving?.code || "-"}
              </td>
              <td className="border p-2 font-light">{`${
                item.customer?.name || ""
              } ${item.customer?.lastname || ""}`}</td>
              <td className="border p-2 font-light text-right">
                {formatNumberDigit2(item.price)}
              </td>
              <td className="border p-2 font-light">
                {item.user?.name || "-"}
              </td>
              <td
                className="border p-2 font-light text-center"
                onClick={() => onClick(item)}
              >
                {getStatusLabel(item.status)}
              </td>
              <td className="border p-2 font-light text-center">
                {formatDateTH(item.create_date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableCustomerPaymentList.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

export default TableCustomerPaymentList;
