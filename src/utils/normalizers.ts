// utils/normalizers.ts
import type { listRestaurant } from "../types";

export function toListRestaurant(r: any): listRestaurant {
  return {
    id: String(r.id ?? r.ID),
    name: r.name ?? r.restaurantName ?? "",
    cover: r.logo ?? r.picture ?? "",   // backend ใช้ logo/picture
    rating: typeof r.rating === "number" ? r.rating : undefined,
  };
}