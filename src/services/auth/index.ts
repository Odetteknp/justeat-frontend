import { saveToken, clearToken } from "../tokenStore";
import type { AuthProvider, LoginInput, SignupInput, LoginResult, SignupResult } from "./types";
import { ApiAuthProvider } from "./providers/api";
import { MockAuthProvider } from "./providers/mock";

const useApi = import.meta.env.VITE_USE_API === "true";
const provider: AuthProvider = useApi ? new ApiAuthProvider() : new MockAuthProvider();

/** ล็อกอิน: รองรับ remember + ยืดหยุ่นต่อ cookie/bearer */
export async function login(input: LoginInput, signal?: AbortSignal): Promise<LoginResult> {
  const res = await provider.login(input, signal);
  // ถ้า backend ใช้ cookie: token อาจไม่มี -> ไม่ต้อง saveToken
  if (res.token) saveToken(res.token, input.remember);
  return res;
}

export async function signup(input: SignupInput, signal?: AbortSignal): Promise<SignupResult> {
  return provider.signup ? provider.signup(input, signal) : Promise.reject(new Error("Not implemented"));
}

export async function logout(signal?: AbortSignal): Promise<void> {
  try {
    if (provider.logout) await provider.logout(signal);
  } finally {
    clearToken();
  }
}

export async function me(signal?: AbortSignal) {
  if (!provider.me) throw new Error("Not implemented");
  return provider.me(signal);
}
