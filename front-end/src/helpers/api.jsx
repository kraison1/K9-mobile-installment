import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { isEmpty } from "lodash";
import { conFirm, error as alertError, success } from "src/components/alart";

const checkTokenTime = 1800;

const axiosApi = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: false,
});

export function getToken() {
  return localStorage.getItem("jwtToken");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

export function setToken(token) {
  localStorage.setItem("jwtToken", token);
}

export function setRefreshToken(refreshToken) {
  localStorage.setItem("refresh_token", refreshToken);
}

export function setPermissions(permissions) {
  localStorage.setItem("permissions", JSON.stringify(permissions));
}

export function setUser(token) {
  const decoded = jwtDecode(token);
  localStorage.setItem("user", JSON.stringify(decoded));
}

export function getTokenState() {
  return localStorage.getItem("tokenState") || "use_access_token";
}

export function setTokenState(state) {
  localStorage.setItem("tokenState", state);
}

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(access_token) {
  refreshSubscribers.forEach((callback) => callback(access_token));
  refreshSubscribers = [];
}

async function refreshToken(refreshToken) {
  try {
    // console.log("Attempting to refresh token");
    const { data } = await axios.post(
      `${import.meta.env.VITE_APP_API_URL}/auth/refresh-token`,
      { refreshToken: refreshToken, deviceType: "website" },
      { headers: { "Content-Type": "application/json" } }
    );
    const { access_token, refresh_token, permissions } = data;
    setUser(access_token);
    setToken(access_token);
    setRefreshToken(refresh_token);
    setPermissions(permissions);
    setTokenState("use_access_token");
    localStorage.setItem("lastRefresh", Date.now().toString());
    // console.log("Token refreshed:", access_token);
    return access_token;
  } catch (err) {
    console.error("Refresh token error:", err.response?.data);
    alertError(
      `Refresh token error: ${err.response?.data?.message || "Unknown error"}`
    );
    throw err;
  }
}

axiosApi.interceptors.request.use(
  async (config) => {
    if (!config.skipInterceptor) {
      const tokenState = getTokenState();
      let token;

      if (tokenState === "use_access_token") {
        token = getToken();
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        } else {
          // console.log("No access token, switching to refresh token");
          setTokenState("use_refresh_token");
          token = getRefreshToken();
          if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
          } else {
            // console.log("No tokens available");
            delete config.headers["Authorization"];
          }
        }
      } else {
        token = getRefreshToken();
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        } else {
          // console.log("No refresh token available");
          delete config.headers["Authorization"];
        }
      }

      // ตรวจสอบอายุ refresh_token
      const refreshTokenValue = getRefreshToken();
      if (refreshTokenValue && !isRefreshing) {
        try {
          const decoded = jwtDecode(refreshTokenValue);
          const now = Math.floor(Date.now() / 1000);
          const timeLeft = decoded.exp - now;

          if (timeLeft < checkTokenTime) {
            // เหลือ < 5 นาที
            // console.log("Refresh token near expiry, refreshing");
            isRefreshing = true;
            try {
              const access_token = await refreshToken(refreshTokenValue);
              config.headers["Authorization"] = `Bearer ${access_token}`;
              isRefreshing = false;
              onRefreshed(access_token);
            } catch {
              isRefreshing = false;
              conFirmToLogin();
              delete config.headers["Authorization"];
            }
          }
        } catch {
          // console.log("Invalid refresh token, clearing authorization");
          delete config.headers["Authorization"];
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const conFirmToLogin = () => {
  conFirm(`หมดอายุการใช้งาน !`, "ตกลง", "ปิด", false)
    .then(() => {
      localStorage.clear();
      setTokenState("use_access_token");
    })
    .finally(() => {
      window.location.href = `${import.meta.env.VITE_APP_BASE_NAME}/login`;
    });
};

axiosApi.interceptors.response.use(
  async (response) => {
    // console.log("Response status:", response.status);
    const data = response.data;
    const { message_error, message_success } = data;
    if (!isEmpty(message_error)) {
      console.error("API error:", message_error);
      alertError(`API error: ${message_error}`);
    } else if (!isEmpty(message_success)) {
      success(message_success);
    }
    return response;
  },
  async (error) => {
    // console.log(
    //   "Response error:",
    //   error.response?.status,
    //   error.response?.data
    // );
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((access_token) => {
            originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
            resolve(axiosApi(originalRequest));
          });
        });
      }

      isRefreshing = true;
      const tokenState = getTokenState();
      let refreshTokenValue = getRefreshToken();

      if (tokenState === "use_access_token") {
        // console.log("Access token failed, switching to refresh token");
        setTokenState("use_refresh_token");
        if (refreshTokenValue) {
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${refreshTokenValue}`;
          isRefreshing = false;
          return axiosApi(originalRequest);
        }
      }

      if (refreshTokenValue) {
        try {
          const access_token = await refreshToken(refreshTokenValue);
          originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
          isRefreshing = false;
          onRefreshed(access_token);
          return axiosApi(originalRequest);
        } catch {
          isRefreshing = false;
          // console.log("Refresh failed, redirecting to login");
          conFirmToLogin();
          return Promise.reject(error);
        }
      } else {
        // console.log("No refresh token available");
        isRefreshing = false;
        conFirmToLogin();
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && originalRequest._retry) {
      // console.log("Retry failed, redirecting to login");
      conFirmToLogin();
    }

    return Promise.reject(error);
  }
);

export default axiosApi;
