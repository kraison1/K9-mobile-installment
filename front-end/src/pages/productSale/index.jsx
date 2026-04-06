/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import TableSale from "src/components/tables/tableProductSale";
import ModalSale from "src/components/modals/modalProductSale";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductSale } from "src/store/productSale";
import dayjs from "src/helpers/dayjsConfig";
import { th } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchSelectBranch } from "src/store/branch";
import Select from "react-select";
import { handleSubMitRow } from "../downs";

const DefaultValues = {
  randomCode: "1",
  code: "",
  note: "",
  productBookId: null,
  customerId: "",
  productId: "",
  isMobileSale: "0",
  useCalType: "1",
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
  tackingNumber: "",
  priceType: "1",
  createByUserId: "",
  fileProductSale: [],
  productPayMentLists: [],
  productSaleLists: [],
};

const ProductSalePage = () => {
  const { user, isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();

  const [Modal, setModal] = React.useState(false);
  const [Search, setSearch] = React.useState("");
  const [Status, setStatus] = React.useState("1");
  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);
  const [Branches, setBranches] = React.useState([]);
  const [BranchId, setBranchId] = React.useState(user.branchId);

  const [startDate, setStartDate] = React.useState(
    dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss")
  );
  const [endDate, setEndDate] = React.useState(
    dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss")
  );

  const [SearchType, setSearchType] = React.useState("1");
  const [SaleType, setSaleType] = React.useState(["1", "2"]);

  const dispatch = useDispatch();
  const store = useSelector((state) => state.productSale);
  const storeBranch = useSelector((state) => state.branch);

  const [RowData, setRowData] = React.useState(DefaultValues);


  const TableHeaders = [
    {
      name: "ลำดับ",
      w: 5,
      align: "text-left",
    },
    {
      name: "เลขสัญญา",
      w: 30,
      align: "text-left",
    },
    {
      name: "รายการแถม",
      w: 20,
      align: "text-left",
    },
    {
      name: "ต้นทุนของแถม",
      w: 10,
      align: "text-right",
    },
    {
      name: "ยอดรวม",
      w: 10,
      align: "text-right",
    },
    {
      name: "โดย",
      w: 10,
      align: "text-left",
    },

    {
      name: "เมื่อ",
      w: 15,
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
          saleType,
          branchId,
        } = store.params;

        setBranchId(branchId);
        setPageIndex(page);
        setStatus(status);
        setSearch(search);
        setSearchType(searchType);
        setSaleType(saleType);
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
        isMobileSale: "0",
        searchType: SearchType,
        pageSize: sizePerPage(),
        saleType: SaleType,
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
    setRowData(DefaultValues);
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
              isMobileSale={false}
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

export default ProductSalePage;
