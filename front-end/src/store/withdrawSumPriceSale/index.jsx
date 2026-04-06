import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { isEmpty } from "lodash";
import axiosApi from "src/helpers/api";

export const addWithdrawSumPriceSale = createAsyncThunk(
  "appWithdrawSumPriceSales/addWithdrawSumPriceSale",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/withdrawSumPriceSale`, item);

      const state = getState();

      const params = state.withdrawSumPriceSale.params;
      if (!isEmpty(params)) {
        dispatch(fetchWithdrawSumPriceSale(params));
      }
    } catch (error) {
      console.error("addWithdrawSumPriceSale", error);
    }
  }
);

export const fetchWithdrawSumPriceSale = createAsyncThunk(
  "appWithdrawSumPriceSales/fetchWithdrawSumPriceSale",
  async (item) => {
    try {
      const response = await axiosApi.post(
        `/withdrawSumPriceSale/search`,
        item
      );
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchWithdrawSumPriceSale", error);
    }
  }
);

export const fetchInfoWithdrawSumPriceSale = createAsyncThunk(
  "appWithdrawSumPriceSales/fetchInfoWithdrawSumPriceSale",
  async (item) => {
    try {
      const response = await axiosApi.get(`/withdrawSumPriceSale/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoWithdrawSumPriceSale", error);
    }
  }
);

export const updateWithdrawSumPriceSale = createAsyncThunk(
  "appWithdrawSumPriceSales/updateWithdrawSumPriceSale",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/withdrawSumPriceSale/${item.id}`, item);

      const state = getState();

      const params = state.withdrawSumPriceSale.params;
      if (!isEmpty(params)) {
        dispatch(fetchWithdrawSumPriceSale(params));
      }
    } catch (error) {
      console.error("updateWithdrawSumPriceSale", error);
    }
  }
);

export const deleteWithdrawSumPriceSale = createAsyncThunk(
  "appCustomers/deleteWithdrawSumPriceSale",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.delete(`/withdrawSumPriceSale/${item.id}`);

      const state = getState();

      const params = state.withdrawSumPriceSale.params;
      dispatch(fetchWithdrawSumPriceSale(params));
    } catch (error) {
      console.error("deleteWithdrawSumPriceSale", error);
    }
  }
);

export const appWithdrawSumPriceSalesSlice = createSlice({
  name: "appWithdrawSumPriceSales",
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
      .addCase(fetchWithdrawSumPriceSale.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoWithdrawSumPriceSale.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appWithdrawSumPriceSalesSlice.reducer;
