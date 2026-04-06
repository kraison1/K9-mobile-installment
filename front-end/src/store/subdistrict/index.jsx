import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addSubdistrict = createAsyncThunk(
  "appSubdistricts/addSubdistrict",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/m-subdistricts`, item);

      const state = getState();

      const params = state.subdistricts.params;
      dispatch(fetchSubdistrict(params));
    } catch (error) {
      console.error("addSubdistrict", error);
    }
  }
);

export const fetchSubdistrict = createAsyncThunk(
  "appSubdistricts/fetchSubdistrict",
  async (item) => {
    try {
      const response = await axiosApi.post(`/m-subdistricts/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchSubdistrict", error);
    }
  }
);

export const fetchInfoSubdistrict = createAsyncThunk(
  "appSubdistricts/fetchInfoSubdistrict",
  async (item) => {
    try {
      const response = await axiosApi.get(`/m-subdistricts/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoSubdistrict", error);
    }
  }
);

export const fetchSelectSubdistrict = createAsyncThunk(
  "appSubdistricts/fetchSelectSubdistrict",
  async (districtId) => {
    try {
      const response = await axiosApi.get(
        `/m-subdistricts/select/${districtId}`
      );
      return response.data;
    } catch (error) {
      console.error("fetchSelectSubdistrict", error);
    }
  }
);

export const fetchSelectIdCardSubdistrict = createAsyncThunk(
  "appSubdistricts/fetchSelectIdCardSubdistrict",
  async (districtId) => {
    try {
      const response = await axiosApi.get(
        `/m-subdistricts/select/${districtId}`
      );
      return response.data;
    } catch (error) {
      console.error("fetchSelectIdCardSubdistrict", error);
    }
  }
);

export const updateSubdistrict = createAsyncThunk(
  "appSubdistricts/updateSubdistrict",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/m-subdistricts/${item.id}`, item);

      const state = getState();

      const params = state.subdistricts.params;
      dispatch(fetchSubdistrict(params));
    } catch (error) {
      console.error("updateSubdistrict", error);
    }
  }
);

export const appSubdistrictsSlice = createSlice({
  name: "appSubdistricts",
  initialState: {
    params: {},
    data: {},
    select: [],
    selectIdCard: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubdistrict.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoSubdistrict.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectSubdistrict.fulfilled, (state, action) => {
        state.select = action.payload;
      })
      .addCase(fetchSelectIdCardSubdistrict.fulfilled, (state, action) => {
        state.selectIdCard = action.payload;
      });
  },
});

export default appSubdistrictsSlice.reducer;
