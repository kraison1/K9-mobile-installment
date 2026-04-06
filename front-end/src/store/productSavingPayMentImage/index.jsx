import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";
import { fetchPaySaving } from "../productSaving";

export const addProductSavingPayMentImages = createAsyncThunk(
  "appProductSavingPayMentImagess/addProductSavingPayMentImages",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/product-saving-pay-ment-image`, item);

      const state = getState();

      const params = state.productSavingPayMentImage.params;
      dispatch(fetchProductSavingPayMentImages(params));

      const paramsPay = state.productSaving.paramsPay;
      dispatch(fetchPaySaving(paramsPay.ContactCode));
    } catch (error) {
      console.error("addProductSavingPayMentImages", error);
    }
  }
);

export const fetchProductSavingPayMentImages = createAsyncThunk(
  "appProductSavingPayMentImagess/fetchProductSavingPayMentImages",
  async (item) => {
    try {
      const response = await axiosApi.post(
        `/product-saving-pay-ment-image/search`,
        item
      );
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductSavingPayMentImages", error);
    }
  }
);

export const fetchInfoProductSavingPayMentImages = createAsyncThunk(
  "appProductSavingPayMentImagess/fetchInfoProductSavingPayMentImages",
  async (item) => {
    try {
      const response = await axiosApi.get(
        `/product-saving-pay-ment-image/${item}`
      );
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductSavingPayMentImages", error);
    }
  }
);

export const updateProductSavingPayMentImages = createAsyncThunk(
  "appProductSavingPayMentImagess/updateProductSavingPayMentImages",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/product-saving-pay-ment-image/${item.id}`, item);

      const state = getState();

      const params = state.productPayMentImage.params;
      dispatch(fetchProductSavingPayMentImages(params));
    } catch (error) {
      console.error("updateProductSavingPayMentImages", error);
    }
  }
);

export const deleteProductSavingPayMentImages = createAsyncThunk(
  "appProductSavingPayMentImagess/deleteProductSavingPayMentImages",
  async (id, { dispatch, getState }) => {
    try {
      await axiosApi.delete(`/product-saving-pay-ment-image/${id}`);

      const state = getState();
      const params = state.productPayMentImage.params;
      dispatch(fetchProductSavingPayMentImages(params));

      const paramsPay = state.productSale.paramsPay;
      dispatch(fetchPaySaving(paramsPay.ContactCode));
    } catch (error) {
      console.error("deleteProductSavingPayMentImages", error);
    }
  }
);

export const appProductSavingPayMentImagessSlice = createSlice({
  name: "appProductSavingPayMentImagess",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductSavingPayMentImages.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(
        fetchInfoProductSavingPayMentImages.fulfilled,
        (state, action) => {
          state.data = action.payload;
        }
      );
  },
});

export default appProductSavingPayMentImagessSlice.reducer;
