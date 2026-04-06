import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addTransport = createAsyncThunk(
  "appTransport/addTransport",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/transport`, item);
      
      const state = getState();
      
      const params = state.transport.params;
      dispatch(fetchTransport(params)); 
    } catch (error) {
      console.error("addTransport", error);
    }
  }
);

export const fetchTransport = createAsyncThunk(
  "appTransport/fetchTransport",
  async (item) => {
    try {
      const response = await axiosApi.post(`/transport/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchTransport", error);
    }
  }
);

export const fetchInfoTransport = createAsyncThunk(
  "appTransport/fetchInfoTransport",
  async (item) => {
    try {
      const response = await axiosApi.get(`/transport/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoTransport", error);
    }
  }
);

export const fetchSelectTransport = createAsyncThunk(
  "appTransport/fetchSelectTransport",
  async () => {
    try {
      const response = await axiosApi.get(`/transport/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectTransport", error);
    }
  }
);

export const updateTransport = createAsyncThunk(
  "appTransport/updateTransport",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/transport/${item.id}`, item);
      
      const state = getState();
      
      const params = state.transport.params;
      dispatch(fetchTransport(params)); 
    } catch (error) {
      console.error("updateTransport", error);
    }
  }
);

export const appTransportSlice = createSlice({
  name: "appTransport",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransport.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoTransport.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectTransport.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appTransportSlice.reducer;
