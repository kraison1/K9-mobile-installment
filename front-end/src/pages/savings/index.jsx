/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import TableSaving from "src/components/tables/tableProductSaving";
import ModalSaving from "src/components/modals/modalProductSaving";
import { useDispatch, useSelector } from "react-redux";
import { addProductSaving, fetchProductSaving } from "src/store/productSaving";
import dayjs from "src/helpers/dayjsConfig";
import { th } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchSelectBranch } from "src/store/branch";
import Select from "react-select";

export const DefaultValuesSaving = {
  priceTransferCash: "",
  note: "",
  productBookId: null,
  priceCash: "",
  payType: "1",
  bankId: "",
  customerId: "",
  productId: "",
  createByUserId: "",
  fileProductSaving: [],
};

const SavingPage = () => {
  const { user, isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();

  const [Modal, setModal] = React.useState(false);
  const [Search, setSearch] = React.useState("");
  const [Status, setStatus] = React.useState("1");
  const [Branches, setBranches] = React.useState([]);
  const [BranchId, setBranchId] = React.useState(user.branchId);

  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);
  const [startDate, setStartDate] = React.useState(
    dayjs().startOf("month").format("YYYY-MM-DD HH:mm:ss")
  );
  const [endDate, setEndDate] = React.useState(
    dayjs().endOf("month").format("YYYY-MM-DD HH:mm:ss")
  );

  const [SearchType, setSearchType] = React.useState("1");

  const dispatch = useDispatch();
  const store = useSelector((state) => state.productSaving);
  const storeBranch = useSelector((state) => state.branch);

  const [RowData, setRowData] = React.useState(DefaultValuesSaving);

  const searchTypeLists = [
    {
      name: "ไม่",
      value: "0",
      color: "blue",
    },
    {
      name: "ใช่",
      value: "1",
      color: "red",
    },
  ];

  const statusTypeLists = [
    {
      name: "ออมอยู่",
      value: "1",
      color: "blue",
    },
    {
      name: "ยึดออม",
      value: "2",
      color: "yellow",
    },
    {
      name: "คืนออม",
      value: "3",
      color: "red",
    },
    {
      name: "มีในสัญญา",
      value: "4",
      color: "red",
    },
    {
      name: "ดูทั้งหมด",
      value: "0",
      color: "black",
    },
  ];

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

  const TableHeaders = [
    {
      name: "ลำดับ",
      w: 5,
      align: "text-left",
    },
    {
      name: "เลขสัญญา",
      w: 10,
      align: "text-left",
    },
    {
      name: "ทรัพย์สิน",
      w: 20,
      align: "text-left",
    },
    {
      name: "สี",
      w: 5,
      align: "text-left",
    },
    {
      name: "ความจุ",
      w: 5,
      align: "text-left",
    },
    {
      name: "ยอดรวม",
      w: 10,
      align: "text-right",
    },
    {
      name: "ลูกค้า",
      w: 10,
      align: "text-left",
    },

    {
      name: "โดย",
      w: 5,
      align: "text-left",
    },

    {
      name: "เวลา",
      w: 15,
      align: "text-left",
    },
  ];

  const [TableLists, setTableLists] = React.useState([]);

  const confirmSearch = async () => {
    await getItems(1);
  };

  React.useEffect(() => {
    if (isEmpty(store.params)) {
      getItems(PageIndex);
    }

    if (isEmpty(storeBranch.select)) {
      setIsLoadingOpen(true);
      dispatch(fetchSelectBranch())
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
    }
  }, []);

  React.useEffect(() => {
    if (!isEmpty(store.allData)) {
      const { data, total } = store.allData;
      setTableLists(data);
      setTotalData(total);
      if (!isEmpty(store.params)) {
        const {
          page,
          search,
          status,
          startDate,
          endDate,
          searchType,
          branchId,
        } = store.params;

        setSearchType(searchType);
        setBranchId(branchId);
        setPageIndex(page);
        setStatus(status);
        setSearch(search);
        setStartDate(startDate);
        setEndDate(endDate);
      }
    } else {
      setTableLists([]);
    }
  }, [store]);

  const getItems = async (page) => {
    setIsLoadingOpen(true);
    dispatch(
      fetchProductSaving({
        search: Search,
        status: Status,
        branchId: BranchId,
        searchType: SearchType,
        pageSize: sizePerPage(),
        startDate: startDate,
        endDate: endDate,
        page: page,
      })
    )
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const addRow = () => {
    setModal(true);
    setRowData(DefaultValuesSaving);
  };

  const editRow = (e) => {
    setModal(true);
    setRowData(e);
  };

  const submitRow = (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      dispatch(addProductSaving(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    }
  };

  const changePage = async (page) => {
    if (PageIndex !== page) {
      await getItems(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="grid gap-4 overflow-x-auto">
      <ModalSaving
        open={Modal}
        setModal={setModal}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Button and Search Row */}
        <div className="col-span-2 lg:col-span-1">
          <button
            type="button"
            className="w-full lg:w-6/12 px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200 shadow-sm"
            onClick={() => addRow()}
          >
            เพิ่มข้อมูลใหม่
          </button>
        </div>

        <div className="col-span-2 lg:col-span-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MdOutlineSearch size={20} className="text-gray-500" />
            </div>
            <input
              id="Search"
              name="Search"
              type="text"
              value={Search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-20 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200"
              placeholder="ค้นหา ชื่อ, ประเภท"
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
              className="absolute inset-y-0 right-0 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-r-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              ค้นหา
            </button>
          </div>
        </div>

        {/* DatePicker and Radio Section */}
        <div className="col-span-2">
          <div className="grid grid-cols-1 gap-6 bg-white p-6 rounded-xl shadow-md">
            <div className="grid-cols-2 lg:col-span-1 justify-items-end">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                ค้นหาด้วย วันที่
              </label>
              <div className="flex flex-row flex-wrap gap-6">
                {searchTypeLists.map((v, k) => (
                  <div className="flex items-center" key={k}>
                    <input
                      id={`SearchType-${v.value}`}
                      type="radio"
                      name="SearchType"
                      onChange={(e) => setSearchType(e.target.value)}
                      checked={v.value === SearchType}
                      value={v.value}
                      className={`w-5 h-5 text-${v.color}-600 border-gray-300 focus:ring-${v.color}-500 cursor-pointer`}
                    />
                    <label
                      htmlFor={`SearchType-${v.value}`}
                      className={`ml-2 text-sm font-medium text-${v.color}-600 hover:text-${v.color}-700 transition-colors duration-200 cursor-pointer`}
                    >
                      {v.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* DatePickers */}
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
              {SearchType == "1" ? (
                <div className="w-full flex flex-col lg:flex-row lg:items-end gap-6">
                  <div className="w-full space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
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
                      minDate={dayjs(startDate).subtract(1, "month").toDate()}
                      maxDate={dayjs(endDate).toDate()}
                      dateFormat="dd/MM/yyyy"
                      timeZone="Asia/Bangkok"
                      wrapperClassName="w-full"
                      className={`w-full p-2.5 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white=`}
                    />
                  </div>

                  <div className="w-full space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      วันที่สิ้นสุด
                    </label>
                    <DatePicker
                      showIcon
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsStart
                      startDate={startDate}
                      locale={th}
                      endDate={endDate}
                      minDate={startDate}
                      maxDate={dayjs().add(1, "month").toDate()}
                      dateFormat="dd/MM/yyyy"
                      timeZone="Asia/Bangkok"
                      wrapperClassName="w-full"
                      className={`w-full p-2.5 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white=`}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Radio Buttons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="grid-cols-2 lg:col-span-1">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  สถานะ
                </label>
                <div className="flex flex-row flex-wrap gap-6">
                  {statusTypeLists.map((v, k) => (
                    <div className="flex items-center" key={k}>
                      <input
                        id={`statusTypeLists-${v.value}`}
                        type="radio"
                        name="Status"
                        onChange={(e) => setStatus(e.target.value)}
                        checked={v.value === Status}
                        value={v.value}
                        className={`w-5 h-5 text-${v.color}-600 border-gray-300 focus:ring-${v.color}-500 cursor-pointer`}
                      />
                      <label
                        htmlFor={`statusTypeLists-${v.value}`}
                        className={`ml-2 text-sm font-medium text-${v.color}-600 hover:text-${v.color}-700 transition-colors duration-200 cursor-pointer`}
                      >
                        {v.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEmpty(TableLists) ? (
        <NodataPage />
      ) : (
        <div className="w-full">
          <div className="grid gap-2 min-h-96">
            <TableSaving
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

export default SavingPage;
