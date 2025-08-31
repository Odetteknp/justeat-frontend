import { api } from "./api";

export const admin = {
  dashboard: () => api.get("/admin/dashboard"),
  restaurants: (page=1, limit=20) => api.get("/admin/restaurant", { params: { page, limit } }),
  reports: () => api.get("/admin/report"),
  riders: () => api.get("/admin/rider"),
  promotions: () => api.get("/admin/promotion"),
  createPromotion: (body: {
    promoCode: string; promoDetail?: string; promoTypeId: number; isValues?: boolean;
    minOrder?: number; startAt?: string; endAt?: string; adminId?: number;
  }) => api.post("/admin/promotion", body),

  // Applications
  applications: (status="pending") => api.get("/admin/restaurant-applications", { params: { status } }),
  approveApp: (id: number, body: { restaurantStatusId?: number; adminId?: number }) =>
    api.patch(`/admin/restaurant-applications/${id}/approve`, body),
  rejectApp: (id: number, body: { reason: string; adminId?: number }) =>
    api.patch(`/admin/restaurant-applications/${id}/reject`, body),
};
