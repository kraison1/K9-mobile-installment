import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";
import { error as alertError } from "src/components/alart";

export const addFinanceTable = createAsyncThunk(
  "appFinanceTable/addFinanceTable",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/finance-table`, item);

      const state = getState();

      const params = state.rateFinance.params;
      dispatch(fetchFinanceTable(params));
    } catch (error) {
      console.error("addFinanceTable", error);
    }
  }
);

export const printTableBrand = createAsyncThunk(
  "appFinanceTable/tableBrand",
  async (item, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get(`/finance-table/tableBrand/${item}`, {
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

export const fetchFinanceTable = createAsyncThunk(
  "appFinanceTable/fetchFinanceTable",
  async () => {
    try {
      const response = await axiosApi.get(`/finance-table`);

      return {
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchFinanceTable", error);
    }
  }
);

export const fetchInfoFinanceTable = createAsyncThunk(
  "appFinanceTable/fetchInfoFinanceTable",
  async (item) => {
    try {
      const response = await axiosApi.get(`/finance-table/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoFinanceTable", error);
    }
  }
);

export const fetchSelectFinanceTable = createAsyncThunk(
  "appFinanceTable/fetchSelectFinanceTable",
  async (item) => {
    try {
      const response = await axiosApi.get(
        `/finance-table/select/${item.branchId}`
      );
      return response.data;
    } catch (error) {
      console.error("fetchSelectFinanceTable", error);
    }
  }
);

export const updateFinanceTable = createAsyncThunk(
  "appFinanceTable/updateFinanceTable",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/finance-table/${item.id}`, item);

      const state = getState();

      const params = state.rateFinance.params;
      dispatch(fetchFinanceTable(params));
    } catch (error) {
      console.error("updateFinanceTable", error);
    }
  }
);

export const appFinanceTableSlice = createSlice({
  name: "appFinanceTable",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinanceTable.fulfilled, (state, action) => {
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoFinanceTable.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectFinanceTable.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appFinanceTableSlice.reducer;
