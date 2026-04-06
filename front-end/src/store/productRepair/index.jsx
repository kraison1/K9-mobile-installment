import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addProductRepairs = createAsyncThunk(
  "appProductRepairs/addProductRepairs",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/product-repair`, item);

      const state = getState();

      const params = state.productRepair.params;
      dispatch(fetchProductRepairs(params));
    } catch (error) {
      console.error("addProductRepairs", error);
    }
  },
);

export const fetchProductRepairs = createAsyncThunk(
  "appProductRepairs/fetchProductRepairs",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-repair/search`, item);

      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductRepairs", error);
    }
  },
);

export const fetchInfoProductRepairs = createAsyncThunk(
  "appProductRepairs/fetchInfoProductRepairs",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-repair/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductRepairs", error);
    }
  },
);

export const updateProductRepairs = createAsyncThunk(
  "appProductRepairs/updateProductRepairs",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/product-repair/${item.id}`, item);

      const state = getState();

      const params = state.productRepair.params;
      dispatch(fetchProductRepairs(params));
    } catch (error) {
      console.error("updateProductRepairs", error);
    }
  },
);

export const deleteProductRepair = createAsyncThunk(
  "appProductRepair/delete",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.delete(`/product-repair/${item.id}`);
      const state = getState();
      const params = state.productRepair.params;
      dispatch(fetchProductRepairs(params));
    } catch (error) {
      console.error("delete", error);
    }
  },
);

export const appProductRepairssSlice = createSlice({
  name: "appProductRepairs",
  initialState: {
    params: {},
    paramsInstore: {},
    paramsWalkin: {},
    paramsWholesale: {},

    data: {},
    select: [],
    allData: [],
    allDataInstore: [],
    allDataWalkin: [],
    allDataWholesale: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductRepairs.fulfilled, (state, action) => {
        if (action.payload.params.typeRepair == "1") {
          state.paramsInstore = action.payload.params;
          state.allDataInstore = action.payload.allData;
        } else if (action.payload.params.typeRepair == "2") {
          state.paramsWalkin = action.payload.params;
          state.allDataWalkin = action.payload.allData;
        } else if (action.payload.params.typeRepair == "3") {
          state.paramsWholesale = action.payload.params;
          state.allDataWholesale = action.payload.allData;
        } else {
          state.params = action.payload.params;
          state.allData = action.payload.allData;
        }
      })
      .addCase(fetchInfoProductRepairs.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appProductRepairssSlice.reducer;
