/* eslint-disable no-unsafe-optional-chaining */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { isEmpty } from "lodash";
import axiosApi from "src/helpers/api";

export const addProcessSaving = createAsyncThunk(
  "appProcessSavings/addProcessSaving",
  async (item, { dispatch, getState }) => {
    try {
      const response = await axiosApi.postForm(`/process-savings`, item);

      const { message_error } = response?.data;

      if (!message_error) {
        const state = getState();

        const params = state.processSaving.params;
        if (!isEmpty(params)) {
          dispatch(fetchProcessSaving(params));
        }
      }
    } catch (error) {
      console.error("addProcessSaving", error);
    }
  }
);

export const fetchProcessSaving = createAsyncThunk(
  "appProcessSavings/fetchProcessSaving",
  async (item) => {
    try {
      const response = await axiosApi.post(`/process-savings/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProcessSaving", error);
    }
  }
);

export const fetchInfoProcessSaving = createAsyncThunk(
  "appProcessSavings/fetchInfoProcessSaving",
  async (item) => {
    try {
      const response = await axiosApi.get(`/process-savings/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProcessSaving", error);
    }
  }
);

export const fetchSelectProcessSaving = createAsyncThunk(
  "appProcessSavings/fetchSelectProcessSaving",
  async () => {
    try {
      const response = await axiosApi.get(`/process-savings/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProcessSaving", error);
    }
  }
);

export const updateProcessSaving = createAsyncThunk(
  "appProcessSavings/updateProcessSaving",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/process-savings/${item.id}`, item);

      const state = getState();

      const params = state.processSaving.params;
      dispatch(fetchProcessSaving(params));
    } catch (error) {
      console.error("updateProcessSaving", error);
    }
  }
);

export const appProcessSavingsSlice = createSlice({
  name: "appProcessSavings",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProcessSaving.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProcessSaving.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProcessSaving.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appProcessSavingsSlice.reducer;
