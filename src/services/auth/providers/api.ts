import { apiFetch } from "../../apiClient";
import type { AuthProvider, LoginInput, LoginResult, SignupInput, SignupResult } from "../types";

// ถ้าใช้ Bearer token ให้ส่ง header Authorization ในที่ที่จำเป็น (เช่น /me)
// หรือใช้ cookie ล้วน (credentials: include) ก็ไม่ต้องแนบ header
export class ApiAuthProvider implements AuthProvider {
  private base = "/api";

  async login(data: LoginInput, signal?: AbortSignal): Promise<LoginResult> {
    // backend ของคุณ: POST /api/login -> { token?, user }
    const res = await apiFetch<LoginResult>(`${this.base}/login`, {
      method: "POST",
      body: JSON.stringify({ email: data.email, password: data.password }),
    }, signal);
    return res;
  }

  async signup(data: SignupInput, signal?: AbortSignal): Promise<SignupResult> {
    return apiFetch<SignupResult>(`${this.base}/signup`, {
      method: "POST",
      body: JSON.stringify(data),
    }, signal);
  }

  async logout(signal?: AbortSignal): Promise<void> {
    await apiFetch<void>(`${this.base}/logout`, { method: "POST" }, signal);
  }

  async me(signal?: AbortSignal): Promise<LoginResult["user"]> {
    // ถ้าใช้ bearer:
    // const token = getToken(); headers: { Authorization: `Bearer ${token}` }
    const user = await apiFetch<LoginResult["user"]>(`${this.base}/me`, {}, signal);
    return user;
  }
}
