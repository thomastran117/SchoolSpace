import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import axios from "axios";
import environment from "../configuration/Environment";

const BASE_URL: string = environment.backend_url;

const PublicApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

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
