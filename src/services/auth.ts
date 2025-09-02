
// src/serviecs/auth.ts
import { api } from "./api";

export const auth = {
  register: (body: {
    email: string; password: string; firstName: string; lastName: string; phoneNumber?: string
  }) => api.post("/auth/register", body),

  login: (body: { email: string; password: string }) => api.post("/auth/login", body),

  me: () => api.get("/auth/me"),

  // ถ้ามี endpoint refresh
  refresh: () => api.post("/auth/refresh"),
};
