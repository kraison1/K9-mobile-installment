import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";
import { isEmpty } from "lodash";

export const addCustomerPaymentList = createAsyncThunk(
  "appCustomerPaymentList/addCustomerPaymentList",
  async (item, { dispatch, getState }) => {
    try {
      const response = await axiosApi.postForm(`/customer-payment-lists`, item);

      const state = getState();

      const params = state.customerPaymentList.params;
      if (!isEmpty(params)) {
        dispatch(fetchCustomerPaymentLists(params));
      }

      return response?.data;
    } catch (error) {
      console.error("addCustomerPaymentList", error);
    }
  }
);

export const fetchCustomerPaymentLists = createAsyncThunk(
  "appCustomerPaymentList/fetchCustomerPaymentLists",
  async (item) => {
    try {
      const response = await axiosApi.post(`/customer-payment-lists/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.log("fetchCustomerPaymentLists", error);
    }
  }
);

export const fetchInfoCustomerPaymentList = createAsyncThunk(
  "appCustomerPaymentList/fetchInfoCustomerPaymentList",
  async (item) => {
    try {
      const response = await axiosApi.get(`/customer-payment-lists/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoCustomerPaymentList", error);
    }
  }
);

export const updateCustomerPaymentList = createAsyncThunk(
  "appCustomerPaymentList/updateCustomerPaymentList",
  async (item, { dispatch, getState }) => {
    try {
      const response = await axiosApi.patchForm(`/customer-payment-lists/${item.id}`, item);

      const state = getState();

      const params = state.customerPaymentList.params;
      if (!isEmpty(params)) {
        dispatch(fetchCustomerPaymentLists(params));
      }

      return response?.data;
    } catch (error) {
      console.error("updateCustomerPaymentList", error);
    }
  }
);

export const deleteCustomerPaymentList = createAsyncThunk(
  "appCustomerPaymentList/deleteCustomerPaymentList",
  async (id, { dispatch, getState }) => {
    try {
      await axiosApi.delete(`/customer-payment-lists/${id}`);

      const state = getState();

      const params = state.customerPaymentList.params;
      if (!isEmpty(params)) {
        dispatch(fetchCustomerPaymentLists(params));
      }
    } catch (error) {
      console.error("deleteCustomerPaymentList", error);
    }
  }
);

export const appCustomerPaymentListSlice = createSlice({
  name: "appCustomerPaymentList",
  initialState: {
    params: {},
    allData: [],
    select: [],
    data: {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerPaymentLists.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoCustomerPaymentList.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appCustomerPaymentListSlice.reducer;