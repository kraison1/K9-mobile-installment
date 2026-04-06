import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addProvince = createAsyncThunk(
  "appProvinces/addProvince",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/m-provinces`, item);

      const state = getState();

      const params = state.province.params;
      dispatch(fetchProvince(params));
    } catch (error) {
      console.error("addProvince", error);
    }
  }
);

export const fetchProvince = createAsyncThunk(
  "appProvinces/fetchProvince",
  async (item) => {
    try {
      const response = await axiosApi.post(`/m-provinces/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProvince", error);
    }
  }
);

export const fetchInfoProvince = createAsyncThunk(
  "appProvinces/fetchInfoProvince",
  async (item) => {
    try {
      const response = await axiosApi.get(`/m-provinces/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProvince", error);
    }
  }
);

export const fetchSelectProvince = createAsyncThunk(
  "appProvinces/fetchSelectProvince",
  async () => {
    try {
      const response = await axiosApi.get(`/m-provinces/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProvince", error);
    }
  }
);

export const fetchSelectIdCardProvince = createAsyncThunk(
  "appProvinces/fetchSelectIdCardProvince",
  async () => {
    try {
      const response = await axiosApi.get(`/m-provinces/select`);

      return response.data;
    } catch (error) {
      console.error("fetchSelectIdCardProvince", error);
    }
  }
);

export const updateProvince = createAsyncThunk(
  "appProvinces/updateProvince",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/m-provinces/${item.id}`, item);

      const state = getState();

      const params = state.province.params;
      dispatch(fetchProvince(params));
    } catch (error) {
      console.error("updateProvince", error);
    }
  }
);

export const appProvincesSlice = createSlice({
  name: "appProvinces",
  initialState: {
    params: {},
    data: {},
    select: [],
    selectIdCard: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProvince.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProvince.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProvince.fulfilled, (state, action) => {
        state.select = action.payload;
      })
      .addCase(fetchSelectIdCardProvince.fulfilled, (state, action) => {
        state.selectIdCard = action.payload;
      });
  },
});

export default appProvincesSlice.reducer;
