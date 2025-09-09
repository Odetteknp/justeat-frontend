// src/services/orders.ts
import { api } from "./api";

export const orders = {
  // สร้างออเดอร์
  create: (body: {
    restaurantId: number;
    items: Array<{ menuId: number; qty: number; note?: string }>;
  }) => api.post<{ id: number; total: number }>("/orders", body),

  // ดูออเดอร์ของผู้ใช้
  myOrders: () => api.get("/profile/orders"), // ✅ แก้เป็น orders (มี s)

  // ดูรายละเอียดออเดอร์
  detail: (id: number) => api.get(`/orders/${id}`),
};
