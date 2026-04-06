import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addProductColors = createAsyncThunk(
  "appProductColors/addProductColors",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/product-colors`, item);
      
      const state = getState();
      
      const params = state.productColor.params;
      dispatch(fetchProductColors(params)); 
    } catch (error) {
      console.error("addProductColors", error);
    }
  }
);

export const fetchProductColors = createAsyncThunk(
  "appProductColors/fetchProductColors",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-colors/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductColors", error);
    }
  }
);

export const fetchInfoProductColors = createAsyncThunk(
  "appProductColors/fetchInfoProductColors",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-colors/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductColors", error);
    }
  }
);

export const fetchSelectProductColors = createAsyncThunk(
  "appProductColors/fetchSelectProductColors",
  async () => {
    try {
      const response = await axiosApi.get(`/product-colors/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProductColors", error);
    }
  }
);

export const updateProductColors = createAsyncThunk(
  "appProductColors/updateProductColors",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/product-colors/${item.id}`, item);
      
      const state = getState();
      
      const params = state.productColor.params;
      dispatch(fetchProductColors(params)); 
    } catch (error) {
      console.error("updateProductColors", error);
    }
  }
);

export const appProductColorssSlice = createSlice({
  name: "appProductColors",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductColors.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProductColors.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProductColors.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appProductColorssSlice.reducer;
