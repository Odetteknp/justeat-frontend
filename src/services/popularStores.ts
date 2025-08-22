import type { PopularStore } from "../types/sections";

/** Provider type */
export type PopularStoresProvider = {
  list(): Promise<PopularStore[]>;
};

/** ---- MOCK provider ---- */
import s1 from "../assets/Restaurants/res1.svg";
import s2 from "../assets/Restaurants/res2.svg";
import s3 from "../assets/Restaurants/res3.svg";
import s4 from "../assets/Restaurants/res4.svg";
import s5 from "../assets/Restaurants/res6.svg";
import s6 from "../assets/Restaurants/res7.svg";

class MockPopularStoresProvider implements PopularStoresProvider {
  async list(): Promise<PopularStore[]> {
    return [
      { id: "st1", name: "คลายหิว",          cover: s1, rating: 4.7, to: "/shop/st1" },
      { id: "st2", name: "ส้มตำปริญญา มทส.",   cover: s2, rating: 4.7, to: "/shop/st2" },
      { id: "st3", name: "มุมอร่อย",           cover: s3, rating: 4.7, to: "/shop/st3" },
      { id: "st4", name: "TteokDam",           cover: s4, rating: 4.7, to: "/shop/st4" },
      { id: "st5", name: "ช้อนชา 茶匙",      cover: s5, rating: 4.7, to: "/shop/st5" },
      { id: "st6", name: "สเต็กเด็กแนว",     cover: s6, rating: 4.7, to: "/shop/st6" },
    ];
  }
}

/** ---- API provider ---- */
class ApiPopularStoresProvider implements PopularStoresProvider {
  private endpoint: string;
  constructor(endpoint = "/api/stores/popular") {
    this.endpoint = endpoint;
  }
  async list(): Promise<PopularStore[]> {
    const res = await fetch(this.endpoint, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch popular stores");
    return (await res.json()) as PopularStore[];
  }
}

/** ---- Factory: env switch ---- */
const useApi = import.meta.env.VITE_USE_API === "true";
export const popularStoresProvider: PopularStoresProvider = useApi
  ? new ApiPopularStoresProvider()
  : new MockPopularStoresProvider();

/** Helper: สำหรับ container/hook */
export function fetchPopularStores(provider?: PopularStoresProvider) {
  const p = provider ?? popularStoresProvider;
  return p.list();
}
