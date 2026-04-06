import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addProductBrands = createAsyncThunk(
  "appProductBrands/addProductBrands",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/product-brands`, item);

      const state = getState();

      const params = state.productBrand.params;
      dispatch(fetchProductBrands(params));
    } catch (error) {
      console.error("addProductBrands", error);
    }
  }
);

export const fetchProductBrands = createAsyncThunk(
  "appProductBrands/fetchProductBrands",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-brands/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductBrands", error);
    }
  }
);

export const fetchInfoProductBrands = createAsyncThunk(
  "appProductBrands/fetchInfoProductBrands",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-brands/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductBrands", error);
    }
  }
);

export const fetchSelectProductBrands = createAsyncThunk(
  "appProductBrands/fetchSelectProductBrands",
  async () => {
    try {
      const response = await axiosApi.get(`/product-brands/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProductBrands", error);
    }
  }
);

export const fetchSelectProductBrandsBy = createAsyncThunk(
  "appProductBrands/fetchSelectProductBrandsBy",
  async (item) => {
    try {
      const response = await axiosApi.get(
        `/product-brands/selectBy/${item.catalog}`
      );
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchSelectProductBrandsBy", error);
    }
  }
);

export const updateProductBrands = createAsyncThunk(
  "appProductBrands/updateProductBrands",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/product-brands/${item.id}`, item);

      const state = getState();

      const params = state.productBrand.params;
      dispatch(fetchProductBrands(params));
    } catch (error) {
      console.error("updateProductBrands", error);
    }
  }
);

export const appProductBrandssSlice = createSlice({
  name: "appProductBrands",
  initialState: {
    params: {},
    data: {},
    select: [],
    selectMobile: [],
    selectAccessibility: [],
    selectRepair: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductBrands.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProductBrands.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProductBrands.fulfilled, (state, action) => {
        state.select = action.payload;
      })
      .addCase(fetchSelectProductBrandsBy.fulfilled, (state, action) => {
        if (action.payload.params.catalog == "มือถือ") {
          state.selectMobile = action.payload.allData;
        } else if (action.payload.params.catalog == "อุปกรณ์เสริม") {
          state.selectAccessibility = action.payload.allData;
        } else if (action.payload.params.catalog == "อะไหล่ซ่อม") {
          state.selectRepair = action.payload.allData;
        }
      });
  },
});

export default appProductBrandssSlice.reducer;
