import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { isEmpty } from "lodash";
import { jwtDecode } from "jwt-decode";
import axiosApi from "src/helpers/api";

export const addUser = createAsyncThunk(
  "appUsers/addUser",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.post(`/users`, item);

      const state = getState();

      const params = state.user.params;
      dispatch(fetchUser(params));
    } catch (error) {
      console.error("addUser", error);
    }
  },
);

export const fetchUser = createAsyncThunk(
  "appUsers/fetchUser",
  async (item) => {
    try {
      const response = await axiosApi.post(`/users/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.log("fetchUser", error);
    }
  },
);

export const fetchInfoUser = createAsyncThunk(
  "appUsers/fetchInfoUser",
  async (item) => {
    try {
      const response = await axiosApi.get(`/users/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoUser", error);
    }
  },
);

export const updateUser = createAsyncThunk(
  "appUsers/updateUser",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patch(`/users/${item.id}`, item);

      const state = getState();

      const params = state.user.params;
      // console.log("params", params);
      dispatch(fetchUser(params));
    } catch (error) {
      console.error("updateUser", error);
    }
  },
);

export const authLogin = createAsyncThunk(
  "appUsers/authLogin",
  async (formData) => {
    localStorage.clear();
    try {
      const response = await axiosApi.post("/auth/login", formData);
      const { access_token, refresh_token, permissions } = response.data;
      if (access_token == undefined) {
        throw new Error("No access token returned");
      }
      const decoded = jwtDecode(access_token);

      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("jwtToken", access_token);
      localStorage.setItem("user", JSON.stringify(decoded));
      localStorage.setItem("permissions", permissions);

      return {
        decoded: decoded,
        permissions: permissions,
      };
    } catch (error) {
      console.log("login", error);
    }
  },
);
// localStorage.clear();

export const authLogout = createAsyncThunk("appUsers/logout", async () => {
  localStorage.clear();
  return {};
});

export const appUsersSlice = createSlice({
  name: "appUsers",
  initialState: {
    params: {},
    allData: [],
    select: [],
    permissions: [],
    auth: isEmpty(localStorage.getItem("user"))
      ? {}
      : JSON.parse(localStorage.getItem("user")),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchInfoUser.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(authLogin.fulfilled, (state, action) => {
        state.auth = action.payload.decoded;
        state.permissions = action.payload.permissions;
      })
      .addCase(authLogout.fulfilled, (state, action) => {
        state.auth = action.payload;
      });
  },
});

export default appUsersSlice.reducer;
