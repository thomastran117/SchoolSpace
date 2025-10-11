import axios from "axios";
import config from "../configs/envManager";

const BASE_URL = config.backend_url;

const PublicApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

PublicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 500) {
      console.error("Internal server error:", error.response?.data);
      throw new Error("A server error occurred. Please try again later.");
    }
    return Promise.reject(error);
  },
);

export default PublicApi;
