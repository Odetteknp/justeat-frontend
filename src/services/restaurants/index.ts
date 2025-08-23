// src/services/restaurants/index.ts
import type { RestaurantProvider } from "./types";
import { MockRestaurantProvider } from "./providers/mock";
import { ApiRestaurantProvider } from "./providers/api"; // ← ต้องตรงกับโฟลเดอร์

const useApi = import.meta.env.VITE_USE_API === "true";
const provider: RestaurantProvider = useApi
  ? new ApiRestaurantProvider()
  : new MockRestaurantProvider();

export type { RestaurantSummary, Restaurant, MenuItem } from "./types";
export function getPopularRestaurants(signal?: AbortSignal) {
  return provider.getPopularRestaurants(signal);
}
export function getRestaurantDetail(id: string, signal?: AbortSignal) {
  return provider.getRestaurantDetail(id, signal);
}
