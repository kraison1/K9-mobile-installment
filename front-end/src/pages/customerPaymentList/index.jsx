import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerPaymentLists,
  updateCustomerPaymentList,
} from "src/store/customerPaymentList";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import TableCustomerPaymentList from "src/components/tables/tableCustomerPaymentList";
import ModalCustomerPaymentList from "src/components/modals/modalCustomerPaymentList";
import NodataPage from "src/pages/notfound/noData";
import dayjs from "src/helpers/dayjsConfig";
import DatePicker from "react-datepicker";
import { th } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { fetchSelectBranch } from "src/store/branch";

const CustomerPaymentListPage = () => {
  const { user, isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();
  const dispatch = useDispatch();
  const store = useSelector((state) => state.customerPaymentList);
  const storeBranch = useSelector((state) => state.branch);

  const [ModalOpen, setModalOpen] = useState(false);
  const [RowData, setRowData] = useState({});
  const [Search, setSearch] = useState("");
  const [PageIndex, setPageIndex] = useState(1);
  const [TotalData, setTotalData] = useState(0);
  const [TableLists, setTableLists] = useState([]);

  // New state for filters
  const [Type, setType] = useState(null);
  const [Status, setStatus] = useState(null);
  const [BranchId, setBranchId] = useState(user.branchId);
  const [Branches, setBranches] = useState([]);
  const [startDate, setStartDate] = useState(
    dayjs().subtract(1, "day").startOf("day").toDate()
  );

  const [endDate, setEndDate] = useState(dayjs().endOf("day").toDate());

  // Filter options
  const radioTypeLists = [
    { name: "ดูทั้งหมด", value: null, color: "black" },
    { name: "ค่าดูแล", value: "1", color: "blue" },
    { name: "ออม", value: "2", color: "green" },
  ];

  const radioStatusLists = [
    { name: "ดูทั้งหมด", value: null, color: "black" },
    { name: "รอยืนยัน", value: "0", color: "yellow" },
    { name: "ยืนยัน", value: "1", color: "green" },
    { name: "ยกเลิก", value: "2", color: "red" },
  ];

  // New Table Headers
  const TableHeaders = [
    { name: "ลำดับ", w: 5, align: "text-left" },
    { name: "รหัส", w: 10, align: "text-left" },
    { name: "ประเภท", w: 10, align: "text-left" },
    { name: "เลขสัญญา", w: 10, align: "text-left" },
    { name: "ลูกค้า", w: 15, align: "text-left" },
    { name: "ยอดเงิน", w: 10, align: "text-right" },
    { name: "ผู้ทำรายการ", w: 10, align: "text-left" },
    { name: "สถานะ", w: 10, align: "text-center" },
    { name: "วันที่", w: 10, align: "text-center" },
  ];

  const confirmSearch = async () => {
    await getItems(1);
  };

  // useEffect to fetch branches
  useEffect(() => {
    if (isEmpty(storeBranch.select)) {
      dispatch(fetchSelectBranch());
    }
  }, [dispatch, storeBranch.select]);

  useEffect(() => {
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

  // useEffect to get initial items
  useEffect(() => {
    if (isEmpty(store.params)) {
      getItems(PageIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect to update local state from redux store
  useEffect(() => {
    if (!isEmpty(store.allData)) {
      const { data, total } = store.allData;
      setTableLists(data);
      setTotalData(total);

      if (!isEmpty(store.params)) {
        const { page, search, branchId, type, status, startDate, endDate } =
          store.params;
        setPageIndex(page);
        setSearch(search);
        setBranchId(branchId);
        setType(type);
        setStatus(status);
        setStartDate(new Date(startDate));
        setEndDate(new Date(endDate));
      }
    } else {
      setTableLists([]);
    }
  }, [store]);

  // Updated getItems
  const getItems = async (page) => {
    setIsLoadingOpen(true);
    dispatch(
      fetchCustomerPaymentLists({
        search: Search,
        branchId: BranchId,
        pageSize: sizePerPage(),
        page: page,
        type: Type,
        status: Status,
        startDate: dayjs(startDate).format("YYYY-MM-DD HH:mm:ss"),
        endDate: dayjs(endDate).format("YYYY-MM-DD HH:mm:ss"),
      })
    )
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const editRow = (e) => {
    setModalOpen(true);
    setRowData(e);
  };

  // Updated submitRow for status update
  const submitRow = (e) => {
    setIsLoadingOpen(true);
    if (!isNaN(e.id)) {
      dispatch(updateCustomerPaymentList({ ...e, updateByUserId: user.id }))
        .unwrap()
        .then(() => {
          setIsLoadingOpen(false);
          setModalOpen(false);
        })
        .catch(() => {
          setIsLoadingOpen(false);
        });
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
      <ModalCustomerPaymentList
        open={ModalOpen}
        setModal={setModalOpen}
        RowData={RowData}
        submitRow={submitRow}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Button and Search Row */}
        <div className="col-span-2 lg:col-span-1"></div>

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
              placeholder="ค้นหา"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md">
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

            {/* DatePickers */}

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
                  endDate={endDate}
                  minDate={dayjs(startDate).subtract(1, "month").toDate()}
                  locale={th}
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
                  endDate={endDate}
                  minDate={startDate}
                  locale={th}
                  maxDate={dayjs().add(1, "month").toDate()}
                  dateFormat="dd/MM/yyyy"
                  timeZone="Asia/Bangkok"
                  wrapperClassName="w-full"
                  className={`w-full p-2.5 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white=`}
                />
              </div>
            </div>

            {/* Radio Buttons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">ประเภท</p>
                <div className="flex flex-wrap items-center gap-4">
                  {radioTypeLists.map((item, k) => (
                    <div className="flex items-center gap-2" key={k}>
                      <input
                        name={`radioTypeList-${item.value}`}
                        id={`radioTypeList-${item.value}`}
                        type="radio"
                        onChange={(e) =>
                          setType(
                            e.target.value === "null" ? null : e.target.value
                          )
                        }
                        checked={String(item.value) === String(Type)}
                        value={String(item.value)}
                        className={`h-4 w-4 text-${item.color}-600 border-gray-300 focus:ring-${item.color}-500`}
                      />
                      <label
                        htmlFor={`radioTypeList-${item.value}`}
                        className={`text-sm font-medium text-${item.color}-600`}
                      >
                        {item.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">สถานะ</p>
                <div className="flex flex-wrap items-center gap-4">
                  {radioStatusLists.map((item, k) => (
                    <div className="flex items-center gap-2" key={k}>
                      <input
                        name={`radioStatusList-${item.value}`}
                        id={`radioStatusList-${item.value}`}
                        type="radio"
                        onChange={(e) =>
                          setStatus(
                            e.target.value === "null" ? null : e.target.value
                          )
                        }
                        checked={String(item.value) === String(Status)}
                        value={String(item.value)}
                        className={`h-4 w-4 text-${item.color}-600 border-gray-300 focus:ring-${item.color}-500`}
                      />
                      <label
                        htmlFor={`radioStatusList-${item.value}`}
                        className={`text-sm font-medium text-${item.color}-600`}
                      >
                        {item.name}
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
            <TableCustomerPaymentList
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

export default CustomerPaymentListPage;
