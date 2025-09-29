import axios from "axios";
import { store } from "./stores";
import { setCredentials, clearCredentials } from "./stores/authSlice";
import config from "./configs/envManager";

const BASE_URL = config.backend_url;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let refreshPromise = null;

async function refreshToken(state) {
  try {
    const refreshResp = await api.get("/auth/refresh");
    const { accessToken } = refreshResp.data;

    store.dispatch(
      setCredentials({
        token: accessToken,
        role: state.auth.role,
        email: state.auth.email,
      })
    );

    return accessToken;
  } catch (err) {
    if (
      err.response?.status === 401 &&
      err.response?.data?.message === "Missing refresh token"
    ) {
      store.dispatch(clearCredentials());
      throw new Error("You are not logged in. Please log in.");
    }

    if (
      err.response?.status === 401 &&
      (err.response?.data?.message === "Expired refresh token" ||
        err.response?.data?.message === "Invalid refresh token")
    ) {
      store.dispatch(clearCredentials());
      throw new Error("Your session has expired. Please log in again.");
    }

    store.dispatch(clearCredentials());
    throw err;
  }
}

api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;
    const state = store.getState();

    if (originalConfig?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      const msg = error.response?.data?.message || "";

      if (msg.includes("Invalid access token")) {
        store.dispatch(clearCredentials());
        return Promise.reject(new Error("Invalid session. Please log in again."));
      }

      if (!originalConfig._retry) {
        originalConfig._retry = true;

        if (!refreshPromise) {
          refreshPromise = refreshToken(state).finally(() => {
            refreshPromise = null;
          });
        }

        try {
          const newToken = await refreshPromise;

          originalConfig.headers = originalConfig.headers ?? {};
          originalConfig.headers.Authorization = `Bearer ${newToken}`;

          return api(originalConfig);
        } catch (err) {
          return Promise.reject(err);
        }
      }
    }

    if (error.response?.status === 500) {
      console.error("Internal server error:", error.response?.data);
      throw new Error("An unexpected server error occurred. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;
