// src/services/riderWorkApi.ts
import { api } from "./api";

export type RiderAvailability = "ONLINE" | "OFFLINE";

export type AvailableOrder = {
  id: number;
  createdAt: string;        // ISO string หลัง normalize
  restaurantName: string;
  customerName: string;
  address?: string;
  total: number;
};

function normalizeIsoMs(s: string): string {
  // ตัดเศษวินาทีให้เหลือ 3 หลัก (จาก .ddddddd เป็น .ddd)
  return s.replace(/(\.\d{3})\d+/, "$1");
}

export const riderWorkApi = {
  setAvailability: (status: RiderAvailability) =>
    api.patch("/rider/me/availability", { status }),

  getAvailable: async (): Promise<AvailableOrder[]> => {
    const res = await api.get("/rider/works/available");
    const arr = res.data.items ?? res.data;
    return arr.map((x: any) => ({
      id: x.id,
      createdAt: normalizeIsoMs(x.createdAt),
      restaurantName: x.restaurantName,
      customerName: x.customerName,
      address: x.address,
      total: x.total,
    })) as AvailableOrder[];
  },

  accept: (orderId: number) => api.post(`/rider/works/${orderId}/accept`),
  complete: (orderId: number) => api.post(`/rider/works/${orderId}/complete`),
};
