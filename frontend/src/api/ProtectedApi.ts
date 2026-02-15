import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import { store } from "../stores";
import { setCredentials, clearCredentials } from "../stores/authSlice";
import environment from "../configuration/Environment";
import { ensureCsrfToken } from "./Crsf";

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
    const refreshResp = await ProtectedApi.post("/auth/refresh");
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

ProtectedApi.interceptors.request.use(
  async (config: RetryAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.accessToken;

    config.headers = config.headers ?? {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = (config.method ?? "get").toLowerCase();
    const isUnsafe = ["post", "put", "patch", "delete"].includes(method);

    const url = config.url ?? "";
    const needsCsrf =
      isUnsafe || url.includes("/auth/refresh") || url.includes("/auth/logout");

    if (needsCsrf) {
      const csrf = await ensureCsrfToken();
      config.headers["X-CSRF-Token"] = csrf;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

function isTimeoutError(err: AxiosError) {
  const code = (err as any).code as string | undefined;
  return (
    code === "ECONNABORTED" ||
    code === "ETIMEDOUT" ||
    (typeof err.message === "string" &&
      err.message.toLowerCase().includes("timeout"))
  );
}

ProtectedApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (isTimeoutError(error)) {
      console.error("Request timed out:", {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
      });

      throw new Error("Request timed out. Please try again.");
    }

    if (status === 500) {
      console.error("Internal server error:", data);
      throw new Error("A server error occurred. Please try again later.");
    }

    return Promise.reject(error);
  },
);

export default ProtectedApi;
