import { api } from "./api";

export const restaurants = {
  list: (q?: { q?: string; categoryId?: number; statusId?: number; page?: number; limit?: number }) =>
    api.get("/restaurants", { params: q }),

  detail: (id: number | string) => api.get(`/restaurants/${id}`),
};

// type กลางตามที่คุณกำหนด
export interface listRestaurant {
  id: string;
  name: string;
  cover: string; // base64 หรือ data URI / URL ก็ได้
  rating?: number;
}

type Query = {
  q?: string;
  categoryId?: number;
  statusId?: number;
  page?: number;
  limit?: number;
};

// ดึงลิสต์ร้าน + map ให้เป็น listRestaurant[] แบบตรงไปตรงมา
export async function listRestaurants(q?: Query): Promise<listRestaurant[]> {
  const res = await api.get("/restaurants", { params: q });
  const items = res.data?.items ?? res.data ?? [];
  return items.map((r: any) => ({
    id: String(r.id ?? r.ID),
    name: r.name ?? r.restaurantName ?? "",
    cover: r.logo ?? r.picture ?? "",   // BE บางที่ใช้ logo, บางที่ picture
    rating: typeof r.rating === "number" ? r.rating : undefined,
  }));
}

// รายละเอียดร้าน (อยากคงแบบดิบไว้ก็ได้)
export function getRestaurant(id: number | string) {
  return api.get(`/restaurants/${id}`);
}
