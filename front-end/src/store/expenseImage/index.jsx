import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const updateExpenseImageSeq = createAsyncThunk(
  "appExpenseImages/updateExpenseImageSeq",
  async (item) => {
    try {
      await axiosApi.post(`/expense-images/updateSeq`, item);
    } catch (error) {
      console.error("updateExpenseImageSeq", error);
    }
  }
);

export const deleteExpenseImage = createAsyncThunk(
  "appExpenseImages/deleteExpenseImage",
  async (id) => {
    try {
      const response = await axiosApi.delete(`/expense-images/${id}`);
      return response.data;
    } catch (error) {
      console.error("deleteExpenseImage", error);
    }
  }
);

export const appExpenseImagesSlice = createSlice({
  name: "appExpenseImages",
  initialState: {},
});

export default appExpenseImagesSlice.reducer;
