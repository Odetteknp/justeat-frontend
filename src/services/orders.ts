import { api } from "./api";

export const orders = {
  create: (body: {
    restaurantId: number;
    items: Array<{ menuId: number; qty: number; selections?: Array<{ optionId: number; optionValueId: number }> }>;
  }) => api.post("/orders", body),

  myOrders: () => api.get("/profile/order"),

  detail: (id: number) => api.get(`/orders/${id}`),
};
