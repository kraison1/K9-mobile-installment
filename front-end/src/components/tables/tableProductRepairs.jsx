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
import { conFirm } from "../alart";
import { useAuth } from "src/hooks/authContext";
import { useDispatch } from "react-redux";
import { deleteProductRepair } from "src/store/productRepair";
import { MdExpandMore, MdChevronRight } from "react-icons/md";
import React from "react";

const getTypeRepairText = (type) => {
  switch (String(type)) {
    case "1":
      return "เครื่องหน้าร้าน";
    case "2":
      return "ลูกค้าหน้าร้าน";
    case "3":
      return "ร้านค้าส่งซ่อม";
    case "4":
      return "ส่งซ่อมร้านนอก";
    default:
      return "ไม่ระบุ";
  }
};

const TableProductRepairs = ({
  tableHeaders,
  tableLists,
  onClick,
  page,
  pageSize,
}) => {
  const { setIsLoadingOpen } = useAuth();

  const dispatch = useDispatch();

  const handleDeleteProductRepair = (item) => {
    conFirm(`ยืนยันการลบ : ${item.code}`, "ตกลง", "ปิด", true).then((e) => {
      if (e.isConfirmed) {
        setIsLoadingOpen(true);
        dispatch(deleteProductRepair(item))
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
            <React.Fragment key={k}>
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
                  {TableList.code}
                </td>
                <td className="border p-2 font-light">
                  <td className="p-2">
                    {TableList.typeRepair == "1"
                      ? TableList?.product?.productModel?.name || "-"
                      : TableList?.productModel?.name || "-"}
                  </td>
                </td>

                <td className="border p-2 font-light">
                  {`${TableList?.imei || TableList?.product?.imei || ""}`}
                </td>

                <td className="border p-2 font-light">
                  <div className="flex items-center">
                    <div className="group relative w-full">
                      <p className="truncate">{TableList.note}</p>
                      <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-sm rounded py-1 px-2 z-10">
                        {TableList.note}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="border p-2 font-light text-right">
                  {formatNumberDigit(TableList.pricePredict || 0)}
                </td>

                <td className="border p-2 font-light text-right">
                  {formatNumberDigit(TableList.priceRepair || 0)}
                </td>

                <td className="border p-2 font-light text-right">
                  {formatNumberDigit(TableList.priceEquipCost || 0)}
                </td>

                <td className="border p-2 font-light text-right">
                  {formatNumberDigit(TableList.priceEquipProfit || 0)}
                </td>

                <td className="border p-2 font-light text-right">
                  {formatNumberDigit(TableList.priceWage || 0)}
                </td>

                <td className="border p-2 font-light text-right">
                  {formatNumberDigit(
                    (TableList.priceEquipProfit || 0) -
                      (TableList.priceWage || 0)
                  )}
                </td>

                <td className="border p-2 font-light text-right">
                  {getTypeRepairText(TableList.typeRepair)}
                </td>
                <td className="border p-2 font-light text-right">
                  {TableList.shopName || "-"}
                </td>
                <td
                  className="border p-2 font-light text-blue-500 cursor-pointer"
                  onClick={() => handleDeleteProductRepair(TableList)}
                >
                  {TableList.create_by?.name || "-"}
                </td>
              </tr>

              {TableList.productRepairLists.length > 0 && (
                <tr className="bg-gray-50">
                  <td colSpan="3" className="p-0 border-none"></td>
                  <td
                    colSpan={tableHeaders.length - 3}
                    className="p-0 border-none"
                  >
                    <div className="p-4 bg-white">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="p-2 text-left font-semibold">
                              ประเภท
                            </th>

                            <th className="p-2 text-left font-semibold">
                              รุ่น
                            </th>

                            <th className="p-2 text-left font-semibold">สี</th>

                            <th className="p-2 text-left font-semibold">
                              แบรนด์
                            </th>

                            <th className="p-2 text-left font-semibold">
                              ซื้อจากร้านค้า
                            </th>

                            <th className="p-2 text-right font-semibold w-24">
                              จำนวน
                            </th>

                            <th className="p-2 text-right font-semibold w-32">
                              ราคา
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {TableList.productRepairLists.map((item, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="p-2">
                                {item.product?.productType?.name || "-"}
                              </td>
                              <td className="p-2">
                                {item.product?.productModel?.name || "-"}
                              </td>
                              <td className="p-2">
                                {item.product?.productColor?.name || "-"}
                              </td>
                              <td className="p-2">
                                {item.product?.productBrand?.name || "-"}
                              </td>

                              <td className="p-2">
                                {item.product?.buyFormShop || "-"}
                              </td>

                              <td className="p-2 text-right">
                                {formatNumberDigit(item.amount)}
                              </td>
                              <td className="p-2 text-right">
                                {formatNumberDigit2(item.priceSale)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableProductRepairs.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

export default TableProductRepairs;
