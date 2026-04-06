import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addManageAppleId = createAsyncThunk(
  "appManageAppleId/addManageAppleId",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/manage-apple-id`, item);

      const state = getState();

      const params = state.manageAppleId.params;
      dispatch(fetchManageAppleId(params));
    } catch (error) {
      console.error("addManageAppleId", error);
    }
  }
);

export const fetchManageAppleId = createAsyncThunk(
  "appManageAppleId/fetchManageAppleId",
  async (item) => {
    try {
      const response = await axiosApi.post(`/manage-apple-id/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchManageAppleId", error);
    }
  }
);

export const fetchInfoManageAppleId = createAsyncThunk(
  "appManageAppleId/fetchInfoManageAppleId",
  async (item) => {
    try {
      const response = await axiosApi.get(`/manage-apple-id/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoManageAppleId", error);
    }
  }
);

export const updateManageAppleId = createAsyncThunk(
  "appManageAppleId/updateManageAppleId",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/manage-apple-id/${item.id}`, item);

      const state = getState();

      const params = state.manageAppleId.params;
      dispatch(fetchManageAppleId(params));
    } catch (error) {
      console.error("updateManageAppleId", error);
    }
  }
);

export const appManageAppleIdSlice = createSlice({
  name: "appManageAppleId",
  initialState: {
    params: {},
    data: {},
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchManageAppleId.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoManageAppleId.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appManageAppleIdSlice.reducer;
