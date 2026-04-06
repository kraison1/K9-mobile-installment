import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addBank = createAsyncThunk(
  "appBanks/addBank",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/banks`, item);

      const state = getState();

      const params = state.bank.params;
      dispatch(fetchBank(params));
    } catch (error) {
      console.error("addBank", error);
    }
  }
);

export const fetchBank = createAsyncThunk(
  "appBanks/fetchBank",
  async (item) => {
    try {
      const response = await axiosApi.post(`/banks/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchBank", error);
    }
  }
);

export const fetchInfoBank = createAsyncThunk(
  "appBanks/fetchInfoBank",
  async (item) => {
    try {
      const response = await axiosApi.get(`/banks/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoBank", error);
    }
  }
);

export const fetchSelectBank = createAsyncThunk(
  "appBanks/fetchSelectBank",
  async (bookType) => {
    try {
      const response = await axiosApi.get(`/banks/select/${bookType}`);
      return {
        bookType: bookType,
        data: response.data,
      };
    } catch (error) {
      console.error("fetchSelectBank", error);
    }
  }
);

export const updateBank = createAsyncThunk(
  "appBanks/updateBank",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/banks/${item.id}`, item);

      const state = getState();

      const params = state.bank.params;
      dispatch(fetchBank(params));
    } catch (error) {
      console.error("updateBank", error);
    }
  }
);

export const appBanksSlice = createSlice({
  name: "appBanks",
  initialState: {
    params: {},
    data: {},
    select: [],
    selectPay: [],
    selectPaySaving: [],
    selectPayExpense: [],
    selectPayBranchTransferPrice: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBank.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoBank.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectBank.fulfilled, (state, action) => {
        if (action.payload.bookType == "2") {
          state.selectPay = action.payload.data;
        } else if (action.payload.bookType == "5") {
          state.selectPaySaving = action.payload.data;
        } else if (action.payload.bookType == "6") {
          state.selectPayExpense = action.payload.data;
        } else if (action.payload.bookType == "7") {
          state.selectPayBranchTransferPrice = action.payload.data;
        } else if (action.payload.bookType == "8") {
          state.selectPayBranchTransferPrice = action.payload.data;
        } else {
          state.select = action.payload.data;
        }
      });
  },
});

export default appBanksSlice.reducer;
