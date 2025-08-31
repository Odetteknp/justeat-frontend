import { api } from "./api";

export const partnerRestaurant = {
  // สำหรับเจ้าของร้าน (owner/admin)
  dashboard: (restaurantId: number) =>
    api.get("/partner/restaurant/dashboard", { params: { restaurantId } }),

  account: (restaurantId: number) =>
    api.get("/partner/restaurant/account", { params: { restaurantId } }),

  orders: (params: { restaurantId: number; statusId?: number; page?: number; limit?: number }) =>
    api.get("/partner/restaurant/order", { params }),

  menus: (params: { restaurantId: number; page?: number; limit?: number }) =>
    api.get("/partner/restaurant/menu", { params }),

  createMenu: (body: {
    restaurantId: number; menuName: string; detail?: string; price: number;
    picture?: string; menuTypeId: number; menuStatusId: number;
  }) => api.post("/partner/restaurant/menu", body),

  updateMenu: (id: number, body: Partial<{
    id: number; restaurantId: number; menuName: string; detail: string; price: number;
    picture: string; menuTypeId: number; menuStatusId: number;
  }>) => api.patch(`/partner/restaurant/menu/${id}`, body),
};
