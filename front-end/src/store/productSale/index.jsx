/* eslint-disable no-unsafe-optional-chaining */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";
import { fetchProductPayMentLists } from "../productPayMentList";
import { sizePerPage } from "src/helpers/sizePerPage";
import { fetchProductPayMentImages } from "../productPayMentImage";
import { error as alertError } from "src/components/alart";
import { fetchProcessBook } from "../processBook";
import { isNumber } from "lodash";
import { fetchPaySaving } from "../productSaving";
import { fetchProcessManageFinance } from "../manageFinancial";

export const addProductSale = createAsyncThunk(
  "appProductSale/addProductSale",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/product-sale`, item);

      if (isNaN(item.processManageFinanceId)) {
        if (item.productBookId == undefined) {
          const state = getState();

          const params =
            item.isMobileSale == "1"
              ? item.isCash == "1"
                ? state.productSale.paramsMobileCash
                : state.productSale.paramsMobile
              : state.productSale.params;

          dispatch(fetchProductSale(params));
        } else if (isNumber(item.productBookId)) {
          const state = getState();

          const params = state.processBook.params;

          dispatch(fetchProcessBook(params));
        } else if (isNumber(item.productSavingId)) {
          const state = getState();

          const params = state.processSaving.params;

          dispatch(fetchPaySaving(params));
        }
      } else {
        if (!isNaN(item.processManageFinanceId)) {
          const state = getState();
          const params = state.manageFinancial.params;
          dispatch(fetchProcessManageFinance(params));
        }
      }
    } catch (error) {
      console.error("addProductSale", error);
    }
  }
);

export const fetchProductSale = createAsyncThunk(
  "appProductSale/fetchProductSale",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-sale/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductSale", error);
    }
  }
);

export const fetchPayDownList = createAsyncThunk(
  "appProductSale/fetchPayDownList",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-sale/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchPayDownList", error);
    }
  }
);

export const notifyContactAgain = createAsyncThunk(
  "appProductSale/notifyContactAgain",
  async (item) => {
    try {
      await axiosApi.get(`/product-sale/notifyContact/${item.id}/${item.type}`);
    } catch (error) {
      console.error("notifyContact", error);
    }
  }
);

export const fetchPayDown = createAsyncThunk(
  "appProductSale/fetchPayDown",
  async (item, { dispatch }) => {
    try {
      const response = await axiosApi.get(`/product-sale/getPayDown/${item}`);
      const { message_error } = response?.data;

      dispatch(
        fetchProductPayMentLists({
          search: item,
          page: 1,
          pageSize: sizePerPage(),
        })
      );

      dispatch(
        fetchProductPayMentImages({
          search: item,
          page: 1,
          pageSize: sizePerPage(),
        })
      );

      if (!message_error) {
        return {
          params: item,
          allData: response.data,
        };
      } else {
        return {
          params: item,
          allData: {},
        };
      }
    } catch (error) {
      console.error("fetchPayDown", error);
    }
  }
);

export const fetchInfoProductSale = createAsyncThunk(
  "appProductSale/fetchInfoProductSale",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-sale/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductSale", error);
    }
  }
);

export const fetchProfit = createAsyncThunk(
  "appProductSale/fetchProfit",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-sale/getProfit`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProfit", error);
    }
  }
);

export const fetchSummaryProfit = createAsyncThunk(
  "appProductSale/fetchSummaryProfit",
  async (item) => {
    try {
      const response = await axiosApi.post(
        `/product-sale/getSummaryProfit`,
        item
      );
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchSummaryProfit", error);
    }
  }
);

export const updateProductSale = createAsyncThunk(
  "appProductSale/updateProductSale",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/product-sale/${item.id}`, item);
      if (item.isMobileSale == "1") {
        dispatch(fetchPayDown(item.code));
      }

      const state = getState();
      let params = state.productSale.paramsMobile;

      if (item.isMobileSale == "0") {
        params = state.productSale.params;
      }

      dispatch(fetchProductSale(params));
    } catch (error) {
      console.error("updateProductSale", error);
    }
  }
);

export const changeStatusProductSale = createAsyncThunk(
  "appProductSale/changeStatusProductSale",
  async (item, { dispatch }) => {
    try {
      await axiosApi.patchForm(`/product-sale/changeStatus/${item.id}`, item);
      dispatch(fetchPayDown(item.code));
    } catch (error) {
      console.error("changeStatusProductSale", error);
    }
  }
);

export const contractProductSale = createAsyncThunk(
  "appProductSale/contractProductSale",
  async (item, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get(
        `/product-sale/printContract/${item.id}/${item.financeId}`,
        {
          responseType: "blob",
        }
      );

      // กรณีสำเร็จ: สร้าง PDF URL จาก Blob
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      return pdfUrl;
    } catch (error) {
      // console.error("contractProductSale error:", error);

      // กรณีเกิด error: ตรวจสอบว่า backend ส่ง message_error กลับมาหรือไม่
      if (error.response) {
        // ถ้า response เป็น Blob (เช่น backend ส่ง JSON แต่ถูกตีความเป็น Blob เนื่องจาก responseType)
        const reader = new FileReader();
        reader.readAsText(error.response.data); // อ่าน Blob เป็น text
        return new Promise((resolve, reject) => {
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result); // แปลง text เป็น JSON
              const messageError =
                errorData?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
              alertError(messageError);
              reject(rejectWithValue(messageError)); // ส่ง message_error ไปใน rejectWithValue
            } catch (e) {
              reject(rejectWithValue("ไม่สามารถอ่านข้อความข้อผิดพลาดได้"));
            }
          };
          reader.onerror = () =>
            reject(rejectWithValue("เกิดข้อผิดพลาดในการอ่านข้อมูล"));
        });
      } else {
        // กรณีไม่มี response (เช่น network error)
        return rejectWithValue("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    }
  }
);

export const slipProductSale = createAsyncThunk(
  "appProductSale/contractProductSale",
  async (item, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get(`/product-sale/printSlip/${item}`, {
        responseType: "blob",
      });

      // กรณีสำเร็จ: สร้าง PDF URL จาก Blob
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      return pdfUrl;
    } catch (error) {
      // console.error("contractProductSale error:", error);

      // กรณีเกิด error: ตรวจสอบว่า backend ส่ง message_error กลับมาหรือไม่
      if (error.response) {
        // ถ้า response เป็น Blob (เช่น backend ส่ง JSON แต่ถูกตีความเป็น Blob เนื่องจาก responseType)
        const reader = new FileReader();
        reader.readAsText(error.response.data); // อ่าน Blob เป็น text
        return new Promise((resolve, reject) => {
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result); // แปลง text เป็น JSON
              const messageError =
                errorData?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
              alertError(messageError);
              reject(rejectWithValue(messageError)); // ส่ง message_error ไปใน rejectWithValue
            } catch (e) {
              reject(rejectWithValue("ไม่สามารถอ่านข้อความข้อผิดพลาดได้"));
            }
          };
          reader.onerror = () =>
            reject(rejectWithValue("เกิดข้อผิดพลาดในการอ่านข้อมูล"));
        });
      } else {
        // กรณีไม่มี response (เช่น network error)
        return rejectWithValue("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    }
  }
);

export const printPaymentList = createAsyncThunk(
  "appProductSale/printPaymentList",
  async (item, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get(
        `/product-sale/printPaymentList/${item}`,
        {
          responseType: "blob",
        }
      );

      // กรณีสำเร็จ: สร้าง PDF URL จาก Blob
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      return pdfUrl;
    } catch (error) {
      // console.error("printPaymentList error:", error);

      // กรณีเกิด error: ตรวจสอบว่า backend ส่ง message_error กลับมาหรือไม่
      if (error.response) {
        // ถ้า response เป็น Blob (เช่น backend ส่ง JSON แต่ถูกตีความเป็น Blob เนื่องจาก responseType)
        const reader = new FileReader();
        reader.readAsText(error.response.data); // อ่าน Blob เป็น text
        return new Promise((resolve, reject) => {
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result); // แปลง text เป็น JSON
              const messageError =
                errorData?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
              alertError(messageError);
              reject(rejectWithValue(messageError)); // ส่ง message_error ไปใน rejectWithValue
            } catch (e) {
              reject(rejectWithValue("ไม่สามารถอ่านข้อความข้อผิดพลาดได้"));
            }
          };
          reader.onerror = () =>
            reject(rejectWithValue("เกิดข้อผิดพลาดในการอ่านข้อมูล"));
        });
      } else {
        // กรณีไม่มี response (เช่น network error)
        return rejectWithValue("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    }
  }
);

export const printAccessibilityList = createAsyncThunk(
  "appProductSale/printAccessibilityList",
  async (item, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get(
        `/product-sale/printAccessibilityList/${item}`,
        {
          responseType: "blob",
        }
      );

      // กรณีสำเร็จ: สร้าง PDF URL จาก Blob
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      return pdfUrl;
    } catch (error) {
      // console.error("printAccessibilityList error:", error);

      // กรณีเกิด error: ตรวจสอบว่า backend ส่ง message_error กลับมาหรือไม่
      if (error.response) {
        // ถ้า response เป็น Blob (เช่น backend ส่ง JSON แต่ถูกตีความเป็น Blob เนื่องจาก responseType)
        const reader = new FileReader();
        reader.readAsText(error.response.data); // อ่าน Blob เป็น text
        return new Promise((resolve, reject) => {
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result); // แปลง text เป็น JSON
              const messageError =
                errorData?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
              alertError(messageError);
              reject(rejectWithValue(messageError)); // ส่ง message_error ไปใน rejectWithValue
            } catch (e) {
              reject(rejectWithValue("ไม่สามารถอ่านข้อความข้อผิดพลาดได้"));
            }
          };
          reader.onerror = () =>
            reject(rejectWithValue("เกิดข้อผิดพลาดในการอ่านข้อมูล"));
        });
      } else {
        // กรณีไม่มี response (เช่น network error)
        return rejectWithValue("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    }
  }
);

export const reportProductById = createAsyncThunk(
  "appProductSale/reportProductById",
  async (item, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get(
        `/product-sale/reportProductById/${item}`,
        {
          responseType: "blob",
        }
      );

      // กรณีสำเร็จ: สร้าง PDF URL จาก Blob
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      return pdfUrl;
    } catch (error) {
      // console.error("reportProductById error:", error);

      // กรณีเกิด error: ตรวจสอบว่า backend ส่ง message_error กลับมาหรือไม่
      if (error.response) {
        // ถ้า response เป็น Blob (เช่น backend ส่ง JSON แต่ถูกตีความเป็น Blob เนื่องจาก responseType)
        const reader = new FileReader();
        reader.readAsText(error.response.data); // อ่าน Blob เป็น text
        return new Promise((resolve, reject) => {
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result); // แปลง text เป็น JSON
              const messageError =
                errorData?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
              alertError(messageError);
              reject(rejectWithValue(messageError)); // ส่ง message_error ไปใน rejectWithValue
            } catch (e) {
              reject(rejectWithValue("ไม่สามารถอ่านข้อความข้อผิดพลาดได้"));
            }
          };
          reader.onerror = () =>
            reject(rejectWithValue("เกิดข้อผิดพลาดในการอ่านข้อมูล"));
        });
      } else {
        // กรณีไม่มี response (เช่น network error)
        return rejectWithValue("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    }
  }
);

export const deleteProductSale = createAsyncThunk(
  "appProductSale/delete",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.delete(`/product-sale/${item.id}`);
      const state = getState();
      let params = state.productSale.paramsMobile;

      if (item.isMobileSale == "0") {
        params = state.productSale.params;
      }

      dispatch(fetchProductSale(params));
    } catch (error) {
      console.error("delete", error);
    }
  }
);

export const appProductSalesSlice = createSlice({
  name: "appProductSale",
  initialState: {
    params: {},
    paramsPayDown: {},
    paramsMobile: {},
    paramsMobileCash: {},
    paramsPay: {},
    paramsProfit: {},
    paramsSummaryProfit: {},

    data: {},
    dataPay: {},
    select: [],
    allData: [],
    allDataPayDown: [],
    allDataMobile: [],
    allDataMobileCash: [],
    allDataProfit: [],
    allDataSummaryProfit: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductSale.fulfilled, (state, action) => {
        if (action.payload.params.isMobileSale == "0") {
          state.params = action.payload.params;
          state.allData = action.payload.allData;
        } else if (
          action.payload.params.isMobileSale == "1" &&
          action.payload.params.isCash == "1"
        ) {
          state.paramsMobileCash = action.payload.params;
          state.allDataMobileCash = action.payload.allData;
        } else {
          state.paramsMobile = action.payload.params;
          state.allDataMobile = action.payload.allData;
        }
      })
      .addCase(fetchPayDownList.fulfilled, (state, action) => {
        state.allDataPayDown = action.payload.allData;
        state.paramsPayDown = action.payload.params;
      })
      .addCase(fetchInfoProductSale.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchProfit.fulfilled, (state, action) => {
        state.allDataProfit = action.payload.allData;
        state.paramsProfit = action.payload.params;
      })
      .addCase(fetchSummaryProfit.fulfilled, (state, action) => {
        state.allDataSummaryProfit = action.payload.allData;
        state.paramsSummaryProfit = action.payload.params;
      })
      .addCase(fetchPayDown.fulfilled, (state, action) => {
        state.paramsPay = {
          ContactCode: action.payload.params,
        };
        state.dataPay = action.payload.allData;
      });
  },
});

export default appProductSalesSlice.reducer;
