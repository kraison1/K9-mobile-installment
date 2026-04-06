import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addPriceProducts = createAsyncThunk(
  "appPriceProducts/addPriceProducts",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/change-product-price`, item);

      const state = getState();

      const params = state.priceProduct.params;
      dispatch(fetchPriceProducts(params));
    } catch (error) {
      console.error("addPriceProducts", error);
    }
  }
);

export const fetchPriceProducts = createAsyncThunk(
  "appPriceProducts/fetchPriceProducts",
  async (item) => {
    try {
      const response = await axiosApi.post(
        `/change-product-price/search`,
        item
      );
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchPriceProducts", error);
    }
  }
);

export const fetchInfoPriceProducts = createAsyncThunk(
  "appPriceProducts/fetchInfoPriceProducts",
  async (item) => {
    try {
      const response = await axiosApi.get(`/change-product-price/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoPriceProducts", error);
    }
  }
);

export const updatePriceProducts = createAsyncThunk(
  "appPriceProducts/updatePriceProducts",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/change-product-price/${item.id}`, item);

      const state = getState();

      const params = state.priceProduct.params;
      dispatch(fetchPriceProducts(params));
    } catch (error) {
      console.error("updatePriceProducts", error);
    }
  }
);

export const appPriceProductsSlice = createSlice({
  name: "appPriceProducts",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPriceProducts.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoPriceProducts.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appPriceProductsSlice.reducer;
