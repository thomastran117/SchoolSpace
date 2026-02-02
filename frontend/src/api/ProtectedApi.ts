import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import { store } from "../stores";
import { setCredentials, clearCredentials } from "../stores/authSlice";
import environment from "../configuration/Environment";

const BASE_URL: string = environment.backend_url;

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const ProtectedApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

async function refreshToken(): Promise<string> {
  try {
    const refreshResp = await ProtectedApi.get("/auth/refresh");
    const { accessToken, username, role, avatar } = refreshResp.data;

    store.dispatch(
      setCredentials({
        accessToken,
        role,
        username,
        avatar,
      }),
    );

    return accessToken;
  } catch (err: any) {
    const status = err.response?.status;
    const message = err.response?.data?.message;

    if (status === 401 && message === "Missing refresh token") {
      store.dispatch(clearCredentials());
      throw new Error("You are not logged in. Please log in.");
    }

    if (
      status === 401 &&
      (message === "Expired refresh token" ||
        message === "Invalid refresh token")
    ) {
      store.dispatch(clearCredentials());
      throw new Error("Your session has expired. Please log in again.");
    }

    store.dispatch(clearCredentials());
    throw err;
  }
}

ProtectedApi.interceptors.request.use(
  (config: RetryAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

ProtectedApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const response = error.response;
    const originalConfig = error.config as RetryAxiosRequestConfig;

    if (originalConfig?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (originalConfig?.url?.includes("/auth/logout")) {
      store.dispatch(clearCredentials());
      return Promise.reject(error);
    }

    if (response?.status === 401) {
      const msg = (response.data as any)?.message || "";

      if (msg.includes("Invalid access token")) {
        store.dispatch(clearCredentials());
        return Promise.reject(
          new Error("Invalid session. Please log in again."),
        );
      }

      if (!originalConfig._retry) {
        originalConfig._retry = true;

        if (!refreshPromise) {
          refreshPromise = refreshToken().finally(() => {
            refreshPromise = null;
          });
        }

        try {
          const newToken = await refreshPromise;

          originalConfig.headers = originalConfig.headers ?? {};
          originalConfig.headers.Authorization = `Bearer ${newToken}`;

          return ProtectedApi(originalConfig);
        } catch (refreshErr) {
          return Promise.reject(refreshErr);
        }
      }
    }

    if (response?.status === 500) {
      console.error("Internal server error:", response.data);
      throw new Error(
        "An unexpected server error occurred. Please try again later.",
      );
    }

    return Promise.reject(error);
  },
);

export default ProtectedApi;
