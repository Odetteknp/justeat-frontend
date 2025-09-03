import axios from "axios";
import type { AxiosRequestHeaders } from "axios";
import { getToken, clearToken } from "./tokenStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: false,
});

// ✅ request interceptor
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    (config.headers as AxiosRequestHeaders)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ✅ response interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      clearToken();
      // window.location.href = "/login"; // redirect ไป login ถ้าต้องการ
    }
    return Promise.reject(err);
  }
);
