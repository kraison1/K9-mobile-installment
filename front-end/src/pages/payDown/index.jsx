/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { isEmpty } from "lodash";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import TableListPayDown from "src/components/tables/tableListPayDown";
import ModalSale from "src/components/modals/modalProductSaleDown";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayDownList } from "src/store/productSale";
import dayjs from "src/helpers/dayjsConfig";
import { th } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchSelectBranch } from "src/store/branch";

import ModalCustomer from "src/components/modals/modalCustomer";
import { DefaultValuesCustomer, handleSubMitRowCustomer } from "../customers";
import { DefaultValuesDowns, handleSubMitRow, searchTypeLists } from "../downs";

const cancelTypeLists = [
  {
    name: "ยังไม่ยกเลิก",
    value: "0",
    color: "blue",
  },
  {
    name: "ยกเลิก",
    value: "1",
    color: "red",
  },
  {
    name: "ดูทั้งหมด",
    value: "",
    color: "black",
  },
];

const paySuccessOptions = [
  {
    name: "ครบสัญญา",
    value: "7",
    color: "blue",
  },
  {
    name: "สำเร็จ",
    value: "1",
    color: "green",
  },
  {
    name: "ยังไม่ถึงเวลาจ่ายค่างวด",
    value: "4",
    color: "black",
  },
  {
    name: "ถึงเวลาชำระ",
    value: "2",
    color: "yellow",
  },
  {
    name: "มียอดค้างชำระ",
    value: "3",
    color: "orange",
  },
  {
    name: "ติดตามเครื่อง",
    value: "8",
    color: "brown",
  },
  {
    name: "หนี้เสีย",
    value: "9",
    color: "red",
  },
  {
    name: "ทั้งหมด",
    value: "0",
    color: "black",
  },
];

const isPaySuccessLists = paySuccessOptions.map((option) => {
  const { color } = option;
  let textColor, focusRingColor, hoverTextColor;

  if (color === "brown") {
    textColor = "text-[#e7a37d]";
    focusRingColor = "focus:ring-[#e7a37d]";
    hoverTextColor = "hover:text-[#d6936d]";
  } else if (color === "black") {
    textColor = "text-black";
    focusRingColor = "focus:ring-black";
    hoverTextColor = "hover:text-gray-700";
  } else {
    textColor = `text-${color}-600`;
    focusRingColor = `focus:ring-${color}-500`;
    hoverTextColor = `hover:text-${color}-700`;
  }

  return { ...option, textColor, focusRingColor, hoverTextColor };
});

const PayDownPage = () => {
  const { user, isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();

  const [Modal, setModal] = React.useState(false);
  const [CustomerModal, setCustomerModal] = React.useState(false);

  const [Search, setSearch] = React.useState("");
  const [Status, setStatus] = React.useState("1");
  const [BranchId, setBranchId] = React.useState(4);

  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);
  const [startDate, setStartDate] = React.useState(
    dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss")
  );
  const [endDate, setEndDate] = React.useState(
    dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss")
  );

  const [SearchType, setSearchType] = React.useState("1");
  const [IsCancel, setIsCancel] = React.useState("0");
  const [SaleType, setSaleType] = React.useState(["3", "4"]);
  const [IsPaySuccess, setIsPaySuccess] = React.useState("0");
  const [SearchBy, setSearchBy] = React.useState("1");

  const dispatch = useDispatch();
  const store = useSelector((state) => state.productSale);
  const storeBranch = useSelector((state) => state.branch);

  const [RowData, setRowData] = React.useState(DefaultValuesDowns);

  const [RowDataCustomer, setRowDataCustomer] = React.useState(
    DefaultValuesCustomer
  );

  const TableHeaders = [
    {
      name: "ลำดับ",
      align: "text-center",
    },
    {
      name: "วันที่",
      align: "text-center",
    },
    {
      name: "เลขที่สัญญา",
      align: "text-center",
    },
    {
      name: "ร้านที่ผ่อน",
      align: "text-center",
    },
    {
      name: "ลูกค้า",
      align: "text-center",
    },
    {
      name: "ทรัพย์สิน",
      align: "text-center",
    },
    {
      name: "ความจุ",
      align: "text-center",
    },
    {
      name: "สี",
      align: "text-center",
    },
    {
      name: "แบต",
      align: "text-center",
    },
    {
      name: "กล่อง",
      align: "text-center",
    },
    {
      name: "สภาพตอนขาย",
      align: "text-center",
    },
    {
      name: "ประกัน",
      align: "text-center",
    },
    {
      name: "อีมี่เครื่อง/ซีเรียล",
      align: "text-center",
    },
    {
      name: "ต้นทุนซ่อม",
      align: "text-center",
    },
    {
      name: "ค่าคอมตัวแทน",
      align: "text-center",
    },
    {
      name: "ทุนเครื่องสุทธิ",
      align: "text-center",
    },
    {
      name: "ค่าเปิดใช้เครื่อง",
      align: "text-center",
    },
    {
      name: "ค่าเช่า/ชำระ",
      align: "text-center",
    },
    {
      name: "กำหนดชำระ",
      align: "text-center",
    },
    {
      name: "ค่าทวงถาม/จ่ายแล้ว",
      align: "text-center",
    },
    {
      name: "โดย",
      align: "text-center",
    },
  ].filter((item) => item !== null); // ลบ null ออกจากอาร์เรย์

  const [TableLists, setTableLists] = React.useState([]);

  const confirmSearch = async () => {
    await getItems(1);
  };

  React.useEffect(() => {
    if (isEmpty(store.paramsPayDown)) {
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
    if (!isEmpty(store.allDataPayDown)) {
      const { data, total } = store.allDataPayDown;
      setTableLists(data);
      setTotalData(total);
      if (!isEmpty(store.paramsPayDown)) {
        const {
          page,
          search,
          status,
          startDate,
          endDate,
          searchType,
          saleType,
          isPaySuccess,
          searchBy,
          isCancel,
          branchId,
        } = store.paramsPayDown;

        setIsCancel(isCancel);
        setBranchId(branchId);
        setPageIndex(page);
        setStatus(status);
        setSearch(search);
        setSearchType(searchType);
        setSaleType(saleType);
        setIsPaySuccess(isPaySuccess);
        setSearchBy(searchBy);
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
      fetchPayDownList({
        search: Search,
        status: Status,
        branchId: BranchId,
        isCancel: IsCancel,
        isMobileSale: "1",
        isCash: "0",
        searchType: SearchType,
        pageSize: sizePerPage(),
        saleType: SaleType,
        isPaySuccess: IsPaySuccess,
        searchBy: SearchBy,
        startDate: startDate,
        endDate: endDate,
        page: page,
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

  const submitRow = handleSubMitRow({
    setIsLoadingOpen: setIsLoadingOpen,
    dispatch: dispatch,
    setModal: setModal,
    RowData: RowData,
  });

  const changePage = async (page) => {
    if (PageIndex !== page) {
      await getItems(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="grid gap-4 overflow-x-auto">
      <ModalSale
        open={Modal}
        setModal={setModal}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
      />

      <ModalCustomer
        open={CustomerModal}
        setModal={setCustomerModal}
        RowData={RowDataCustomer}
        submitRow={handleSubMitRowCustomer({
          setIsLoadingOpen: setIsLoadingOpen,
          user: user,
          dispatch: dispatch,
          setModal: setCustomerModal,
        })}
        getItems={() => {}}
      />

      <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-xl shadow-lg">
        {/* Input Field */}
        <div className="col-span-3 lg:col-span-2 flex items-start gap-3 ">
          <label
            htmlFor="ContactCode"
            className="font-medium text-gray-700 whitespace-nowrap pt-2"
          >
            หมายเลขสัญญา
          </label>
          <div className="flex-1">
            <input
              id="Search"
              name="Search"
              type="text"
              value={Search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-200 ease-in-out hover:border-gray-400`}
              disabled={isLoadingOpen}
              placeholder="ค้นหา หมายเลขสัญญา, ลูกค้า, เบอร์โทรศัพท์, อีมี่, รุ่น"
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmSearch();
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="col-span-3 lg:col-span-1 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isLoadingOpen}
            onClick={() => confirmSearch()}
            className={`px-4 py-2 w-full bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 ease-in-out ${
              isLoadingOpen ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            ค้นหา
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DatePicker and Radio Section */}
        <div className="col-span-2">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md ">
            {/* Main responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
              {/* FULL WIDTH: Radio groups */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {/* สถานะสัญญา */}
                  <div className="min-w-0 lg:col-span-1">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      สถานะสัญญา
                    </label>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6">
                      {cancelTypeLists.map((v, k) => (
                        <div className="flex items-center" key={k}>
                          <input
                            id={`cancelTypeLists-${v.value}`}
                            type="radio"
                            name="IsCancel"
                            onChange={(e) => setIsCancel(e.target.value)}
                            checked={v.value === IsCancel}
                            value={v.value}
                            className={`w-5 h-5 text-${v.color}-600 border-gray-300 focus:ring-${v.color}-500 cursor-pointer`}
                          />
                          <label
                            htmlFor={`cancelTypeLists-${v.value}`}
                            className={`ml-2 text-sm font-medium text-${v.color}-600 hover:text-${v.color}-700 transition-colors duration-200 cursor-pointer`}
                          >
                            {v.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* สถานะค่าเช่า (ขยายพื้นที่) */}
                  <div className="min-w-0 lg:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      สถานะค่าเช่า
                    </label>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6">
                      {isPaySuccessLists.map((v, k) => (
                        <div className="flex items-center" key={k}>
                          <input
                            id={`isPaySuccessLists-${v.value}`}
                            type="radio"
                            name="paySuccess"
                            onChange={(e) => setIsPaySuccess(e.target.value)}
                            checked={v.value === IsPaySuccess}
                            value={v.value}
                            className={`w-5 h-5 ${v.textColor} border-gray-300 ${v.focusRingColor} cursor-pointer`}
                          />
                          <label
                            htmlFor={`isPaySuccessLists-${v.value}`}
                            className={`ml-2 text-sm font-medium ${v.textColor} ${v.hoverTextColor} transition-colors duration-200 cursor-pointer`}
                          >
                            {v.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* วันที่ (บีบให้แคบลง) */}
                  <div className="min-w-0 lg:col-span-1 max-w-[280px]">
                    {SearchType === "1" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* วันที่เริ่มต้น */}
                        <div className="space-y-2 min-w-0">
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
                                : dayjs()
                                    .startOf("month")
                                    .subtract(2, "year")
                                    .toDate()
                            }
                            maxDate={dayjs(endDate)
                              .subtract(1, "date")
                              .toDate()}
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
                          <div className="space-y-2 min-w-0">
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

                  {/* ค้นหาด้วย วันที่ (บีบให้เล็กลง + จัดเป็นคอลัมน์) */}
                  <div className="min-w-0 lg:col-span-1 justify-self-end w-full max-w-[220px]">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      ค้นหาด้วย วันที่
                    </label>

                    <div className="flex flex-row gap-2">
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
            <TableListPayDown
              page={PageIndex}
              pageSize={sizePerPage()}
              tableHeaders={TableHeaders}
              tableLists={TableLists}
              onClick={editRow}
              isMobileSale={true}
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

export default PayDownPage;
