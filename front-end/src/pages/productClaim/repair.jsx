/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import TableModalProductClaims from "src/components/tables/tableProductClaims";
import ModalProductClaims from "src/components/modals/modalProductClaims";
import { useDispatch, useSelector } from "react-redux";
import {
  addProductClaims,
  fetchProductClaims,
  updateProductClaims,
} from "src/store/productClaim";

import dayjs from "src/helpers/dayjsConfig";
import { th } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchSelectBranch } from "src/store/branch";
import Select from "react-select";

const ProductClaimsRepairPage = () => {
  const { user, isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();

  const [Modal, setModal] = React.useState(false);
  const [Search, setSearch] = React.useState("");
  const [Status, setStatus] = React.useState("0");
  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);

  const [Branches, setBranches] = React.useState([]);
  const [BranchId, setBranchId] = React.useState(user.branchId);

  const [startDate, setStartDate] = React.useState(
    dayjs().startOf("month").format("YYYY-MM-DD HH:mm:ss"),
  );
  const [endDate, setEndDate] = React.useState(
    dayjs().endOf("month").format("YYYY-MM-DD HH:mm:ss"),
  );

  const storeBranch = useSelector((state) => state.branch);

  const dispatch = useDispatch();
  const store = useSelector((state) => state.productClaim);

  const [RowData, setRowData] = React.useState({});

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

  const radioStatusLists = [
    {
      name: "รอ",
      value: "0",
      color: "blue",
    },
    {
      name: "ยืนยัน",
      value: "1",
      color: "green",
    },
  ];

  const TableHeaders = [
    {
      name: "ลำดับ",
      w: 8,
      align: "text-left",
    },
    {
      name: "วันที่",
      w: 8,
      align: "text-center",
    },
    {
      name: "เวลา",
      w: 8,
      align: "text-center",
    },
    {
      name: "รหัสสินค้า",
      w: 18,
      align: "text-left",
    },
    {
      name: "รุ่น",
      w: 20,
      align: "text-left",
    },
    {
      name: "จำนวน",
      w: 18,
      align: "text-right",
    },
    {
      name: "ต้นทุน/หน่วย",
      w: 8,
      align: "text-right",
    },
    {
      name: "สร้างโดย",
      w: 6,
      align: "text-left",
    },
    {
      name: "อนุมัติโดย",
      w: 6,
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
      const { data, total } = store.allDataRepair;

      setTableLists(data);
      setTotalData(total);

      if (!isEmpty(store.paramsRepair)) {
        const { page, search, status, startDate, endDate, branchId } =
          store.paramsRepair;
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
      fetchProductClaims({
        search: Search,
        status: Status,
        pageSize: sizePerPage(),
        branchId: BranchId,
        startDate: startDate,
        endDate: endDate,
        catalog: "อะไหล่ซ่อม",
        page: page,
      }),
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
      dispatch(addProductClaims(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    } else {
      dispatch(updateProductClaims(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
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
      <ModalProductClaims
        open={Modal}
        setModal={setModal}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            className="absolute inset-y-0 right-0 flex items-center px-4 font-bold text-white bg-blue-500 rounded-r-lg hover:bg-blue-600"
          >
            ค้นหา
          </button>
        </div>

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

            {/* Radio Buttons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex items-center col-span-full lg:col-span-1">
                <label htmlFor="status">สถานะ </label>
                <div id="status" name="status" className="flex">
                  {radioStatusLists.map((radioStatusList, k) => (
                    <div className="flex items-center me-4 ml-2" key={k}>
                      <input
                        name={`radioStatusList-${radioStatusList.value}`}
                        id={`radioStatusList-${radioStatusList.value}`}
                        type="radio"
                        onChange={(e) => {
                          setStatus(e.target.value);
                        }}
                        checked={radioStatusList.value === Status}
                        value={radioStatusList.value}
                        className={`w-4 h-4 border border-${radioStatusList.color}-500 focus:ring-${radioStatusList.color}-500`}
                      />
                      <label
                        htmlFor={`radioStatusList-${radioStatusList.value}`}
                        className={`ms-2 text-sm text-${radioStatusList.color}-500`}
                      >
                        {radioStatusList.name}
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
            <TableModalProductClaims
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

export default ProductClaimsRepairPage;
