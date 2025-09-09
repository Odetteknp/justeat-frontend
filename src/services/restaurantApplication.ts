// services/restaurantApplication.ts

import { api } from "./api";

export type ApplyRestaurantDTO = {
  name: string;
  address: string;
  description: string;
  pictureBase64?: string;
  openingTime: string;
  closingTime: string;
  restaurantCategoryId: number;
};

export async function applyRestaurant(payload: ApplyRestaurantDTO) {
  const res = await api.post("/partner/restaurant-applications", payload);
  return res.data;
}

export async function listApplications(status: string = "pending") {
  const res = await api.get(`/partner/restaurant-applications?status=${status}`);
  return res.data.items;
}

export async function approveApplication(id: number, restaurantStatusId: number = 1) {
  const res = await api.patch(`/partner/restaurant-applications/${id}/approve`, {
    restaurantStatusId,
  });
  return res.data;
}

export async function rejectApplication(id: number, reason: string) {
  const res = await api.patch(`/partner/restaurant-applications/${id}/reject`, {
    reason,
  });
  return res.data;
}