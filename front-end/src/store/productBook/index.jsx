/* eslint-disable no-unsafe-optional-chaining */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addProductBook = createAsyncThunk(
  "appProductBook/addProductBook",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/product-book`, item);

      const state = getState();

      const params = state.productBook.params;

      dispatch(fetchProductBook(params));
    } catch (error) {
      console.error("addProductBook", error);
    }
  }
);

export const fetchProductBook = createAsyncThunk(
  "appProductBook/fetchProductBook",
  async (item) => {
    try {
      const response = await axiosApi.post(`/product-book/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductBook", error);
    }
  }
);

export const fetchInfoProductBook = createAsyncThunk(
  "appProductBook/fetchInfoProductBook",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-book/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductBook", error);
    }
  }
);

export const appProductBooksSlice = createSlice({
  name: "appProductBook",
  initialState: {
    params: {},
    paramsPay: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductBook.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProductBook.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appProductBooksSlice.reducer;
