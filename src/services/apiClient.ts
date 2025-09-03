// src/services/apiClient.ts
import axios, { AxiosError, AxiosHeaders } from "axios";
import { getToken, saveToken, clearToken } from "./tokenStore";

/** Base config */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 15000,
  withCredentials: false, // ใช้ cookie session? -> true
  headers: { Accept: "application/json" },
});

const AUTH_PATHS_NO_RETRY = ["/api/login", "/api/signup", "/api/refresh"];

const isFormData = (v: unknown): v is FormData =>
  typeof FormData !== "undefined" && v instanceof FormData;

/** แปลง/รับประกันว่า headers เป็น AxiosHeaders เสมอ และ copy ค่าจาก object ที่มีมา */
function ensureAxiosHeaders(h: unknown): AxiosHeaders {
  if (h instanceof AxiosHeaders) return h;
  const out = new AxiosHeaders();
  if (h && typeof h === "object") {
    for (const [k, v] of Object.entries(h as Record<string, unknown>)) {
      if (typeof v !== "undefined") out.set(k, v as any);
    }
  }
  return out;
}

/** 👉 REQUEST INTERCEPTOR */
api.interceptors.request.use((config) => {
  const headers = ensureAxiosHeaders(config.headers);

  const token = getToken?.();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // ตั้ง Content-Type อัตโนมัติถ้าเป็น JSON (ไม่ใช่ FormData)
  if (config.data && !isFormData(config.data) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  config.headers = headers; // ✅ AxiosHeaders แล้ว
  return config;
});

/** กลไก Refresh Token (กันยิงซ้ำพร้อมกัน) */
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshHeaders = new AxiosHeaders();
      // กันเผื่อ interceptor ดันไปแนบ Authorization เดิม
      refreshHeaders.set("Authorization", "");

      const { data } = await api.post<{ token: string }>(
        "/api/refresh",
        undefined,
        {
          headers: refreshHeaders,
          withCredentials: api.defaults.withCredentials,
        }
      );

      const newToken = data?.token ?? null;
      if (newToken) {
        saveToken?.(newToken);
        return newToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/** 👉 RESPONSE INTERCEPTOR */
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError<any>) => {
    const status = err.response?.status;
    const original = err.config as (typeof err.config & { _retry?: boolean });

    if (status !== 401) return Promise.reject(err);

    const path = original?.url || "";
    const shouldSkip = AUTH_PATHS_NO_RETRY.some((p) => path.startsWith(p));
    if (original?._retry || shouldSkip) {
      clearToken?.();
      return Promise.reject(err);
    }

    // ทำ refresh 1 ครั้ง
    original._retry = true;
    const newToken = await refreshAccessToken();

    if (newToken) {
      const retryHeaders = ensureAxiosHeaders(original.headers);
      retryHeaders.set("Authorization", `Bearer ${newToken}`);
      original.headers = retryHeaders;

      return api(original);
    }

    clearToken?.();
    return Promise.reject(err);
  }
);

/** (ทางเลือก) คลาส error ที่อ่านง่าย */
export class ApiError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }

  static fromAxios(err: AxiosError<any>) {
    const msg =
      (err.response?.data as any)?.message ||
      err.message ||
      "Unexpected API error";
    return new ApiError(msg, err.response?.status, err.response?.data);
  }
}
