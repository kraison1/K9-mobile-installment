import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addExpenseType = createAsyncThunk(
  "appExpenseTypes/addExpenseType",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/expense-types`, item);
      
      const state = getState();
      
      const params = state.expenseType.params;
      dispatch(fetchExpenseType(params)); 
    } catch (error) {
      console.error("addExpenseType", error);
    }
  }
);

export const fetchExpenseType = createAsyncThunk(
  "appExpenseTypes/fetchExpenseType",
  async (item) => {
    try {
      const response = await axiosApi.post(`/expense-types/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchExpenseType", error);
    }
  }
);

export const fetchInfoExpenseType = createAsyncThunk(
  "appExpenseTypes/fetchInfoExpenseType",
  async (item) => {
    try {
      const response = await axiosApi.get(`/expense-types/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoExpenseType", error);
    }
  }
);

export const fetchSelectExpenseType = createAsyncThunk(
  "appExpenseTypes/fetchSelectExpenseType",
  async () => {
    try {
      const response = await axiosApi.get(`/expense-types/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectExpenseType", error);
    }
  }
);

export const updateExpenseType = createAsyncThunk(
  "appExpenseTypes/updateExpenseType",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/expense-types/${item.id}`, item);
      
      const state = getState();
      
      const params = state.expenseType.params;
      dispatch(fetchExpenseType(params)); 
    } catch (error) {
      console.error("updateExpenseType", error);
    }
  }
);

export const appExpenseTypesSlice = createSlice({
  name: "appExpenseTypes",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenseType.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoExpenseType.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectExpenseType.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appExpenseTypesSlice.reducer;
