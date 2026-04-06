import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import dayjs from "src/helpers/dayjsConfig";
import TableRatePurchase from "src/components/tables/tableRatePurchase";
import ModalRatePurchase from "src/components/modals/modalRatePurchase";
import { useDispatch, useSelector } from "react-redux";
import {
  addRatePurchase,
  fetchRatePurchase,
  updateRatePurchase,
  getPdfRatePurchase,
} from "src/store/ratePurchase";
import { noopener_noreferrer } from "src/helpers/constant";
import { formatDateTHWithOutTime } from "src/helpers/formatDate";

const DefaultValues = {
  productModelId: "",
  productStorageId: "",
  priceDownPayment: 0,
  payPerMonth: 0,
  priceCommission: 0,
  priceHandOne: 0,
  priceStartHandTwo: 0,
  priceEndHandTwo: 0,
  active: "1",
};

const SettingRatePurchasePage = () => {
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const [Modal, setModal] = React.useState(false);
  const [Search, setSearch] = React.useState("");
  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);
  const [Active, setActive] = React.useState("1");

  const dispatch = useDispatch();
  const store = useSelector((state) => state.ratePurchase);

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
      name: "รุ่น",
      w: 35,
      align: "text-left",
    },
    {
      name: "ความจุ",
      w: 10,
      align: "text-left",
    },
    {
      name: "ราคามือหนึ่ง",
      w: 20,
      align: "text-right",
    },
    {
      name: "ราคาเริ่มต้นมือสอง",
      w: 20,
      align: "text-right",
    },
    {
      name: "ราคาสูงสุดมือสอง",
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
    if (!isEmpty(store.allData)) {
      const { data, total } = store.allData;
      setTableLists(data);
      setTotalData(total);

      if (!isEmpty(store.params)) {
        const { page, search, active } = store.params;
        setPageIndex(page);
        setSearch(search);
        setActive(active);
      }
    } else {
      setTableLists([]);
    }
  }, [store]);

  const getItems = async (page) => {
    setIsLoadingOpen(true);
    dispatch(
      fetchRatePurchase({
        search: Search,
        active: Active,
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
    setRowData(DefaultValues);
  };

  const editRow = (e) => {
    setModal(true);
    setRowData(e);
  };

  const submitRow = (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      dispatch(addRatePurchase(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    } else {
      dispatch(updateRatePurchase(e))
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

  const printRatePurchase = async () => {
    setIsLoadingOpen(true);
    dispatch(getPdfRatePurchase())
      .unwrap()
      .then((pdfUrl) => {
        setIsLoadingOpen(false);
        const link = document.createElement("a");
        link.href = pdfUrl;

        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
        );

        if (isSafari) {
          link.download = `RatePurchase-${formatDateTHWithOutTime(dayjs())}.pdf`;
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

  return (
    <div className="grid gap-4 overflow-x-auto">
      <ModalRatePurchase
        open={Modal}
        setModal={setModal}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="w-full gap-2">
          <button
            type="button"
            className="text-white text-sm w-full lg:w-6/12 bg-green-500 hover:bg-green-600 rounded-lg px-4 py-2"
            onClick={() => addRow()}
          >
            เพิ่มข้อมูลใหม่
          </button>

          <button
            type="button"
            onClick={() => printRatePurchase()}
            className="bg-blue-500 text-white rounded-md text-lg p-1 m-2"
          >
            Export PDF
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
            placeholder="ค้นหา รหัส, ชื่อ"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex">
              <p>สถานะ </p>
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

      {isEmpty(TableLists) ? (
        <NodataPage />
      ) : (
        <div className="w-full">
          <div className="grid gap-2 min-h-96">
            <TableRatePurchase
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

export default SettingRatePurchasePage;
