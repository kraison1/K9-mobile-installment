import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import { fetchSelectBranch } from "src/store/branch";
import TableStockProductBuy from "src/components/tables/tableStockProductBuy";
import ModalStockProductBuy from "src/components/modals/modalStockProductBuy";
import ModalStockProductLog from "src/components/modals/modalStockProductLog";
import { useDispatch, useSelector } from "react-redux";
import { addProduct } from "src/store/product";
import Select from "react-select";

import dayjs from "src/helpers/dayjsConfig";
import DatePicker from "react-datepicker";
import { th } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { fetchProductLogs, reportListBuy } from "src/store/productLog";
import { noopener_noreferrer } from "src/helpers/constant";

export const DefaultValuesProduct = {
  imei: "",
  catalog: "มือถือ",
  payPerMonth: 0,
  valueMonth: "6",
  batteryHealth: 100,
  shopInsurance: "0",
  shopCenterInsurance: "ไม่มี",
  hand: "มือหนึ่ง",
  simType: "ใช่",
  randomCode: "1",
  simName: "",
  boxType: "มี",
  freeGift: "สายชาร์จ",
  machineCondition: 100,
  priceCostBuy: "",
  priceWholeSale: "",
  priceSale: "",
  priceDownPaymentPercent: 40,
  priceDownPayment: 0,
  priceRepair: 0,
  priceReRider: 0,
  priceRegAppleId: 0,
  priceETC: 0,
  // priceCommission: 300,
  // priceCommissionFinance: 10,
  priceCommission: 0,
  priceCommissionFinance: 0,
  productTypeId: "",
  productColorId: "",
  productStorageId: "",
  productBrandId: "",
  productModelId: "",
  amount: 1,
  branchId: "",
  refOldStockNumber: "",
  createByUserId: "",
  active: "1",
};

const ProductMobilePage = () => {
  const { user, permissions } = useAuth();
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const [Modal, setModal] = React.useState(false);
  const [ModalLog, setModalLog] = React.useState(false);

  const [Branches, setBranches] = React.useState([]);
  const [BranchId, setBranchId] = React.useState(user.branchId);
  const [Search, setSearch] = React.useState("");
  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);
  const [Catalog, setCatalog] = React.useState("มือถือ");
  const [ActionType, setActionType] = React.useState("ซื้อเข้า");
  const [startDate, setStartDate] = React.useState(
    dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss")
  );
  const [endDate, setEndDate] = React.useState(
    dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss")
  );

  const dispatch = useDispatch();
  const store = useSelector((state) => state.productLog);
  const storeBranch = useSelector((state) => state.branch);

  const [RowData, setRowData] = React.useState(DefaultValuesProduct);

  const isThunder = import.meta.env.VITE_SYSTEM_NAME == "THUNDER";

  const TableHeaders = [
    {
      name: "ลำดับ",
      align: "text-center",
      w: 4,
    },
    {
      name: isThunder ? "รหัส" : "รหัส/เลขสต็อกเก่า",
      align: "text-center",
      w: isThunder ? 7 : 8,
    },
    {
      name: "รุ่น",
      align: "text-center",
      w: isThunder ? 8 : 9,
    },
    {
      name: "ความจุ",
      align: "text-center",
      w: isThunder ? 5 : 6,
    },
    {
      name: "สี",
      align: "text-center",
      w: isThunder ? 5 : 6,
    },
    {
      name: "สุขภาพแบต",
      align: "text-center",
      w: isThunder ? 5 : 6,
    },
    {
      name: "กล่อง",
      align: "text-center",
      w: isThunder ? 5 : 6,
    },
    {
      name: "สภาพ",
      align: "text-center",
      w: isThunder ? 8 : 9,
    },
    {
      name: "แบรนด์",
      align: "text-center",
      w: isThunder ? 6 : 7,
    },
    {
      name: "อีมี่",
      align: "text-center",
      w: isThunder ? 8 : 9,
    },
    {
      name: "สภาพเครื่อง",
      align: "text-center",
      w: 5,
    },
    isThunder
      ? {
          name: "ซื้อจากร้านค้า",
          align: "text-center",
          w: 7,
        }
      : null,

    {
      name: "วันที่/เวลา",
      align: "text-center",
      w: isThunder ? 7 : 10,
    },

    {
      name: "ทุน",
      align: "text-center",
      w: 5,
    },
  ].filter((item) => item !== null); // ลบ null ออกจากอาร์เรย์

  const [TableLists, setTableLists] = React.useState([]);

  const confirmSearch = async () => {
    await getItems(1, Catalog);
  };

  React.useEffect(() => {
    if (isEmpty(store.params)) {
      getItems(PageIndex, Catalog);
    }

    if (isEmpty(storeBranch.select)) {
      dispatch(fetchSelectBranch());
    }
  }, []);

  React.useEffect(() => {
    if (!isEmpty(store.allDataBuy)) {
      const { data, total } = store.allDataBuy;
      setTableLists(data);
      setTotalData(total);

      if (!isEmpty(store.paramBuys)) {
        const {
          page,
          search,
          catalog,
          branchId,
          startDate,
          endDate,
          actionType,
        } = store.paramBuys;
        setPageIndex(page);
        setSearch(search);
        setCatalog(catalog);
        setStartDate(startDate);
        setEndDate(endDate);
        setBranchId(branchId);
        setActionType(actionType);
      }
    } else {
      setTableLists([]);
    }
  }, [store]);

  const getItems = async (page, catalog) => {
    setIsLoadingOpen(true);
    dispatch(
      fetchProductLogs({
        search: Search,
        pageSize: sizePerPage(),
        page: page,
        branchId: BranchId,
        catalog: catalog,
        startDate: startDate,
        endDate: endDate,
        actionType: ActionType,
        isBuy: "1",
      })
    )
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const exportFile = () => {
    setIsLoadingOpen(true);

    const { search, catalog, branchId, startDate, endDate, actionType } =
      store.paramBuys;

    dispatch(
      reportListBuy({
        search: search,
        branchId: branchId,
        catalog: catalog,
        startDate: startDate,
        endDate: endDate,
        actionType: actionType,
      })
    )
      .unwrap()
      .then((pdfUrl) => {
        setIsLoadingOpen(false);
        const link = document.createElement("a");
        link.href = pdfUrl;

        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
        );

        if (isSafari) {
          link.download = `BuyLists.pdf`;
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

  const addRow = () => {
    setModal(true);
    setRowData(DefaultValuesProduct);
  };

  const editRow = (e) => {
    setModalLog(true);
    setRowData(e);
  };

  const submitRow = (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      dispatch(addProduct(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    }
  };

  const changePage = async (page) => {
    if (PageIndex !== page) {
      await getItems(page, Catalog);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="grid gap-4 overflow-x-auto">
      <ModalStockProductLog
        open={ModalLog}
        setModal={setModalLog}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
      />

      <ModalStockProductBuy
        open={Modal}
        setModal={setModal}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
        getItems={getItems}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="col-span-2 lg:col-span-1">
          <button
            type="button"
            className="text-white text-sm w-full bg-green-500 hover:bg-green-600 rounded-lg px-4 py-2"
            onClick={() => addRow()}
          >
            เพิ่มข้อมูลใหม่
          </button>
        </div>

        {TableLists.length > 0 ? (
          <div className="col-span-2 lg:col-span-1">
            <button
              type="button"
              className="text-white text-sm w-full bg-indigo-500 hover:bg-indigo-600 rounded-lg px-4 py-2"
              onClick={() => exportFile()}
            >
              Export
            </button>
          </div>
        ) : null}

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
            className="block w-full pl-10 pr-16 text-sm text-gray-900 bg-gray-100 border border-gray-300 rounded-lg py-2 focus:ring-1 focus:ring-inset focus:ring-indigo-300"
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
            className="absolute inset-y-0 right-0 flex items-center px-4 font-bold text-white bg-blue-500 rounded-r-lg hover:bg-blue-600"
          >
            ค้นหา
          </button>
        </div>

        <div className="w-full col-span-2 lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Branch Select */}

            {permissions.includes("view-all-branches") ? (
              <div className="space-y-2">
                <label
                  htmlFor="branchId"
                  className="block text-sm font-medium text-gray-700"
                >
                  ค้นหาสาขา
                </label>
                <Select
                  menuPortalTarget={document.body}
                  styles={{
                    control: (base) => ({
                      ...base,
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 11 }),
                    option: (base, { data }) => ({
                      ...base,
                      color: data.isBranchDown == "1" ? "#69b8f2" : "", // Blue for isBranchDown, default otherwise
                    }),
                  }}
                  options={Branches}
                  placeholder="กรุณาเลือกสาขา"
                  isClearable
                  isSearchable
                  classNamePrefix="react-select"
                  value={Branches.find((option) => option.value === BranchId)}
                  onChange={(selectedOption) =>
                    setBranchId(selectedOption.value)
                  }
                />
              </div>
            ) : null}

            {/* Date Pickers and Button */}

            {permissions.includes("view-all-branches") ? (
              <div className="w-full flex flex-col lg:flex-row lg:items-end gap-6">
                {/* วันที่เริ่มต้น */}
                <div className="w-full space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    วันที่เริ่มต้น
                  </label>
                  <DatePicker
                    showIcon
                    selected={startDate}
                    onChange={(date) => {
                      setStartDate(date);
                      if (permissions.includes("view-sale-by-day")) {
                        setEndDate(dayjs(date).endOf("date").toDate());
                      }
                    }}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    locale={th}
                    minDate={
                      permissions.includes("view-sale-by-day")
                        ? dayjs(endDate)
                            .startOf("date")
                            .subtract(1, "date")
                            .toDate()
                        : dayjs().startOf("month").subtract(5, "month").toDate()
                    }
                    maxDate={dayjs(endDate).subtract(1, "date").toDate()}
                    dateFormat="dd/MM/yyyy"
                    timeZone="Asia/Bangkok"
                    wrapperClassName="w-full"
                    className="w-full p-2.5 text-sm border rounded-lg shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   focus:border-blue-500 transition duration-200 bg-white"
                  />
                </div>

                {/* วันที่สิ้นสุด */}
                {!permissions.includes("view-sale-by-day") ? (
                  <div className="w-full space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      วันที่สิ้นสุด
                    </label>
                    <DatePicker
                      showIcon
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      locale={th}
                      minDate={startDate}
                      maxDate={dayjs().endOf("date").toDate()}
                      dateFormat="dd/MM/yyyy"
                      timeZone="Asia/Bangkok"
                      wrapperClassName="w-full"
                      className="w-full p-2.5 text-sm border rounded-lg shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   focus:border-blue-500 transition duration-200 bg-white"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {isEmpty(TableLists) ? (
        <NodataPage />
      ) : (
        <div className="w-full">
          <div className="grid gap-2 min-h-96">
            <TableStockProductBuy
              page={PageIndex}
              pageSize={sizePerPage()}
              tableHeaders={TableHeaders}
              tableLists={TableLists}
              onClick={editRow}
            />
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
      )}
    </div>
  );
};

export default ProductMobilePage;
