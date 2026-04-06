import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import dayjs from "src/helpers/dayjsConfig";
import { th } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchSelectBranch } from "src/store/branch";
import Select from "react-select";
import TableManageFinancialList from "src/components/tables/tableManageFinancialList";
import { fetchProcessManageFinance } from "src/store/manageFinancial";
import { useDispatch, useSelector } from "react-redux";

const ManageFinancialList = () => {
  const { user, isLoadingOpen, setIsLoadingOpen } = useAuth();

  const [Search, setSearch] = React.useState("");
  const [Status, setStatus] = React.useState("1");
  const [SearchType, setSearchType] = React.useState("1");
  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);
  const [Branches, setBranches] = React.useState([]);
  const [BranchId, setBranchId] = React.useState(user.branchId);

  const [startDate, setStartDate] = React.useState(
    dayjs().startOf("month").format("YYYY-MM-DD HH:mm:ss")
  );
  const [endDate, setEndDate] = React.useState(
    dayjs().endOf("month").format("YYYY-MM-DD HH:mm:ss")
  );
  const dispatch = useDispatch();
  const store = useSelector((state) => state.manageFinancial);
  const storeBranch = useSelector((state) => state.branch);

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

  const radioStatusLists = [
    {
      name: "ทั้งหมด",
      value: "0",
      color: "blue",
    },
    {
      name: "รอดำเนินการ",
      value: "1",
      color: "blue",
    },
    {
      name: "ยืนยัน",
      value: "2",
      color: "green",
    },
    {
      name: "ปฏิเสธ",
      value: "3",
      color: "red",
    },
  ];

  const TableHeaders = [
    {
      name: "ลำดับ",
      w: 6,
      align: "text-left",
    },
    {
      name: "เลขสัญญา",
      w: 10,
      align: "text-left",
    },
    {
      name: "ทรัพย์สิน",
      w: 10,
      align: "text-left",
    },
    {
      name: "เพิ่มเติม",
      w: 7,
      align: "text-left",
    },
    {
      name: "ข้อมูลผู้เช่า",
      w: 10,
      align: "text-left",
    },
    {
      name: "ราคาขาย",
      w: 5,
      align: "text-right",
    },
    {
      name: "ค่าเปิดใช้เครื่อง",
      w: 7,
      align: "text-right",
    },
    {
      name: "ค่าคอม",
      w: 5,
      align: "text-right",
    },
    {
      name: "ค่าดำเนินการ",
      w: 8,
      align: "text-right",
    },

    {
      name: "ได้รับรวม",
      w: 6,
      align: "text-right",
    },
    {
      name: "ส่งโดย",
      w: 5,
      align: "text-right",
    },
    {
      name: "วันที่",
      w: 6,
      align: "text-right",
    },
    {
      name: "เวลา",
      w: 5,
      align: "text-right",
    },
    {
      name: "ยืนยันโดย",
      w: 5,
      align: "text-right",
    },
    {
      name: "สถานะ",
      w: 5,
      align: "text-right",
    },
  ].filter((item) => item !== null); // ลบ null ออกจากอาร์เรย์;

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        setBranchId(branchId);
        setPageIndex(page);
        setStatus(status);
        setSearch(search);
        setSearchType(searchType);
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
      fetchProcessManageFinance({
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

  const changePage = async (page) => {
    if (PageIndex !== page) {
      await getItems(page);
      // Scroll to the top of the page or to a specific element after loading new data
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="grid gap-4 overflow-x-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Button and Search Row */}

        <div className="col-span-2">
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
                  {radioStatusLists.map((v, k) => (
                    <div className="flex items-center" key={k}>
                      <input
                        id={`Status-${v.value}`}
                        type="radio"
                        name="Status"
                        onChange={(e) => setStatus(e.target.value)}
                        checked={v.value === Status}
                        value={v.value}
                        className={`w-5 h-5 text-${v.color}-600 border-gray-300 focus:ring-${v.color}-500 cursor-pointer`}
                      />
                      <label
                        htmlFor={`Status-${v.value}`}
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
            <TableManageFinancialList
              page={PageIndex}
              pageSize={sizePerPage()}
              tableHeaders={TableHeaders}
              tableLists={TableLists}
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

export default ManageFinancialList;
