import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import axios from "axios";
import environment from "../configuration/Environment";
import { ensureCsrfToken } from "./Crsf";

const BASE_URL: string = environment.backend_url;

const PublicApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

PublicApi.interceptors.request.use(
  async (config) => {
    const method = (config.method ?? "get").toLowerCase();

    const isUnsafe = ["post", "put", "patch", "delete"].includes(method);

    const url = config.url ?? "";
    const needsCsrf =
      isUnsafe ||
      url.includes("/auth/login") ||
      url.includes("/auth/logout");

    if (needsCsrf) {
      const token = await ensureCsrfToken();

      config.headers = config.headers ?? {};
      config.headers["X-CSRF-Token"] = token;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

PublicApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 500) {
      console.error("Internal server error:", data);
      throw new Error("A server error occurred. Please try again later.");
    }

    return Promise.reject(error);
  },
);

export default PublicApi;
