import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import TableStockProductRepair from "src/components/tables/tableStockProductRepair";
import TableStockProductSaleRepair from "src/components/tables/tableStockProductSaleRepair";

import ModalStockProductRepair from "src/components/modals/modalStockProductRepair";
import ModalBuyIntoStock from "src/components/modals/modalBuyIntoStock";
import { generateMultipleBarcodesPDF } from "src/components/multipleBarcodeGenerator";

import { useDispatch, useSelector } from "react-redux";
import {
  addProductRepair,
  fetchProductRepair,
  fetchProductFindSale,
  printStockAction,
  updateProductRepair,
} from "src/store/product";
import { handleSubmitRow } from "../productBuy";
import Select from "react-select";
import { fetchSelectBranch } from "src/store/branch";
import { noopener_noreferrer } from "src/helpers/constant";
import { warning } from "src/components/alart";
import { fetchSelectProductBrandsBy } from "src/store/productBrand";
import { fetchSelectProductTypesRepair } from "src/store/productType";

import dayjs from "src/helpers/dayjsConfig";
import DatePicker from "react-datepicker";
import { th } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

const DefaultValues = {
  priceCostBuy: 0,
  priceWholeSale: "",
  priceSale: "",
  randomCode: "1",
  productTypeId: "",
  amount: 0,
  branchId: "",
  createByUserId: "",
  buyFormShop: "",
  active: "1",
  fileProducts: [],
  catalog: "อะไหล่ซ่อม",
};

export const DefaultValuesBuyRepair = {
  priceSumAll: 0,
  branchId: "",
  createByUserId: "",
  status: "0",
  catalog: "อะไหล่ซ่อม",
  productBuyLists: [],
};

const ProductRepairPage = () => {
  const { user, permissions } = useAuth();
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const [Modal, setModal] = React.useState(false);
  const [ModalBuy, setModalBuy] = React.useState(false);
  const [Search, setSearch] = React.useState("");
  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);
  const [Branches, setBranches] = React.useState([]);
  const [BranchId, setBranchId] = React.useState(user.branchId);
  const [ProductBrandId, setProductBrandId] = React.useState([]);
  const [ProductBrand, setProductBrand] = React.useState([]);
  const [ProductType, setProductType] = React.useState([]);
  const [ProductTypeId, setProductTypeId] = React.useState([]);
  const [Active, setActive] = React.useState("1");
  const dispatch = useDispatch();
  const store = useSelector((state) => state.product);
  const storeBranch = useSelector((state) => state.branch);
  const [SelectedItems, setSelectedItems] = React.useState([]);
  const storeProductBrand = useSelector((state) => state.productBrand);
  const storeProductType = useSelector((state) => state.productType);
  const [RowData, setRowData] = React.useState(DefaultValues);
  const [RowDataBuy, setRowDataBuy] = React.useState(DefaultValuesBuyRepair);
  const [startDate, setStartDate] = React.useState(
    dayjs().startOf("month").format("YYYY-MM-DD HH:mm:ss"),
  );
  const [endDate, setEndDate] = React.useState(
    dayjs().endOf("month").format("YYYY-MM-DD HH:mm:ss"),
  );

  const [TableLists, setTableLists] = React.useState([]);

  const [TableSaleLists, setTableSaleLists] = React.useState([]);

  const isThunder = import.meta.env.VITE_SYSTEM_NAME == "THUNDER";

  const radioActiveLists = [
    {
      name: "ทั้งหมด",
      value: "2",
      color: "blue",
    },
    {
      name: "ปิดใช้งาน",
      value: "0",
      color: "red",
    },
    {
      name: "พร้อมขาย",
      value: "1",
      color: "black",
    },
    {
      name: "ขายแล้ว",
      value: "3",
      color: "black",
    },
  ];

  const TableHeaders = [
    {
      name: "ลำดับ",
      w: isThunder ? 4 : 5,
      align: "text-left",
    },
    {
      name: "รหัส",
      w: isThunder ? 12 : 15,
      align: "text-center",
    },
    {
      name: "รูปสินค้า",
      w: isThunder ? 10 : 15,
      align: "text-center",
    },
    {
      name: "ประเภท",
      w: isThunder ? 6 : 7,
      align: "text-left",
    },
    {
      name: "รุ่น",
      w: isThunder ? 6 : 7,
      align: "text-left",
    },
    {
      name: "สี",
      w: isThunder ? 6 : 7,
      align: "text-left",
    },
    {
      name: "แบรนด์",
      w: isThunder ? 6 : 7,
      align: "text-left",
    },
    isThunder
      ? {
          name: "ซื้อจากร้านค้า",
          w: 8,
          align: "text-left",
        }
      : null,

    {
      name: "วันที่",
      w: 7,
      align: "text-left",
    },

    {
      name: "ขายแล้ว",
      w: 5,
      align: "text-right",
    },
    {
      name: "เครม",
      w: 5,
      align: "text-right",
    },
    {
      name: "คงคลัง",
      w: 7,
      align: "text-right",
    },
    {
      name: "ทุน",
      w: 5,
      align: "text-right",
    },
    {
      name: "ราคาส่ง/ราคาปลีก",
      w: isThunder ? 7 : 5,
      align: "text-right",
    },
    {
      name: "ผู้บันทึก",
      w: isThunder ? 6 : 5,
      align: "text-left",
    },
  ].filter((item) => item !== null); // ลบ null ออกจากอาร์เรย์

  const TableSaleHeaders = [
    {
      name: "ลำดับ",
      w: isThunder ? 4 : 5,
      align: "text-left",
    },
    {
      name: "รหัส",
      w: isThunder ? 12 : 15,
      align: "text-center",
    },
    {
      name: "รูปสินค้า",
      w: isThunder ? 10 : 15,
      align: "text-center",
    },
    {
      name: "ประเภท",
      w: isThunder ? 6 : 7,
      align: "text-left",
    },
    {
      name: "รุ่น",
      w: isThunder ? 6 : 7,
      align: "text-left",
    },
    {
      name: "สี",
      w: isThunder ? 6 : 7,
      align: "text-left",
    },
    {
      name: "แบรนด์",
      w: isThunder ? 6 : 7,
      align: "text-left",
    },
    isThunder
      ? {
          name: "ซื้อจากร้านค้า",
          w: 8,
          align: "text-left",
        }
      : null,

    {
      name: "วันที่",
      w: 7,
      align: "text-left",
    },
    {
      name: "จำนวน",
      w: 5,
      align: "text-right",
    },

    {
      name: "ทุน",
      w: 8,
      align: "text-right",
    },
    {
      name: "ราคาขาย",
      w: 8,
      align: "text-right",
    },
    {
      name: "กำไร",
      w: 8,
      align: "text-right",
    },
    {
      name: "ผู้บันทึก",
      w: isThunder ? 6 : 5,
      align: "text-left",
    },
  ].filter((item) => item !== null); // ลบ null ออกจากอาร์เรย์

  const confirmSearch = async () => {
    await getItems(1);
  };

  // Handle individual item selection
  const handleSelectItem = (item) => {
    const isSelected = SelectedItems.some(
      (selected) => selected.id === item.id,
    );
    if (isSelected) {
      setSelectedItems(
        SelectedItems.filter((selected) => selected.id !== item.id),
      );
    } else {
      setSelectedItems([...SelectedItems, item]);
    }
  };

  // Handle select all
  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      // Select all items on current page that aren't already selected
      const newSelections = TableLists.filter(
        (item) => !SelectedItems.some((selected) => selected.id === item.id),
      );
      setSelectedItems([...SelectedItems, ...newSelections]);
    } else {
      // Deselect all items on current page
      setSelectedItems(
        SelectedItems.filter(
          (item) => !TableLists.some((tableItem) => tableItem.id === item.id),
        ),
      );
    }
  };

  React.useEffect(() => {
    if (isEmpty(store.paramsRepair)) {
      getItems(PageIndex);
    }

    if (isEmpty(storeProductBrand.selectRepair)) {
      dispatch(
        fetchSelectProductBrandsBy({
          catalog: ["อะไหล่ซ่อม"],
        }),
      );
    }

    if (isEmpty(storeBranch.select)) {
      setIsLoadingOpen(true);
      dispatch(fetchSelectBranch())
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!isEmpty(store.allDataRepair)) {
      const { data, total } = store.allDataRepair;
      setTableLists(data);
      setTotalData(total);

      if (!isEmpty(store.paramsRepair)) {
        const {
          page,
          search,
          active,
          branchId,
          productBrandId,
          productTypeId,
        } = store.paramsRepair;
        setBranchId(branchId);
        setProductBrandId(productBrandId || []);
        setProductTypeId(productTypeId || []);
        setPageIndex(page);
        setSearch(search);
        setActive(active);
      }
    } else {
      setTableLists([]);
    }
  }, [store.allDataRepair, store.paramsRepair]);

  React.useEffect(() => {
    if (!isEmpty(store.allDataSaleRepair)) {
      const { data, total } = store.allDataSaleRepair;

      setTableSaleLists(data);
      setTotalData(total);

      if (!isEmpty(store.paramsSaleRepair)) {
        const {
          page,
          search,
          active,
          branchId,
          productBrandId,
          productTypeId,
          startDate,
          endDate,
        } = store.paramsSaleRepair;
        setBranchId(branchId);
        setProductBrandId(productBrandId || []);
        setProductTypeId(productTypeId || []);
        setPageIndex(page);
        setSearch(search);
        setActive(active);
        setStartDate(startDate);
        setEndDate(endDate);
      }
    } else {
      setTableSaleLists([]);
    }
  }, [store.allDataSaleRepair, store.paramsSaleRepair]);

  React.useEffect(() => {
    if (!isEmpty(storeProductType.selectRepair)) {
      setProductType(storeProductType.selectRepair);
    } else {
      dispatch(fetchSelectProductTypesRepair("อะไหล่ซ่อม"));
    }
  }, [storeProductType.selectRepair]);

  const getItems = async (page) => {
    setIsLoadingOpen(true);
    if (Active === "3") {
      dispatch(
        fetchProductFindSale({
          branchId: BranchId,
          search: Search,
          active: Active,
          productBrandId: ProductBrandId,
          productTypeId: ProductTypeId,
          catalog: "อะไหล่ซ่อม",
          pageSize: sizePerPage(),
          startDate: dayjs(startDate).format("YYYY-MM-DD HH:mm:ss"),
          endDate: dayjs(endDate).format("YYYY-MM-DD HH:mm:ss"),
          page: page,
        }),
      )
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
    } else {
      dispatch(
        fetchProductRepair({
          branchId: BranchId,
          search: Search,
          active: Active,
          productBrandId: ProductBrandId,
          productTypeId: ProductTypeId,
          catalog: "อะไหล่ซ่อม",
          pageSize: sizePerPage(),
          page: page,
        }),
      )
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
    }
  };

  const addRow = () => {
    setModal(true);
    setRowData(DefaultValues);
  };

  React.useEffect(() => {
    if (!isEmpty(storeProductBrand.selectRepair)) {
      const formattedBranches = [
        ...storeProductBrand.selectRepair.map((item) => ({
          value: item.id,
          label: item.brandname,
          fileProductBrand: item.fileproductbrand || null,
        })),
      ];
      setProductBrand(formattedBranches);
    } else {
      setProductBrand([]);
    }
  }, [storeProductBrand.selectRepair]);

  React.useEffect(() => {
    if (!isEmpty(storeBranch.select)) {
      const formattedBranches = [
        { value: 0, label: "ทุกสาขา" },
        ...storeBranch.select.map((item) => ({
          value: item.id,
          label: item.name,
        })),
      ];
      setBranches(formattedBranches);
    } else {
      setBranches([{ value: 0, label: "ทุกสาขา" }]);
    }
  }, [storeBranch.select]);

  const editRow = (e) => {
    setModal(true);
    setRowData(e);
  };

  const submitRow = (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      dispatch(addProductRepair(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    } else {
      delete e.productImages;
      e = { ...e, updateByUserId: user.id };

      dispatch(updateProductRepair(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    }
  };

  const submitRowBuy = handleSubmitRow({
    setIsLoadingOpen: setIsLoadingOpen,
    dispatch: dispatch,
    user: user,
    setModal: setModalBuy,
  });

  const printStock = () => {
    if (BranchId == 0) {
      warning("ไม่สามารถดาวน์โหลดทุกสาขา");
    } else {
      setIsLoadingOpen(true);
      dispatch(printStockAction(`${BranchId}/${"อะไหล่ซ่อม"}`))
        .unwrap()
        .then((pdfUrl) => {
          setIsLoadingOpen(false);
          const link = document.createElement("a");
          link.href = pdfUrl;

          const isSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent,
          );

          if (isSafari) {
            link.download = `stocks-lists-${BranchId}-${"อะไหล่ซ่อม"}.pdf`;
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
    }
  };

  const changePage = async (page) => {
    if (PageIndex !== page) {
      await getItems(page);
      // Scroll to the top of the page or to a specific element after loading new data
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="grid gap-4 overflow-x-auto">
      <ModalStockProductRepair
        open={Modal}
        setModal={setModal}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
        getItems={getItems}
      />

      <ModalBuyIntoStock
        open={ModalBuy}
        setModal={setModalBuy}
        RowData={RowDataBuy}
        setRowData={setRowDataBuy}
        submitRow={submitRowBuy}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="w-full">
            <button
              type="button"
              className="text-white text-sm w-full bg-green-500 hover:bg-green-600 rounded-lg px-4 py-2"
              onClick={() => addRow()}
            >
              เพิ่มข้อมูลใหม่
            </button>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <button
              type="button"
              className="text-white text-sm w-full bg-indigo-500 hover:bg-indigo-600 rounded-lg px-4 py-2"
              onClick={() => generateMultipleBarcodesPDF(SelectedItems)} // Use lowercase 's' to match state
            >
              Export Barcodes ({SelectedItems.length})
            </button>
          </div>

          {/* <div className="w-full">
            <button
              type="button"
              className="text-white text-sm w-full bg-blue-500 hover:bg-blue-600 rounded-lg px-4 py-2"
              onClick={() => addRowBuy()}
            >
              ซื้อสินค้าเข้าคลัง
            </button>
          </div> */}
        </div>

        <div className="col-span-2 lg:col-span-1">
          <button
            type="button"
            className="text-white text-sm w-full bg-yellow-500 hover:bg-yellow-600 rounded-lg px-4 py-2"
            onClick={() => printStock()} // Use lowercase 's' to match state
          >
            Export Stocks
          </button>
        </div>

        <div className="relative w-full text-center col-span-1 lg:col-span-2">
          <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center pl-3 pointer-events-none">
            <MdOutlineSearch size={20} />
          </div>
          <input
            id="Search"
            name="Search"
            type="text"
            value={Search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-28 text-sm text-gray-900 bg-gray-100 border border-gray-300 rounded-lg py-2 focus:ring-1 focus:ring-inset focus:ring-indigo-300"
            placeholder="ค้นหา รหัส, หมายเลขเครื่อง/หมายเลข IMEI"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                confirmSearch();
              }
            }}
          />
          <button
            type="button"
            disabled={isLoadingOpen}
            onClick={() => confirmSearch()}
            className="absolute inset-y-0 right-0 flex items-center px-8 font-bold text-white bg-blue-500 rounded-r-lg hover:bg-blue-600"
          >
            ค้นหา
          </button>
        </div>

        <div className="w-full col-span-1 lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="flex flex-col lg:flex-row gap-2 items-start md:col-span-3">
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                {permissions.includes("view-all-branches") ? (
                  <div className="space-y-2 w-full lg:w-[15rem] flex-shrink-0">
                    <p>ค้นหาสาขา</p>
                    <Select
                      menuPortalTarget={document.body}
                      styles={{
                        control: (base) => ({ ...base }),
                        menuPortal: (base) => ({ ...base, zIndex: 11 }),
                      }}
                      options={Branches}
                      placeholder="กรุณาเลือกสาขา"
                      isClearable
                      isSearchable
                      classNamePrefix="react-select"
                      value={Branches.find(
                        (option) => option.value === BranchId,
                      )}
                      onChange={(selectedOption) =>
                        setBranchId(selectedOption ? selectedOption.value : 0)
                      }
                    />
                  </div>
                ) : null}

                <div className="space-y-2 min-w-0 flex-1">
                  <p>แบรนด์</p>
                  <div className="flex flex-row flex-wrap gap-x-1 gap-y-1 sm:gap-x-2 sm:gap-y-2">
                    {ProductBrand.map((option) => (
                      <div
                        key={option.value}
                        className="flex flex-col items-center basis-[80px]"
                      >
                        <label
                          htmlFor={`brand-${option.value}`}
                          className="flex flex-col items-center cursor-pointer"
                        >
                          {option.fileProductBrand != null ? (
                            <img
                              src={`${import.meta.env.VITE_APP_API_URL}/${
                                option.fileProductBrand
                              }`}
                              alt={option.label}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded" />
                          )}
                          <span className="truncate text-[10px] sm:text-xs leading-tight text-center mt-[2px]">
                            {option.label}
                          </span>
                        </label>
                        <input
                          type="checkbox"
                          id={`brand-${option.value}`}
                          value={option.value}
                          checked={ProductBrandId.includes(option.value)}
                          onChange={(e) => {
                            const brandId = parseInt(e.target.value);
                            setProductBrandId((prev) =>
                              prev.includes(brandId)
                                ? prev.filter((id) => id !== brandId)
                                : [...prev, brandId],
                            );
                          }}
                          className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-[2px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 min-w-0 flex-1">
                  <p>ประเภท</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2">
                    {ProductType.map((option) => (
                      <div key={option.id} className="flex items-center">
                        <input
                          id={`model-${option.id}`}
                          type="checkbox"
                          value={option.id}
                          checked={ProductTypeId.includes(option.id)}
                          onChange={(e) => {
                            const modelId = parseInt(e.target.value);
                            setProductTypeId((prev) =>
                              prev.includes(modelId)
                                ? prev.filter((id) => id !== modelId)
                                : [...prev, modelId],
                            );
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <label
                          htmlFor={`model-${option.id}`}
                          className="ml-2 block text-sm text-gray-900 truncate cursor-pointer"
                        >
                          {option.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* สถานะ: เต็มแถว, wrap, ชิดกัน */}
            <div className="col-span-1 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <p className="mr-2">สถานะ</p>
                {radioActiveLists.map((radioActiveList, k) => (
                  <label
                    key={k}
                    htmlFor={`radioActiveList-${radioActiveList.value}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      id={`radioActiveList-${radioActiveList.value}`}
                      name="radioActiveList"
                      type="radio"
                      value={radioActiveList.value}
                      checked={radioActiveList.value === Active}
                      onChange={(e) => setActive(e.target.value)}
                      className={`w-4 h-4 border border-${radioActiveList.color}-500 focus:ring-${radioActiveList.color}-500`}
                    />
                    <span
                      className={`text-sm text-${radioActiveList.color}-500`}
                    >
                      {radioActiveList.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-2 w-full flex flex-row justify-start md:items-end gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 flex-shrink-0">
                  วันที่เริ่มต้น
                </label>
                <DatePicker
                  showIcon
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  locale={th}
                  endDate={endDate}
                  minDate={dayjs(endDate).subtract(1, "year").toDate()}
                  maxDate={endDate}
                  dateFormat="dd/MM/yyyy"
                  timeZone="Asia/Bangkok"
                  wrapperClassName="flex justify-end"
                  className={`p-2.5 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white`}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 flex-shrink-0">
                  วันที่สิ้นสุด
                </label>
                <DatePicker
                  showIcon
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsStart
                  startDate={endDate}
                  locale={th}
                  endDate={startDate}
                  minDate={dayjs(startDate).subtract(1, "year").toDate()}
                  maxDate={startDate}
                  dateFormat="dd/MM/yyyy"
                  timeZone="Asia/Bangkok"
                  wrapperClassName="flex justify-end"
                  className={`p-2.5 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* {isEmpty(TableLists || TableSaleLists) ? ( */}
      {/* <NodataPage /> */}
      {/* ) : ( */}
      <div className="w-full">
        <div className="grid gap-2 min-h-96">
          {Active !== "3" ? (
            <TableStockProductRepair
              active={Active}
              page={PageIndex}
              pageSize={sizePerPage()}
              tableHeaders={TableHeaders}
              tableLists={TableLists}
              onClick={editRow}
              onSelectItems={handleSelectItem}
              selectedItems={SelectedItems}
              onSelectAll={handleSelectAll}
            />
          ) : (
            <TableStockProductSaleRepair
              active={Active}
              page={PageIndex}
              pageSize={sizePerPage()}
              tableHeaders={TableSaleHeaders}
              tableLists={TableSaleLists}
              onClick={editRow}
              onSelectItems={handleSelectItem}
              selectedItems={SelectedItems}
              onSelectAll={handleSelectAll}
            />
          )}
        </div>

        <div className="py-2 px-2">
          <PageNavigation
            currentPage={PageIndex}
            totalCount={TotalData}
            pageSize={sizePerPage()}
            onPageChange={(page) => changePage(page)}
          />
        </div>
      </div>
      {/* )} */}
    </div>
  );
};

export default ProductRepairPage;
