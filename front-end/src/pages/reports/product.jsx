import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";

import TableStockProductLog from "src/components/tables/tableStockProductLog";
import ModalStockProductLog from "src/components/modals/modalStockProductLog";
import { useDispatch, useSelector } from "react-redux";
import {
  addProductLogs,
  fetchProductLogs,
  updateProductLogs,
} from "src/store/productLog";

import dayjs from "src/helpers/dayjsConfig";
import DatePicker from "react-datepicker";
import { th } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { fetchSelectBranch } from "src/store/branch";
const DefaultValues = {
  name: "",
};

const ReportProductPage = () => {
  const { permissions, isLoadingOpen, setIsLoadingOpen, user } = useAuth();
  const [Modal, setModal] = React.useState(false);
  const [Search, setSearch] = React.useState("");
  const [Catalog, setCatalog] = React.useState("มือถือ");
  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);
  const [ActionType, setActionType] = React.useState("");

  const [BranchId, setBranchId] = React.useState(user.branchId);
  const [Branches, setBranches] = React.useState([]);
  const dispatch = useDispatch();
  const store = useSelector((state) => state.productLog);

  const storeBranch = useSelector((state) => state.branch);
  const [startDate, setStartDate] = React.useState(
    dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss")
  );
  const [endDate, setEndDate] = React.useState(
    dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss")
  );

  const [RowData, setRowData] = React.useState(DefaultValues);

  const radioCatalogs = [
    {
      name: "ทั้งหมด",
      value: "",
      color: "blue",
    },
    {
      name: "มือถือ",
      value: "มือถือ",
      color: "red",
    },
    {
      name: "อุปกรณ์เสริม",
      value: "อุปกรณ์เสริม",
      color: "green",
    },
    {
      name: "อะไหล่ซ่อม",
      value: "อะไหล่ซ่อม",
      color: "green",
    },
  ];

  const TableHeaders = [
    {
      name: "ลำดับ",
      w: 5,
      align: "text-left",
    },
    {
      name: "หมายเลขเครื่อง/หมายเลข IMEI",
      w: 55,
      align: "text-left",
    },
    {
      name: "การกระทำ",
      w: 15,
      align: "text-left",
    },
    {
      name: "โดย",
      w: 10,
      align: "text-left",
    },
    {
      name: "เมื่อวันที่",
      w: 10,
      align: "text-left",
    },
  ];

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    }
  }, [storeBranch.select]);

  React.useEffect(() => {
    if (!isEmpty(store.allData)) {
      const { data, total } = store.allData;
      setTableLists(data);
      setTotalData(total);

      if (!isEmpty(store.params)) {
        const {
          page,
          search,
          catalog,
          branchId,
          startDate,
          endDate,
          actionType,
        } = store.params;
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
      })
    )
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const editRow = (e) => {
    setModal(true);
    setRowData(e);
  };

  const submitRow = (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      dispatch(addProductLogs(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    } else {
      dispatch(updateProductLogs(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    }
  };

  const changePage = async (page) => {
    if (PageIndex !== page) {
      await getItems(page, Catalog);
      // Scroll to the top of the page or to a specific element after loading new data
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="grid gap-4 overflow-x-auto">
      <ModalStockProductLog
        open={Modal}
        setModal={setModal}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
      />

      <div className="w-full col-span-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md">
          {/* Radio Buttons */}
          <div className="col-span-2">
            <div className="relative w-full text-center">
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
                placeholder="ค้นหา รหัส"
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
          </div>
          <div className="col-span-2">
            {/* Branch Select and DatePickers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 col-span-2 gap-6">
              {/* Branch Select */}
              {permissions.includes("view-all-branches") && (
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
                        borderRadius: "0.375rem",
                        borderColor: "#d1d5db",
                        boxShadow: "none",
                        "&:hover": { borderColor: "#2563eb" },
                      }),
                      menuPortal: (base) => ({ ...base, zIndex: 50 }),
                    }}
                    options={Branches}
                    placeholder="กรุณาเลือกสาขา"
                    isClearable
                    isSearchable
                    classNamePrefix="react-select"
                    value={Branches.find((option) => option.value === BranchId)}
                    onChange={(selectedOption) =>
                      setBranchId(selectedOption ? selectedOption.value : null)
                    }
                  />
                </div>
              )}

              {/* Date Pickers */}
              {permissions.includes("view-all-calendar") && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        วันที่เริ่มต้น
                      </label>
                      <DatePicker
                        showIcon
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        minDate={dayjs(startDate).subtract(3, "month").toDate()}
                        locale={th}
                        maxDate={dayjs(endDate).toDate()}
                        dateFormat="dd/MM/yyyy"
                        timeZone="Asia/Bangkok"
                        wrapperClassName="w-full"
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        วันที่สิ้นสุด
                      </label>
                      <DatePicker
                        showIcon
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        locale={th}
                        maxDate={dayjs().add(1, "month").toDate()}
                        dateFormat="dd/MM/yyyy"
                        timeZone="Asia/Bangkok"
                        wrapperClassName="w-full"
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="col-span-2">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-left">
              <p className="shrink-0">แคตตาล็อก</p>

              {radioCatalogs.map((radioCatalog, k) => {
                // กำหนดคลาสสีแบบคงที่ แยก input/label
                const colorStyles = {
                  red: {
                    input: "border-red-500 focus:ring-red-500",
                    label: "text-red-600",
                  },
                  green: {
                    input: "border-green-500 focus:ring-green-500",
                    label: "text-green-600",
                  },
                  blue: {
                    input: "border-blue-500 focus:ring-blue-500",
                    label: "text-blue-600",
                  },
                  yellow: {
                    input: "border-yellow-500 focus:ring-yellow-500",
                    label: "text-yellow-600",
                  },
                  gray: {
                    input: "border-gray-500 focus:ring-gray-500",
                    label: "text-gray-600",
                  },
                  orange: {
                    input: "border-orange-500 focus:ring-orange-500",
                    label: "text-orange-600",
                  },
                  purple: {
                    input: "border-purple-500 focus:ring-purple-500",
                    label: "text-purple-600",
                  },
                };

                const styles =
                  colorStyles[radioCatalog.color] || colorStyles.gray;

                return (
                  <label
                    key={k}
                    htmlFor={`radioCatalog-${radioCatalog.value}`}
                    className={`flex items-center gap-2 shrink-0 cursor-pointer ${styles.label}`}
                  >
                    <input
                      name="radioCatalog"
                      id={`radioCatalog-${radioCatalog.value}`}
                      type="radio"
                      onChange={(e) => setCatalog(e.target.value)}
                      checked={radioCatalog.value === Catalog}
                      value={radioCatalog.value}
                      className={`w-4 h-4 border focus:ring-2 ${styles.input}`}
                    />
                    <span className="text-sm">{radioCatalog.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {isEmpty(TableLists) ? (
        <NodataPage />
      ) : (
        <div className="w-full col-span-2">
          <div className="grid gap-2 min-h-96">
            <TableStockProductLog
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

export default ReportProductPage;
