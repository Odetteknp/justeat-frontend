// src/services/auth/index.ts
import { api } from "../apiClient"; // ⚠️ ชี้มาที่ไฟล์ instance ที่คุณมีจริง
import { clearToken } from "../tokenStore";

// กำหนด type ตาม backend จริงของคุณ
export type User = { id: number|string; email: string; role: string };
export type LoginResponse = { token?: string; user: User };
export type RefreshResponse = { token: string };

// ---- ฟังก์ชันเดี่ยว (ให้ไฟล์เดิมที่ import { login } ยังทำงานได้) ----
export const register = (body: {
  email: string; password: string; firstName: string; lastName: string; phoneNumber?: string;
}) => api.post("/auth/register", body).then(r => r.data);

export const login = (body: { email: string; password: string }) =>
  api.post<LoginResponse>("/auth/login", body).then(r => r.data);

export const me = () =>
  api.get<User>("/auth/me").then(r => r.data);

export const refresh = () =>
  api.post<{ token: string }>("/auth/refresh").then(r => r.data);

export const logout = async () => {
  try {
    // ถ้า backend มี endpoint นี้ให้เปิดใช้
    await api.post("/auth/logout");
  } catch {
    // ไม่ต้อง throw — เคลียร์ฝั่ง client ต่อไป
  } finally {
    clearToken();
    // ถ้าตั้ง Authorization ไว้ที่ instance ให้ล้างด้วย
    if ((api as any)?.defaults?.headers?.common?.Authorization) {
      delete (api as any).defaults.headers.common.Authorization;
    }
  }
  return true;
};

// ---- รวมเป็น object สำหรับผู้ที่อยากใช้แบบ auth.login ----
export const auth = { register, login, me, refresh, logout };
export default auth; // จะ import auth จาก default ก็ได้
