import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addRateFinance = createAsyncThunk(
  "appRateFinance/addRateFinance",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/rate-finance`, item);

      const state = getState();

      const params = state.rateFinance.params;
      dispatch(fetchRateFinance(params));
    } catch (error) {
      console.error("addRateFinance", error);
    }
  }
);

export const fetchRateFinance = createAsyncThunk(
  "appRateFinance/fetchRateFinance",
  async (item) => {
    try {
      const response = await axiosApi.post(`/rate-finance/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchRateFinance", error);
    }
  }
);

export const fetchInfoRateFinance = createAsyncThunk(
  "appRateFinance/fetchInfoRateFinance",
  async (item) => {
    try {
      const response = await axiosApi.get(`/rate-finance/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoRateFinance", error);
    }
  }
);

export const fetchSelectRateFinance = createAsyncThunk(
  "appRateFinance/fetchSelectRateFinance",
  async () => {
    try {
      const response = await axiosApi.get(`/rate-finance/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectRateFinance", error);
    }
  }
);

export const updateRateFinance = createAsyncThunk(
  "appRateFinance/updateRateFinance",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/rate-finance/${item.id}`, item);

      const state = getState();

      const params = state.rateFinance.params;
      dispatch(fetchRateFinance(params));
    } catch (error) {
      console.error("updateRateFinance", error);
    }
  }
);

export const appRateFinanceSlice = createSlice({
  name: "appRateFinance",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRateFinance.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoRateFinance.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectRateFinance.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appRateFinanceSlice.reducer;
