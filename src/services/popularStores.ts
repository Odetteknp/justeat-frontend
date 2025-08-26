import type { PopularStore } from "../types";           // ประเภทข้อมูลที่หน้า Section ใช้
import { getPopularRestaurants } from "./restaurants/index";           // ดึงยอดนิยมจากบริการร้าน (ใช้ฟิกซ์เจอร์เดียวกับ detail)

/** Provider type */
export type PopularStoresProvider = {                            // อินเตอร์เฟซ provider สำหรับ popular stores
  list(signal?: AbortSignal): Promise<PopularStore[]>;           // ฟังก์ชันอ่านลิสต์ popular
};                                                               // จบอินเตอร์เฟซ

/** ---- MOCK provider: reuse fixtures ผ่าน service ---- */
class MockPopularStoresProvider implements PopularStoresProvider { // ผู้ให้บริการ mock
  async list(signal?: AbortSignal): Promise<PopularStore[]> {     // อ่านลิสต์ popular
    const data = await getPopularRestaurants(signal);             // ใช้บริการร้าน (mock/api ตาม env)
    return data.map(r => ({                                       // map เป็น PopularStore
      id: r.id,                                                   // คง id เดิม
      name: r.name,                                               // ชื่อร้าน
      cover: r.heroImage ?? null,                                 // รูปปก (อาจไม่มี)
      rating: r.rating,                                           // คะแนน
      // ไม่ใส่ 'to' — ให้ UI คำนวน route: `/restaurants/${id}`
    }));                                                          // จบ map
  }                                                               // จบฟังก์ชัน
}                                                                 // จบคลาส

/** ---- API provider: ปล่อยให้ services/restaurants เลือกแหล่งจริง/ปลอม ---- */
class ApiPopularStoresProvider implements PopularStoresProvider { // ผู้ให้บริการ api (เรียกผ่าน service)
  async list(signal?: AbortSignal): Promise<PopularStore[]> {     // อ่านลิสต์ popular
    const data = await getPopularRestaurants(signal);             // ปล่อยให้ service ตัดสินใจ (mock/api)
    return data.map(r => ({                                       // map ให้เป็น PopularStore
      id: r.id,                                                   // id ร้าน
      name: r.name,                                               // ชื่อร้าน
      cover: r.heroImage ?? null,                                 // รูปปก
      rating: r.rating,                                           // คะแนน
    }));                                                          // จบ map
  }                                                               // จบฟังก์ชัน
}                                                                 // จบคลาส

/** ---- Factory: env switch ---- */
const useApi = import.meta.env.VITE_USE_API === "true";           // อ่านแฟล็กจาก .env
export const popularStoresProvider: PopularStoresProvider = useApi // เลือก provider ตาม env
  ? new ApiPopularStoresProvider()                                 // ใช้ api provider (จริง/ผ่าน service)
  : new MockPopularStoresProvider();                               // ใช้ mock provider

/** Helper: สำหรับ container/hook */
export function fetchPopularStores(                               // helper สำหรับจุดเรียกใช้งาน
  provider?: PopularStoresProvider,                               // อนุญาตส่ง provider เองเพื่อเทสต์
  signal?: AbortSignal                                            // รองรับยกเลิกโหลด
) {                                                               // เปิดฟังก์ชัน
  const p = provider ?? popularStoresProvider;                    // เลือก provider ที่จะใช้
  return p.list(signal);                                          // คืนพรอมิสของลิสต์ popular
}                                                                 // จบฟังก์ชัน
