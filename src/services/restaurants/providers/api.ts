import type { RestaurantProvider, Restaurant, RestaurantSummary } from "../types";

export class ApiRestaurantProvider implements RestaurantProvider {
  // base URL จาก .env (พร้อม /api)
  private base =
    (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080") + "/api";

  // ✔️ ต้องมีเมธอดนี้ เพราะ interface บังคับ
  async getPopularRestaurants(_signal?: AbortSignal): Promise<RestaurantSummary[]> {
    // TODO: เชื่อมจริงภายหลัง
    // ตัวอย่างตอนเชื่อมจริง:
    // const res = await fetch(`${this.base}/restaurants/popular`, { credentials: "include", signal: _signal });
    // if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // return (await res.json()) as RestaurantSummary[];

    throw new Error("ApiRestaurantProvider.getPopularRestaurants not implemented yet");
  }

  // ✔️ เมธอดดึงรายละเอียดร้าน
  async getRestaurantDetail(_id: string, _signal?: AbortSignal): Promise<Restaurant> {
    // TODO: เชื่อมจริงภายหลัง
    // ตัวอย่างตอนเชื่อมจริง:
    // const res = await fetch(`${this.base}/restaurants/${_id}/detail`, { credentials: "include", signal: _signal });
    // if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // return (await res.json()) as Restaurant;

    throw new Error("ApiRestaurantProvider.getRestaurantDetail not implemented yet");
  }
}
