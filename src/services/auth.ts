import { api } from "../services/api";
import type {
  LoginResponse,
  RegisterResponse,
  MeResponse,
  RefreshResponse,
} from "../types";

export const auth = {
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) =>
    api.post<RegisterResponse>("/auth/register", body).then((res) => res.data),

  login: (body: { email: string; password: string }) =>
    api.post<LoginResponse>("/auth/login", body).then((res) => res.data),

  me: () => api.get<MeResponse>("/auth/me").then((res) => res.data),

  refresh: () =>
    api.post<RefreshResponse>("/auth/refresh").then((res) => res.data),
};
