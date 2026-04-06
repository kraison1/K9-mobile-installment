import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "src/helpers/api";

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/chat/conversations", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  data: [],
  isLoading: false,
  total: 0,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        const { page } = action.meta.arg;
        state.isLoading = false;
        if (page === 1) {
          state.data = action.payload.data;
        } else {
          state.data = [...state.data, ...action.payload.data];
        }
        state.total = action.payload.total;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default chatSlice.reducer;
