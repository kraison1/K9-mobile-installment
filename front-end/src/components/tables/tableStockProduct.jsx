// TableStockProduct.jsx
import React from "react";
import PropTypes from "prop-types";
import { isEmpty, update } from "lodash";
import { formatNumberDigit } from "src/helpers/formatNumber";
import BarcodeGenerator from "src/components/barcodeGenerator";
import { noImage } from "src/helpers/constant";
import { useAuth } from "src/hooks/authContext";
import { useDispatch } from "react-redux";
import { conFirm } from "../alart";
import { deleteProduct } from "src/store/product";
import {
  formatDateNumberWithoutTime,
  formatDateTimeOnlyZoneTH,
} from "src/helpers/formatDate";
import { radioActiveProductLists } from "src/pages/stocks/product";
// import ModalTransferProduct from "src/components/modals/modalTransferProduct";
import { DefaultTransferValues } from "src/pages/transferProducts";
import ModalPayDown from "src/components/modals/modelPayDown";
import { findByProductId } from "src/store/productLog";
import ModalStockProductLog from "src/components/modals/modalStockProductLog";

const TableStockProduct = ({
  tableHeaders,
  tableLists,
  onClick,
  page,
  pageSize,
  onSelectItems,
  selectedItems = [],
  onSelectAll,
  IsBranchDown = "0",
}) => {
  const { user, permissions, setIsLoadingOpen } = useAuth();

  const [Modal, setModal] = React.useState(false);
  const [RowData, setRowData] = React.useState(DefaultTransferValues);

  const [handleOpenPayDown, setHandleOpenPayDown] = React.useState(false);
  const [contactCodeFromUrl, setContactCodeFromUrl] = React.useState(null);

  const dispatch = useDispatch();

  const onDelete = (item) => {
    conFirm(`ยืนยันการลบ ${item.code}`, "ตกลง", "ปิด", true).then((e) => {
      if (e.isConfirmed) {
        setIsLoadingOpen(true);
        dispatch(deleteProduct(item))
          .unwrap()
          .then(() => setIsLoadingOpen(false))
          .catch(() => setIsLoadingOpen(false));
      }
    });
  };

  const handleCheckboxChange = (item) => {
    onSelectItems(item);
  };

  const handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;
    onSelectAll(isChecked);
  };

  const fetchPayDown = (code) => {
    setContactCodeFromUrl(code);
    setHandleOpenPayDown(true);
  };

  const isAllSelected =
    tableLists.length > 0 &&
    selectedItems &&
    tableLists.every((item) =>
      selectedItems.some((selected) => selected.id === item.id)
    );

  const warranty = (list) => {
    if (list.hand == "มือสอง") {
      if (list.shopCenterInsurance == "มี") {
        return `ประกันศูนย์ถึง: ${formatDateNumberWithoutTime(
          list.shopCenterInsuranceDate || 0
        )}`;
      } else {
        return `ประกันร้าน: ${formatNumberDigit(list.shopInsurance || 0)} วัน`;
      }
    } else {
      return "รอ Active";
    }
  };

  const activeProduct = (active) => {
    const item = radioActiveProductLists.find(
      (i) => i.value.toString() === active?.toString()
    );

    if (!item)
      return (
        <span className="px-2 py-1 rounded text-sm font-medium text-gray-500 bg-gray-100">
          ไม่ทราบสถานะ
        </span>
      );

    return (
      <span
        className={`px-2 py-1 rounded text-sm font-medium text-${item.color}-600 bg-${item.color}-100`}
      >
        {item.name}
      </span>
    );
  };

  const fetchHistory = (value) => {
    dispatch(findByProductId(value)).then((v) => {
      // console.log(v);
      const { payload } = v;
      // console.log(payload);
      setRowData(payload);
      setModal(true);
    });
  };

  // const handleOpenTransfer = (value) => {
  //   setModal(true);
  //   setRowData({
  //     ...DefaultTransferValues,
  //     id: value.transferProductBranch.id,
  //     code: value.transferProductBranch.code,
  //     status: "1",
  //   });
  // };

  const submitRow = (e) => {
    setIsLoadingOpen(true);

    if (!isNaN(e.id)) {
      e = { ...e, updateByUserId: user.id };
      dispatch(update(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <ModalPayDown
        open={handleOpenPayDown}
        setModal={setHandleOpenPayDown}
        contactCodeFromUrl={contactCodeFromUrl}
      />

      {/* <ModalTransferProduct
        open={Modal}
        setModal={setModal}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
      /> */}

      <ModalStockProductLog
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
                  isEmpty(TableList.align) ? "" : `${TableList.align}`
                } border bg-gray-300 p-2`}
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
                <p
                  className="font-light text-blue-500 cursor-pointer"
                  onClick={() => onClick(TableList)}
                >
                  <p> {TableList.code}</p>
                </p>
              </td>
              <td className="border p-2 font-light truncate text-center">
                {`${TableList.productBrand?.name || ""}`}
              </td>
              <td className="border p-2 font-light truncate text-center">
                {`${TableList.productModel?.name || ""}`}
              </td>

              <td className="border p-2 font-light text-center">
                <div className="flex justify-center items-center">
                  {noImage(TableList.fileProduct)}
                </div>
              </td>
              <td className="border p-2 font-light truncate text-center">
                {`${TableList.productStorage?.name || ""}`}
              </td>
              <td className="border p-2 font-light truncate text-center">
                {`${TableList.productColor?.name || ""}`}
              </td>
              <td className="border p-2 font-light truncate text-center">
                {`${TableList.batteryHealth || 0}%`}
              </td>
              <td className="border p-2 font-light truncate text-center">
                <p
                  className={`${
                    TableList.boxType == "มี" ? "text-blue-500" : "text-red-500"
                  }`}
                >
                  {TableList.boxType}
                </p>
              </td>
              <td className="border p-2 font-light text-center">
                <p
                  className={`${
                    TableList.hand == "มือสอง"
                      ? "text-red-500"
                      : "text-blue-500"
                  }`}
                >
                  {TableList.hand == "มือสอง" ? "มือ 2" : "มือ 1"}
                </p>
                <p>{warranty(TableList)}</p>
              </td>

              <td className="border p-2 font-light text-center">
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <BarcodeGenerator value={TableList} />
                </div>
                <p>{TableList.imei}</p>
              </td>
              <td className="border p-2 font-light truncate text-center">
                {`${TableList.machineCondition || 0}%`}
              </td>

              <td className="border p-2 font-light truncate text-center">
                {activeProduct(TableList.active)}
                {IsBranchDown === "0" ? null : (
                  <p
                    className="text-blue-500 cursor-pointer"
                    onClick={() =>
                      fetchPayDown(TableList.productSaleLatest?.code || "")
                    }
                  >
                    {TableList.productSaleLatest?.code || ""}
                  </p>
                )}
              </td>

              {IsBranchDown === "0" ? (
                <td className="border p-2 font-light truncate text-center">
                  {TableList.transferProductBranchList?.length > 0 ? (
                    <>
                      <p>
                        {`${
                          TableList.transferProductBranchList?.[0]
                            ?.transferProductBranch?.branch?.name || ""
                        }`}
                      </p>
                      <p>
                        <span
                          className="text-red-500 cursor-pointer"
                          onClick={() => fetchHistory(TableList.id)}
                        >
                          ประวัติสินค้า
                        </span>
                      </p>
                    </>
                  ) : (
                    <p>
                      <span
                        className="text-red-500 cursor-pointer"
                        onClick={() => fetchHistory(TableList.id)}
                      >
                        ประวัติสินค้า
                      </span>
                    </p>
                  )}
                </td>
              ) : null}

              <>
                <td className="border p-2 font-light truncate">
                  {IsBranchDown === "0" ? (
                    <>
                      <p>
                        {TableList.vender?.customerType === "2"
                          ? "ร้านค้า"
                          : TableList.vender?.customerType === "3"
                          ? "ลูกค้า"
                          : ""}
                      </p>
                      <p>{TableList.buyFormShop || ""}</p>
                    </>
                  ) : (
                    <>
                      <p>
                        {TableList.productSaleLatest?.create_by?.branch?.name ||
                          ""}
                      </p>
                      <p>
                        {TableList.productSaleLatest?.create_by?.name || ""}
                      </p>
                    </>
                  )}
                </td>

                <td className="border p-2 font-light truncate">
                  {isEmpty(TableList?.productReturnSaleLatest) ? null : (
                    <>
                      <p>
                        {`${
                          TableList?.returnShopForm != ""
                            ? `ร้าน: ${TableList?.returnShopForm}`
                            : ""
                        }` || ""}
                      </p>
                      <p
                        className="text-blue-500 cursor-pointer"
                        onClick={() =>
                          fetchPayDown(TableList?.productReturnSaleLatest?.code)
                        }
                      >
                        {`${TableList?.productReturnSaleLatest?.code}` || ""}
                      </p>
                    </>
                  )}
                </td>

                <td className="border p-2 font-light truncate">
                  <p>
                    {formatDateNumberWithoutTime(TableList.create_date) || ""}
                  </p>
                  <p>{formatDateTimeOnlyZoneTH(TableList.create_date) || ""}</p>
                </td>

                <td className="border p-2 font-light truncate">
                  {(TableList?.productImages?.length || 0) > 0 &&
                  TableList.productImages[0].name ? (
                    <a
                      href={`${import.meta.env.VITE_APP_API_URL}/${
                        TableList.productImages[0].name
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p className="text-blue-500">
                        {formatNumberDigit(
                          Number(TableList.priceCostBuy) -
                            Number(TableList.priceRepair)
                        )}
                      </p>
                    </a>
                  ) : (
                    <p>
                      {formatNumberDigit(
                        Number(TableList.priceCostBuy) -
                          Number(TableList.priceRepair)
                      )}
                    </p>
                  )}
                </td>

                <td className="border p-2 font-light truncate text-right">
                  {formatNumberDigit(TableList.priceRepair)}
                </td>

                <td className="border p-2 font-light truncate text-right">
                  {formatNumberDigit(Number(TableList.priceCostBuy || 0))}
                </td>
              </>

              {permissions.includes("can-deleted") ? (
                <td
                  className="border p-2 font-light truncate cursor-pointer text-blue-500 text-right"
                  onClick={() => onDelete(TableList)}
                >
                  {`${formatNumberDigit(
                    TableList.priceWholeSale
                  )} / ${formatNumberDigit(TableList.priceSale)}`}
                </td>
              ) : (
                <td className="border p-2 font-light truncate text-right">
                  {`${formatNumberDigit(
                    TableList.priceWholeSale
                  )} / ${formatNumberDigit(TableList.priceSale)}`}
                </td>
              )}
              <td className="border p-2 font-light truncate text-right">
                {TableList?.create_by?.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableStockProduct.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  onSelectItems: PropTypes.func,
  selectedItems: PropTypes.array,
  onSelectAll: PropTypes.func,
  IsBranchDown: PropTypes.string,
};

export default TableStockProduct;
