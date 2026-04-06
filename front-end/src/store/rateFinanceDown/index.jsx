import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addRateFinanceDown = createAsyncThunk(
  "appRateFinanceDown/addRateFinanceDown",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/percent-down-finance`, item);

      const state = getState();

      const params = state.rateFinanceDown.params;
      dispatch(fetchRateFinanceDown(params));
    } catch (error) {
      console.error("addRateFinanceDown", error);
    }
  }
);

export const fetchRateFinanceDown = createAsyncThunk(
  "appRateFinanceDown/fetchRateFinanceDown",
  async (item) => {
    try {
      const response = await axiosApi.post(
        `/percent-down-finance/search`,
        item
      );
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchRateFinanceDown", error);
    }
  }
);

export const fetchInfoRateFinanceDown = createAsyncThunk(
  "appRateFinanceDown/fetchInfoRateFinanceDown",
  async (item) => {
    try {
      const response = await axiosApi.get(`/percent-down-finance/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoRateFinanceDown", error);
    }
  }
);

export const fetchSelectRateFinanceDownPrice = createAsyncThunk(
  "appRateFinanceDown/fetchSelectRateFinanceDownPrice",
  async (item) => {
    try {
      const response = await axiosApi.get(
        `/percent-down-finance/findPrice/${item.productModelId}/${item.productStorageId}/${item.hand}`
      );
      return response.data;
    } catch (error) {
      console.error("fetchSelectRateFinanceDownPrice", error);
    }
  }
);

export const updateRateFinanceDown = createAsyncThunk(
  "appRateFinanceDown/updateRateFinanceDown",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/percent-down-finance/${item.id}`, item);

      const state = getState();

      const params = state.rateFinanceDown.params;
      dispatch(fetchRateFinanceDown(params));
    } catch (error) {
      console.error("updateRateFinanceDown", error);
    }
  }
);

export const appRateFinanceDownSlice = createSlice({
  name: "appRateFinanceDown",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRateFinanceDown.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoRateFinanceDown.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appRateFinanceDownSlice.reducer;
