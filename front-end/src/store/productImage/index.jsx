import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const updateProductImageSeq = createAsyncThunk(
  "appProductImages/updateProductImageSeq",
  async (item) => {
    try {
      await axiosApi.post(`/product-images/updateSeq`, item);
    } catch (error) {
      console.error("updateProductImageSeq", error);
    }
  }
);

export const deleteProductImage = createAsyncThunk(
  "appProductImages/deleteProductImage",
  async (id) => {
    try {
      const response = await axiosApi.delete(`/product-images/${id}`);
      return response.data;
    } catch (error) {
      console.error("deleteProductImage", error);
    }
  }
);

export const appProductImagesSlice = createSlice({
  name: "appProductImages",
  initialState: {},
});

export default appProductImagesSlice.reducer;
