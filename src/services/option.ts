import { api } from "./api";

export const option = {
  // Public
  list: () => api.get("/options"),
  get: (id: number) => api.get(`/options/${id}`),

  // Owner
  create: (body: any, token: string) =>
    api.post("/owner/options", body, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  update: (id: number, body: any, token: string) =>
    api.patch(`/owner/options/${id}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  remove: (id: number, token: string) =>
    api.delete(`/owner/options/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
