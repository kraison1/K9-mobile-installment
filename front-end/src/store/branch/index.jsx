import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addBranch = createAsyncThunk(
  "appBranchs/addBranch",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/branchs`, item);

      const state = getState();

      const params = state.branch.params;
      dispatch(fetchBranch(params));
    } catch (error) {
      console.error("addBranch", error);
    }
  }
);

export const fetchBranch = createAsyncThunk(
  "appBranchs/fetchBranch",
  async (item) => {
    try {
      const response = await axiosApi.post(`/branchs/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchBranch", error);
    }
  }
);

export const fetchInfoBranch = createAsyncThunk(
  "appBranchs/fetchInfoBranch",
  async (item) => {
    try {
      const response = await axiosApi.get(`/branchs/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoBranch", error);
    }
  }
);

export const fetchSelectBranch = createAsyncThunk(
  "appBranchs/fetchSelectBranch",
  async () => {
    try {
      const response = await axiosApi.get(`/branchs/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectBranch", error);
    }
  }
);

export const updateBranch = createAsyncThunk(
  "appBranchs/updateBranch",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/branchs/${item.id}`, item);

      const state = getState();

      const params = state.branch.params;
      dispatch(fetchBranch(params));
    } catch (error) {
      console.error("updateBranch", error);
    }
  }
);

export const appBranchsSlice = createSlice({
  name: "appBranchs",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranch.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoBranch.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectBranch.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appBranchsSlice.reducer;
