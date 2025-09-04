import type { UserProfile } from "../types";
import { api } from "./api";

export type ProfileUpdateDTO = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  avatarBase64?: string; // ✅ ใช้ field นี้แทน avatarUrl
};

// ดึงโปรไฟล์ปัจจุบัน
export async function getProfile() {
  const res = await api.get("/auth/me");
  return res.data.user as UserProfile;
}

// อัปเดตโปรไฟล์
export async function updateProfile(payload: ProfileUpdateDTO) {
  await api.patch("/auth/me", payload);
  const res = await api.get("/auth/me");
  return res.data.user as UserProfile;
}

// ✅ ดึง Avatar (Base64)
export async function getAvatarBase64(): Promise<string | null> {
  const res = await api.get("/auth/me/avatar");
  return res.data.avatarBase64 ?? null;
}

// ✅ อัปโหลด Avatar (Base64) แล้วได้ user กลับมา
export async function uploadAvatarBase64(b64: string): Promise<UserProfile> {
  const res = await api.post("/auth/me/avatar", { avatarBase64: b64 });
  return res.data.user as UserProfile;
}
