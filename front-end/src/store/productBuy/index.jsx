import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";
import { error as alartError } from "src/components/alart";

export const addProductBuy = createAsyncThunk(
  "appProductBuy/addProductBuy",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/product-buy`, item);

      const state = getState();

      const params = state.productBuy.params;
      dispatch(fetchProductBuy(params));
    } catch (error) {
      console.error("addProductBuy", error);
    }
  }
);

export const fetchProductBuy = createAsyncThunk(
  "appProductBuy/fetchProductBuy",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-buy/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductBuy", error);
    }
  }
);

export const fetchInfoProductBuy = createAsyncThunk(
  "appProductBuy/fetchInfoProductBuy",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-buy/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductBuy", error);
    }
  }
);

export const fetchSelectProductBuy = createAsyncThunk(
  "appProductBuy/fetchSelectProductBuy",
  async () => {
    try {
      const response = await axiosApi.get(`/product-buy/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProductBuy", error);
    }
  }
);

export const reportListBuy = createAsyncThunk(
  "appProductSale/reportListBuy",
  async (item, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get(
        `/product-buy/reportListBuy/${item}`,
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

export const updateProductBuy = createAsyncThunk(
  "appProductBuy/updateProductBuy",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/product-buy/${item.id}`, item);

      const state = getState();

      const params = state.productBuy.params;
      dispatch(fetchProductBuy(params));
    } catch (error) {
      console.error("updateProductBuy", error);
    }
  }
);

export const appProductBuySlice = createSlice({
  name: "appProductBuy",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductBuy.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProductBuy.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProductBuy.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appProductBuySlice.reducer;
