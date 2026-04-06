import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addProductClaims = createAsyncThunk(
  "appProductClaims/addProductClaims",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/product-claim`, item);

      const state = getState();

      const params = state.productClaim.params;
      dispatch(fetchProductClaims(params));
    } catch (error) {
      console.error("addProductClaims", error);
    }
  },
);

export const fetchProductClaims = createAsyncThunk(
  "appProductClaims/fetchProductClaims",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-claim/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductClaims", error);
    }
  },
);

export const fetchInfoProductClaims = createAsyncThunk(
  "appProductClaims/fetchInfoProductClaims",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-claim/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductClaims", error);
    }
  },
);

export const updateProductClaims = createAsyncThunk(
  "appProductClaims/updateProductClaims",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/product-claim/${item.id}`, item);

      const state = getState();

      const params = state.productClaim.params;
      dispatch(fetchProductClaims(params));
    } catch (error) {
      console.error("updateProductClaims", error);
    }
  },
);

export const deleteProductClaim = createAsyncThunk(
  "appProductClaim/delete",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.delete(`/product-claim/${item.id}`);
      const state = getState();
      const params = state.productClaim.params;
      dispatch(fetchProductClaims(params));
    } catch (error) {
      console.error("delete", error);
    }
  },
);

export const appProductClaimssSlice = createSlice({
  name: "appProductClaims",
  initialState: {
    params: {},
    paramsRepair: {},
    data: {},
    select: [],
    allData: [],
    allDataRepair: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductClaims.fulfilled, (state, action) => {
        if (action.payload.params.catalog == "อะไหล่ซ่อม") {
          state.paramsRepair = action.payload.params;
          state.allDataRepair = action.payload.allData;
        } else {
          state.params = action.payload.params;
          state.allData = action.payload.allData;
        }
      })
      .addCase(fetchInfoProductClaims.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appProductClaimssSlice.reducer;
