import React from "react";
import { isEmpty } from "lodash";
import { MdOutlineSearch } from "react-icons/md";
import PageNavigation from "src/components/pagination";
import NodataPage from "src/pages/notfound/noData";
import { useAuth } from "src/hooks/authContext";
import { sizePerPage } from "src/helpers/sizePerPage";
import { fetchSelectBranch } from "src/store/branch";
import TableStockProduct from "src/components/tables/tableStockProduct";
import ModalStockProduct from "src/components/modals/modalStockProduct";
import ModalStockProductMultiple from "src/components/modals/modalStockProductMultiple";
import { useDispatch, useSelector } from "react-redux";
import {
  addProduct,
  addProductMultiple,
  fetchBrandsSelectBy,
  fetchProduct,
  printStockAction,
  updateProduct,
} from "src/store/product";
import Select from "react-select";
import { generateMultipleBarcodesPDF } from "src/components/multipleBarcodeGenerator";
import { noopener_noreferrer } from "src/helpers/constant";
import { warning } from "src/components/alart";
import { fetchSelectProductBrandsBy } from "src/store/productBrand";

export const DefaultValuesProduct = {
  imei: "",
  catalog: "มือถือ",
  payPerMonth: 0,
  valueMonth: "6",
  batteryHealth: 100,
  shopInsurance: "0",
  shopCenterInsurance: "ไม่มี",
  hand: "มือหนึ่ง",
  simType: "ใช่",
  randomCode: "1",
  simName: "",
  boxType: "มี",
  freeGift: "สายชาร์จ",
  machineCondition: 100,
  priceCostBuy: "",
  priceWholeSale: "",
  priceSale: "",
  priceDownPaymentPercent: 40,
  priceDownPayment: 0,
  priceRepair: 0,
  priceReRider: 0,
  priceRegAppleId: 0,
  priceETC: 0,
  // priceCommission: 300,
  // priceCommissionFinance: 10,
  priceCommission: 0,
  priceCommissionFinance: 0,
  productTypeId: "",
  productColorId: "",
  productStorageId: "",
  productBrandId: "",
  productModelId: "",
  amount: 1,
  branchId: "",
  refOldStockNumber: "",
  createByUserId: "",
  active: "1",
};

export const radioActiveProductLists = [
  { name: "ทั้งหมด", value: "2", color: "blue" },
  { name: "ปิดใช้งาน", value: "0", color: "red" },
  { name: "พร้อมขาย", value: "1", color: "green" },
  { name: "จอง", value: "6", color: "yellow" },
  { name: "มีในสัญญา", value: "3", color: "black" },
  { name: "มีในออม", value: "7", color: "black" },
  { name: "ซ่อม", value: "8", color: "red" },
  { name: "ใช้ภายใน", value: "9", color: "black" },
  { name: "เครื่องคืน", value: "10", color: "black" },
  { name: "เครื่องยึด", value: "11", color: "black" },
  { name: "ขายสด", value: "4", color: "black" },
];

const ProductPage = () => {
  const { user, permissions } = useAuth();
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const [Modal, setModal] = React.useState(false);
  const [ModalMultiple, setModalMultiple] = React.useState(false);
  const [Branches, setBranches] = React.useState([]);
  const [BranchId, setBranchId] = React.useState(user.branchId);
  const [ProductBrandId, setProductBrandId] = React.useState([]);
  const [Search, setSearch] = React.useState("");
  const [IsAddMultiple, setIsAddMultiple] = React.useState(false);
  const [PageIndex, setPageIndex] = React.useState(1);
  const [TotalData, setTotalData] = React.useState(0);
  const [Active, setActive] = React.useState("1");
  const [SelectedItems, setSelectedItems] = React.useState([]);
  const [ProductBrand, setProductBrand] = React.useState([]);
  const [ProductModel, setProductModel] = React.useState([]);
  const [ProductModelId, setProductModelId] = React.useState([]);
  const [IsBranchDown, setIsBranchDown] = React.useState("0");

  const dispatch = useDispatch();
  const store = useSelector((state) => state.product);
  const storeBranch = useSelector((state) => state.branch);
  const storeProductBrand = useSelector((state) => state.productBrand);

  const [RowData, setRowData] = React.useState(DefaultValuesProduct);
  const TableHeaders = [
    { name: "ลำดับ", align: "text-left" },
    { name: "รหัส", align: "text-center" },
    { name: "แบรนด์", align: "text-center" },
    { name: "รุ่น", align: "text-center" },
    { name: "รูปสินค้า", align: "text-center" },
    { name: "ความจุ", align: "text-center" },
    { name: "สี", align: "text-center" },
    { name: "สุขภาพแบต", align: "text-center" },
    { name: "กล่อง", align: "text-center" },
    { name: "ประเภท/ประกัน", align: "text-center" },
    { name: "อีมี่", align: "text-center" },
    { name: "สภาพเครื่อง", align: "text-center" },
    { name: "สถานะเครื่อง", align: "text-left" },
    IsBranchDown === "0" ? { name: "โอนจากสาขา", align: "text-left" } : null,
    IsBranchDown === "0"
      ? { name: "ซื้อจากร้านค้า/ลูกค้า", align: "text-left" }
      : { name: "จากร้านค้า", align: "text-left" },

    { name: "เครื่องคืน/ยึดจาก", align: "text-left" },
    { name: "วันที่/เวลา", align: "text-left" },
    { name: "ต้นทุน", align: "text-left" },
    {
      name: "ต้นทุนซ่อม",
      align: "text-left",
    },
    { name: "ทุนสุทธิ", align: "text-left" },
    { name: "ราคาส่ง/ราคาปลีก", align: "text-right" },
    { name: "ผู้ลงบันทึก", align: "text-left" },
  ].filter((item) => item !== null);

  const [TableLists, setTableLists] = React.useState([]);

  const confirmSearch = async () => {
    await getItems(1);
  };

  React.useEffect(() => {
    if (!isEmpty(ProductBrandId)) {
      dispatch(
        fetchBrandsSelectBy({
          catalog: ["มือถือ"],
          productBrandId: ProductBrandId,
          branchId: BranchId,
        })
      );
    } else {
      setProductModel([]);
      setProductModelId([]);
    }
  }, [ProductBrandId]);

  // Handle individual item selection
  const handleSelectItem = (item) => {
    const isSelected = SelectedItems.some(
      (selected) => selected.id === item.id
    );
    if (isSelected) {
      setSelectedItems(
        SelectedItems.filter((selected) => selected.id !== item.id)
      );
    } else {
      setSelectedItems([...SelectedItems, item]);
    }
  };

  React.useEffect(() => {
    if (!isEmpty(storeProductBrand.selectMobile)) {
      const formattedBranches = [
        ...storeProductBrand.selectMobile.map((item) => ({
          value: item.id,
          label: item.brandname,
          fileProductBrand: item.fileproductbrand || null,
        })),
      ];
      setProductBrand(formattedBranches);
    } else {
      setProductBrand([]);
    }
  }, [storeProductBrand.selectMobile]);

  React.useEffect(() => {
    if (!isEmpty(store.modelMobile)) {
      setProductModel(store.modelMobile);
    } else {
      setProductModel([]);
    }
  }, [store.modelMobile]);

  // Handle select all
  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      // Select all items on current page that aren't already selected
      const newSelections = TableLists.filter(
        (item) => !SelectedItems.some((selected) => selected.id === item.id)
      );
      setSelectedItems([...SelectedItems, ...newSelections]);
    } else {
      // Deselect all items on current page
      setSelectedItems(
        SelectedItems.filter(
          (item) => !TableLists.some((tableItem) => tableItem.id === item.id)
        )
      );
    }
  };

  const printStock = () => {
    if (BranchId == 0) {
      warning("ไม่สามารถดาวน์โหลดทุกสาขา");
    } else {
      setIsLoadingOpen(true);
      dispatch(printStockAction(`${BranchId}/${"มือถือ"}`))
        .unwrap()
        .then((pdfUrl) => {
          setIsLoadingOpen(false);
          const link = document.createElement("a");
          link.href = pdfUrl;

          const isSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent
          );

          if (isSafari) {
            link.download = `stocks-lists-${BranchId}-${"มือถือ"}.pdf`;
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
    }
  };

  React.useEffect(() => {
    if (isEmpty(store.params)) {
      getItems(PageIndex);
    }

    if (isEmpty(storeProductBrand.selectMobile)) {
      dispatch(
        fetchSelectProductBrandsBy({
          catalog: ["มือถือ"],
        })
      );
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
          active,
          branchId,
          productBrandId,
          productModelId,
        } = store.params;

        setBranchId(branchId);
        setProductBrandId(productBrandId || []);
        setProductModelId(productModelId || []);
        setPageIndex(page);
        setSearch(search);
        setActive(active);
      }
    } else {
      setTableLists([]);
    }
  }, [store.allData, store.params]);

  function reorderModelsByRow(ProductModel) {
    // 1. แยกกลุ่มตามเลขรุ่น เช่น 11, 12, 13, ...
    const groups = {};

    ProductModel.forEach((o) => {
      const match = o.name.match(/(\d+)/); // ดึงเลขจากชื่อ
      if (!match) return;
      const gen = parseInt(match[1], 10);

      if (!groups[gen]) groups[gen] = [];
      groups[gen].push(o);
    });

    // 2. เรียงภายในรุ่น (MINI, PM, PRO จะเรียงตามตัวอักษร)
    Object.values(groups).forEach((arr) => {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    });

    // 3. เรียงตามรุ่น 11 → 12 → 13 → ...
    const gens = Object.keys(groups)
      .map((g) => parseInt(g))
      .sort((a, b) => a - b);

    // 4. สร้างตารางแบบ rows ลงมา
    const maxLen = Math.max(...gens.map((g) => groups[g].length));
    const reordered = [];

    for (let row = 0; row < maxLen; row++) {
      gens.forEach((gen) => {
        const item = groups[gen][row];
        if (item) reordered.push(item);
      });
    }

    return reordered;
  }

  const getItems = async (page) => {
    setIsLoadingOpen(true);
    dispatch(
      fetchProduct({
        productBrandId: ProductBrandId,
        productModelId: ProductModelId,
        branchId: BranchId,
        search: Search,
        active: Active,
        catalog: "มือถือ",
        pageSize: sizePerPage(),
        page: page,
      })
    )
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

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

  const editRow = (e) => {
    setIsAddMultiple(false);
    setModal(true);
    setRowData(e);
  };

  const submitRow = (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      if (IsAddMultiple) {
        dispatch(addProductMultiple(e))
          .unwrap()
          .then(() => setIsLoadingOpen(false))
          .catch(() => setIsLoadingOpen(false));
        setModalMultiple(false);
      } else {
        dispatch(addProduct(e))
          .unwrap()
          .then(() => setIsLoadingOpen(false))
          .catch(() => setIsLoadingOpen(false));
        setModal(false);
      }
    } else {
      delete e.productImages;
      e = { ...e, updateByUserId: user.id };
      dispatch(updateProduct(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setModal(false);
    }
  };

  const changePage = async (page) => {
    if (PageIndex !== page) {
      await getItems(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const orderedProductModels = reorderModelsByRow(ProductModel);

  React.useEffect(() => {
    let isDown = "0";
    if (BranchId && Branches.length > 0) {
      const branch = Branches.find((option) => option.value === BranchId);
      if (branch) {
        isDown = branch.isBranchDown || "0";
      }
    }
    setIsBranchDown(isDown);

    if (isDown === "0" && ["3", "10", "11"].includes(Active)) {
      setActive("1");
    }
  }, [BranchId, Branches, Active]);

  return (
    <div className="grid gap-4 overflow-x-auto">
      <ModalStockProduct
        open={Modal}
        setModal={setModal}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
        getItems={getItems}
      />

      <ModalStockProductMultiple
        open={ModalMultiple}
        setModal={setModalMultiple}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {user.type != "ไฟแนนซ์" ? (
          <div className="col-span-2 lg:col-span-1">
            <button
              type="button"
              className="text-white text-sm w-full bg-indigo-500 hover:bg-indigo-600 rounded-lg px-4 py-2"
              onClick={() => generateMultipleBarcodesPDF(SelectedItems)} // Use lowercase 's' to match state
            >
              Export Barcodes ({SelectedItems.length})
            </button>
          </div>
        ) : null}

        <div className="col-span-2 lg:col-span-1">
          <button
            type="button"
            className="text-white text-sm w-full bg-yellow-500 hover:bg-yellow-600 rounded-lg px-4 py-2"
            onClick={() => printStock()} // Use lowercase 's' to match state
          >
            Export Stocks
          </button>
        </div>

        <div className="relative w-full text-center col-span-1 lg:col-span-2">
          <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center pl-3 pointer-events-none">
            <MdOutlineSearch size={20} />
          </div>
          <input
            id="Search"
            name="Search"
            type="text"
            value={Search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-28 text-sm text-gray-900 bg-gray-100 border border-gray-300 rounded-lg py-2 focus:ring-1 focus:ring-inset focus:ring-indigo-300"
            placeholder="ค้นหา รหัส, หมายเลขเครื่อง/หมายเลข IMEI"
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
            className="absolute inset-y-0 right-0 flex items-center px-8 font-bold text-white bg-blue-500 rounded-r-lg hover:bg-blue-600"
          >
            ค้นหา
          </button>
        </div>

        <div className="w-full col-span-2 lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col lg:flex-row gap-2 items-start md:col-span-3">
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                {permissions.includes("view-all-branches") ? (
                  <div className="space-y-2 w-full lg:w-[15rem] flex-shrink-0">
                    <p>ค้นหาสาขา</p>
                    <Select
                      menuPortalTarget={document.body}
                      styles={{
                        control: (base) => ({ ...base }),
                        menuPortal: (base) => ({ ...base, zIndex: 11 }),
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
                        setBranchId(selectedOption ? selectedOption.value : 0)
                      }
                    />
                  </div>
                ) : null}

                <div className="space-y-2 min-w-0 flex-1">
                  <p>แบรนด์</p>
                  <div className="flex flex-row flex-wrap gap-x-1 gap-y-1 sm:gap-x-2 sm:gap-y-2">
                    {ProductBrand.map((option) => (
                      <div
                        key={option.value}
                        className="flex flex-col items-center basis-[80px]"
                      >
                        <label
                          htmlFor={`brand-${option.value}`}
                          className="flex flex-col items-center cursor-pointer"
                        >
                          {option.fileProductBrand != null ? (
                            <img
                              src={`${import.meta.env.VITE_APP_API_URL}/${
                                option.fileProductBrand
                              }`}
                              alt={option.label}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded" />
                          )}
                          <span className="truncate text-[10px] sm:text-xs leading-tight text-center mt-[2px]">
                            {option.label}
                          </span>
                        </label>
                        <input
                          type="checkbox"
                          id={`brand-${option.value}`}
                          value={option.value}
                          checked={ProductBrandId.includes(option.value)}
                          onChange={(e) => {
                            const brandId = parseInt(e.target.value);
                            setProductBrandId((prev) =>
                              prev.includes(brandId)
                                ? prev.filter((id) => id !== brandId)
                                : [...prev, brandId]
                            );
                          }}
                          className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-[2px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 min-w-0 flex-1">
                  <p>รุ่น</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-2">
                    {orderedProductModels.map((option) => (
                      <div key={option.id} className="flex items-center">
                        <input
                          id={`model-${option.id}`}
                          type="checkbox"
                          value={option.id}
                          checked={ProductModelId.includes(option.id)}
                          onChange={(e) => {
                            const modelId = parseInt(e.target.value);
                            setProductModelId((prev) =>
                              prev.includes(modelId)
                                ? prev.filter((id) => id !== modelId)
                                : [...prev, modelId]
                            );
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <label
                          htmlFor={`model-${option.id}`}
                          className="ml-2 block text-sm text-gray-900 truncate cursor-pointer"
                        >
                          {option.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* <div className="space-y-2 min-w-0 flex-1">
                  <p>รุ่น</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2">
                    {ProductModel.map((option) => (
                      <div key={option.id} className="flex items-center">
                        <input
                          id={`model-${option.id}`}
                          type="checkbox"
                          value={option.id}
                          checked={ProductModelId.includes(option.id)}
                          onChange={(e) => {
                            const modelId = parseInt(e.target.value);
                            setProductModelId((prev) =>
                              prev.includes(modelId)
                                ? prev.filter((id) => id !== modelId)
                                : [...prev, modelId]
                            );
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <label
                          htmlFor={`model-${option.id}`}
                          className="ml-2 block text-sm text-gray-900 truncate cursor-pointer"
                        >
                          {option.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div> */}
              </div>
            </div>

            {/* สถานะสินค้า: เต็มแถว */}
            <div className="flex flex-col lg:flex-row gap-2 items-start md:col-span-3">
              <p>สถานะสินค้า</p>
              {radioActiveProductLists
                .filter((item) => {
                  if (IsBranchDown === "0") {
                    return !["3", "10", "11"].includes(item.value);
                  }
                  return true;
                })
                .map((radioActiveList, k) => (
                  <div className="flex items-center me-4 ml-2" key={k}>
                    <input
                      name={`radioActiveList-${radioActiveList.value}`}
                      id={`radioActiveList-${radioActiveList.value}`}
                      type="radio"
                      onChange={(e) => setActive(e.target.value)}
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
            <TableStockProduct
              page={PageIndex}
              pageSize={sizePerPage()}
              tableHeaders={TableHeaders}
              tableLists={TableLists}
              onClick={editRow}
              onSelectItems={handleSelectItem}
              selectedItems={SelectedItems}
              onSelectAll={handleSelectAll}
              IsBranchDown={IsBranchDown}
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

export default ProductPage;
