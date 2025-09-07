// src/services/order.ts
import { api } from "./api";

export type SelectionIn = { optionId: number; optionValueId: number };
export type ItemIn = { menuId: number; qty: number; selections: SelectionIn[] };

export type CreateOrderBody = {
  restaurantId: number;
  items: ItemIn[];
};

export async function createOrder(body: CreateOrderBody) {
  const res = await api.post<{ id: number; total: number }>("/orders", body);
  return res.data;
}
