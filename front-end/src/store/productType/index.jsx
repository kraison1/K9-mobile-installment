import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addProductTypes = createAsyncThunk(
  "appProductTypes/addProductTypes",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/product-types`, item);

      const state = getState();

      const params = state.productType.params;
      dispatch(fetchProductTypes(params));
    } catch (error) {
      console.error("addProductTypes", error);
    }
  }
);

export const fetchProductTypes = createAsyncThunk(
  "appProductTypes/fetchProductTypes",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-types/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductTypes", error);
    }
  }
);

export const fetchInfoProductTypes = createAsyncThunk(
  "appProductTypes/fetchInfoProductTypes",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-types/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductTypes", error);
    }
  }
);

export const fetchSelectProductTypes = createAsyncThunk(
  "appProductTypes/fetchSelectProductTypes",
  async (catalog) => {
    try {
      const response = await axiosApi.get(`/product-types/select/${catalog}`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProductTypes", error);
    }
  }
);

export const fetchSelectProductTypesAccessibility = createAsyncThunk(
  "appProductModels/fetchSelectProductTypesAccessibility",
  async (catalog) => {
    try {
      const response = await axiosApi.get(`/product-types/select/${catalog}`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProductTypesAccessibility", error);
    }
  }
);

export const fetchSelectProductTypesRepair = createAsyncThunk(
  "appProductModels/fetchSelectProductTypesRepair",
  async (catalog) => {
    try {
      const response = await axiosApi.get(`/product-types/select/${catalog}`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProductTypesRepair", error);
    }
  }
);

export const updateProductTypes = createAsyncThunk(
  "appProductTypes/updateProductTypes",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/product-types/${item.id}`, item);

      const state = getState();

      const params = state.productType.params;
      dispatch(fetchProductTypes(params));
    } catch (error) {
      console.error("updateProductTypes", error);
    }
  }
);

export const appProductTypessSlice = createSlice({
  name: "appProductTypes",
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
      .addCase(fetchProductTypes.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProductTypes.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProductTypes.fulfilled, (state, action) => {
        state.select = action.payload;
      })
      .addCase(
        fetchSelectProductTypesAccessibility.fulfilled,
        (state, action) => {
          state.selectAccessibility = action.payload;
        }
      )
      .addCase(fetchSelectProductTypesRepair.fulfilled, (state, action) => {
        state.selectRepair = action.payload;
      });
  },
});

export default appProductTypessSlice.reducer;
