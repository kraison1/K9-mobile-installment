import { useForm, Controller } from "react-hook-form";
import { useAuth } from "src/hooks/authContext";
import { authLogin } from "src/store/user";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import React from "react";
import { isEmpty } from "lodash";
import { addOcr, checkOcr } from "src/store/ocr";
import _ from "lodash";
import { imageJpeg, imagePng } from "src/helpers/fileType";
import FileDropzone from "src/helpers/fileDropzone";
import BarcodeGenerator from "src/components/barcodeGenerator";
import Thunder_logo from "src/styles/images/thunder_logo.png";

const acceptedFileTypes = {
  "image/jpeg": imageJpeg,
  "image/png": imagePng,
};

// ===============================
// SAFE NAVIGATION HELPERS (กัน infinite loop)
// ===============================
const shouldGoNext = ({ auth, token }) => {
  return !isEmpty(auth) && Boolean(token);
};

const useOnceNavigateFlag = ({
  auth,
  token,
  shouldNavigate,
  setShouldNavigate,
}) => {
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    // กัน setState ซ้ำ + กัน loop
    if (shouldNavigate) return;
    if (firedRef.current) return;

    if (shouldGoNext({ auth, token })) {
      firedRef.current = true;
      setShouldNavigate(true);
    }
  }, [auth, token, shouldNavigate, setShouldNavigate]);
};

const LoginPage = () => {
  const { user, setIsLoadingOpen } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const store = useSelector((state) => state.user);
  const storeOcr = useSelector((state) => state.ocr);

  const location = useLocation();

  const [shouldNavigate, setShouldNavigate] = React.useState(false);
  const [ocrCode, setOcrCode] = React.useState("");
  const [productDetails, setProductDetails] = React.useState(null);
  const [submissionType, setSubmissionType] = React.useState("login");

  const token = localStorage.getItem("jwtToken");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const debouncedAddOcr = React.useCallback(
    _.debounce(() => {
      dispatch(addOcr());
    }, 3000),
    [dispatch],
  );

  const onSubmit = async (data) => {
    setIsLoadingOpen(true);

    if (submissionType === "login") {
      dispatch({ type: "RESET_APP" });

      dispatch(
        authLogin({
          ...data,
          deviceType: "website",
        }),
      )
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
    } else if (submissionType === "ocr") {
      dispatch(
        checkOcr({
          item: {
            code: ocrCode,
            file: data.uploadFileOcr,
          },
          navigate,
        }),
      )
        .unwrap()
        .then(() => setIsLoadingOpen(false))
        .catch(() => setIsLoadingOpen(false));
    }
  };

  // ✅ แทน useEffect เดิม เพื่อไม่ให้ติด loop
  useOnceNavigateFlag({
    auth: store.auth,
    token,
    shouldNavigate,
    setShouldNavigate,
  });

  React.useEffect(() => {
    if (!isEmpty(storeOcr)) {
      setOcrCode(storeOcr.createNew?.ocrCode || "");
      setProductDetails(storeOcr.createNew?.product || null);
    }
  }, [storeOcr]);

  React.useEffect(() => {
    if (!isEmpty(user)) {
      const { branch } = user;
      if (branch?.isCheckOcr === "1") {
        debouncedAddOcr();
      }
    }
  }, [user, debouncedAddOcr]);

  // ===============================
  // REDIRECT ZONE
  // ===============================
  if (shouldNavigate) {
    // ✅ กันเคส user ยังไม่มา แต่ store.auth มาแล้ว
    if (isEmpty(user) || isEmpty(user.branch)) {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 bg-white border border-blue-200 shadow-md rounded-lg">
          <div className="p-6 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              กำลังโหลดข้อมูลผู้ใช้...
            </p>
            <p className="text-sm text-gray-600">กรุณารอสักครู่</p>
          </div>
        </div>
      );
    }

    // OCR flow
    if (user.branch?.isCheckOcr === "1") {
      return isEmpty(ocrCode) ? (
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 bg-white border border-blue-200 shadow-md rounded-lg">
          <div className="p-6 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              กำลังสุ่มรหัส...
            </p>
            <p className="text-sm text-gray-600">กรุณารอสักครู่</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 bg-white border border-blue-200 shadow-md">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-4 lg:space-y-6 sm:p-8"
          >
            <div className="grid grid-cols-1 gap-3 justify-items-center items-center">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 lg:text-2xl text-center">
                กรุณาอัพโหลดรูปภาพที่มีการแนบบาร์โค้ด
              </h1>

              <div className="my-2">
                <BarcodeGenerator
                  value={{
                    catalog: "ocr",
                    code: ocrCode,
                  }}
                />
              </div>

              {productDetails && (
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    รายละเอียดอุปกรณ์
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div className="font-medium">CODE:</div>
                    <div>{productDetails.code || "-"}</div>

                    <div className="font-medium">IMEI:</div>
                    <div>{productDetails.imei || "-"}</div>

                    <div className="font-medium">รหัสสต็อกเก่า:</div>
                    <div>{productDetails.refOldStockNumber || "-"}</div>

                    <div className="font-medium">รุ่น:</div>
                    <div>{productDetails.productModel?.name || "-"}</div>

                    <div className="font-medium">สี:</div>
                    <div>{productDetails.productColor?.name || "-"}</div>

                    <div className="font-medium">ความจุ:</div>
                    <div>{productDetails.productStorage?.name || "-"}</div>
                  </div>
                </div>
              )}

              <p className="text-base text-gray-700 text-center">
                พร้อมกับเลข IMEI บนมือถือ
              </p>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="items-center col-span-2 lg:col-span-2">
                <label
                  htmlFor="uploadFileOcr"
                  className="block text-sm font-medium text-gray-700 mr-2"
                >
                  อัพโหลดไฟล์ png, jpeg, jpg
                </label>

                <FileDropzone
                  name="uploadFileOcr"
                  acceptedFileTypes={acceptedFileTypes}
                  control={control}
                  maxFileSize={5}
                  fileMultiple={false}
                  setValue={setValue}
                />
              </div>

              <button
                type="submit"
                onClick={() => setSubmissionType("ocr")}
                className="w-full bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-white"
              >
                ตรวจสอบรูปภาพ
              </button>
            </div>
          </form>
        </div>
      );
    }

    // role-based redirect (เหมือนเดิม)
    if (user.type === "ไฟแนนซ์") {
      return (
        <Navigate
          to={`/manageFinancialList`}
          state={{ from: location }}
          replace
        />
      );
    } else if (user.type === "admin-external") {
      return (
        <Navigate to={`/books/lists`} state={{ from: location }} replace />
      );
    } else {
      return <Navigate to={`/`} state={{ from: location }} replace />;
    }
  }

  // ===============================
  // LOGIN FORM
  // ===============================
  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 bg-white border border-blue-200 shadow-md">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 space-y-4 lg:space-y-6 sm:p-8"
      >
        <div className="grid grid-cols-1 gap-3 justify-items-center items-center">
          <img
            src={Thunder_logo}
            alt={import.meta.env.VITE_APP_NAME}
            className="h-28"
          />

          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 lg:text-2xl text-center">
            เข้าสู่ระบบ
            <span className="text-red-300">{` ${import.meta.env.VITE_APP_NAME}`}</span>
          </h1>
        </div>

        <div className="space-y-4 lg:space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              ชื่อผู้ใช้งาน
            </label>

            <Controller
              name="username"
              control={control}
              defaultValue=""
              rules={{ required: "Username is required" }}
              render={({ field }) => (
                <div>
                  <input
                    {...field}
                    type="text"
                    id="username"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-sky-600 focus:border-sky-600 block w-full p-2.5"
                  />
                  {errors.username && (
                    <span style={{ color: "red" }}>กรุณาใส่ชื่อผู้ใช้งาน</span>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              รหัสผ่าน
            </label>

            <Controller
              name="password"
              control={control}
              defaultValue=""
              rules={{ required: "Password is required" }}
              render={({ field }) => (
                <div>
                  <input
                    {...field}
                    type="password"
                    id="password"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-sky-600 focus:border-sky-600 block w-full p-2.5"
                  />
                  {errors.password && (
                    <span style={{ color: "red" }}>กรุณาใส่รหัสผ่าน</span>
                  )}
                </div>
              )}
            />
          </div>

          <button
            type="submit"
            onClick={() => setSubmissionType("login")}
            className="w-full bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-sky-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-white"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
