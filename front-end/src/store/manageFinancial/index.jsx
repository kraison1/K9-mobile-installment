import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { isEmpty } from "lodash";
import axiosApi from "src/helpers/api";

export const addProcessManageFinance = createAsyncThunk(
  "appProcessManageFinances/addProcessManageFinance",
  async (item, { dispatch, getState }) => {
    try {
      const response = await axiosApi.post(`/process-manage-finance`, item);

      const state = getState();

      const params = state.manageFinancial.params;
      if (!isEmpty(params)) {
        dispatch(
          fetchProcessManageFinance({
            ...params,
            search: response?.data?.data || "",
          })
        );
      }
    } catch (error) {
      console.error("addProcessManageFinance", error);
    }
  }
);

export const fetchProcessManageFinance = createAsyncThunk(
  "appProcessManageFinances/fetchProcessManageFinance",
  async (item) => {
    try {
      const response = await axiosApi.post(
        `/process-manage-finance/search`,
        item
      );
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProcessManageFinance", error);
    }
  }
);

export const fetchInfoProcessManageFinance = createAsyncThunk(
  "appProcessManageFinances/fetchInfoProcessManageFinance",
  async (item) => {
    try {
      const response = await axiosApi.get(`/process-manage-finance/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProcessManageFinance", error);
    }
  }
);

export const fetchSelectProcessManageFinance = createAsyncThunk(
  "appProcessManageFinances/fetchSelectProcessManageFinance",
  async () => {
    try {
      const response = await axiosApi.get(`/process-manage-finance/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectProcessManageFinance", error);
    }
  }
);

export const updateProcessManageFinance = createAsyncThunk(
  "appProcessManageFinances/updateProcessManageFinance",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/process-manage-finance/${item.id}`, item);

      const state = getState();

      const params = state.manageFinancial.params;
      if (!isEmpty(params)) {
        dispatch(fetchProcessManageFinance(params));
      }
    } catch (error) {
      console.error("updateProcessManageFinance", error);
    }
  }
);

export const appProcessManageFinancesSlice = createSlice({
  name: "appProcessManageFinances",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProcessManageFinance.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoProcessManageFinance.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProcessManageFinance.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appProcessManageFinancesSlice.reducer;
