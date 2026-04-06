import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";
import { error as alertError } from "src/components/alart";

export const addRatePurchase = createAsyncThunk(
  "appRatePurchase/addRatePurchase",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/rate-purchase`, item);

      const state = getState();

      const params = state.ratePurchase.params;
      dispatch(fetchRatePurchase(params));
    } catch (error) {
      console.error("addRatePurchase", error);
    }
  }
);

export const fetchRatePurchase = createAsyncThunk(
  "appRatePurchase/fetchRatePurchase",
  async (item) => {
    try {
      const response = await axiosApi.post(`/rate-purchase/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchRatePurchase", error);
    }
  }
);

export const fetchInfoRatePurchase = createAsyncThunk(
  "appRatePurchase/fetchInfoRatePurchase",
  async (item) => {
    try {
      const response = await axiosApi.get(`/rate-purchase/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoRatePurchase", error);
    }
  }
);

export const fetchSelectRatePurchasePrice = createAsyncThunk(
  "appRatePurchase/fetchSelectRatePurchasePrice",
  async (item) => {
    try {
      const response = await axiosApi.get(
        `/rate-purchase/findPrice/${item.productModelId}/${item.productStorageId}/${item.hand}`
      );
      return response.data;
    } catch (error) {
      console.error("fetchSelectRatePurchasePrice", error);
    }
  }
);

export const updateRatePurchase = createAsyncThunk(
  "appRatePurchase/updateRatePurchase",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/rate-purchase/${item.id}`, item);

      const state = getState();

      const params = state.ratePurchase.params;
      dispatch(fetchRatePurchase(params));
    } catch (error) {
      console.error("updateRatePurchase", error);
    }
  }
);

export const getPdfRatePurchase = createAsyncThunk(
  "appRatePurchase/getPdfRatePurchase",
  async (item, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get(`/rate-purchase/pefRatePurchase`, {
        responseType: "blob",
      });

      // กรณีสำเร็จ: สร้าง PDF URL จาก Blob
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      return pdfUrl;
    } catch (error) {
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

export const appRatePurchaseSlice = createSlice({
  name: "appRatePurchase",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRatePurchase.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoRatePurchase.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appRatePurchaseSlice.reducer;
