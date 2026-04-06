import React from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { formatNumberDigit } from "src/helpers/formatNumber";
import BarcodeGenerator from "src/components/barcodeGenerator";
import { noImage, noopener_noreferrer } from "src/helpers/constant";
import { useAuth } from "src/hooks/authContext";
import { useDispatch } from "react-redux";
import {
  addWithdrawSumPriceSale,
  updateWithdrawSumPriceSale,
} from "src/store/withdrawSumPriceSale";
import ModalWithdrawSumPriceSale from "src/components/modals/modalWithdrawSumPriceSale";
import { reportProductById } from "src/store/productSale";
import {
  formatDateNumberWithoutTime,
  formatDateTimeOnlyZoneTH,
} from "src/helpers/formatDate";

const DefaultValues = {
  code: "",
  productId: "",
  amountWithdraw: 0,
  amountRemaining: 0,
  priceSale: 0,
  priceSum: 0,
  status: "1",
  active: "1",
  note: "",
  fileWithdrawSumPriceSale: [],
};

const TableStockProductAccessibility = ({
  tableHeaders,
  tableLists,
  onClick,
  page,
  pageSize,
  onSelectItems,
  selectedItems = [],
  onSelectAll,
}) => {
  const isThunder = import.meta.env.VITE_SYSTEM_NAME == "THUNDER";

  const dispatch = useDispatch();

  const { setIsLoadingOpen } = useAuth();

  const [RowData, setRowData] = React.useState(DefaultValues);
  const [Modal, setModal] = React.useState(false);

  const submitRow = (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      dispatch(addWithdrawSumPriceSale(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    } else {
      dispatch(updateWithdrawSumPriceSale(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    }
  };

  const addRow = (item) => {
    const amountWithdraw = Number(item.amountRemaining);
    setModal(true);
    setRowData({
      ...DefaultValues,
      productName: `${item.productModel?.name || "-"},
      สี: ${item.productColor?.name || "-"}
      (${item.productBrand?.name || "-"})`,
      productId: item.id,
      amountWithdraw: amountWithdraw,
      priceSale: item.priceSale,
      priceSum: amountWithdraw * Number(item.priceSale),
      amountRemaining: item.amountRemaining,
    });
  };

  const printReport = (item) => {
    setIsLoadingOpen(true);
    dispatch(reportProductById(`${item.id}`))
      .unwrap()
      .then((pdfUrl) => {
        setIsLoadingOpen(false);
        const link = document.createElement("a");
        link.href = pdfUrl;

        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
        );

        if (isSafari) {
          link.download = `report-${item.code}.pdf`;
        } else {
          link.target = "_blank";
          link.rel = noopener_noreferrer;
        }

        link.click();
      })
      .catch((error) => {
        console.error("Failed to load payment list:", error);
        setIsLoadingOpen(false);
      });
  };

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
      selectedItems.some((selected) => selected.id === item.id)
    );

  return (
    <div className="overflow-x-auto">
      <ModalWithdrawSumPriceSale
        open={Modal}
        setModal={setModal}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
      />

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
                  isEmpty(TableList?.align) ? "" : `${TableList?.align}`
                } border bg-gray-300 p-2`}
                style={{ width: `${TableList?.w}%` }}
              >
                {TableList?.name}
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
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <BarcodeGenerator value={TableList} />
                </div>
                <p
                  className="p-2 font-light text-blue-500 cursor-pointer"
                  onClick={() => onClick(TableList)}
                >
                  {TableList.code}
                </p>
              </td>
              <td className="border p-2 font-light text-center">
                <div className="flex justify-center items-center">
                  {noImage(TableList.fileProduct)}
                </div>
              </td>

              <td className="border p-2 font-light truncate">
                {`${TableList.productType?.name || ""}`}
              </td>

              <td className="border p-2 font-light truncate">
                {`${TableList.productModel?.name || ""}`}
              </td>

              <td className="border p-2 font-light truncate">
                {`${TableList.productColor?.name || ""}`}
              </td>

              <td className="border p-2 font-light truncate">
                {`${TableList.productBrand?.name || ""}`}
              </td>

              {isThunder ? (
                <td className="border p-2 font-light truncate">
                  {`${TableList.buyFormShop || ""}`}
                </td>
              ) : null}

              <td className="border p-2 font-light text-left">
                <p>{formatDateNumberWithoutTime(TableList.create_date)}</p>
                <p>{formatDateTimeOnlyZoneTH(TableList.create_date)}</p>
              </td>

              <td className="border p-2 font-light text-right">
                {`${formatNumberDigit(TableList.amountSale)}`}
              </td>

              <td className="border p-2 font-light text-right">
                {`${formatNumberDigit(TableList.amountFree)}`}
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
                  TableList.priceWholeSale
                )} / ${formatNumberDigit(TableList.priceSale)}`}
              </td>

              {/* <td className="border p-2 font-light text-right">
                <p
                  className="text-blue-500 cursor-pointer"
                  onClick={() => addRow(TableList)}
                >
                  {`${formatNumberDigit(TableList.amountWithdraw)}`}
                </p>
              </td>

              <td className="border p-2 font-light text-right">
                <p
                  className="text-blue-500 cursor-pointer"
                  onClick={() => printReport(TableList)}
                >
                  {`${formatNumberDigit(TableList.amountRemaining)}`}
                </p>
              </td> */}

              {isThunder ? null : (
                <td className="border p-2 font-light text-right">
                  {`${formatNumberDigit(
                    TableList.priceWholeSale
                  )} / ${formatNumberDigit(TableList.priceSale)}`}
                </td>
              )}

              <td className="border p-2 font-light text-right">
                {`${TableList.create_by?.name}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableStockProductAccessibility.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  onSelectItems: PropTypes.func,
  selectedItems: PropTypes.array,
  onSelectAll: PropTypes.func,
};

export default TableStockProductAccessibility;
