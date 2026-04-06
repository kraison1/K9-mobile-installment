import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";
import { fetchProductPayMentLists } from "../productPayMentList";
import { fetchPayDown } from "../productSale";

export const addProductPayMentImages = createAsyncThunk(
  "appProductPayMentImagess/addProductPayMentImages",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/product-payment-images`, item);

      const state = getState();

      const params = state.productPayMentImage.params;
      dispatch(fetchProductPayMentImages(params));

      const paramsPayMentList = state.productPayMentList.params;
      dispatch(fetchProductPayMentLists(paramsPayMentList));

      const paramsPay = state.productSale.paramsPay;
      dispatch(fetchPayDown(paramsPay.ContactCode));
    } catch (error) {
      console.error("addProductPayMentImages", error);
    }
  }
);

export const fetchProductPayMentImages = createAsyncThunk(
  "appProductPayMentImagess/fetchProductPayMentImages",
  async (item) => {
    try {
      const response = await axiosApi.post(
        `/product-payment-images/search`,
        item
      );
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductPayMentImages", error);
    }
  }
);

export const fetchInfoProductPayMentImages = createAsyncThunk(
  "appProductPayMentImagess/fetchInfoProductPayMentImages",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-payment-images/${item}`);

      return response.data;
    } catch (error) {
      console.error("fetchInfoProductPayMentImages", error);
    }
  }
);

export const updateProductPayMentImages = createAsyncThunk(
  "appProductPayMentImagess/updateProductPayMentImages",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/product-payment-images/${item.id}`, item);

      const state = getState();

      const params = state.productPayMentImage.params;
      dispatch(fetchProductPayMentImages(params));
    } catch (error) {
      console.error("updateProductPayMentImages", error);
    }
  }
);

export const deleteProductPayMentImages = createAsyncThunk(
  "appProductPayMentImagess/deleteProductPayMentImages",
  async (id, { dispatch, getState }) => {
    try {
      await axiosApi.delete(`/product-payment-images/${id}`);

      const state = getState();
      const params = state.productPayMentImage.params;
      dispatch(fetchProductPayMentImages(params));
      const paramsPayMentList = state.productPayMentList.params;
      dispatch(fetchProductPayMentLists(paramsPayMentList));
      const paramsPay = state.productSale.paramsPay;
      dispatch(fetchPayDown(paramsPay.ContactCode));
    } catch (error) {
      console.error("deleteProductPayMentImages", error);
    }
  }
);

export const appProductPayMentImagessSlice = createSlice({
  name: "appProductPayMentImagess",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductPayMentImages.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProductPayMentImages.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appProductPayMentImagessSlice.reducer;
