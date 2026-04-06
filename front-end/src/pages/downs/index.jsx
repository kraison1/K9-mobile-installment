/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { isEmpty, isNumber } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import TableSale from "src/components/tables/tableProductSale";
import ModalSale from "src/components/modals/modalProductSaleDown";
import { useDispatch, useSelector } from "react-redux";
import {
  addProductSale,
  fetchProductSale,
  updateProductSale,
} from "src/store/productSale";
import dayjs from "src/helpers/dayjsConfig";
import { th } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchSelectBranch } from "src/store/branch";
import Select from "react-select";
import { conFirm, error } from "src/components/alart";

import ModalCustomer from "src/components/modals/modalCustomer";
import { DefaultValuesCustomer, handleSubMitRowCustomer } from "../customers";

export const DefaultValuesDowns = {
  randomCode: "1",
  code: "",
  note: "",
  productBookId: null,
  priceCash: "",
  priceTransferCash: "",
  bankId: "",
  customerId: "",
  productId: "",
  isMobileSale: "1",
  shopAppID: "",
  shopPass: "",
  shopPin: "",
  useCalType: "1",
  catalog: "มือถือ",
  payPerMonth: 0,
  payType: "1",
  priceSale: 0,
  priceETC: 0,
  priceRegAppleId: 0,
  priceRegAppleIdCash: 0,
  priceRegAppleIdTransferCash: 0,
  priceReRiderCustomer: 0,
  priceReRider: 0,
  priceReRiderTransferCash: 0,
  priceReRiderCash: 0,
  priceDownType: "1",
  priceDownPayment: 0,
  priceDownPaymentPercent: 0,
  priceDiscount: 0,
  priceTotalPaid: 0,
  priceEquipCash: 0,
  priceEquipTransferCash: 0,
  saleType: "3",
  transportId: 0,
  priceSumAdjusted: 0,
  tackingNumber: "",
  rateFinanceId: "",
  valueMonth: 0,
  valueEqual: 1,
  priceType: "2",
  createByUserId: "",
  caseDate: dayjs(),
  fileProductSale: [],
  productPayMentLists: [],
  productSaleLists: [],
  create_date: "",
  isCash: "0",
  priceReseller: 0,
  resellerId: "",
};

export const searchTypeLists = [
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
  // {
  //   name: "ดูทั้งหมด",
  //   value: "",
  //   color: "black",
  // },
];

const isPaySuccessLists = [
  {
    name: "สำเร็จ",
    value: "1",
    color: "blue",
  },
  {
    name: "ถึงเวลาชำระ",
    value: "2",
    color: "yellow",
  },
  {
    name: "มียอดค้างชำระ",
    value: "3",
    color: "red",
  },
  {
    name: "ยังไม่ถึงเวลาจ่ายค่างวด",
    value: "4",
    color: "black",
  },
  {
    name: "ทั้งหมด",
    value: "0",
    color: "black",
  },
];

const SalePage = () => {
  const { user, isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();

  const [Modal, setModal] = React.useState(false);
  const [CustomerModal, setCustomerModal] = React.useState(false);

  const [Search, setSearch] = React.useState("");
  const [Status, setStatus] = React.useState("1");
  const [Branches, setBranches] = React.useState([]);
  const [BranchId, setBranchId] = React.useState(user.branchId);

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
  const [SearchBy, setSearchBy] = React.useState("0");

  const dispatch = useDispatch();
  const store = useSelector((state) => state.productSale);
  const storeBranch = useSelector((state) => state.branch);

  const [RowData, setRowData] = React.useState(DefaultValuesDowns);

  const [RowDataCustomer, setRowDataCustomer] = React.useState(
    DefaultValuesCustomer
  );

  React.useEffect(() => {
    if (!isEmpty(storeBranch.select)) {
      const formattedBranches = [
        { value: 0, label: "ทุกสาขา" },
        ...storeBranch.select.map((item) => ({
          value: item.id,
          label: item.name,
          isBranchDown: item.isBranchDown,
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
      name: "จากร้านค้า",
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
    if (isEmpty(store.paramsMobile)) {
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
    if (!isEmpty(store.allDataMobile)) {
      const { data, total } = store.allDataMobile;
      setTableLists(data);
      setTotalData(total);
      if (!isEmpty(store.paramsMobile)) {
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
        } = store.paramsMobile;

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

  const fetchAll = async () => {
    // Dispatch the fetch action directly with the "reset" parameters.
    // This avoids the race condition with state updates and the useEffect hook.
    setIsLoadingOpen(true);
    dispatch(
      fetchProductSale({
        search: "", // Reset search
        status: Status, // Keep existing status
        branchId: 0, // Reset branch to "all"
        isCancel: "0", // Reset to "not cancelled"
        isMobileSale: "1",
        isCash: "0",
        searchType: "0", // Reset search type
        pageSize: sizePerPage(),
        saleType: SaleType, // Keep existing saleType
        isPaySuccess: IsPaySuccess, // Keep existing isPaySuccess
        searchBy: SearchBy, // Keep existing searchBy
        startDate: startDate, // Keep existing startDate
        endDate: endDate, // Keep existing endDate
        page: 1, // Fetch the first page
      })
    )
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const getItems = async (page) => {
    setIsLoadingOpen(true);
    dispatch(
      fetchProductSale({
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

  const addRow = () => {
    setModal(true);
    setRowData({ ...DefaultValuesDowns });
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Button and Search Row */}
        <div className="col-span-2 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              className="w-full px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-sm"
              onClick={() => addRow("1")}
            >
              เพิ่มข้อมูลการขายดาวน์
            </button>

            {/* <button
              type="button"
              className="w-full px-6 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors duration-200 shadow-sm"
              onClick={() => {
                setRowDataCustomer({ ...DefaultValuesCustomer });
                setCustomerModal(true);
              }}
            >
              เพิ่มข้อมูลใหม่ (ลูกค้า)
            </button> */}
          </div>
        </div>

        <div className="col-span-2 lg:col-span-2">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3">
            {/* LEFT: button (fixed) */}
            <button
              type="button"
              className="w-full lg:w-[200px] px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-sm"
              onClick={() => fetchAll()}
            >
              รายการสัญญาทั้งหมด
            </button>

            {/* MIDDLE: date (grow) */}
            {SearchType == "1" ? (
              <div className="w-full lg:flex-1 max-w-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* วันที่เริ่มต้น */}
                  <div className="w-full space-y-2 min-w-0">
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
                              .subtract(5, "month")
                              .toDate()
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
                    <div className="w-full space-y-2 min-w-0">
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
              </div>
            ) : null}

            {/* RIGHT: search (fixed on lg) */}
            <div className="w-full lg:w-[360px] min-w-0 relative">
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
                  if (e.key === "Enter") confirmSearch();
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
        </div>

        {/* DatePicker and Radio Section */}
        <div className="col-span-2">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md ">
            {/* Main responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
              {/* LEFT: Branch */}
              <div className="max-w-sm">
                {permissions.includes("view-all-branches") ? (
                  <div className="space-y-2 w-full">
                    <label
                      htmlFor="branchId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ค้นหาสาขา
                    </label>

                    <div className="min-w-0">
                      <Select
                        menuPortalTarget={document.body}
                        styles={{
                          control: (base) => ({ ...base }),
                          menuPortal: (base) => ({ ...base, zIndex: 11 }),
                          option: (base, { data }) => ({
                            ...base,
                            color: data.isBranchDown == "1" ? "#69b8f2" : "",
                          }),
                        }}
                        options={Branches}
                        placeholder="กรุณาเลือกสาขา"
                        isClearable
                        isSearchable
                        classNamePrefix="react-select"
                        value={Branches.find(
                          (option) => option.value === BranchId
                        )}
                        onChange={(selectedOption) =>
                          setBranchId(selectedOption?.value)
                        }
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* RIGHT: SearchType */}
              <div className="min-w-0 md:justify-self-end w-full md:w-auto">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  ค้นหาด้วย วันที่
                </label>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6">
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

              {/* FULL WIDTH: Radio groups */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* สถานะสัญญา */}
                  <div className="min-w-0">
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

                  {/* สถานะค่าเช่า */}
                  {/* <div className="min-w-0">
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
                            className={`w-5 h-5 text-${v.color}-600 border-gray-300 focus:ring-${v.color}-500 cursor-pointer`}
                          />
                          <label
                            htmlFor={`isPaySuccessLists-${v.value}`}
                            className={`ml-2 text-sm font-medium text-${v.color}-600 hover:text-${v.color}-700 transition-colors duration-200 cursor-pointer`}
                          >
                            {v.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div> */}
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
            <TableSale
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

export default SalePage;

export const handleSubMitRow = ({
  setIsLoadingOpen,
  dispatch,
  setModal,
  RowData,
}) => {
  return (e) => {
    setIsLoadingOpen(true);

    if (
      (e.isMobileSale == "1" && e.saleType == "3" && e.useCalType == "2") ||
      (e.isMobileSale == "1" && e.saleType == "4" && e.useCalType == "2")
    ) {
      if (e.priceDownPayment <= 0) {
        setIsLoadingOpen(false);
        return error("ค่าเปิดใช้เครื่องห้ามต่ำกว่า 0 บาท");
      }

      if (e.payPerMonth <= 0) {
        setIsLoadingOpen(false);
        return error("ค่าบริการดูแลห้ามต่ำกว่า 0 บาท");
      }
    }

    if (e.isMobileSale == "0" && e.productSaleLists.length <= 0) {
      setIsLoadingOpen(false);
      return error("อุปกรณ์ต้องมีอย่างน้อย 1 รายการ");
    }

    if (isNaN(e.id)) {
      dispatch(addProductSale(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    } else if (isNumber(e.id)) {
      conFirm(`อัพเดตรูปภาพ/การจ่าย ${RowData.code}`, "ตกลง", "ปิด", true)
        .then((value) => {
          if (value.isConfirmed) {
            dispatch(updateProductSale(e))
              .unwrap()
              .then(() => setIsLoadingOpen(false))
              .catch(() => setIsLoadingOpen(false));
            setModal(false);
          }
        })
        .finally(() => {
          setIsLoadingOpen(false);
        });
    }
  };
};
