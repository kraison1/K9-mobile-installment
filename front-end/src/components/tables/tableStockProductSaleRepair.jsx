import React from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { formatNumberDigit } from "src/helpers/formatNumber";
import BarcodeGenerator from "src/components/barcodeGenerator";
import { noImage } from "src/helpers/constant";
import {
  formatDateNumberWithoutTime,
  formatDateTimeOnlyZoneTH,
} from "src/helpers/formatDate";

const TableStockProductRepair = ({
  active,
  tableHeaders,
  tableLists,
  onClick,
  page,
  pageSize,
  onSelectItems,
  selectedItems = [],
  onSelectAll,
}) => {
  const handleCheckboxChange = (item) => {
    onSelectItems(item);
  };

  const handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;
    onSelectAll(isChecked);
  };

  const isAllSelected =
    tableLists.length > 0 &&
    selectedItems &&
    tableLists.every((item) =>
      selectedItems.some((selected) => selected.id === item.id),
    );

  return (
    <div className="overflow-x-auto">
      <table className="rounded-sm text-left border border-collapse border-1 table-auto w-full truncate">
        <thead className="text-gray-900">
          <tr className="bg-white">
            <th className="border bg-gray-300 p-2">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={isAllSelected}
                onChange={handleSelectAllChange}
              />
            </th>

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
              <td className="border p-2">
                <input
                  type="checkbox"
                  checked={
                    selectedItems &&
                    selectedItems.some((item) => item.id === TableList.id)
                  }
                  onChange={() => handleCheckboxChange(TableList)}
                  className="w-4 h-4"
                />
              </td>
              <td className="border p-2 font-light">
                {formatNumberDigit((page - 1) * pageSize + k + 1)}
              </td>
              <td className="border p-2 font-light text-center">
                {active == "3" ? null : (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <BarcodeGenerator value={TableList} />
                  </div>
                )}

                <p
                  className="p-2 font-light text-blue-500 cursor-pointer"
                  onClick={() => onClick(TableList.product)}
                >
                  {`${active == "3" ? TableList.product?.code : TableList.code}`}
                </p>
              </td>
              <td className="border p-2 font-light text-center">
                <div className="flex justify-center items-center">
                  {active == "3"
                    ? noImage(TableList?.product?.productImages?.[0]?.name)
                    : noImage(TableList?.fileProduct)}
                </div>
              </td>

              <td className="border p-2 font-light truncate">
                {`${TableList?.product.productType?.name || ""}`}
              </td>
              <td className="border p-2 font-light truncate">
                {`${TableList?.product.productModel?.name || ""}`}
              </td>
              <td className="border p-2 font-light truncate">
                {`${TableList?.product.productColor?.name || ""}`}
              </td>

              <td className="border p-2 font-light truncate">
                {`${TableList?.product.productBrand?.name || ""}`}
              </td>

              <td className="border p-2 font-light truncate">
                {`${active == "3" ? TableList.buyFormShop : TableList?.product.buyFormShop || ""}`}
              </td>

              <td className="border p-2 font-light text-left">
                {active == "3" ? (
                  <>
                    <p>
                      {formatDateNumberWithoutTime(
                        TableList?.productRepair.create_date,
                      )}
                    </p>
                    <p>
                      {formatDateTimeOnlyZoneTH(
                        TableList?.productRepair.create_date,
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      {formatDateNumberWithoutTime(
                        TableList?.product.create_date,
                      )}
                    </p>
                    <p>
                      {formatDateTimeOnlyZoneTH(TableList?.product.create_date)}
                    </p>
                  </>
                )}
              </td>

              {active == "3" ? (
                <>
                  <td className="border p-2 font-light text-right">
                    {`${formatNumberDigit(TableList.amount)}`}
                  </td>

                  <td className="border p-2 font-light text-right">
                    {`${formatNumberDigit(TableList.priceCostBuy)}`}
                  </td>

                  <td className="border p-2 font-light text-right">
                    {`${formatNumberDigit(TableList.priceSale)}`}
                  </td>

                  <td className="border p-2 font-light text-right">
                    {`${formatNumberDigit(TableList.priceProfit)}`}
                  </td>
                </>
              ) : (
                <>
                  <td className="border p-2 font-light text-right">
                    {`${formatNumberDigit(TableList.amountSale)}`}
                  </td>

                  <td className="border p-2 font-light text-right">
                    {`${formatNumberDigit(TableList.amountClaim)}`}
                  </td>

                  <td className="border p-2 font-light text-right">
                    {`${formatNumberDigit(TableList.amount)}`}
                  </td>

                  <td className="border p-2 font-light text-right">
                    {`${formatNumberDigit(TableList.priceCostBuy)}`}
                  </td>

                  <td className="border p-2 font-light text-right">
                    {`${formatNumberDigit(
                      TableList.priceWholeSale,
                    )} / ${formatNumberDigit(TableList.priceSale)}`}
                  </td>
                </>
              )}

              <td className="border p-2 font-light text-right">
                {`${active == "3" ? TableList.productRepair?.create_by?.name : TableList.create_by?.name}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableStockProductRepair.propTypes = {
  active: PropTypes.string,
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  onSelectItems: PropTypes.func,
  selectedItems: PropTypes.array,
  onSelectAll: PropTypes.func,
};

export default TableStockProductRepair;
