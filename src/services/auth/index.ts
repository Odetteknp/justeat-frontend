// src/services/auth/index.ts
import { api } from "../apiClient";
import { setToken, clearToken } from "../tokenStore";

// ---- Types ให้ตรงกับ backend ตอนนี้ ----
export type User = {
  id: number | string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  role: string;
};

export type LoginResponse = { ok?: boolean; token?: string; user: User };
export type RefreshResponse = { token: string };

// ---- helper: ดึง user จาก payload ได้ทั้งห่อ/ไม่ห่อ ----
function extractUser(payload: any): User {
  // รองรับ { user: {...} } หรือ { data: {...} } หรือ user ตรงๆ
  return (payload?.user ?? payload?.data ?? payload) as User;
}

// ---- ฟังก์ชันเดี่ยว (ให้ import { login } ยังทำงานได้) ----
export const register = async (body: {
  email: string; password: string; firstName: string; lastName: string; phoneNumber?: string;
}) => {
  const { data } = await api.post("/auth/register", body);
  // คืน user ตรงๆ เพื่อ FE ใช้ง่าย
  return extractUser(data);
};

export const login = async (body: { email: string; password: string }) => {
  const { data } = await api.post<LoginResponse>("/auth/login", body);
  if (data?.token) {
    setToken(data.token);
    // (ออปชัน) เผื่อบางหน้าที่ยังไม่ได้แนบจาก interceptor
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
  }
  // ถ้าต้องการตั้ง header อัตโนมัติที่นี่ก็ทำได้:
  // if (data.token) api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
  return data; // คงรูปแบบเดิม: { ok, token, user }
};

export const me = async () => {
  const { data } = await api.get("/auth/me");
  // คืน user ตรงๆ เสมอ (useAuthGuard จะได้ไม่แตก)
  return extractUser(data);
};

export const refresh = () =>
  api.post<RefreshResponse>("/auth/refresh").then(r => r.data);

export const logout = async () => {
  try {
    // ถ้ามี endpoint นี้ค่อยเรียก; ถ้าไม่มีก็ข้าม
    await api.post("/auth/logout");
  } catch {
    // ignore
  } finally {
    clearToken();
    if ((api as any)?.defaults?.headers?.common?.Authorization) {
      delete (api as any).defaults.headers.common.Authorization;
    }
  }
  return true;
};

// ---- รวม object
export const auth = { register, login, me, refresh, logout };
export default auth;

