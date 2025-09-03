// src/services/reports.ts
import { api } from "./api";

export type Report = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  description: string;
  issueTypeId: number;
  picture?: string;
  createdAt: string;
};

export const reports = {
  create: (formData: FormData) =>
    api.post("/reports", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  list: () => api.get<{ ok: boolean; reports: Report[] }>("/reports"),

  getById: (id: number) =>
    api.get<{ ok: boolean; report: Report }>(`/reports/${id}`),
};
