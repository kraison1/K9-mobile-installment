import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addLatestNews = createAsyncThunk(
  "appLatestNews/addLatestNews",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/latest-news`, item);

      const state = getState();
      const params = state.latestNews.params;
      dispatch(fetchLatestNews(params));
    } catch (error) {
      console.error("addLatestNews", error);
      throw error; // Propagate error for frontend handling
    }
  }
);

export const fetchLatestNews = createAsyncThunk(
  "appLatestNews/fetchLatestNews",
  async (item) => {
    try {
      const response = await axiosApi.post(`/latest-news/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchLatestNews", error);
      throw error;
    }
  }
);

export const fetchInfoLatestNews = createAsyncThunk(
  "appLatestNews/fetchInfoLatestNews",
  async (item) => {
    try {
      const response = await axiosApi.get(`/latest-news/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoLatestNews", error);
      throw error;
    }
  }
);

export const updateLatestNews = createAsyncThunk(
  "appLatestNews/updateLatestNews",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/latest-news/${item.id}`, item);

      const state = getState();
      const params = state.latestNews.params;
      dispatch(fetchLatestNews(params));
    } catch (error) {
      console.error("updateLatestNews", error);
      throw error;
    }
  }
);

export const appLatestNewsSlice = createSlice({
  name: "appLatestNews",
  initialState: {
    params: {},
    data: {},
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatestNews.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoLatestNews.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appLatestNewsSlice.reducer;
