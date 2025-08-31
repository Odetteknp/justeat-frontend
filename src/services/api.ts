import axios from "axios";
import { getToken, clearToken } from "./tokenStore"; // คุณมี getToken อยู่แล้ว

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = getToken?.();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      clearToken?.();
      // redirect ไป login ถ้าต้องการ
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
