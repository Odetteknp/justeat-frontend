// services/application.ts
import { api } from "./api";

export const applications = {
  apply: (body: {
    name: string; address?: string; description?: string; picture?: string; restaurantCategoryId: number;
  }) => api.post("/restaurant-applications", body),

};
