import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addProductPayMentLists = createAsyncThunk(
  "appProductPayMentListss/addProductPayMentLists",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/product-pay-ment-lists`, item);

      const state = getState();

      const params = state.productPayMentList.params;
      dispatch(fetchProductPayMentLists(params));
    } catch (error) {
      console.error("addProductPayMentLists", error);
    }
  }
);

export const fetchProductPayMentLists = createAsyncThunk(
  "appProductPayMentListss/fetchProductPayMentLists",
  async (item) => {
    try {
      const response = await axiosApi.post(
        `/product-pay-ment-lists/search`,
        item
      );
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductPayMentLists", error);
    }
  }
);

export const fetchInfoProductPayMentLists = createAsyncThunk(
  "appProductPayMentListss/fetchInfoProductPayMentLists",
  async (item) => {
    try {
      const response = await axiosApi.get(`/product-pay-ment-lists/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProductPayMentLists", error);
    }
  }
);

export const fetchSelectProductPayMentLists = createAsyncThunk(
  "appProductPayMentListss/fetchSelectProductPayMentLists",
  async () => {
    try {
      const response = await axiosApi.get(`/product-pay-ment-lists/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProductPayMentLists", error);
    }
  }
);

export const updateProductPayMentLists = createAsyncThunk(
  "appProductPayMentListss/updateProductPayMentLists",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/product-pay-ment-lists/${item.id}`, item);

      const state = getState();

      const params = state.productPayMentList.params;
      dispatch(fetchProductPayMentLists(params));
    } catch (error) {
      console.error("updateProductPayMentLists", error);
    }
  }
);

export const appProductPayMentListssSlice = createSlice({
  name: "appProductPayMentListss",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductPayMentLists.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProductPayMentLists.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProductPayMentLists.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appProductPayMentListssSlice.reducer;
