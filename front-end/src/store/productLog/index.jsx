import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";
import { error as alartError } from "src/components/alart";

export const addProductLogs = createAsyncThunk(
  "appProductLogs/addProductLogs",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/product-logs`, item);

      const state = getState();

      const params = state.productLog.params;
      dispatch(fetchProductLogs(params));
    } catch (error) {
      console.error("addProductLogs", error);
    }
  }
);

export const fetchProductLogs = createAsyncThunk(
  "appProductLogs/fetchProductLogs",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-logs/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductLogs", error);
    }
  }
);

export const findByProductId = createAsyncThunk(
  "appProductLogs/findByProductId",
  async (item) => {
    try {
      const response = await axiosApi.get(
        `/product-logs/findByProductId/${item}`
      );

      return {
        id: response.data,
      };
    } catch (error) {
      console.error("findByProductId", error);
    }
  }
);

export const reportListBuy = createAsyncThunk(
  "appProductLogs/reportListBuy",
  async (item, { rejectWithValue }) => {
    try {
      const response = await axiosApi.postForm(
        `/product-logs/reportListBuy`,
        item,
        {
          responseType: "blob",
        }
      );

      // กรณีสำเร็จ: สร้าง PDF URL จาก Blob
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      return pdfUrl;
    } catch (error) {
      // console.error("reportListBuy error:", error);

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
              alartError(messageError);
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

export const fetchInfoProductLogs = createAsyncThunk(
  "appProductLogs/fetchInfoProductLogs",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-logs/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductLogs", error);
    }
  }
);

export const fetchSelectProductLogs = createAsyncThunk(
  "appProductLogs/fetchSelectProductLogs",
  async () => {
    try {
      const response = await axiosApi.get(`/product-logs/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProductLogs", error);
    }
  }
);

export const updateProductLogs = createAsyncThunk(
  "appProductLogs/updateProductLogs",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/product-logs/${item.id}`, item);

      const state = getState();

      const params = state.productLog.params;
      dispatch(fetchProductLogs(params));
    } catch (error) {
      console.error("updateProductLogs", error);
    }
  }
);

export const appProductLogssSlice = createSlice({
  name: "appProductLogs",
  initialState: {
    params: {},
    paramBuys: {},

    data: {},
    select: [],
    allData: [],
    allDataBuy: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductLogs.fulfilled, (state, action) => {
        if (action.payload.params.isBuy == "1") {
          state.paramBuys = action.payload.params;
          state.allDataBuy = action.payload.allData;
        } else {
          state.params = action.payload.params;
          state.allData = action.payload.allData;
        }
      })
      .addCase(fetchInfoProductLogs.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProductLogs.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appProductLogssSlice.reducer;
