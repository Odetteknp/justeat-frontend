// src/services/ownerOrders.ts
import { api } from "./api";

export type OwnerOrderSummary = {
  id: number;
  userId: number;
  customerName: string;
  total: number;
  orderStatusId: number;
  createdAt: string;
};

export type OwnerOrderListOut = {
  items: OwnerOrderSummary[];
  total: number;
  page: number;
  limit: number;
};

export type OrderItem = {
  id: number;
  menuId: number;
  qty: number;
  unitPrice: number;
  total: number;
};

export type OwnerOrderDetail = {
  order: {
    ID: number;
    restaurantId: number;
    orderStatusId: number;
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
    CreatedAt?: string;
  };
  items: OrderItem[];
};

export const ownerOrders = {
  list: (restaurantId: number, params?: { statusId?: number; page?: number; limit?: number }) =>
    api.get<OwnerOrderListOut>(`/owner/restaurants/${restaurantId}/orders`, { params }),

  detail: (restaurantId: number, orderId: number) =>
    api.get<OwnerOrderDetail>(`/owner/restaurants/${restaurantId}/orders/${orderId}`),

  // ✅ actions: ตาม BE routes ที่เพิ่มไว้
  accept:   (orderId: number) => api.post(`/owner/orders/${orderId}/accept`),   // Pending -> Preparing
  handoff:  (orderId: number) => api.post(`/owner/orders/${orderId}/handoff`),  // Preparing -> Delivering
  complete: (orderId: number) => api.post(`/owner/orders/${orderId}/complete`), // Delivering -> Completed
  cancel:   (orderId: number) => api.post(`/owner/orders/${orderId}/cancel`),   // Pending -> Cancelled
};

// ✅ แก้ให้ครบ 5 สถานะ (เผื่อโชว์ชื่อไทยทีหลังจะมาแก้ตรงนี้)
export const statusTH: Record<number, string> = {
  1: "Pending",
  2: "Preparing",
  3: "Delivering",
  4: "Completed",
  5: "Cancelled",
};