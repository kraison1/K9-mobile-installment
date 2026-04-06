import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addProductStorages = createAsyncThunk(
  "appProductStorages/addProductStorages",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/product-storages`, item);
      
      const state = getState();
      
      const params = state.productStorage.params;
      dispatch(fetchProductStorages(params)); 
    } catch (error) {
      console.error("addProductStorages", error);
    }
  }
);

export const fetchProductStorages = createAsyncThunk(
  "appProductStorages/fetchProductStorages",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-storages/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductStorages", error);
    }
  }
);

export const fetchInfoProductStorages = createAsyncThunk(
  "appProductStorages/fetchInfoProductStorages",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-storages/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductStorages", error);
    }
  }
);

export const fetchSelectProductStorages = createAsyncThunk(
  "appProductStorages/fetchSelectProductStorages",
  async () => {
    try {
      const response = await axiosApi.get(`/product-storages/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProductStorages", error);
    }
  }
);

export const updateProductStorages = createAsyncThunk(
  "appProductStorages/updateProductStorages",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/product-storages/${item.id}`, item);
      
      const state = getState();
      
      const params = state.productStorage.params;
      dispatch(fetchProductStorages(params)); 
    } catch (error) {
      console.error("updateProductStorages", error);
    }
  }
);

export const appProductStoragessSlice = createSlice({
  name: "appProductStorages",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductStorages.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProductStorages.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProductStorages.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appProductStoragessSlice.reducer;
