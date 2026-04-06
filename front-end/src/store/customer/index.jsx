import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { isEmpty } from "lodash";
import axiosApi from "src/helpers/api";
import { fetchProcessManageFinance } from "../manageFinancial";

export const addCustomer = createAsyncThunk(
  "appCustomers/addCustomer",
  async (item, { dispatch, getState }) => {
    try {
      const response = await axiosApi.postForm(`/customers`, item);

      const state = getState();

      const params = state.customer.params;
      if (!isEmpty(params)) {
        dispatch(fetchCustomer(params));
      }

      return response?.data;
    } catch (error) {
      console.error("addCustomer", error);
    }
  }
);

export const fetchCustomer = createAsyncThunk(
  "appCustomers/fetchCustomer",
  async (item) => {
    try {
      const response = await axiosApi.post(`/customers/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.log("fetchCustomer", error);
    }
  }
);

export const fetchSearchCitizenIdCard = createAsyncThunk(
  "appCustomers/fetchSearchCitizenIdCard",
  async (item) => {
    try {
      const response = await axiosApi.get(`/customers/citizenIdCard/${item}`);

      return response?.data;
    } catch (error) {
      console.log("fetchSearchCitizenIdCard", error);
    }
  }
);

export const fetchSelectCustomer = createAsyncThunk(
  "appCustomers/fetchSelectCustomer",
  async (item) => {
    try {
      const response = await axiosApi.get(
        `/customers/select/${item.branchId}/${item.customerType}/${item.search}`
      );
      return response.data;
    } catch (error) {
      console.error("fetchSelectCustomer", error);
    }
  }
);

export const fetchSelectReseller = createAsyncThunk(
  "appCustomers/fetchSelectReseller",
  async (item) => {
    try {
      const response = await axiosApi.get(
        `/customers/select/${item.branchId}/${item.customerType}/${item.search}`
      );

      return response.data;
    } catch (error) {
      console.error("fetchSelectReseller", error);
    }
  }
);

export const fetchSelectMirrorCustomer = createAsyncThunk(
  "appCustomers/fetchSelectMirrorCustomer",
  async (item) => {
    try {
      const response = await axiosApi.get(
        `/customers/select/${item.branchId}/${item.customerType}/${item.search}`
      );

      return response.data;
    } catch (error) {
      console.error("fetchSelectMirrorCustomer", error);
    }
  }
);

export const fetchInfoCustomer = createAsyncThunk(
  "appCustomers/fetchInfoCustomer",
  async (item) => {
    try {
      const response = await axiosApi.get(`/customers/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoCustomer", error);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "appCustomers/updateCustomer",
  async (item, { dispatch, getState }) => {
    try {
      const response = await axiosApi.patchForm(`/customers/${item.id}`, item);

      const state = getState();

      const params = state.customer.params;
      if (!isEmpty(params)) {
        dispatch(fetchCustomer(params));
      }

      const paramsManageFinancial = state.manageFinancial.params;
      if (!isEmpty(paramsManageFinancial)) {
        dispatch(fetchProcessManageFinance(paramsManageFinancial));
      }

      return response?.data;
    } catch (error) {
      console.error("updateCustomer", error);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "appCustomers/deleteCustomer",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.delete(`/customers/${item.id}`);

      const state = getState();

      const params = state.customer.params;
      if (!isEmpty(params)) {
        dispatch(fetchCustomer(params));
      }
    } catch (error) {
      console.error("deleteCustomer", error);
    }
  }
);

export const appCustomersSlice = createSlice({
  name: "appCustomers",
  initialState: {
    params: {},
    allData: [],
    select: [],
    selectReseller: [],
    selectMirror: [],
    auth: isEmpty(localStorage.getItem("customer"))
      ? {}
      : JSON.parse(localStorage.getItem("customer")),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoCustomer.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectCustomer.fulfilled, (state, action) => {
        state.select = action.payload;
      })
      .addCase(fetchSelectReseller.fulfilled, (state, action) => {
        state.selectReseller = action.payload;
      })
      .addCase(fetchSelectMirrorCustomer.fulfilled, (state, action) => {
        state.selectMirror = action.payload;
      });
  },
});

export default appCustomersSlice.reducer;
