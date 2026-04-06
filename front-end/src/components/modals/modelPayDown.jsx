/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { isEmpty, isNumber } from "lodash";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { fontColor, handleCheckOpen, noImage } from "src/helpers/constant";
import { useAuth } from "src/hooks/authContext";
import { fetchPayDown, changeStatusProductSale } from "src/store/productSale";
import parse from "html-react-parser";
import dayjs from "src/helpers/dayjsConfig";
import { formatNumberDigit2 } from "src/helpers/formatNumber";
import ModalCustomer from "src/components/modals/modalCustomer";
import ModalStockProduct from "src/components/modals/modalStockProduct";
import ModalPayMentImage from "src/components/modals/modalPayMentImage";
import {
  fetchProductPayMentLists,
  updateProductPayMentLists,
} from "src/store/productPayMentList";
import { sizePerPage } from "src/helpers/sizePerPage";
import PageNavigation from "src/components/pagination";
import {
  addProductPayMentImages,
  deleteProductPayMentImages,
  fetchProductPayMentImages,
  updateProductPayMentImages,
} from "src/store/productPayMentImage";
import { conFirm } from "src/components/alart";
import { MdClose, MdMenu } from "react-icons/md";
import { addProcessCase } from "src/store/processCase";
import {
  formatDateNumberWithoutTime,
  formatDateTimeZoneTH,
} from "src/helpers/formatDate";
import ModalUpdatePayDownNote from "src/components/modals/modalUpdatePayDownNote";
import ModalClaimMobileContact from "src/components/modals/modalClaimMobileContact";
import PropTypes from "prop-types";

const DefaultValues = {
  ContactCode: "",
};

const DefaultClaimMobile = {
  caseType: "5",
  code: "",
  oldProductId: null,
  newProductId: null,
};

const DefaultPayMentImageValues = {
  price: "",
  active: "1",
  datePay: "",
  filePayMent: [],
  payType: "2",
  bankId: "",
};

const ModalPayDown = ({ open, setModal, contactCodeFromUrl }) => {
  const { permissions, isLoadingOpen, setIsLoadingOpen } = useAuth();
  const [InfoPayDown, setInfoPayDown] = React.useState({});
  const [PayDownLists, setPayDownLists] = React.useState([]);
  const [PayDownImages, setPayDownImages] = React.useState([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const modalRef = React.useRef(null);

  const [PageIndexPayMentImages, setPageIndexPayMentImages] = React.useState(1);
  const [TotalDataPayMentImages, setTotalDataPayMentImages] = React.useState(0);

  const [PageIndexPayMentLists, setPageIndexPayMentLists] = React.useState(1);
  const [TotalDataPayMentLists, setTotalDataPayMentLists] = React.useState(0);

  const store = useSelector((state) => state.productSale);
  const storeProductPayMentList = useSelector(
    (state) => state.productPayMentList
  );

  const storeProductPayMentImage = useSelector(
    (state) => state.productPayMentImage
  );

  const container = React.useRef({});
  const dropdownRef = React.useRef(null);
  const dispatch = useDispatch();

  const [RowData, setRowData] = React.useState(DefaultPayMentImageValues);
  const [IsModalPayMentImage, setIsModalPayMentImage] = React.useState(false);

  const [IsModalClaimMobile, setIsModalClaimMobile] = React.useState(false);
  const [RowDataClaimMobile, setRowDataClaimMobile] =
    React.useState(DefaultClaimMobile);

  const [isModalUpdateNote, setIsModalUpdateNote] = React.useState(false);
  const [rowDataNote, setRowDataNote] = React.useState({
    note: "",
    priceDebt: 0,
  });
  const [IsModalCustomer, setIsModalCustomer] = React.useState(false);
  const [RowDataCustomer, setRowDataCustomer] = React.useState({
    id: "",
  });

  const [IsModalProduct, setIsModalProduct] = React.useState(false);
  const [RowDataProduct, setRowDataProduct] = React.useState({
    id: "",
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: contactCodeFromUrl
      ? { ContactCode: contactCodeFromUrl }
      : DefaultValues,
  });

  React.useEffect(() => {
    if (!isEmpty(contactCodeFromUrl)) {
      onSubmit({
        ContactCode: contactCodeFromUrl,
      });
    }
  }, [contactCodeFromUrl]);

  const onSubmit = (data) => {
    setIsLoadingOpen(true);
    dispatch(fetchPayDown(data.ContactCode.trim()))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch(() => setIsLoadingOpen(false));
  };

  React.useEffect(() => {
    if (!isEmpty(store.paramsPay)) {
      reset(store.paramsPay);
    }
    setInfoPayDown(store?.dataPay || {});
  }, [store]);

  const submitRow = (e) => {
    setIsLoadingOpen(true);
    if (isNaN(e.id)) {
      dispatch(
        addProductPayMentImages({
          ...e,
          productSaleId: InfoPayDown.id,
          productSaleCode: watch("ContactCode"),
        })
      )
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setIsModalPayMentImage(false);
    } else {
      dispatch(updateProductPayMentImages(e))
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      setIsModalPayMentImage(false);
    }
  };

  const submitRowClaimMobile = (e) => {
    setIsModalClaimMobile(false);
    cancelCase(
      `เครมเครื่อง ${InfoPayDown.code}`,
      "claimMobile",
      e.oldProductId,
      e.newProductId
    );
  };

  const addClaimMobile = () => {
    setRowDataClaimMobile({
      ...DefaultClaimMobile,
      code: InfoPayDown.code,
      productSaleId: InfoPayDown.id,
      oldProductId: InfoPayDown.product.id,
      newProductId: null,
    });
    setIsModalClaimMobile(true);
  };

  const submitUpdateNote = (data) => {
    setIsLoadingOpen(true);
    dispatch(updateProductPayMentLists(data))
      .unwrap()
      .then(() => {
        setIsLoadingOpen(false);
        setIsModalUpdateNote(false);
      })
      .catch(() => {
        setIsLoadingOpen(false);
        setIsModalUpdateNote(false);
      });
  };

  React.useEffect(() => {
    const { data, page, total } = storeProductPayMentList.allData;
    setPayDownLists(data || []);
    setPageIndexPayMentLists(page || 1);
    setTotalDataPayMentLists(total || 0);
  }, [storeProductPayMentList]);

  React.useEffect(() => {
    const { data, page, total } = storeProductPayMentImage.allData;
    setPayDownImages(data || []);
    setPageIndexPayMentImages(page || 1);
    setTotalDataPayMentImages(total || 0);
  }, [storeProductPayMentImage]);

  const changePagePayMentList = (page) => {
    if (PageIndexPayMentLists !== page) {
      setIsLoadingOpen(true);
      dispatch(
        fetchProductPayMentLists({
          ...storeProductPayMentList.params,
          page: page,
        })
      )
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDeleteImage = (item) => {
    conFirm(
      `ยืนยันการลบ ชำระงวดที่: ${item.payNo} \nยอด ${formatNumberDigit2(
        item.price
      )}`,
      "ตกลง",
      "ปิด",
      true
    ).then((e) => {
      if (e.isConfirmed) {
        setIsLoadingOpen(true);
        dispatch(deleteProductPayMentImages(item.id))
          .unwrap()
          .then(() => setIsLoadingOpen(false))
          .catch(() => setIsLoadingOpen(false));
      }
    });
  };

  const changePagePayMentImage = (page) => {
    if (PageIndexPayMentImages !== page) {
      setIsLoadingOpen(true);
      dispatch(
        fetchProductPayMentImages({
          ...storeProductPayMentImage.params,
          page: page,
        })
      )
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const cancelCase = (title, type, oldProductId, newProductId) => {
    conFirm(`${title}`, "ตกลง", "ปิด", true).then((e) => {
      if (e.isConfirmed) {
        setIsLoadingOpen(true);
        const { customer, product, ...res } = InfoPayDown;
        if (type == "cancelCase" || type == "cancelCaseReturn") {
          dispatch(
            changeStatusProductSale({
              ...res,
              isCancel: "1",
              isReturn: type == "cancelCaseReturn" ? 1 : 0,
            })
          )
            .unwrap()
            .then(() => setIsLoadingOpen(false))
            .catch(() => setIsLoadingOpen(false));
        } else if (type == "endCase") {
          dispatch(
            addProcessCase({
              caseType: 1,
              id: InfoPayDown.id,
            })
          )
            .unwrap()
            .then(() => setIsLoadingOpen(false))
            .catch(() => setIsLoadingOpen(false));
        } else if (type == "returnCase") {
          dispatch(
            addProcessCase({
              caseType: 3,
              id: InfoPayDown.id,
            })
          )
            .unwrap()
            .then(() => setIsLoadingOpen(false))
            .catch(() => setIsLoadingOpen(false));
        } else if (type == "badDebt") {
          dispatch(
            addProcessCase({
              caseType: 6,
              id: InfoPayDown.id,
            })
          )
            .unwrap()
            .then(() => setIsLoadingOpen(false))
            .catch(() => setIsLoadingOpen(false));
        } else if (type == "fastenCase") {
          dispatch(
            addProcessCase({
              caseType: 4,
              id: InfoPayDown.id,
            })
          )
            .unwrap()
            .then(() => setIsLoadingOpen(false))
            .catch(() => setIsLoadingOpen(false));
        } else if (type == "claimMobile") {
          dispatch(
            addProcessCase({
              caseType: 5,
              oldProductId: oldProductId,
              newProductId: newProductId,
              id: InfoPayDown.id,
            })
          )
            .unwrap()
            .then(() => setIsLoadingOpen(false))
            .catch(() => setIsLoadingOpen(false));
        }
        setModal(false);
      }
    });
  };

  const endCase = () => {
    const checkCase = PayDownLists.find((e) => e.isPaySuccess !== "1");
    if (isEmpty(checkCase)) {
      cancelCase(`ยืนยันการปิดสัญญา ${InfoPayDown.code}`, "endCase");
    } else {
      cancelCase(`มียอดค้างในการปิดสัญญา ${InfoPayDown.code}`, "endCase");
    }
    setModal(false);
  };

  const handleOpenUpdateNoteModal = (data) => {
    setRowDataNote(data);
    setIsModalUpdateNote(true);
  };

  return (
    <div
      ref={modalRef}
      tabIndex="-1"
      className={`${
        open
          ? "flex justify-center items-center absolute inset-0 overflow-y-auto z-10 overflow-x-hidden p-5 bg-gray-300 bg-opacity-70"
          : "hidden"
      }`}
      onKeyDown={(e) => (e.key === "Escape" ? setModal(false) : null)}
    >
      <div className="relative w-full bg-white rounded-lg shadow overflow-y-auto max-h-[95vh] p-5">
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

        <ModalPayMentImage
          open={IsModalPayMentImage}
          setModal={setIsModalPayMentImage}
          RowData={RowData}
          setRowData={setRowData}
          submitRow={submitRow}
        />

        <ModalClaimMobileContact
          open={IsModalClaimMobile}
          setModal={setIsModalClaimMobile}
          RowData={RowDataClaimMobile}
          setRowData={setRowDataClaimMobile}
          submitRow={submitRowClaimMobile}
        />

        <ModalUpdatePayDownNote
          open={isModalUpdateNote}
          setModal={setIsModalUpdateNote}
          RowData={rowDataNote}
          submitRow={submitUpdateNote}
        />

        <div className="w-full col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between p-3 border-b rounded-t">
            <h3 className="text-xl font-semibold text-gray-900">
              {`ข้อมูลสัญญาเช่า - ${InfoPayDown?.code || ""}`}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              onClick={() => setModal(false)}
            >
              <MdClose />
            </button>
          </div>
        </div>

        {!isEmpty(InfoPayDown) ? (
          <div className="col-span-2 min-h-96">
            <div className="grid gap-4 grid-cols-3">
              <div className="w-full col-span-3 lg:col-span-1">
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
                          setRowDataCustomer(InfoPayDown?.customer);
                        }}
                      >
                        {parse(
                          `${fontColor(
                            InfoPayDown?.customer?.name
                          )} ${fontColor(InfoPayDown?.customer?.lastname)}`
                        )}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(
                            `${fontColor(
                              InfoPayDown?.customer?.name
                            )} ${fontColor(InfoPayDown?.customer?.lastname)}`
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
                          handleCheckOpen("tel", InfoPayDown?.customer?.tel)
                        }
                      >
                        {parse(`${fontColor(InfoPayDown?.customer?.tel)}`)}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(`${fontColor(InfoPayDown?.customer?.tel)}`)}
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
                            InfoPayDown?.customer?.facebook
                          )
                        }
                      >
                        {parse(`${fontColor(InfoPayDown?.customer?.facebook)}`)}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(
                            `${fontColor(InfoPayDown?.customer?.facebook)}`
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
                            InfoPayDown?.customer?.nameRefOne
                          )} ${fontColor(
                            InfoPayDown?.customer?.lastnameRefOne
                          )}`
                        )}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(
                            `${fontColor(
                              InfoPayDown?.customer?.nameRefOne
                            )} ${fontColor(
                              InfoPayDown?.customer?.lastnameRefOne
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
                          `${fontColor(InfoPayDown?.customer?.relaRefOne)}`
                        )}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(
                            `${fontColor(InfoPayDown?.customer?.relaRefOne)}`
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
                            InfoPayDown?.customer?.telRefOne
                          )
                        }
                      >
                        {parse(
                          `${fontColor(InfoPayDown?.customer?.telRefOne)}`
                        )}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(
                            `${fontColor(InfoPayDown?.customer?.telRefOne)}`
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
                            InfoPayDown?.customer?.nameRefTwo
                          )} ${fontColor(
                            InfoPayDown?.customer?.lastnameRefTwo
                          )}`
                        )}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(
                            `${fontColor(
                              InfoPayDown?.customer?.nameRefTwo
                            )} ${fontColor(
                              InfoPayDown?.customer?.lastnameRefTwo
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
                          `${fontColor(InfoPayDown?.customer?.relaRefTwo)}`
                        )}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(
                            `${fontColor(InfoPayDown?.customer?.relaRefTwo)}`
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
                            InfoPayDown?.customer?.telRefTwo
                          )
                        }
                      >
                        {parse(
                          `${fontColor(InfoPayDown?.customer?.telRefTwo)}`
                        )}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(
                            `${fontColor(InfoPayDown?.customer?.telRefTwo)}`
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full col-span-3 lg:col-span-1">
                {isNumber(InfoPayDown?.customerMirror?.id) ? (
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      ข้อมูลผู้เช่า (สัญญาร่วม)
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Tenant Name */}
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">
                          ชื่อผู้เช่า
                        </span>
                        <p
                          className="text-gray-800 cursor-pointer hover:text-blue-600 truncate group relative"
                          onClick={() => {
                            setIsModalCustomer(true);
                            setRowDataCustomer(InfoPayDown?.customerMirror);
                          }}
                        >
                          {parse(
                            `${fontColor(
                              InfoPayDown?.customerMirror?.name
                            )} ${fontColor(
                              InfoPayDown?.customerMirror?.lastname
                            )}`
                          )}
                          <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                            {parse(
                              `${fontColor(
                                InfoPayDown?.customerMirror?.name
                              )} ${fontColor(
                                InfoPayDown?.customerMirror?.lastname
                              )}`
                            )}
                          </span>
                        </p>
                      </div>

                      {/* Contact Number */}
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">
                          เบอร์ติดต่อ
                        </span>
                        <p
                          className="text-gray-800 cursor-pointer hover:text-blue-600 truncate group relative"
                          onClick={() =>
                            handleCheckOpen(
                              "tel",
                              InfoPayDown?.customerMirror?.tel
                            )
                          }
                        >
                          {parse(
                            `${fontColor(InfoPayDown?.customerMirror?.tel)}`
                          )}
                          <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                            {parse(
                              `${fontColor(InfoPayDown?.customerMirror?.tel)}`
                            )}
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
                              InfoPayDown?.customerMirror?.facebook
                            )
                          }
                        >
                          {parse(
                            `${fontColor(
                              InfoPayDown?.customerMirror?.facebook
                            )}`
                          )}
                          <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                            {parse(
                              `${fontColor(
                                InfoPayDown?.customerMirror?.facebook
                              )}`
                            )}
                          </span>
                        </p>
                      </div>

                      {/* Relative 1 */}
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">
                          ญาติคนที่ 1
                        </span>
                        <p className="text-gray-800 truncate group relative">
                          {parse(
                            `${fontColor(
                              InfoPayDown?.customerMirror?.nameRefOne
                            )} ${fontColor(
                              InfoPayDown?.customerMirror?.lastnameRefOne
                            )}`
                          )}
                          <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                            {parse(
                              `${fontColor(
                                InfoPayDown?.customerMirror?.nameRefOne
                              )} ${fontColor(
                                InfoPayDown?.customerMirror?.lastnameRefOne
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
                            `${fontColor(
                              InfoPayDown?.customerMirror?.relaRefOne
                            )}`
                          )}
                          <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                            {parse(
                              `${fontColor(
                                InfoPayDown?.customerMirror?.relaRefOne
                              )}`
                            )}
                          </span>
                        </p>
                      </div>

                      {/* Relative 1 Contact */}
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">
                          เบอร์ติดต่อ
                        </span>
                        <p
                          className="text-gray-800 cursor-pointer hover:text-blue-600 truncate group relative"
                          onClick={() =>
                            handleCheckOpen(
                              "tel",
                              InfoPayDown?.customerMirror?.telRefOne
                            )
                          }
                        >
                          {parse(
                            `${fontColor(
                              InfoPayDown?.customerMirror?.telRefOne
                            )}`
                          )}
                          <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                            {parse(
                              `${fontColor(
                                InfoPayDown?.customerMirror?.telRefOne
                              )}`
                            )}
                          </span>
                        </p>
                      </div>

                      {/* Relative 2 */}
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">
                          ญาติคนที่ 2
                        </span>
                        <p className="text-gray-800 truncate group relative">
                          {parse(
                            `${fontColor(
                              InfoPayDown?.customerMirror?.nameRefTwo
                            )} ${fontColor(
                              InfoPayDown?.customerMirror?.lastnameRefTwo
                            )}`
                          )}
                          <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                            {parse(
                              `${fontColor(
                                InfoPayDown?.customerMirror?.nameRefTwo
                              )} ${fontColor(
                                InfoPayDown?.customerMirror?.lastnameRefTwo
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
                            `${fontColor(
                              InfoPayDown?.customerMirror?.relaRefTwo
                            )}`
                          )}
                          <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                            {parse(
                              `${fontColor(
                                InfoPayDown?.customerMirror?.relaRefTwo
                              )}`
                            )}
                          </span>
                        </p>
                      </div>

                      {/* Relative 2 Contact */}
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">
                          เบอร์ติดต่อ
                        </span>
                        <p
                          className="text-gray-800 cursor-pointer hover:text-blue-600 truncate group relative"
                          onClick={() =>
                            handleCheckOpen(
                              "tel",
                              InfoPayDown?.customerMirror?.telRefTwo
                            )
                          }
                        >
                          {parse(
                            `${fontColor(
                              InfoPayDown?.customerMirror?.telRefTwo
                            )}`
                          )}
                          <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                            {parse(
                              `${fontColor(
                                InfoPayDown?.customerMirror?.telRefTwo
                              )}`
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-red-300 text-center">
                      ไม่มีผู้เช่าสัญญาร่วม
                    </h2>
                  </div>
                )}
              </div>

              <div className="w-full col-span-3 lg:col-span-1">
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
                          setRowDataProduct(InfoPayDown?.product);
                        }}
                      >
                        {parse(`${fontColor(InfoPayDown?.product?.imei)}`)}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(`${fontColor(InfoPayDown?.product?.imei)}`)}
                        </span>
                      </p>
                    </div>

                    {/* Brand */}
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600">ยี่ห้อ</span>
                      <p className="text-gray-800 truncate group relative">
                        {parse(
                          `${fontColor(
                            InfoPayDown?.product?.productBrand?.name
                          )}`
                        )}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(
                            `${fontColor(
                              InfoPayDown?.product?.productBrand?.name
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
                            InfoPayDown?.product?.productModel?.name
                          )}`
                        )}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(
                            `${fontColor(
                              InfoPayDown?.product?.productModel?.name
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
                            InfoPayDown?.product?.productStorage?.name
                          )}`
                        )}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(
                            `${fontColor(
                              InfoPayDown?.product?.productStorage?.name
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
                            InfoPayDown?.product?.productColor?.name
                          )}`
                        )}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(
                            `${fontColor(
                              InfoPayDown?.product?.productColor?.name
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
                          `${fontColor(InfoPayDown?.product?.batteryHealth)} %`
                        )}
                        <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                          {parse(
                            `${fontColor(
                              InfoPayDown?.product?.batteryHealth
                            )} %`
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full col-span-3">
                <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-xl shadow-lg">
                  <div className="col-span-3 lg:col-span-2 content-center">
                    <p>ตารางค่าบริการดูแล</p>
                  </div>

                  {InfoPayDown.isCancel == "0" &&
                  !["1", "5", "6"].includes(InfoPayDown.isPaySuccess) ? (
                    <div
                      className="col-span-3 lg:col-span-1 justify-self-end relative"
                      ref={dropdownRef}
                    >
                      {/* ปุ่ม Hamburger */}
                      <button
                        onClick={() => setIsOpen(!isOpen)}
                        // className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-105"
                        className={`px-3 py-2 w-full bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 ease-in-out`}
                        aria-label="Menu"
                      >
                        {/* <MdMenu className="w-6 h-6 text-gray-700" /> */}
                        แก้ไขสัญญา
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
                                  addClaimMobile();
                                }}
                                className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                                  isLoadingOpen
                                    ? "opacity-60 cursor-not-allowed"
                                    : ""
                                }`}
                                disabled={isLoadingOpen}
                              >
                                เครมเครื่อง
                              </button>
                            </li>

                            <li>
                              <button
                                onClick={() => {
                                  cancelCase(
                                    `คืนสัญญา ${InfoPayDown.code}`,
                                    "returnCase"
                                  );
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
                                  cancelCase(
                                    `หนี้เสีย ${InfoPayDown.code}`,
                                    "badDebt"
                                  );
                                }}
                                className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                                  isLoadingOpen
                                    ? "opacity-60 cursor-not-allowed"
                                    : ""
                                }`}
                                disabled={isLoadingOpen}
                              >
                                หนี้เสีย
                              </button>
                            </li>

                            <li>
                              <button
                                onClick={() => {
                                  cancelCase(
                                    `ยึดสัญญา ${InfoPayDown.code}`,
                                    "fastenCase"
                                  );
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
                                  endCase();
                                }}
                                className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                                  isLoadingOpen
                                    ? "opacity-60 cursor-not-allowed"
                                    : ""
                                }`}
                                disabled={isLoadingOpen}
                              >
                                จบสัญญา จ่ายครบ/ปิดยอดทั้งหมด
                              </button>
                            </li>

                            <li>
                              <button
                                onClick={() => {
                                  cancelCase(
                                    `ยืนยันการยกเลิกสัญญา ${InfoPayDown.code}`,
                                    "cancelCaseReturn"
                                  );
                                }}
                                className={`block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                                  isLoadingOpen
                                    ? "opacity-60 cursor-not-allowed"
                                    : ""
                                }`}
                                disabled={isLoadingOpen}
                              >
                                ยกเลิกสัญญา (คืนอุปกรณ์เสริม)
                              </button>
                            </li>

                            <li>
                              <button
                                onClick={() => {
                                  cancelCase(
                                    `ยืนยันการยกเลิกสัญญา ${InfoPayDown.code}`,
                                    "cancelCase"
                                  );
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
                      <div className="col-span-3 lg:col-span-1"></div>

                      <div className="col-span-3 lg:col-span-1 text-right">
                        {parse(
                          `ค่าเช่าคงเหลือ: ${formatNumberDigit2(
                            InfoPayDown.priceSumInvoices
                          )}/${formatNumberDigit2(
                            InfoPayDown.priceSumPayInvoices
                          )}`
                        )}{" "}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 px-4 sm:px-0">
                    <div className="grid grid-cols-1 gap-5">
                      <div className="col-span-1">
                        <ul className="space-y-3">
                          {PayDownLists?.map((v, k) => (
                            <li
                              key={k}
                              onClick={() =>
                                permissions.includes("can-update-payment") &&
                                handleOpenUpdateNoteModal(v)
                              }
                              className={`p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 ${
                                permissions.includes("can-update-payment")
                                  ? "cursor-pointer"
                                  : ""
                              } ${
                                v.isPaySuccess == "1"
                                  ? "bg-green-200"
                                  : v.isPaySuccess == "2"
                                  ? "bg-yellow-200"
                                  : v.isPaySuccess == "3" || v.isPaySuccess == "8" || v.isPaySuccess == "9"
                                  ? "bg-red-200"
                                  : ""
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                {/* ชื่องวดและวันที่ */}
                                <div className="flex-1 mb-2 sm:mb-0">
                                  <p>
                                    {parse(
                                      `งวดที่ ${
                                        v.payNo
                                      } - ชำระวันที่: ${fontColor(
                                        formatDateNumberWithoutTime(v.datePay)
                                      )}`
                                    )}
                                  </p>
                                </div>

                                {/* ยอดเช่า */}
                                <div className="flex-1 text-right sm:text-center mb-2 sm:mb-0">
                                  <p>
                                    {parse(
                                      `ยอดเช่า: ${fontColor(
                                        formatNumberDigit2(v.price)
                                      )} บาท`
                                    )}
                                  </p>
                                </div>

                                {/* ค่าทวงถาม */}
                                <div className="flex-1 text-right">
                                  <p>
                                    {parse(
                                      `ค่าทวงถาม: ${fontColor(
                                        formatNumberDigit2(v.priceDebt)
                                      )} บาท`
                                    )}
                                  </p>
                                </div>

                                {/* ชำระแล้ว */}
                                <div className="flex-1 text-right">
                                  <p>
                                    {parse(
                                      `ชำระแล้ว: ${fontColor(
                                        formatNumberDigit2(v.pricePay)
                                      )} บาท`
                                    )}
                                  </p>
                                </div>
                              </div>
                              {!isEmpty(v.note) && (
                                <div className="mt-2 pt-2 border-t border-gray-300">
                                  <p className="text-sm text-gray-700">
                                    {parse(`หมายเหตุ: ${fontColor(v.note)}`)}
                                  </p>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="col-span-1">
                        <PageNavigation
                          currentPage={PageIndexPayMentLists}
                          totalCount={TotalDataPayMentLists}
                          pageSize={sizePerPage()}
                          onPageChange={(page) => changePagePayMentList(page)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full col-span-3">
                <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-xl shadow-lg">
                  <div className="col-span-3 lg:col-span-2 content-center">
                    <p>หลักฐานการชำระ</p>
                  </div>

                  {InfoPayDown.isCancel == "0" ? (
                    <div className="col-span-3 lg:col-span-1">
                      <button
                        onClick={() => {
                          setRowData(DefaultPayMentImageValues);
                          setIsModalPayMentImage(true);
                        }}
                        className={`px-3 py-2 w-full bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 ease-in-out ${
                          isLoadingOpen ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        เพิ่มข้อมูลใหม่
                      </button>
                    </div>
                  ) : null}

                  <div className="col-span-3 px-4 sm:px-0">
                    <div className="grid grid-cols-1 gap-5">
                      <div className="col-span-1">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                          {PayDownImages?.map((v, k) => (
                            <div className="col-span-1" key={k}>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 bg-white p-6 rounded-xl shadow-lg hover:bg-blue-100">
                                <div
                                  className="col-span-2"
                                  style={{
                                    textAlign: "right",
                                  }}
                                >
                                  <button
                                    onClick={() => handleDeleteImage(v)}
                                    className="text-red-400 hover:text-red-600 group-hover:opacity-100 transition-opacity duration-200"
                                  >
                                    <MdClose size={20} />
                                  </button>
                                </div>

                                <div className="col-span-2 justify-items-center">
                                  {noImage(v.filePayMent, 52, 52)}
                                </div>

                                <div className="col-span-2 lg:col-span-1">
                                  <p>
                                    {parse(`ชำระงวดที่: ${fontColor(v.payNo)}`)}
                                  </p>
                                </div>
                                <div className="col-span-2 lg:col-span-1">
                                  <p>
                                    {parse(
                                      `ยอดชำระ: ${fontColor(
                                        formatNumberDigit2(v.price)
                                      )} บาท`
                                    )}
                                  </p>
                                </div>

                                <div className="col-span-2 lg:col-span-2">
                                  <p>
                                    {parse(
                                      `วันที่ชำระ: ${fontColor(
                                        formatDateTimeZoneTH(v.datePay)
                                      )}`
                                    )}
                                  </p>
                                </div>

                                <div className="col-span-2 lg:col-span-2">
                                  <p>
                                    {parse(
                                      `โดย: ${fontColor(v.create_by?.name)}`
                                    )}
                                  </p>
                                </div>

                                {permissions.includes("edit-image-payment") && (
                                  <div className="col-span-2">
                                    <button
                                      onClick={() => {
                                        setRowData(v);
                                        setIsModalPayMentImage(true);
                                      }}
                                      className="w-full rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                                    >
                                      แก้ไข
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <PageNavigation
                          currentPage={PageIndexPayMentImages}
                          totalCount={TotalDataPayMentImages}
                          pageSize={sizePerPage()}
                          onPageChange={(page) => changePagePayMentImage(page)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end items-center p-4 lg:p-5 border-t border-gray-200 rounded-b">
          <button
            onClick={() => setModal(!open)}
            type="button"
            className="py-2.5 px-5 ml-3 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-red-300 hover:text-white"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

ModalPayDown.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  contactCodeFromUrl: PropTypes.string,
};

export default ModalPayDown;
