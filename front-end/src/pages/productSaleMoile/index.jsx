/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { isEmpty, isNumber } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import TableSale from "src/components/tables/tableProductSaleMobile";
import ModalSale from "src/components/modals/modalProductSaleMobile";
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

export const DefaultValuesCash = {
  isClaim: "0",
  randomCode: "1",
  code: "",
  note: "",
  catalog: "มือถือ",
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
  useCalType: "2",
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
  priceDownType: "2",
  priceDownPayment: 0,
  priceDownPaymentPercent: 0,
  priceDiscount: 0,
  priceTotalPaid: 0,
  priceEquipCash: 0,
  priceEquipTransferCash: 0,
  saleType: "1",
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
  isCash: "1",
};

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
    dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
  );
  const [endDate, setEndDate] = React.useState(
    dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss"),
  );

  const [SearchType, setSearchType] = React.useState("1");
  const [IsCancel, setIsCancel] = React.useState("0");
  const [SaleType, setSaleType] = React.useState(["1", "2"]);
  const [IsPaySuccess, setIsPaySuccess] = React.useState("1");
  const [SearchBy, setSearchBy] = React.useState("0");

  const dispatch = useDispatch();
  const store = useSelector((state) => state.productSale);
  const storeBranch = useSelector((state) => state.branch);

  const [RowData, setRowData] = React.useState(DefaultValuesCash);

  const [RowDataCustomer, setRowDataCustomer] = React.useState(
    DefaultValuesCustomer,
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
    ...(import.meta.env.VITE_SYSTEM_NAME === "THUNDER"
      ? [
          {
            name: "วันที่",
            align: "text-center",
          },
          // {
          //   name: "เวลา",
          //   w: 5,
          //   align: "text-center",
          // },
        ]
      : []),
    {
      name: "เลขที่สัญญา",
      align: "text-center",
    },
    // ...(import.meta.env.VITE_SYSTEM_NAME === "THUNDER"
    //   ? [
    //       {
    //         name: "สาขา",
    //         w: 5,
    //         align: "text-center",
    //       },
    //     ]
    //   : []),
    ...(import.meta.env.VITE_SYSTEM_NAME === "THUNDER"
      ? [
          {
            name: "จากร้านค้า",
            align: "text-center",
          },
        ]
      : []),
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
    import.meta.env.VITE_SYSTEM_NAME === "THUNDER"
      ? {
          name: "อีมี่เครื่อง/ซีเรียล",
          align: "text-center",
        }
      : null,
    {
      name: "ทุน",
      align: "text-center",
    },
    {
      name: "ค่าคอมตัวแทน",
      align: "text-center",
    },
    {
      name: "ทุนสุทธิ",
      align: "text-center",
    },

    {
      name: "ราคาขาย",
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
    if (isEmpty(store.paramsMobileCash)) {
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
    if (!isEmpty(store.allDataMobileCash)) {
      const { data, total } = store.allDataMobileCash;
      setTableLists(data);
      setTotalData(total);
      if (!isEmpty(store.paramsMobileCash)) {
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
        } = store.paramsMobileCash;

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
      fetchProductSale({
        search: Search,
        status: Status,
        branchId: BranchId,
        isCancel: IsCancel,
        isMobileSale: "1",
        isCash: "1",
        searchType: SearchType,
        pageSize: sizePerPage(),
        saleType: SaleType,
        isPaySuccess: IsPaySuccess,
        searchBy: SearchBy,
        startDate: startDate,
        endDate: endDate,
        page: page,
      }),
    )
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const addRow = () => {
    setModal(true);
    setRowData({ ...DefaultValuesCash, isCash: "1", isMobileSale: "1" });
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
        <div className="col-span-2 lg:col-span-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              className="w-full px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-sm"
              onClick={() => addRow("1")}
            >
              เพิ่มข้อมูลการขายสด
            </button>

            {/* <button
              type="button"
              className="w-full px-6 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors duration-200 shadow-sm"
              onClick={() => {
                setRowDataCustomer({
                  ...DefaultValuesCustomer,
                  customerType: "3",
                });
                setCustomerModal(true);
              }}
            >
              เพิ่มข้อมูลใหม่ (ลูกค้า)
            </button> */}
          </div>
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
              {SearchType == "1" ? (
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

            {/* Radio Buttons */}
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
              isCash={true}
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
