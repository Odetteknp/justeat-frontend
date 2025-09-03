// src/services/user.ts
import { api } from "./api";

export async function getAvatar(): Promise<string> {
  const res = await api.get("/auth/me/avatar", { responseType: "blob" });
  return URL.createObjectURL(res.data);
}
