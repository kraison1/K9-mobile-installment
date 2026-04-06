/* eslint-disable no-unsafe-optional-chaining */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";
import { fetchProductSavingPayMentImages } from "../productSavingPayMentImage";
import { sizePerPage } from "src/helpers/sizePerPage";

export const addProductSaving = createAsyncThunk(
  "appProductSaving/addProductSaving",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/product-saving`, item);

      const state = getState();

      const params = state.productSaving.params;

      dispatch(fetchProductSaving(params));
    } catch (error) {
      console.error("addProductSaving", error);
    }
  }
);

export const fetchProductSaving = createAsyncThunk(
  "appProductSaving/fetchProductSaving",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-saving/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductSaving", error);
    }
  }
);

export const fetchInfoProductSaving = createAsyncThunk(
  "appProductSaving/fetchInfoProductSaving",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-saving/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductSaving", error);
    }
  }
);

export const fetchPaySaving = createAsyncThunk(
  "appProductSale/fetchPaySaving",
  async (item, { dispatch }) => {
    try {
      const response = await axiosApi.get(
        `/product-saving/getPaySaving/${item}`
      );
      const { message_error } = response?.data;

      dispatch(
        fetchProductSavingPayMentImages({
          search: item,
          page: 1,
          pageSize: sizePerPage(),
        })
      );

      if (!message_error) {
        return {
          params: item,
          allData: response.data,
        };
      } else {
        return {
          params: item,
          allData: {},
        };
      }
    } catch (error) {
      console.error("fetchPaySaving", error);
    }
  }
);

export const appProductSavingsSlice = createSlice({
  name: "appProductSaving",
  initialState: {
    params: {},
    paramsPay: {},
    data: {},
    dataPay: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductSaving.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchPaySaving.fulfilled, (state, action) => {
        state.paramsPay = {
          ContactCode: action.payload.params,
        };
        state.dataPay = action.payload.allData;
      })
      .addCase(fetchInfoProductSaving.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appProductSavingsSlice.reducer;
