import { apiFetch } from "./apiClient";
import type { Restaurant } from "../types/sections";

// ดึงรายละเอียดร้าน + เมนู
export async function getRestaurantDetail(id: string, signal?: AbortSignal) {
    return apiFetch<Restaurant>(`/api/restaurants/${id}/detail`, {}, signal);
}
