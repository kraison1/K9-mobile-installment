import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addShopInsurance = createAsyncThunk(
  "appShopInsurances/addShopInsurance",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/shop-insurance`, item);
      
      const state = getState();
      
      const params = state.shopInsurance.params;
      dispatch(fetchShopInsurance(params)); 
    } catch (error) {
      console.error("addShopInsurance", error);
    }
  }
);

export const fetchShopInsurance = createAsyncThunk(
  "appShopInsurances/fetchShopInsurance",
  async (item) => {
    try {
      const response = await axiosApi.post(`/shop-insurance/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchShopInsurance", error);
    }
  }
);

export const fetchInfoShopInsurance = createAsyncThunk(
  "appShopInsurances/fetchInfoShopInsurance",
  async (item) => {
    try {
      const response = await axiosApi.get(`/shop-insurance/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoShopInsurance", error);
    }
  }
);

export const fetchSelectShopInsurance = createAsyncThunk(
  "appShopInsurances/fetchSelectShopInsurance",
  async () => {
    try {
      const response = await axiosApi.get(`/shop-insurance/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectShopInsurance", error);
    }
  }
);

export const updateShopInsurance = createAsyncThunk(
  "appShopInsurances/updateShopInsurance",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/shop-insurance/${item.id}`, item);
      
      const state = getState();
      
      const params = state.shopInsurance.params;
      dispatch(fetchShopInsurance(params)); 
    } catch (error) {
      console.error("updateShopInsurance", error);
    }
  }
);

export const appShopInsurancesSlice = createSlice({
  name: "appShopInsurances",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShopInsurance.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoShopInsurance.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectShopInsurance.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appShopInsurancesSlice.reducer;
