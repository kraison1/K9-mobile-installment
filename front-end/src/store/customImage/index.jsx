import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const updateCustomImageSeq = createAsyncThunk(
  "appCustomImages/updateCustomImageSeq",
  async (item) => {
    try {
      await axiosApi.post(`/customer-images/updateSeq`, item);
    } catch (error) {
      console.error("updateCustomImageSeq", error);
    }
  }
);

export const deleteCustomImage = createAsyncThunk(
  "appCustomImages/deleteCustomImage",
  async (id) => {
    try {
      const response = await axiosApi.delete(`/customer-images/${id}`);
      return response.data;
    } catch (error) {
      console.error("deleteCustomImage", error);
    }
  }
);

export const appCustomImagesSlice = createSlice({
  name: "appCustomImages",
  initialState: {},
});

export default appCustomImagesSlice.reducer;
