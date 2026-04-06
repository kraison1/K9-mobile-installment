import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addBranchTransferPrice = createAsyncThunk(
  "appBranchTransferPrice/addBranchTransferPrice",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/branch-transfer-price`, item);

      const state = getState();

      const params = state.branchTransferPrice.params;
      dispatch(fetchBranchTransferPrice(params));
    } catch (error) {
      console.error("addBranchTransferPrice", error);
    }
  }
);

export const fetchBranchTransferPrice = createAsyncThunk(
  "appBranchTransferPrice/fetchBranchTransferPrice",
  async (item) => {
    try {
      const response = await axiosApi.post(
        `/branch-transfer-price/search`,
        item
      );
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchBranchTransferPrice", error);
    }
  }
);

export const fetchInfoBranchTransferPrice = createAsyncThunk(
  "appBranchTransferPrice/fetchInfoBranchTransferPrice",
  async (item) => {
    try {
      const response = await axiosApi.get(`/branch-transfer-price/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoBranchTransferPrice", error);
    }
  }
);

export const fetchSelectBranchTransferPrice = createAsyncThunk(
  "appBranchTransferPrice/fetchSelectBranchTransferPrice",
  async () => {
    try {
      const response = await axiosApi.get(`/branch-transfer-price/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectBranchTransferPrice", error);
    }
  }
);

export const updateBranchTransferPrice = createAsyncThunk(
  "appCustomers/updateBranchTransferPrice",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/branch-transfer-price/${item.id}`, item);

      const state = getState();

      const params = state.branchTransferPrice.params;
      // console.log("params", params);
      dispatch(fetchBranchTransferPrice(params));
    } catch (error) {
      console.error("updateBranchTransferPrice", error);
    }
  }
);

export const deleteBranchTransferPrice = createAsyncThunk(
  "appBranchTransferPrice/deleteBranchTransferPrice",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.delete(`/branch-transfer-price/${item.id}`);

      const state = getState();

      const params = state.branchTransferPrice.params;
      dispatch(fetchBranchTransferPrice(params));
    } catch (error) {
      console.error("deleteBranchTransferPrice", error);
    }
  }
);

export const appBranchTransferPriceSlice = createSlice({
  name: "appBranchTransferPrice",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranchTransferPrice.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoBranchTransferPrice.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectBranchTransferPrice.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appBranchTransferPriceSlice.reducer;
