import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";

import TableBranchTransferPrice from "src/components/tables/tableBranchTransferPrice";
import ModalBranchTransferPrice from "src/components/modals/modalBranchTransferPrice";
import { useDispatch, useSelector } from "react-redux";
import {
  addBranchTransferPrice,
  fetchBranchTransferPrice,
  updateBranchTransferPrice,
} from "src/store/branchTransferPrice";
import Select from "react-select";
import { fetchSelectBranch } from "src/store/branch";

const DefaultValues = {
  price: "",
  name: "",
  note: "",
  bankId: "",
  infoBank: "",
  fromBankId: "",
  fromInfoBank: "",
  status: "1",
  branchId: "",
  fromBranchId: "",
  createByUserId: "",
  filePrice: "",
};

const BranchTransferPricePage = () => {
  const { user, isLoadingOpen, setIsLoadingOpen, permissions } = useAuth();
  const [Modal, setModal] = React.useState(false);
  const [Search, setSearch] = React.useState("");
  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);
  const [Status, setStatus] = React.useState("1");
  const [BranchId, setBranchId] = React.useState(user.branchId);
  const [Branches, setBranches] = React.useState([]);
  const storeBranch = useSelector((state) => state.branch);

  const dispatch = useDispatch();
  const store = useSelector((state) => state.branchTransferPrice);

  const [RowData, setRowData] = React.useState(DefaultValues);

  const radioStatusLists = [
    {
      name: "ทั้งหมด",
      value: "0",
      color: "blue",
    },
    {
      name: "รอดำเนินการ",
      value: "1",
      color: "blue",
    },
    {
      name: "ยืนยัน",
      value: "2",
      color: "green",
    },
    {
      name: "ปฏิเสธ",
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
      w: 10,
      align: "text-left",
    },
    {
      name: "ชื่อ",
      w: 20,
      align: "text-left",
    },
    {
      name: "บัญชีต้นทาง/ปลายทาง",
      w: 25,
      align: "text-left",
    },
    {
      name: "สาขาต้นทาง/ปลายทาง",
      w: 20,
      align: "text-left",
    },
    {
      name: "วันที่",
      w: 20,
      align: "text-left",
    },
    {
      name: "ยอดเงิน",
      w: 10,
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
        const { page, search, status, branchId } = store.params;
        setPageIndex(page);
        setBranchId(branchId);
        setSearch(search);
        setStatus(status);
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
      fetchBranchTransferPrice({
        search: Search,
        status: Status,
        pageSize: sizePerPage(),
        page: page,
        branchId: BranchId,
      })
    )
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  const addRow = () => {
    setModal(true);
    setRowData({ ...DefaultValues, branchId: user.branchId });
  };

  const editRow = (e) => {
    setModal(true);
    setRowData(e);
  };

  const submitRow = (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      dispatch(addBranchTransferPrice(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    } else {
      dispatch(updateBranchTransferPrice(e))
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
      <ModalBranchTransferPrice
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
        <div className="w-full col-span-1 lg:col-span-2 px-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex col-span-2">
              <p>สถานะ </p>
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

            {permissions.includes("view-all-branches") && (
              <div className="flex items-center col-span-3 w-full">
                <label
                  htmlFor="branchId"
                  className="block text-sm font-medium text-gray-700 mr-2 shrink-0"
                >
                  ค้นหาสาขา
                </label>
                <div className="w-full">
                  <Select
                    menuPortalTarget={document.body}
                    styles={{
                      control: (base) => ({
                        ...base,
                        width: "100%", // Ensure the control takes full width
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
                      setBranchId(selectedOption ? selectedOption.value : null)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEmpty(TableLists) ? (
        <NodataPage />
      ) : (
        <div className="w-full">
          <div className="grid gap-2 min-h-96">
            <TableBranchTransferPrice
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

export default BranchTransferPricePage;
