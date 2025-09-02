import { api } from "./api";

export const restaurants = {
  list: (q?: { q?: string; categoryId?: number; statusId?: number; page?: number; limit?: number }) =>
    api.get("/restaurants", { params: q }),

  detail: (id: number | string) => api.get(`/restaurants/${id}`),
};
