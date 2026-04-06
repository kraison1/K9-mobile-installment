import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addProductUnits = createAsyncThunk(
  "appProductUnits/addProductUnits",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/product-units`, item);
      
      const state = getState();
      
      const params = state.productUnit.params;
      dispatch(fetchProductUnits(params)); 
    } catch (error) {
      console.error("addProductUnits", error);
    }
  }
);

export const fetchProductUnits = createAsyncThunk(
  "appProductUnits/fetchProductUnits",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-units/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductUnits", error);
    }
  }
);

export const fetchInfoProductUnits = createAsyncThunk(
  "appProductUnits/fetchInfoProductUnits",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-units/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductUnits", error);
    }
  }
);

export const fetchSelectProductUnits = createAsyncThunk(
  "appProductUnits/fetchSelectProductUnits",
  async () => {
    try {
      const response = await axiosApi.get(`/product-units/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProductUnits", error);
    }
  }
);

export const updateProductUnits = createAsyncThunk(
  "appProductUnits/updateProductUnits",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/product-units/${item.id}`, item);
      
      const state = getState();
      
      const params = state.productUnit.params;
      dispatch(fetchProductUnits(params)); 
    } catch (error) {
      console.error("updateProductUnits", error);
    }
  }
);

export const appProductUnitssSlice = createSlice({
  name: "appProductUnits",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductUnits.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProductUnits.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProductUnits.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appProductUnitssSlice.reducer;
