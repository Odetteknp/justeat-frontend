import type { PopularStore } from "../types/sections";

// ---- Provider interface ----
export interface PopularStoresProvider {
  list(): Promise<PopularStore[]>;
}

// ---- MOCK provider (ใช้ asset ในโปรเจกต์) ----
import s1 from "../assets/Restaurants/res1.svg";
import s2 from "../assets/Restaurants/res2.svg";
import s3 from "../assets/Restaurants/res3.svg";
import s4 from "../assets/Restaurants/res4.svg";
import s5 from "../assets/Restaurants/res6.svg";
import s6 from "../assets/Restaurants/res7.svg";

export class MockPopularStoresProvider implements PopularStoresProvider {
  async list(): Promise<PopularStore[]> {
    return [
      { id: "st1", name: "กะทิหวาน",        cover: s1, rating: 4.7, to: "/shop/st1" },
      { id: "st2", name: "ส้มตำปรีชา บางแค", cover: s2, rating: 4.7, to: "/shop/st2" },
      { id: "st3", name: "นมอร่อย",         cover: s3, rating: 4.7, to: "/shop/st3" },
      { id: "st4", name: "TteokDam",         cover: s4, rating: 4.7, to: "/shop/st4" },
      { id: "st5", name: "อิ่มอร่อย 365",    cover: s5, rating: 4.7, to: "/shop/st5" },
      { id: "st6", name: "สตีฟก๋วยเตี๋ยว",   cover: s6, rating: 4.7, to: "/shop/st6" },
    ];
  }
}

/*
// ---- API provider (เผื่ออนาคตต่อ backend) ----
export class ApiPopularStoresProvider implements PopularStoresProvider {
  constructor(private endpoint = "/api/stores/popular") {}
  async list(): Promise<PopularStore[]> {
    const res = await fetch(this.endpoint, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch popular stores");
    const data = await res.json();
    return data as PopularStore[];
  }
}

// ---- Factory: เลือก provider จาก env ----
const useApi = import.meta.env.VITE_USE_API === "true";
export const popularStoresProvider: PopularStoresProvider = useApi
  ? new ApiPopularStoresProvider()
  : new MockPopularStoresProvider();

*/
