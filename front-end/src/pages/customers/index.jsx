import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import TableCustomer from "src/components/tables/tableCustomer";
import ModalCustomer from "src/components/modals/modalCustomer";
import { useDispatch, useSelector } from "react-redux";
import { addCustomer, fetchCustomer, updateCustomer } from "src/store/customer";

export const DefaultValuesCustomer = {
  citizenIdCard: "",
  name: "",
  lastname: "",
  tel: "",
  address: "",
  branchId: "",
  mProvinceId: null,
  mDistrictId: null,
  mSubdistrictId: null,
  zipCode: "",
  facebook: "",
  googleMap: "",
  nameRefOne: "",
  nameRefTwo: "",
  lastnameRefOne: "",
  lastnameRefTwo: "",
  relaRefOne: "",
  relaRefTwo: "",
  telRefOne: "",
  telRefTwo: "",
  active: "1",
  customerType: "1",
};

const radioCustomerTypes = [
  { name: "ทั้งหมด", value: "0", color: "blue" },
  { name: "ลูกค้าผ่อน", value: "1", color: "red" },
  { name: "ลูกค้าหน้าร้าน", value: "3", color: "blue" },
  { name: "ร้านค้า", value: "2", color: "green" },
  { name: "ตัวแทน", value: "4", color: "purple" },
];

const radioActiveLists = [
  { name: "ทั้งหมด", value: "2", color: "blue" },
  { name: "ปิดใช้งาน", value: "0", color: "red" },
  { name: "เปิดใช้งาน", value: "1", color: "green" },
];

const colorClassMap = {
  blue: {
    ring: "focus:ring-blue-500",
    text: "text-blue-600",
    border: "border-blue-500",
  },
  red: {
    ring: "focus:ring-red-500",
    text: "text-red-600",
    border: "border-red-500",
  },
  green: {
    ring: "focus:ring-green-500",
    text: "text-green-600",
    border: "border-green-500",
  },
  purple: {
    ring: "focus:ring-purple-500",
    text: "text-purple-600",
    border: "border-purple-500",
  },
};

const CustomerPage = () => {
  const { user, isLoadingOpen, setIsLoadingOpen } = useAuth();

  const [Modal, setModal] = React.useState(false);
  const [Search, setSearch] = React.useState("");

  const [Active, setActive] = React.useState("1");
  const [CustomerType, setCustomerType] = React.useState("0");
  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);

  const dispatch = useDispatch();
  const store = useSelector((state) => state.customer);

  const [RowData, setRowData] = React.useState(DefaultValuesCustomer);

  const TableHeaders = [
    { name: "ลำดับ", w: 4, align: "text-left" },
    { name: "รหัส", w: 6, align: "text-center" },
    { name: "ชื่อ/นามสกุล", w: 12, align: "text-left" },
    { name: "เบอร์ติดต่อ", w: 10, align: "text-left" },
    { name: "Social", w: 8, align: "text-left" },
    { name: "ผู้ติดต่อคนแรก", w: 8, align: "text-left" },
    { name: "ผู้ติดต่อคนที่สอง", w: 8, align: "text-left" },
    { name: "ที่อยู่ปัจจุบัน", w: 22, align: "text-left" },
    { name: "ที่อยู่ตามบัตรประชาชน", w: 22, align: "text-left" },
  ];

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
    if (!isEmpty(store.allData)) {
      const { data, total } = store.allData;
      setTableLists(data);
      setTotalData(total);

      if (!isEmpty(store.params)) {
        const { page, search, active, customerType } = store.params;
        setCustomerType(customerType);
        setPageIndex(page);
        setActive(active);
        setSearch(search);
      }
    } else {
      setTableLists([]);
    }
  }, [store]);

  const getItems = async (page) => {
    setIsLoadingOpen(true);
    dispatch(
      fetchCustomer({
        customerType: CustomerType,
        search: Search,
        active: Active,
        branchId: user.branchId,
        pageSize: sizePerPage(),
        page: page,
      }),
    )
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const addRow = () => {
    setModal(true);
    setRowData(DefaultValuesCustomer);
  };

  const editRow = (e) => {
    setModal(true);
    setRowData(e);
  };

  const submitRow = handleSubMitRowCustomer({
    setIsLoadingOpen: setIsLoadingOpen,
    user: user,
    dispatch: dispatch,
    setModal: setModal,
  });

  const changePage = async (page) => {
    if (PageIndex !== page) {
      await getItems(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="grid gap-4">
      <ModalCustomer
        open={Modal}
        setModal={setModal}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
        getItems={getItems}
      />

      {/* Header actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        <button
          type="button"
          className="text-white text-sm w-full bg-green-500 hover:bg-green-600 rounded-lg px-4 py-2 order-2 md:order-1"
          onClick={addRow}
        >
          เพิ่มข้อมูลใหม่
        </button>

        {/* Search input */}
        <div className="relative w-full col-span-2 order-1 md:order-2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MdOutlineSearch size={20} />
          </div>
          <input
            id="Search"
            name="Search"
            type="text"
            value={Search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-24 text-sm text-gray-900 bg-gray-100 border border-gray-300 rounded-lg py-2 focus:ring-1 focus:ring-inset focus:ring-indigo-300"
            placeholder="ค้นหา ชื่อ, นามสกุล, เบอร์ติดต่อ"
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmSearch();
            }}
          />
          <button
            type="button"
            disabled={isLoadingOpen}
            onClick={confirmSearch}
            className="absolute inset-y-0 right-0 flex items-center px-4 font-bold text-white bg-blue-500 rounded-r-lg hover:bg-blue-600"
          >
            ค้นหา
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Customer type */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm shrink-0">ประเภท</span>
            <div className="flex flex-wrap gap-3">
              {radioCustomerTypes.map((item, k) => {
                const cc = colorClassMap[item.color];
                return (
                  <label
                    key={k}
                    htmlFor={`customerType-${item.value}`}
                    className={`inline-flex items-center gap-2 cursor-pointer ${cc.text}`}
                  >
                    <input
                      id={`customerType-${item.value}`}
                      name="customerType"
                      type="radio"
                      value={item.value}
                      checked={CustomerType === item.value}
                      onChange={(e) => setCustomerType(e.target.value)}
                      className={`w-4 h-4 ${cc.border} ${cc.ring}`}
                    />
                    <span className="text-sm">{item.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Active */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm shrink-0">สถานะ</span>
            <div className="flex flex-wrap gap-3">
              {radioActiveLists.map((item, k) => {
                const cc = colorClassMap[item.color];
                return (
                  <label
                    key={k}
                    htmlFor={`active-${item.value}`}
                    className={`inline-flex items-center gap-2 cursor-pointer ${cc.text}`}
                  >
                    <input
                      id={`active-${item.value}`}
                      name="active"
                      type="radio"
                      value={item.value}
                      checked={Active === item.value}
                      onChange={(e) => setActive(e.target.value)}
                      className={`w-4 h-4 ${cc.border} ${cc.ring}`}
                    />
                    <span className="text-sm">{item.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Table / Cards */}
      {isEmpty(TableLists) ? (
        <NodataPage />
      ) : (
        <div className="w-full">
          <TableCustomer
            page={PageIndex}
            pageSize={sizePerPage()}
            tableHeaders={TableHeaders}
            tableLists={TableLists}
            onClick={editRow}
          />

          <div className="py-2">
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

export default CustomerPage;

export const handleSubMitRowCustomer = ({
  setIsLoadingOpen,
  user,
  dispatch,
  setModal,
}) => {
  return (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      e = { ...e, createByUserId: user.id, branchId: user.branchId };
      dispatch(addCustomer(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    } else {
      e = { ...e, updateByUserId: user.id, branchId: user.branchId };
      dispatch(updateCustomer(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    }
  };
};
