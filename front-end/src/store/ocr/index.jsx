import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addOcr = createAsyncThunk("appOcrs/addOcr", async (item) => {
  try {
    const response = await axiosApi.postForm(`/ocr`, item);

    const { infoBarcode } = response.data;

    return { infoBarcode: infoBarcode };
  } catch (error) {
    console.error("addOcr", error);
  }
});

export const fetchOcr = createAsyncThunk("appOcrs/fetchOcr", async (item) => {
  try {
    const response = await axiosApi.post(`/ocr/search`, item);
    return {
      params: item,
      allData: response.data,
    };
  } catch (error) {
    console.error("fetchOcr", error);
  }
});

export const fetchInfoOcr = createAsyncThunk(
  "appOcrs/fetchInfoOcr",
  async (item) => {
    try {
      const response = await axiosApi.get(`/ocr/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoOcr", error);
    }
  }
);

export const checkOcr = createAsyncThunk(
  "appOcrs/checkOcr",
  async ({ item, navigate }) => {
    try {
      const response = await axiosApi.patchForm(`/ocr/${item.code}`, item);

      const { message_success } = response.data;
      if (message_success) {
        setTimeout(() => {
          navigate(`/`, { replace: true });
        }, 500);
      }
    } catch (error) {
      console.error("checkOcr", error);
    }
  }
);

export const updateOcr = createAsyncThunk("appOcrs/updateOcr", async (item) => {
  try {
    await axiosApi.patchForm(`/ocr/${item.code}`, item);
  } catch (error) {
    console.error("updateOcr", error);
  }
});

export const appOcrsSlice = createSlice({
  name: "appOcrs",
  initialState: {
    createNew: {},
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(addOcr.fulfilled, (state, action) => {
        state.createNew = action.payload.infoBarcode;
      })
      .addCase(fetchOcr.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoOcr.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default appOcrsSlice.reducer;
