import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addCommissionProducts = createAsyncThunk(
  "appCommissionProducts/addCommissionProducts",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/change-product-commission`, item);
      
      const state = getState();
      
      const params = state.commissionProduct.params;
      dispatch(fetchCommissionProducts(params)); 
    } catch (error) {
      console.error("addCommissionProducts", error);
    }
  }
);

export const fetchCommissionProducts = createAsyncThunk(
  "appCommissionProducts/fetchCommissionProducts",
  async (item) => {
    try {
      const response = await axiosApi.post(
        `/change-product-commission/search`,
        item
      );
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchCommissionProducts", error);
    }
  }
);

export const fetchInfoCommissionProducts = createAsyncThunk(
  "appCommissionProducts/fetchInfoCommissionProducts",
  async (item) => {
    try {
      const response = await axiosApi.get(`/change-product-commission/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoCommissionProducts", error);
    }
  }
);

export const updateCommissionProducts = createAsyncThunk(
  "appCommissionProducts/updateCommissionProducts",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/change-product-commission/${item.id}`, item);
      
      const state = getState();
      
      const params = state.commissionProduct.params;
      dispatch(fetchCommissionProducts(params)); 
    } catch (error) {
      console.error("updateCommissionProducts", error);
    }
  }
);

export const appCommissionProductsSlice = createSlice({
  name: "appCommissionProducts",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommissionProducts.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoCommissionProducts.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appCommissionProductsSlice.reducer;
