import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";
import { error as alartError } from "src/components/alart";

export const addExpenses = createAsyncThunk(
  "appExpenses/addExpenses",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/expenses`, item);

      const state = getState();

      const params = state.expenses.params;
      dispatch(fetchExpenses(params));
    } catch (error) {
      console.error("addExpenses", error);
    }
  }
);

export const fetchExpenses = createAsyncThunk(
  "appExpenses/fetchExpenses",
  async (item) => {
    try {
      const response = await axiosApi.post(`/expenses/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchExpenses", error);
    }
  }
);

export const fetchInfoExpenses = createAsyncThunk(
  "appExpenses/fetchInfoExpenses",
  async (item) => {
    try {
      const response = await axiosApi.get(`/expenses/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoExpenses", error);
    }
  }
);

export const fetchSelectExpenses = createAsyncThunk(
  "appExpenses/fetchSelectExpenses",
  async () => {
    try {
      const response = await axiosApi.get(`/expenses/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectExpenses", error);
    }
  }
);

export const updateExpense = createAsyncThunk(
  "appExpenses/updateExpense",
  async (item, { dispatch, getState }) => {
    try {
      const response = await axiosApi.patchForm(`/expenses/${item.id}`, item);

      const state = getState();

      const params = state.expenses.params;
      dispatch(fetchExpenses(params));

      return response?.data;
    } catch (error) {
      console.error("updateExpense", error);
    }
  }
);

export const deleteExpenses = createAsyncThunk(
  "appExpenses/deleteExpenses",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.delete(`/expenses/${item.id}`);

      const state = getState();

      const params = state.expenses.params;
      dispatch(fetchExpenses(params));
    } catch (error) {
      console.error("deleteExpenses", error);
    }
  }
);

export const exportExpenses = createAsyncThunk(
  "appExpenses/printExpensesPdf",
  async (item, { rejectWithValue }) => {
    try {
      const response = await axiosApi.post(`/expenses/printExpensesPdf`, item, {
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

export const appExpensesSlice = createSlice({
  name: "appExpenses",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoExpenses.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectExpenses.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appExpensesSlice.reducer;
