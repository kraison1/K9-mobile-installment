import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addProductModels = createAsyncThunk(
  "appProductModels/addProductModels",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/product-model`, item);

      const state = getState();

      const params = state.productModel.params;
      dispatch(fetchProductModels(params));
    } catch (error) {
      console.error("addProductModels", error);
    }
  }
);

export const fetchProductModels = createAsyncThunk(
  "appProductModels/fetchProductModels",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-model/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductModels", error);
    }
  }
);

export const fetchInfoProductModels = createAsyncThunk(
  "appProductModels/fetchInfoProductModels",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-model/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductModels", error);
    }
  }
);

export const fetchSelectProductModels = createAsyncThunk(
  "appProductModels/fetchSelectProductModels",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-model/select/${item}`);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchSelectProductModels", error);
    }
  }
);

export const updateProductModels = createAsyncThunk(
  "appProductModels/updateProductModels",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/product-model/${item.id}`, item);

      const state = getState();

      const params = state.productModel.params;
      dispatch(fetchProductModels(params));
    } catch (error) {
      console.error("updateProductModels", error);
    }
  }
);

export const appProductModelssSlice = createSlice({
  name: "appProductModels",
  initialState: {
    params: {},
    data: {},
    select: [],
    selectRepair: [],
    selectAccessibility: [],
    allData: [],
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchProductModels.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProductModels.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProductModels.fulfilled, (state, action) => {
        if (action.payload.params.includes("มือถือ")) {
          state.select = action.payload.allData;
        } else if (action.payload.params.includes("อะไหล่ซ่อม")) {
          state.selectRepair = action.payload.allData;
        } else {
          state.selectAccessibility = action.payload.allData;
        }
      });
  },
});

export default appProductModelssSlice.reducer;
