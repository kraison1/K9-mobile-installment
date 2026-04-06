import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addTransferProduct = createAsyncThunk(
  "appTransferProducts/addTransferProduct",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/transfer-product-branch`, item);

      const state = getState();

      let params = state.transferProduct.params;
      if (item.catalog == "อุปกรณ์เสริม") {
        params = state.transferProduct.paramsAccessibility;
      } else if (item.catalog == "อะไหล่ซ่อม") {
        params = state.transferProduct.paramsRepair;
      }
      dispatch(fetchTransferProduct(params));
    } catch (error) {
      console.error("addTransferProduct", error);
    }
  }
);

export const fetchTransferProduct = createAsyncThunk(
  "appTransferProducts/fetchTransferProduct",
  async (item) => {
    try {
      const response = await axiosApi.post(
        `/transfer-product-branch/search`,
        item
      );

      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.log("fetchTransferProduct", error);
    }
  }
);

export const fetchInfoTransferProduct = createAsyncThunk(
  "appTransferProducts/fetchInfoTransferProduct",
  async (item) => {
    try {
      const response = await axiosApi.get(`/transfer-product-branch/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoTransferProduct", error);
    }
  }
);

export const updateTransferProduct = createAsyncThunk(
  "appTransferProducts/updateTransferProduct",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/transfer-product-branch/${item.id}`, item);

      const state = getState();

      let params = state.transferProduct.params;
      if (item.catalog == "อุปกรณ์เสริม") {
        params = state.transferProduct.paramsAccessibility;
      } else if (item.catalog == "อะไหล่ซ่อม") {
        params = state.transferProduct.paramsRepair;
      }

      dispatch(fetchTransferProduct(params));
    } catch (error) {
      console.error("updateTransferProduct", error);
    }
  }
);

export const appTransferProductsSlice = createSlice({
  name: "appTransferProducts",
  initialState: {
    params: {},
    allData: [],
    select: [],
    data: {},

    paramsAccessibility: {},
    allDataAccessibility: [],
    dataAccessibility: {},

    paramsRepair: {},
    allDataRepair: [],
    dataRepair: {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransferProduct.fulfilled, (state, action) => {
        const { catalog } = action.payload.params;
        if (catalog === "มือถือ") {
          state.params = action.payload.params;
          state.allData = action.payload.allData;
        } else if (catalog === "อุปกรณ์เสริม") {
          state.paramsAccessibility = action.payload.params;
          state.allDataAccessibility = action.payload.allData;
        } else if (catalog === "อะไหล่ซ่อม") {
          state.paramsRepair = action.payload.params;
          state.allDataRepair = action.payload.allData;
        }
      })
      .addCase(fetchInfoTransferProduct.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appTransferProductsSlice.reducer;
