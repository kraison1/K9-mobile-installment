import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import Select from "react-select";
import TableBuy from "src/components/tables/tableBuy";
import ModalBuyIntoStock from "src/components/modals/modalBuyIntoStock";
import { useDispatch, useSelector } from "react-redux";
import { addProductBuy, reportListBuy } from "src/store/productBuy";
import { updateProductBuy } from "src/store/productBuy";
import { fetchProductBuy } from "src/store/productBuy";
import { DefaultValuesBuyRepair } from "../stocks/productRepair";
import { DefaultValuesBuyAccess } from "../stocks/productAccessibility";
import { fetchSelectBranch } from "src/store/branch";
import ModalCustomer from "src/components/modals/modalCustomer";
import { DefaultValuesCustomer, handleSubMitRowCustomer } from "../customers";
import dayjs from "src/helpers/dayjsConfig";
import { th } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { noopener_noreferrer } from "src/helpers/constant";

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
  {
    name: "ยกเลิก",
    value: "2",
    color: "red",
  },
];

const radioTypeLists = [
  {
    name: "อุปกรณ์เสริม",
    value: "อุปกรณ์เสริม",
    color: "green",
  },
  {
    name: "อะไหล่ซ่อม",
    value: "อะไหล่ซ่อม",
    color: "red",
  },
  {
    name: "ทั้งหมด",
    value: "0",
    color: "blue",
  },
];

const ProductBuyPage = () => {
  const { permissions, user, isLoadingOpen, setIsLoadingOpen } = useAuth();
  const [Modal, setModal] = React.useState(false);
  const [CustomerModal, setCustomerModal] = React.useState(false);

  const [Search, setSearch] = React.useState("");
  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);
  const [Status, setStatus] = React.useState("0");
  const [Catalog, setCatalog] = React.useState("0");

  const [Branches, setBranches] = React.useState([]);
  const [BranchId, setBranchId] = React.useState(user.branchId);

  const [startDate, setStartDate] = React.useState(
    dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss")
  );
  const [endDate, setEndDate] = React.useState(
    dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss")
  );

  const dispatch = useDispatch();
  const store = useSelector((state) => state.productBuy);
  const storeBranch = useSelector((state) => state.branch);

  const [RowData, setRowData] = React.useState({});
  const [RowDataCustomer, setRowDataCustomer] = React.useState(
    DefaultValuesCustomer
  );

  const TableHeaders = [
    {
      name: "ลำดับ",
      w: 5,
      align: "text-left",
    },
    {
      name: "รหัส",
      w: 35,
      align: "text-left",
    },
    {
      name: "โดย",
      w: 20,
      align: "text-left",
    },
    {
      name: "ยอดเงิน",
      w: 20,
      align: "text-right",
    },

    {
      name: "วันที่",
      w: 20,
      align: "text-right",
    },
  ].filter((item) => item !== null); // ลบ null ออกจากอาร์เรย์;

  const [TableLists, setTableLists] = React.useState([]);

  const confirmSearch = async () => {
    await getItems(1);
  };

  React.useEffect(() => {
    if (isEmpty(store.params)) {
      getItems(PageIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        const { page, search, status, startDate, endDate, branchId, catalog } =
          store.params;
        setBranchId(branchId);
        setPageIndex(page);
        setSearch(search);
        setStatus(status);
        setCatalog(catalog);

        setStartDate(startDate);
        setEndDate(endDate);
      }
    } else {
      setTableLists([]);
    }
  }, [store]);

  const printProductBuy = () => {
    const { status, startDate, endDate, branchId } = store.params;

    const start = dayjs(startDate).format("YYYY-MM-DD HH:mm:ss");
    const end = dayjs(endDate).format("YYYY-MM-DD HH:mm:ss");

    setIsLoadingOpen(true);
    dispatch(reportListBuy(`${status}/${branchId}/${start}/${end}`))
      .unwrap()
      .then((pdfUrl) => {
        setIsLoadingOpen(false);
        const link = document.createElement("a");
        link.href = pdfUrl;

        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
        );

        if (isSafari) {
          link.download = `BuyLists-${branchId}-${start}-${end}.pdf`;
        } else {
          link.target = "_blank";
          link.rel = noopener_noreferrer;
        }

        link.click();
      })
      .catch((error) => {
        console.error("Failed to load payment list:", error);
        setIsLoadingOpen(false);
      });
  };

  const getItems = async (page) => {
    setIsLoadingOpen(true);
    dispatch(
      fetchProductBuy({
        search: Search,
        status: Status,
        pageSize: sizePerPage(),
        page: page,
        catalog: Catalog,
        branchId: BranchId,
        startDate: startDate,
        endDate: endDate,
      })
    )
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const addRow = (value) => {
    setModal(true);
    setRowData(value);
  };

  const editRow = (e) => {
    setModal(true);
    setRowData(e);
  };

  const submitRow = handleSubmitRow({
    setIsLoadingOpen: setIsLoadingOpen,
    dispatch: dispatch,
    user: user,
    setModal: setModal,
  });

  const changePage = async (page) => {
    if (PageIndex !== page) {
      await getItems(page);
      // Scroll to the top of the page or to a specific element after loading new data
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="grid gap-4 overflow-x-auto">
      <ModalBuyIntoStock
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

      {/* Wrapper หลัก */}
      <div className="grid grid-cols-1 gap-4">
        {/* แถวที่ 1: ปุ่ม (3 ปุ่ม) — md ขึ้นไป = 3 คอลัมน์, มือถือ = ทีละบรรทัด */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            className="w-full text-white text-sm bg-green-500 hover:bg-green-600 rounded-lg px-4 py-3 transition-colors duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/60 focus-visible:ring-offset-2"
            onClick={() => addRow(DefaultValuesBuyAccess)}
          >
            สั่งซื้ออุปกรณ์เสริม
          </button>

          <button
            type="button"
            className="w-full text-white text-sm bg-blue-500 hover:bg-blue-600 rounded-lg px-4 py-3 transition-colors duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2"
            onClick={() => addRow(DefaultValuesBuyRepair)}
          >
            สั่งซื้ออะไหล่ซ่อม
          </button>

          <button
            type="button"
            className="w-full text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-6 py-3 transition-colors duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600/60 focus-visible:ring-offset-2"
            onClick={() => {
              setRowDataCustomer({
                ...DefaultValuesCustomer,
                customerType: "2",
              });
              setCustomerModal(true);
            }}
          >
            เพิ่มข้อมูลใหม่ (ร้านค้า)
          </button>
        </div>

        {/* แถวที่ 2: ช่องค้นหา (อยู่บรรทัดใหม่เสมอ) */}
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 ltr:left-0 rtl:right-0 flex items-center pl-3 rtl:pl-0 rtl:pr-3">
            <MdOutlineSearch size={20} />
          </div>

          <input
            id="Search"
            name="Search"
            type="text"
            value={Search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-24 text-sm text-gray-900 bg-gray-100 border border-gray-300 rounded-lg py-2 focus:ring-1 focus:ring-inset focus:ring-indigo-300"
            placeholder="ค้นหา รหัส"
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmSearch();
            }}
          />

          <button
            type="button"
            disabled={isLoadingOpen}
            onClick={confirmSearch}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-semibold text-white bg-blue-500 rounded-r-lg hover:bg-blue-600 disabled:opacity-60"
          >
            ค้นหา
          </button>
        </div>

        {/* แถวที่ 3: ฟิลเตอร์ (สาขา + ช่วงวันที่ + เรดิโอ) */}
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
                  control: (base) => ({ ...base }),
                  menuPortal: (base) => ({ ...base, zIndex: 50 }),
                }}
                options={Branches}
                placeholder="กรุณาเลือกสาขา"
                isClearable
                isSearchable
                classNamePrefix="react-select"
                value={
                  Branches.find((option) => option.value === BranchId) ?? null
                }
                onChange={(opt) => setBranchId(opt ? opt.value : null)}
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
                minDate={
                  endDate
                    ? dayjs(endDate).subtract(1, "month").toDate()
                    : undefined
                }
                maxDate={endDate ?? undefined}
                dateFormat="dd/MM/yyyy"
                timeZone="Asia/Bangkok"
                wrapperClassName="w-full"
                className="w-full p-2.5 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
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
                minDate={startDate ?? undefined}
                maxDate={dayjs().add(1, "month").toDate()}
                dateFormat="dd/MM/yyyy"
                timeZone="Asia/Bangkok"
                wrapperClassName="w-full"
                className="w-full p-2.5 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
              />
            </div>
          </div>

          {/* Radio Section */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* สถานะ */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="font-medium mr-1">สถานะ</p>
                {radioStatusLists.map((item, k) => (
                  <label
                    key={k}
                    htmlFor={`radioStatus-${item.value}`}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      id={`radioStatus-${item.value}`}
                      name="radioStatus"
                      type="radio"
                      onChange={(e) => setStatus(e.target.value)}
                      checked={item.value === Status}
                      value={item.value}
                      className={`w-4 h-4 border focus:ring-2 focus:ring-offset-1 border-${item.color}-500 focus:ring-${item.color}-500`}
                    />
                    <span className={`ml-2 text-sm text-${item.color}-500`}>
                      {item.name}
                    </span>
                  </label>
                ))}
              </div>

              {/* ประเภท */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="font-medium mr-1">ประเภท</p>
                {radioTypeLists.map((item, k) => (
                  <label
                    key={k}
                    htmlFor={`radioType-${item.value}`}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      id={`radioType-${item.value}`}
                      name="radioType"
                      type="radio"
                      onChange={(e) => setCatalog(e.target.value)}
                      checked={item.value === Catalog}
                      value={item.value}
                      className={`w-4 h-4 border focus:ring-2 focus:ring-offset-1 border-${item.color}-500 focus:ring-${item.color}-500`}
                    />
                    <span className={`ml-2 text-sm text-${item.color}-500`}>
                      {item.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEmpty(TableLists) ? (
        <NodataPage />
      ) : (
        <div className="w-full">
          <div className="text-right mb-2">
            <button
              type="button"
              onClick={() => printProductBuy()}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            >
              Export PDF
            </button>
          </div>

          <div className="grid gap-2 min-h-96">
            <TableBuy
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

export default ProductBuyPage;

export function handleSubmitRow({
  setIsLoadingOpen,
  dispatch,
  user,
  setModal,
}) {
  return (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      dispatch(
        addProductBuy({
          ...e,
          branchId: user.branchId,
          createByUserId: user.id,
        })
      )
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    } else {
      delete e.productImages;
      e = { ...e, updateByUserId: user.id };

      dispatch(updateProductBuy(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    }
  };
}
