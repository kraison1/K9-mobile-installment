import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import TableTransferProduct from "src/components/tables/tableTransferProduct";
import ModalTransferProduct from "src/components/modals/modalTransferProduct";
import { useDispatch, useSelector } from "react-redux";
import {
  addTransferProduct,
  fetchTransferProduct,
  updateTransferProduct,
} from "src/store/transferProduct";

export const DefaultTransferValues = {
  catalog: "มือถือ",
  tackingNumber: "",
  transportId: 0,
  toBranchId: "",
  createByUserId: "",
  status: "0",
  priceSumAll: 0,
};

const TransferProductPage = () => {
  const { user, isLoadingOpen, setIsLoadingOpen } = useAuth();

  const [Modal, setModal] = React.useState(false);
  const [Search, setSearch] = React.useState("");
  const [Status, setStatus] = React.useState("0");
  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);

  const dispatch = useDispatch();
  const store = useSelector((state) => state.transferProduct);

  const [RowData, setRowData] = React.useState(DefaultTransferValues);

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
      name: "ปฏิเสธ",
      value: "2",
      color: "red",
    },
    {
      name: "ยกเลิก",
      value: "3",
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
      name: "รหัส",
      w: 35,
      align: "text-left",
    },
    {
      name: "เลขติดตามสินค้า",
      w: 20,
      align: "text-left",
    },
    {
      name: "จากสาขา",
      w: 15,
      align: "text-left",
    },
    {
      name: "ไปยังสาขา",
      w: 15,
      align: "text-left",
    },

    {
      name: "โดย",
      w: 10,
      align: "text-left",
    },

    {
      name: "เมื่อ",
      w: 10,
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
    // localStorage.clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  React.useEffect(() => {
    if (!isEmpty(store.allData)) {
      const { data, total } = store.allData;
      setTableLists(data);
      setTotalData(total);

      if (!isEmpty(store.params)) {
        const { page, search, status } = store.params;
        setPageIndex(page);
        setStatus(status);
        setSearch(search);
      }
    } else {
      setTableLists([]);
    }
  }, [store]);

  const getItems = async (page) => {
    setIsLoadingOpen(true);
    dispatch(
      fetchTransferProduct({
        catalog: "มือถือ",
        search: Search,
        status: Status,
        branchId: user.branchId,
        toBranchId: user.branchId,
        pageSize: sizePerPage(),
        page: page,
      })
    )
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const addRow = () => {
    setModal(true);
    setRowData({
      ...DefaultTransferValues,
      branchId: user.branchId,
    });
  };

  const editRow = (e) => {
    setModal(true);
    setRowData(e);
  };

  const submitRow = (e) => {
    setIsLoadingOpen(true);

    if (isNaN(e.id)) {
      e = { ...e, createByUserId: user.id };
      dispatch(addTransferProduct(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    } else {
      e = { ...e, updateByUserId: user.id };
      dispatch(updateTransferProduct(e))
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
      <ModalTransferProduct
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
        <div className="w-full col-span-1 lg:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {isEmpty(TableLists) ? (
        <NodataPage />
      ) : (
        <div className="w-full">
          <div className="grid gap-2 min-h-96">
            <TableTransferProduct
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

export default TransferProductPage;
