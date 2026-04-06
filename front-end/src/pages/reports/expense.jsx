import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";

import TableExpenses from "src/components/tables/tableExpenses";
import ModalExpenses from "src/components/modals/modalExpenses";
import { useDispatch, useSelector } from "react-redux";
import { addExpenses, fetchExpenses, exportExpenses } from "src/store/expenses";

import dayjs from "src/helpers/dayjsConfig";
import DatePicker from "react-datepicker";
import { th } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { fetchSelectBranch } from "src/store/branch";
import { noopener_noreferrer } from "src/helpers/constant";

const DefaultValues = {
  price: 0,
  payType: "2",
  expenseTypeId: "",
  type: "",
  note: "",
  branchId: "",
  createByUserId: "",
  active: "1",
  create_date: "",
};

const ReportExpensesPage = () => {
  const { user, isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();
  const [Modal, setModal] = React.useState(false);
  const [Search, setSearch] = React.useState("");
  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);
  const [Active, setActive] = React.useState("1");
  const [BranchId, setBranchId] = React.useState(user.branchId);
  const [Branches, setBranches] = React.useState([]);
  const storeBranch = useSelector((state) => state.branch);
  const [startDate, setStartDate] = React.useState(
    dayjs().startOf("month").format("YYYY-MM-DD HH:mm:ss")
  );
  const [endDate, setEndDate] = React.useState(
    dayjs().endOf("month").format("YYYY-MM-DD HH:mm:ss")
  );

  const dispatch = useDispatch();
  const store = useSelector((state) => state.expenses);

  const [RowData, setRowData] = React.useState(DefaultValues);

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
      name: "เปิดใช้งาน",
      value: "1",
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
      name: "รหัส",
      w: 20,
      align: "text-left",
    },
    {
      name: "ประเภท",
      w: 15,
      align: "text-left",
    },
    {
      name: "บัญชี",
      w: 10,
      align: "text-left",
    },
    {
      name: "ยอดเงิน",
      w: 10,
      align: "text-right",
    },
    {
      name: "โดย",
      w: 20,
      align: "text-left",
    },
    {
      name: "วันที่",
      w: 20,
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
      dispatch(fetchSelectBranch());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!isEmpty(store.allData)) {
      const { data, total } = store.allData;
      setTableLists(data);
      setTotalData(total);

      if (!isEmpty(store.params)) {
        const { page, search, active, branchId, startDate, endDate } =
          store.params;
        setPageIndex(page);
        setBranchId(branchId);
        setSearch(search);
        setActive(active);
        setStartDate(startDate);
        setEndDate(endDate);
      }
    } else {
      setTableLists([]);
    }
  }, [store]);

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

  const getItems = async (page) => {
    setIsLoadingOpen(true);
    dispatch(
      fetchExpenses({
        search: Search,
        active: Active,
        pageSize: sizePerPage(),
        page: page,
        startDate: startDate,
        endDate: endDate,
        branchId: BranchId,
      })
    )
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const addRow = () => {
    setModal(true);
    setRowData(DefaultValues);
  };

  const printExpenses = () => {
    setIsLoadingOpen(true);

    const { branchId, startDate, endDate } = store.params;

    dispatch(
      exportExpenses({
        branchId: branchId,
        startDate: startDate,
        endDate: endDate,
      })
    )
      .unwrap()
      .then((pdfUrl) => {
        setIsLoadingOpen(false);
        const link = document.createElement("a");
        link.href = pdfUrl;

        // ตรวจสอบว่าเป็น Safari หรือไม่
        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
        );

        if (isSafari) {
          // สำหรับ Safari: ใช้ download attribute และชื่อไฟล์
          link.download = `Expenses.pdf`;
        } else {
          // สำหรับเบราว์เซอร์อื่น: เปิดในแท็บใหม่
          link.target = "_blank";
          link.rel = noopener_noreferrer;
        }

        link.click();
      })
      .catch((error) => {
        console.error("Failed to load contract:", error);
        setIsLoadingOpen(false);
      });
  };

  const editRow = (e) => {
    setModal(true);
    setRowData(e);
  };

  const submitRow = (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      dispatch(
        addExpenses({
          ...e,
          branchId: user.branchId,
          createByUserId: user.id,
        })
      )
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
      <ModalExpenses
        open={Modal}
        setModal={setModal}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="w-full">
          <button
            type="button"
            className="text-white text-sm w-full lg:w-6/12 bg-green-500 hover:bg-green-600 rounded-lg px-4 py-2"
            onClick={() => addRow()}
          >
            เพิ่มข้อมูลใหม่
          </button>
        </div>
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

        <div className="w-full col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md">
            {/* Radio Buttons */}
            <div className="col-span-1">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-sm font-medium text-gray-700">สถานะ</p>
                {radioActiveLists.map((radioActiveList, k) => (
                  <div className="flex items-center gap-2" key={k}>
                    <input
                      name={`radioActiveList-${radioActiveList.value}`}
                      id={`radioActiveList-${radioActiveList.value}`}
                      type="radio"
                      onChange={(e) => setActive(e.target.value)}
                      checked={radioActiveList.value === Active}
                      value={radioActiveList.value}
                      className={`h-4 w-4 text-${radioActiveList.color}-600 border-gray-300 focus:ring-${radioActiveList.color}-500`}
                    />
                    <label
                      htmlFor={`radioActiveList-${radioActiveList.value}`}
                      className={`text-sm font-medium text-${radioActiveList.color}-600`}
                    >
                      {radioActiveList.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-1 justify-self-end">
              <button
                type="button"
                onClick={() => printExpenses()}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              >
                Export PDF
              </button>
            </div>

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
                        minDate={dayjs(startDate).subtract(1, "month").toDate()}
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
        </div>
      </div>

      {isEmpty(TableLists) ? (
        <NodataPage />
      ) : (
        <div className="w-full">
          <div className="grid gap-2 min-h-96">
            <TableExpenses
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

export default ReportExpensesPage;
