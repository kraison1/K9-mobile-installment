/* eslint-disable no-unsafe-optional-chaining */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { isEmpty } from "lodash";
import axiosApi from "src/helpers/api";

export const addProcessCase = createAsyncThunk(
  "appProcessCases/addProcessCase",
  async (item, { dispatch, getState }) => {
    try {
      const response = await axiosApi.postForm(`/process-cases`, item);

      const { message_error } = response?.data;

      if (!message_error) {
        const state = getState();

        const params = state.processCase.params;
        if (!isEmpty(params)) {
          dispatch(fetchProcessCase(params));
        }
      }
    } catch (error) {
      console.error("addProcessCase", error);
    }
  }
);

export const fetchProcessCase = createAsyncThunk(
  "appProcessCases/fetchProcessCase",
  async (item) => {
    try {
      const response = await axiosApi.post(`/process-cases/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProcessCase", error);
    }
  }
);

export const fetchInfoProcessCase = createAsyncThunk(
  "appProcessCases/fetchInfoProcessCase",
  async (item) => {
    try {
      const response = await axiosApi.get(`/process-cases/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProcessCase", error);
    }
  }
);

export const fetchSelectProcessCase = createAsyncThunk(
  "appProcessCases/fetchSelectProcessCase",
  async () => {
    try {
      const response = await axiosApi.get(`/process-cases/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProcessCase", error);
    }
  }
);

export const updateProcessCase = createAsyncThunk(
  "appProcessCases/updateProcessCase",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/process-cases/${item.id}`, item);

      const state = getState();

      const params = state.processCase.params;
      dispatch(fetchProcessCase(params));
    } catch (error) {
      console.error("updateProcessCase", error);
    }
  }
);

export const appProcessCasesSlice = createSlice({
  name: "appProcessCases",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProcessCase.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProcessCase.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProcessCase.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appProcessCasesSlice.reducer;
