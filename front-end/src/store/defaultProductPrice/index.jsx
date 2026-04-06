import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addDefaultProductPrice = createAsyncThunk(
  "appDefaultProductPrice/addDefaultProductPrice",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/default-product-prices`, item);

      const state = getState();

      const params = state.defaultProductPrice.params;
      dispatch(fetchDefaultProductPrice(params));
    } catch (error) {
      console.error("addDefaultProductPrice", error);
    }
  }
);

export const fetchDefaultProductPrice = createAsyncThunk(
  "appDefaultProductPrice/fetchDefaultProductPrice",
  async (item) => {
    try {
      const response = await axiosApi.post(
        `/default-product-prices/search`,
        item
      );
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchDefaultProductPrice", error);
    }
  }
);

export const fetchInfoDefaultProductPrice = createAsyncThunk(
  "appDefaultProductPrice/fetchInfoDefaultProductPrice",
  async (item) => {
    try {
      const response = await axiosApi.get(`/default-product-prices/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoDefaultProductPrice", error);
    }
  }
);

export const fetchSelectDefaultProductPrice = createAsyncThunk(
  "appDefaultProductPrice/fetchSelectDefaultProductPrice",
  async () => {
    try {
      const response = await axiosApi.get(`/default-product-prices/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectDefaultProductPrice", error);
    }
  }
);

export const updateDefaultProductPrice = createAsyncThunk(
  "appDefaultProductPrice/updateDefaultProductPrice",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/default-product-prices/${item.id}`, item);

      const state = getState();

      const params = state.defaultProductPrice.params;
      dispatch(fetchDefaultProductPrice(params));
    } catch (error) {
      console.error("updateDefaultProductPrice", error);
    }
  }
);

export const appDefaultProductPricesSlice = createSlice({
  name: "appDefaultProductPrice",
  initialState: {
    params: {},
    data: {},
    select: [],
    selectAccessibility: [],
    selectRepair: [],
    allData: [],
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDefaultProductPrice.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoDefaultProductPrice.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectDefaultProductPrice.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appDefaultProductPricesSlice.reducer;
