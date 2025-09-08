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
};

// mapping สถานะ (ปรับตามฐานข้อมูลจริงของคุณได้)
export const statusTH: Record<number, string> = {
  1: "รอดำเนินการ",
  2: "กำลังจัดเตรียม",
  3: "กำลังจัดส่ง",
  4: "สำเร็จ",
  5: "ยกเลิก",
};
