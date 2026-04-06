/* eslint-disable no-unsafe-optional-chaining */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { isEmpty } from "lodash";
import axiosApi from "src/helpers/api";

export const addProcessBook = createAsyncThunk(
  "appProcessBooks/addProcessBook",
  async (item, { dispatch, getState }) => {
    try {
      const response = await axiosApi.postForm(`/process-books`, item);

      const { message_error } = response?.data;

      if (!message_error) {
        const state = getState();

        const params = state.processBook.params;
        if (!isEmpty(params)) {
          dispatch(fetchProcessBook(params));
        }
      }
    } catch (error) {
      console.error("addProcessBook", error);
    }
  }
);

export const fetchProcessBook = createAsyncThunk(
  "appProcessBooks/fetchProcessBook",
  async (item) => {
    try {
      const response = await axiosApi.post(`/process-books/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProcessBook", error);
    }
  }
);

export const fetchInfoProcessBook = createAsyncThunk(
  "appProcessBooks/fetchInfoProcessBook",
  async (item) => {
    try {
      const response = await axiosApi.get(`/process-books/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProcessBook", error);
    }
  }
);

export const fetchSelectProcessBook = createAsyncThunk(
  "appProcessBooks/fetchSelectProcessBook",
  async () => {
    try {
      const response = await axiosApi.get(`/process-books/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProcessBook", error);
    }
  }
);

export const updateProcessBook = createAsyncThunk(
  "appProcessBooks/updateProcessBook",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/process-books/${item.id}`, item);

      const state = getState();

      const params = state.processBook.params;
      dispatch(fetchProcessBook(params));
    } catch (error) {
      console.error("updateProcessBook", error);
    }
  }
);

export const appProcessBooksSlice = createSlice({
  name: "appProcessBooks",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProcessBook.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProcessBook.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProcessBook.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appProcessBooksSlice.reducer;
