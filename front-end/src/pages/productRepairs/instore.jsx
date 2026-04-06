/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import TableModalProductRepairs from "src/components/tables/tableProductRepairs";
import ModalProductRepairs from "src/components/modals/modalProductRepairs";
import { useDispatch, useSelector } from "react-redux";
import {
  addProductRepairs,
  fetchProductRepairs,
  updateProductRepairs,
} from "src/store/productRepair";

import dayjs from "src/helpers/dayjsConfig";
import { th } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchSelectBranch } from "src/store/branch";
import Select from "react-select";

const DefaultValues = {
  randomCode: "1",
  pricePredict: "",
  priceCost: 0,
  priceWage: 0,
  priceRepair: "",
  priceTransferCash: "",
  priceCash: "",
  priceDiscount: 0,
  productId: null,
  productModelId: null,
  productBrandId: null,
  productTypeId: null,
  imei: "",
  note: "",
  shopName: "",
  typeRepair: "1",
  payType: "1",
  bankId: null,

  active: "1",
  productRepairLists: [],
  productRepairImages: [],
};

const ProductRepairsPage = () => {
  const { user, isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();

  const [Modal, setModal] = React.useState(false);
  const [Search, setSearch] = React.useState("");
  const [Active, setActive] = React.useState("1");
  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);

  const [Branches, setBranches] = React.useState([]);
  const [BranchId, setBranchId] = React.useState(user.branchId);

  const [startDate, setStartDate] = React.useState(
    dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
  );
  const [endDate, setEndDate] = React.useState(
    dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss"),
  );

  const storeBranch = useSelector((state) => state.branch);

  const dispatch = useDispatch();
  const store = useSelector((state) => state.productRepair);

  const [RowData, setRowData] = React.useState(DefaultValues);

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

  const radioActiveLists = [
    {
      name: "ทั้งหมด",
      value: "0",
      color: "blue",
    },
    {
      name: "ยืนยัน",
      value: "1",
      color: "green",
    },
    {
      name: "ยกเลิก",
      value: "2",
      color: "red",
    },
  ];

  const TableHeaders = [
    {
      name: "ลำดับ",
      w: 5,
      align: "text-left",
    },
    {
      name: "วันที่",
      w: 5,
      align: "text-center",
    },
    {
      name: "เวลา",
      w: 5,
      align: "text-center",
    },
    {
      name: "รหัส",
      w: 6,
      align: "text-left",
    },
    {
      name: "รุ่น",
      w: 6,
      align: "text-left",
    },
    {
      name: "imei",
      w: 6,
      align: "text-left",
    },
    {
      name: "รายการซ่อม",
      w: 10,
      align: "text-left",
    },
    {
      name: "ประเมินราคา",
      w: 5,
      align: "text-right",
    },
    {
      name: "ค่าซ่อม",
      w: 5,
      align: "text-right",
    },
    {
      name: "ต้นทุน",
      w: 5,
      align: "text-right",
    },

    {
      name: "กำไร",
      w: 5,
      align: "text-right",
    },
    {
      name: "ค่าแรงช่าง",
      w: 5,
      align: "text-right",
    },
    {
      name: "กำไรสุทธิ",
      w: 5,
      align: "text-right",
    },
    {
      name: "ประเภทซ่อม",
      w: 5,
      align: "text-right",
    },
    {
      name: "จากร้าน",
      w: 11,
      align: "text-right",
    },
    {
      name: "โดย",
      w: 11,
      align: "text-left",
    },
  ];

  const [TableLists, setTableLists] = React.useState([]);

  const confirmSearch = async () => {
    await getItems(1);
  };

  React.useEffect(() => {
    if (isEmpty(store.paramsInstore)) {
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
    if (!isEmpty(store.allDataInstore)) {
      const { data, total } = store.allDataInstore;

      setTableLists(data);
      setTotalData(total);

      if (!isEmpty(store.paramsInstore)) {
        const { page, search, active, startDate, endDate, branchId } =
          store.paramsInstore;
        setBranchId(branchId);
        setPageIndex(page);
        setActive(active);
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
      fetchProductRepairs({
        search: Search,
        active: Active,
        pageSize: sizePerPage(),
        branchId: BranchId,
        startDate: startDate,
        endDate: endDate,
        typeRepair: "1",
        page: page,
      }),
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

  const submitRow = (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      dispatch(addProductRepairs(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    } else {
      dispatch(updateProductRepairs(e))
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
      <ModalProductRepairs
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
                  endDate={endDate}
                  locale={th}
                  maxDate={dayjs(endDate).toDate()}
                  dateFormat="dd/MM/yyyy"
                  timeZone="Asia/Bangkok"
                  wrapperClassName="w-full"
                  className="w-full p-2.5 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
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
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  locale={th}
                  minDate={startDate}
                  maxDate={dayjs().add(1, "month").toDate()}
                  dateFormat="dd/MM/yyyy"
                  timeZone="Asia/Bangkok"
                  wrapperClassName="w-full"
                  className="w-full p-2.5 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
                />
              </div>
            </div>

            {/* Radio Buttons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex items-center col-span-full lg:col-span-1">
                <label htmlFor="active">สถานะ </label>
                <div id="active" name="active" className="flex">
                  {radioActiveLists.map((radioActiveList, k) => (
                    <div className="flex items-center me-4 ml-2" key={k}>
                      <input
                        name={`radioActiveList-${radioActiveList.value}`}
                        id={`radioActiveList-${radioActiveList.value}`}
                        type="radio"
                        onChange={(e) => {
                          setActive(e.target.value);
                        }}
                        checked={radioActiveList.value === Active}
                        value={radioActiveList.value}
                        className={`w-4 h-4 border border-${radioActiveList.color}-500 focus:ring-${radioActiveList.color}-500`}
                      />
                      <label
                        htmlFor={`radioActiveList-${radioActiveList.value}`}
                        className={`ms-2 text-sm text-${radioActiveList.color}-500`}
                      >
                        {radioActiveList.name}
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
            <TableModalProductRepairs
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

export default ProductRepairsPage;
