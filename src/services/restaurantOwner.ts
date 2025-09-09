// src/services/restaurantOwner.ts
import { api } from "./api";

export type MyRestaurant = {
  id: number;
  name: string;
  address: string;
  description: string;
  pictureBase64?: string;
  openingTime?: string;
  closingTime?: string;
  restaurantCategoryId?: number;
  restaurantStatusId?: number;
};

export async function getMyRestaurant(): Promise<MyRestaurant | null> {
  const { data } = await api.get("/auth/me/restaurant");
  const r = data?.restaurant;
  if (!r) return null;

  const pictureBase64 = r.pictureBase64 ?? r.logo ?? r.picture ?? undefined;

  return {
    // ✅ รองรับทั้ง id และ ID
    id: Number(r.id ?? r.ID),
    name: r.name || "",
    address: r.address || "",
    description: r.description || "",
    pictureBase64,
    openingTime: r.openingTime || "",
    closingTime: r.closingTime || "",
    restaurantCategoryId: r.restaurantCategoryId ?? r.category?.id,
    restaurantStatusId: r.restaurantStatusId ?? r.status?.id,
  };
}

export async function updateMyRestaurant(
  id: number,
  payload: Partial<MyRestaurant>
) {
  const body = {
    name: payload.name,
    address: payload.address,
    description: payload.description,
    pictureBase64: payload.pictureBase64,
    openingTime: payload.openingTime,
    closingTime: payload.closingTime,
    restaurantCategoryId: payload.restaurantCategoryId,
    restaurantStatusId: payload.restaurantStatusId,
  };
  return api.patch(`/owner/restaurants/${id}`, body);
}
