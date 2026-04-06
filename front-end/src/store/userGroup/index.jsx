import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "src/helpers/api";

export const addUserGroup = createAsyncThunk(
  "appUserGroups/addUserGroup",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/user-groups`, item);
      
      const state = getState();
      
      const params = state.userGroup.params;
      dispatch(fetchUserGroup(params)); 
    } catch (error) {
      console.error("addUserGroup", error);
    }
  }
);

export const fetchUserGroup = createAsyncThunk(
  "appUserGroups/fetchUserGroup",
  async (item) => {
    try {
      const response = await axiosApi.post(`/user-groups/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchUserGroup", error);
    }
  }
);

export const fetchInfoUserGroup = createAsyncThunk(
  "appUserGroups/fetchInfoUserGroup",
  async (item) => {
    try {
      const response = await axiosApi.get(`/user-groups/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoUserGroup", error);
    }
  }
);

export const fetchSelectGroup = createAsyncThunk(
  "appUserGroups/fetchSelectGroup",
  async () => {
    try {
      const response = await axiosApi.get(`/user-groups/select`);
      return response.data;
    } catch (error) {
      console.error("fetchSelectGroup", error);
    }
  }
);

export const updateUserGroup = createAsyncThunk(
  "appUserGroups/updateUserGroup",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/user-groups/${item.id}`, item);
      
      const state = getState();
      
      const params = state.userGroup.params;
      dispatch(fetchUserGroup(params)); 
    } catch (error) {
      console.error("updateUserGroup", error);
    }
  }
);

export const appUserGroupsSlice = createSlice({
  name: "appUserGroups",
  initialState: {
    params: {},
    data: {},
    select: [],
    allData: [],
  },
  reducers: {
    resetGroups: (state) => {
      state.params = {};
      state.data = {};
      state.select = [];
      state.allData = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserGroup.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoUserGroup.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectGroup.fulfilled, (state, action) => {
        state.select = action.payload;
      });
  },
});

export default appUserGroupsSlice.reducer;
