import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addDistrict = createAsyncThunk(
  "appDistricts/addDistrict",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/m-districts`, item);

      const state = getState();

      const params = state.district.params;
      dispatch(fetchDistrict(params));
    } catch (error) {
      console.error("addDistrict", error);
    }
  }
);

export const fetchDistrict = createAsyncThunk(
  "appDistricts/fetchDistrict",
  async (item) => {
    try {
      const response = await axiosApi.post(`/m-districts/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchDistrict", error);
    }
  }
);

export const fetchInfoDistrict = createAsyncThunk(
  "appDistricts/fetchInfoDistrict",
  async (item) => {
    try {
      const response = await axiosApi.get(`/m-districts/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoDistrict", error);
    }
  }
);

export const fetchSelectDistrict = createAsyncThunk(
  "appDistricts/fetchSelectDistrict",
  async (provinceId) => {
    try {
      const response = await axiosApi.get(`/m-districts/select/${provinceId}`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectDistrict", error);
    }
  }
);

export const fetchSelectIdCardDistrict = createAsyncThunk(
  "appDistricts/fetchSelectIdCardDistrict",
  async (provinceId) => {
    try {
      const response = await axiosApi.get(`/m-districts/select/${provinceId}`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectIdCardDistrict", error);
    }
  }
);

export const updateDistrict = createAsyncThunk(
  "appDistricts/updateDistrict",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/m-districts/${item.id}`, item);

      const state = getState();

      const params = state.district.params;
      dispatch(fetchDistrict(params));
    } catch (error) {
      console.error("updateDistrict", error);
    }
  }
);

export const appDistrictsSlice = createSlice({
  name: "appDistricts",
  initialState: {
    params: {},
    data: {},
    select: [],
    selectIdCard: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDistrict.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoDistrict.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectDistrict.fulfilled, (state, action) => {
        state.select = action.payload;
      })
      .addCase(fetchSelectIdCardDistrict.fulfilled, (state, action) => {
        state.selectIdCard = action.payload;
      });
  },
});

export default appDistrictsSlice.reducer;
