/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty, isNumber } from "lodash";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { fontColor, handleCheckOpen, noImage } from "src/helpers/constant";
import { useAuth } from "src/hooks/authContext";
import { fetchPaySaving } from "src/store/productSaving";
import parse from "html-react-parser";
import dayjs from "src/helpers/dayjsConfig";
import { formatNumberDigit2 } from "src/helpers/formatNumber";
import ModalCustomer from "src/components/modals/modalCustomer";
import ModalStockProduct from "src/components/modals/modalStockProduct";
import ModalPaySavingMentImage from "src/components/modals/modalPaySavingMentImage";
import { sizePerPage } from "src/helpers/sizePerPage";
import PageNavigation from "src/components/pagination";
import {
  addProductSavingPayMentImages,
  fetchProductSavingPayMentImages,
  updateProductSavingPayMentImages,
} from "src/store/productSavingPayMentImage";
import { conFirm } from "src/components/alart";
import { MdClose, MdDelete, MdMenu } from "react-icons/md";
import { formatDateTimeZoneTH } from "src/helpers/formatDate";
import { addProcessSaving } from "src/store/processSaving";

const DefaultValues = {
  ContactCode: "",
};

const DefaultPayMentImageValues = {
  price: "",
  active: "1",
  datePay: dayjs(),
  filePayMent: [],
  payType: "2",
  bankId: "",
};

const PaySavingPage = () => {
  const { user, isLoadingOpen, setIsLoadingOpen } = useAuth();
  const [InfoPaySaving, setInfoPaySaving] = React.useState({});
  const [PaySavingImages, setPaySavingImages] = React.useState([]);
  const [isOpen, setIsOpen] = React.useState(false);

  const [PageIndexPayMentImages, setPageIndexPayMentImages] = React.useState(1);
  const [TotalDataPayMentImages, setTotalDataPayMentImages] = React.useState(0);

  const store = useSelector((state) => state.productSaving);
  const storeProductSavingPayMentImage = useSelector(
    (state) => state.productSavingPayMentImage
  );

  const container = React.useRef({});
  const dropdownRef = React.useRef(null);
  const dispatch = useDispatch();

  const [RowData, setRowData] = React.useState(DefaultPayMentImageValues);
  const [IsModalPayMentImage, setIsModalPayMentImageImage] =
    React.useState(false);

  const [IsModalCustomer, setIsModalCustomer] = React.useState(false);
  const [RowDataCustomer, setRowDataCustomer] = React.useState({
    id: "",
  });

  const [IsModalProduct, setIsModalProduct] = React.useState(false);
  const [RowDataProduct, setRowDataProduct] = React.useState({
    id: "",
  });

  const queryParams = new URLSearchParams(window.location.search);
  const ContactCodeFromUrl = queryParams.get("ContactCode");

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: ContactCodeFromUrl ? ContactCodeFromUrl : DefaultValues,
  });

  React.useEffect(() => {
    if (!isEmpty(ContactCodeFromUrl)) {
      onSubmit({
        ContactCode: ContactCodeFromUrl,
      });
    }
  }, [ContactCodeFromUrl]);

  const onSubmit = (data) => {
    setIsLoadingOpen(true);
    dispatch(fetchPaySaving(data.ContactCode))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  React.useEffect(() => {
    if (!isEmpty(store.paramsPay)) {
      reset(store.paramsPay);
    }
    setInfoPaySaving(store?.dataPay || {});
  }, [store]);

  const submitRow = (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      dispatch(
        addProductSavingPayMentImages({
          ...e,
          datePay: dayjs(e.datePay).format("YYYY/MM/DD"),
          productSavingId: InfoPaySaving.id,
          productSavingCode: watch("ContactCode"),
        })
      )
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setIsModalPayMentImageImage(false);
    } else {
      dispatch(updateProductSavingPayMentImages(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setIsModalPayMentImageImage(false);
    }
  };

  React.useEffect(() => {
    const { data, page, total } = storeProductSavingPayMentImage.allData;
    setPaySavingImages(data || []);
    setPageIndexPayMentImages(page || 1);
    setTotalDataPayMentImages(total || 0);
  }, [storeProductSavingPayMentImage]);

  const changePageImagePayMentImage = (page) => {
    if (PageIndexPayMentImages !== page) {
      setIsLoadingOpen(true);
      dispatch(
        fetchProductSavingPayMentImages({
          ...storeProductSavingPayMentImage.params,
          page: page,
        })
      )
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const cancelCase = (savingStatus, type, TableList) => {
    conFirm(`${savingStatus} ${TableList.code}`, "ตกลง", "ปิด", true).then(
      (e) => {
        if (e.isConfirmed) {
          const { customer, product, ...res } = InfoPaySaving;
          setIsLoadingOpen(true);
          dispatch(
            addProcessSaving({
              savingType: type,
              savingStatus: savingStatus,
              id: InfoPaySaving.id,
            })
          )
            .unwrap()
            .then(() => setIsLoadingOpen(false))
            .catch(() => setIsLoadingOpen(false));
        }
      }
    );
  };

  return (
    <div className="grid gap-4 grid-cols-2 px-4 py-6 overflow-x-auto">
      <ModalCustomer
        open={IsModalCustomer}
        setModal={setIsModalCustomer}
        RowData={RowDataCustomer}
        setRowData={setRowDataCustomer}
        isSee={true}
      />

      <ModalStockProduct
        open={IsModalProduct}
        setModal={setIsModalProduct}
        RowData={RowDataProduct}
        setRowData={setRowDataProduct}
        isSee={true}
      />

      <ModalPaySavingMentImage
        open={IsModalPayMentImage}
        setModal={setIsModalPayMentImageImage}
        RowData={RowData}
        setRowData={setRowData}
        submitRow={submitRow}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full col-span-2 lg:col-span-2"
        ref={container}
      >
        <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-xl shadow-lg">
          {/* Input Field */}
          <div className="col-span-3 lg:col-span-2 flex items-start gap-3 ">
            <label
              htmlFor="ContactCode"
              className="font-medium text-gray-700 whitespace-nowrap pt-2"
            >
              หมายเลขสัญญา
            </label>
            <div className="flex-1">
              <Controller
                name="ContactCode"
                control={control}
                rules={{ required: "กรุณาใส่ข้อมูล หมายเลขสัญญา" }}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <input
                      {...field}
                      id="ContactCode"
                      type="text"
                      value={field.value || ""}
                      placeholder="กรอกหมายเลขสัญญา เพื่อค้นหา"
                      className={`w-full px-4 py-2 border ${
                        error ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-200 ease-in-out hover:border-gray-400`}
                      disabled={isLoadingOpen}
                    />
                    {error && (
                      <span className="text-red-500 text-xs mt-1">
                        {error.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="col-span-3 lg:col-span-1 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isLoadingOpen}
              className={`px-4 py-2 w-full bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 ease-in-out ${
                isLoadingOpen ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              ค้นหา
            </button>
          </div>
        </div>
      </form>
      {!isEmpty(InfoPaySaving) ? (
        <div className="col-span-2">
          <div className="grid gap-4 grid-cols-2">
            <div className="w-full col-span-2 lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  ข้อมูลผู้เช่า
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Tenant Name */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">ชื่อผู้เช่า</span>
                    <p
                      className="text-gray-800 cursor-pointer hover:text-blue-600 truncate group relative"
                      onClick={() => {
                        setIsModalCustomer(true);
                        setRowDataCustomer(InfoPaySaving?.customer);
                      }}
                    >
                      {parse(
                        `${fontColor(
                          InfoPaySaving?.customer?.name
                        )} ${fontColor(InfoPaySaving?.customer?.lastname)}`
                      )}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(
                          `${fontColor(
                            InfoPaySaving?.customer?.name
                          )} ${fontColor(InfoPaySaving?.customer?.lastname)}`
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Contact Number */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">เบอร์ติดต่อ</span>
                    <p
                      className="text-gray-800 cursor-pointer hover:text-blue-600 truncate group relative"
                      onClick={() =>
                        handleCheckOpen("tel", InfoPaySaving?.customer?.tel)
                      }
                    >
                      {parse(`${fontColor(InfoPaySaving?.customer?.tel)}`)}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(`${fontColor(InfoPaySaving?.customer?.tel)}`)}
                      </span>
                    </p>
                  </div>

                  {/* Facebook */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Facebook</span>
                    <p
                      className="text-gray-800 cursor-pointer hover:text-blue-600 truncate group relative"
                      onClick={() =>
                        handleCheckOpen(
                          "facebook",
                          InfoPaySaving?.customer?.facebook
                        )
                      }
                    >
                      {parse(`${fontColor(InfoPaySaving?.customer?.facebook)}`)}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(
                          `${fontColor(InfoPaySaving?.customer?.facebook)}`
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Relative 1 */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">ญาติคนที่ 1</span>
                    <p className="text-gray-800 truncate group relative">
                      {parse(
                        `${fontColor(
                          InfoPaySaving?.customer?.nameRefOne
                        )} ${fontColor(
                          InfoPaySaving?.customer?.lastnameRefOne
                        )}`
                      )}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(
                          `${fontColor(
                            InfoPaySaving?.customer?.nameRefOne
                          )} ${fontColor(
                            InfoPaySaving?.customer?.lastnameRefOne
                          )}`
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Relationship 1 */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">
                      ความเกี่ยวข้อง
                    </span>
                    <p className="text-gray-800 truncate group relative">
                      {parse(
                        `${fontColor(InfoPaySaving?.customer?.relaRefOne)}`
                      )}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(
                          `${fontColor(InfoPaySaving?.customer?.relaRefOne)}`
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Relative 1 Contact */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">เบอร์ติดต่อ</span>
                    <p
                      className="text-gray-800 cursor-pointer hover:text-blue-600 truncate group relative"
                      onClick={() =>
                        handleCheckOpen(
                          "tel",
                          InfoPaySaving?.customer?.telRefOne
                        )
                      }
                    >
                      {parse(
                        `${fontColor(InfoPaySaving?.customer?.telRefOne)}`
                      )}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(
                          `${fontColor(InfoPaySaving?.customer?.telRefOne)}`
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Relative 2 */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">ญาติคนที่ 2</span>
                    <p className="text-gray-800 truncate group relative">
                      {parse(
                        `${fontColor(
                          InfoPaySaving?.customer?.nameRefTwo
                        )} ${fontColor(
                          InfoPaySaving?.customer?.lastnameRefTwo
                        )}`
                      )}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(
                          `${fontColor(
                            InfoPaySaving?.customer?.nameRefTwo
                          )} ${fontColor(
                            InfoPaySaving?.customer?.lastnameRefTwo
                          )}`
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Relationship 2 */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">
                      ความเกี่ยวข้อง
                    </span>
                    <p className="text-gray-800 truncate group relative">
                      {parse(
                        `${fontColor(InfoPaySaving?.customer?.relaRefTwo)}`
                      )}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(
                          `${fontColor(InfoPaySaving?.customer?.relaRefTwo)}`
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Relative 2 Contact */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">เบอร์ติดต่อ</span>
                    <p
                      className="text-gray-800 cursor-pointer hover:text-blue-600 truncate group relative"
                      onClick={() =>
                        handleCheckOpen(
                          "tel",
                          InfoPaySaving?.customer?.telRefTwo
                        )
                      }
                    >
                      {parse(
                        `${fontColor(InfoPaySaving?.customer?.telRefTwo)}`
                      )}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(
                          `${fontColor(InfoPaySaving?.customer?.telRefTwo)}`
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full col-span-2 lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  ข้อมูลทรัพย์สิน
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* IMEI */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">
                      หมายเลขเครื่อง/หมายเลข IMEI
                    </span>
                    <p
                      className="text-gray-800 cursor-pointer hover:text-blue-600 truncate group relative"
                      onClick={() => {
                        setIsModalProduct(true);
                        setRowDataProduct(InfoPaySaving?.product);
                      }}
                    >
                      {parse(`${fontColor(InfoPaySaving?.product?.imei)}`)}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(`${fontColor(InfoPaySaving?.product?.imei)}`)}
                      </span>
                    </p>
                  </div>

                  {/* Brand */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">ยี่ห้อ</span>
                    <p className="text-gray-800 truncate group relative">
                      {parse(
                        `${fontColor(
                          InfoPaySaving?.product?.productBrand?.name
                        )}`
                      )}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(
                          `${fontColor(
                            InfoPaySaving?.product?.productBrand?.name
                          )}`
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Model */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">รุ่น</span>
                    <p className="text-gray-800 truncate group relative">
                      {parse(
                        `${fontColor(
                          InfoPaySaving?.product?.productModel?.name
                        )}`
                      )}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(
                          `${fontColor(
                            InfoPaySaving?.product?.productModel?.name
                          )}`
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Storage */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">ความจุ</span>
                    <p className="text-gray-800 truncate group relative">
                      {parse(
                        `${fontColor(
                          InfoPaySaving?.product?.productStorage?.name
                        )}`
                      )}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(
                          `${fontColor(
                            InfoPaySaving?.product?.productStorage?.name
                          )}`
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Color */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">สี</span>
                    <p className="text-gray-800 truncate group relative">
                      {parse(
                        `${fontColor(
                          InfoPaySaving?.product?.productColor?.name
                        )}`
                      )}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(
                          `${fontColor(
                            InfoPaySaving?.product?.productColor?.name
                          )}`
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Battery Health */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">แบตเตอรี่</span>
                    <p className="text-gray-800 truncate group relative">
                      {parse(
                        `${fontColor(InfoPaySaving?.product?.batteryHealth)} %`
                      )}
                      <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                        {parse(
                          `${fontColor(
                            InfoPaySaving?.product?.batteryHealth
                          )} %`
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full col-span-2">
              <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-xl shadow-lg">
                <div className="col-span-3 lg:col-span-2 content-center">
                  {InfoPaySaving.isCancel == "0" &&
                  InfoPaySaving.status == "1" ? (
                    <div className="col-span-3 lg:col-span-1">
                      <button
                        onClick={() => {
                          setRowData(DefaultPayMentImageValues);
                          setIsModalPayMentImageImage(true);
                        }}
                        className={`px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 ease-in-out ${
                          isLoadingOpen ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        ตารางออม +
                      </button>
                    </div>
                  ) : (
                    <p>ตารางออม</p>
                  )}
                </div>

                {InfoPaySaving.isCancel == "0" &&
                InfoPaySaving.status == "1" ? (
                  <div
                    className="col-span-3 lg:col-span-1 justify-self-end relative"
                    ref={dropdownRef}
                  >
                    {/* ปุ่ม Hamburger */}
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-105"
                      aria-label="Menu"
                    >
                      <MdMenu className="w-6 h-6 text-gray-700" />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                      <div
                        className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl z-9 overflow-hidden transform transition-all duration-200 ease-in-out origin-top animate-dropdown"
                        onMouseLeave={() => setIsOpen(!isOpen)}
                      >
                        <ul className="py-2 space-y-1">
                          <li>
                            <button
                              onClick={() => {
                                cancelCase(`คืนสัญญา`, 1, "returnCase");
                              }}
                              className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                                isLoadingOpen
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={isLoadingOpen}
                            >
                              คืนสัญญา
                            </button>
                          </li>

                          <li>
                            <button
                              onClick={() => {
                                cancelCase(`ยึดสัญญา`, 2, "fastenCase");
                              }}
                              className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                                isLoadingOpen
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={isLoadingOpen}
                            >
                              ยึดสัญญา
                            </button>
                          </li>

                          <li>
                            <button
                              onClick={() => {
                                cancelCase(`ค่าเปิดใช้เครื่อง`, 3, "payDown");
                              }}
                              className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                                isLoadingOpen
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={isLoadingOpen}
                            >
                              ค่าเปิดใช้เครื่อง
                            </button>
                          </li>

                          <li>
                            <button
                              onClick={() => {
                                cancelCase(`ยกเลิกสัญญา`, 4, "cancelCase");
                              }}
                              className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                                isLoadingOpen
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={isLoadingOpen}
                            >
                              ยกเลิกสัญญา
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="col-span-3 lg:col-span-3">
                  <div className="grid grid-cols-2 gap-4 bg-blue-100 p-6 rounded-xl shadow-lg">
                    <div className="col-span-3 lg:col-span-1">
                      {parse(
                        `ชำระตอนทำสัญญา: ${formatNumberDigit2(
                          Number(InfoPaySaving.priceCash) +
                            Number(InfoPaySaving.priceTransferCash)
                        )}`
                      )}
                    </div>

                    <div className="col-span-3 lg:col-span-1 text-right">
                      {parse(
                        `ออมทั้งหมด: ${formatNumberDigit2(
                          Number(InfoPaySaving.priceCash) +
                            Number(InfoPaySaving.priceTransferCash) +
                            Number(InfoPaySaving.priceSumPay)
                        )}`
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-3 px-4 sm:px-0">
                  <div className="grid grid-cols-1 gap-5">
                    <div className="col-span-1">
                      <ul className="space-y-3">
                        {PaySavingImages?.map((v, k) => (
                          <li
                            key={k}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 ${
                              v.isPaySuccess == "1"
                                ? "bg-green-200"
                                : v.isPaySuccess == "2"
                                ? "bg-yellow-200"
                                : v.isPaySuccess == "3"
                                ? "bg-red-200"
                                : null
                            }`}
                          >
                            {/* ชื่องวดและวันที่ */}
                            <div className="flex-1 mb-2 sm:mb-0">
                              <p>
                                {parse(
                                  `ชำระวันที่: ${fontColor(
                                    formatDateTimeZoneTH(v.create_date)
                                  )}`
                                )}
                              </p>
                            </div>

                            {/* โดย */}
                            <div className="flex-1 text-right mb-2 sm:mb-0">
                              <p>
                                {parse(
                                  `ประเภท: ${fontColor(
                                    v.payType == "1" ? "เงินสด" : "เงินโอน"
                                  )}`
                                )}
                              </p>
                            </div>

                            {/* โดย */}
                            <div className="flex-1 text-right mb-2 sm:mb-0">
                              <p>
                                {parse(
                                  `โดย: ${fontColor(v.create_by?.name || "")}`
                                )}
                              </p>
                            </div>

                            {/* ยอดเช่า */}
                            <div className="flex-1 text-right mb-2 sm:mb-0">
                              <p>
                                {parse(
                                  `ยอดเช่า: ${fontColor(
                                    formatNumberDigit2(v.price)
                                  )} บาท`
                                )}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="col-span-1">
                      <PageNavigation
                        currentPage={PageIndexPayMentImages}
                        totalCount={TotalDataPayMentImages}
                        pageSize={sizePerPage()}
                        onPageChange={(page) =>
                          changePageImagePayMentImage(page)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PaySavingPage;
