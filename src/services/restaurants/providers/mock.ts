import type { RestaurantProvider, Restaurant, RestaurantSummary } from "../types"; // นำเข้า types
import { POPULAR_RESTAURANTS, MENU_BY_RESTAURANT } from "../fixtures";            // ใช้ฟิกซ์เจอร์กลาง

const delay = (ms: number, signal?: AbortSignal) =>                   // ยูทิลดีเลย์ (ยกเลิกได้)
  new Promise<void>((res, rej) => {                                   // สร้างพรอมิส
    const t = setTimeout(res, ms);                                    // ตั้งเวลา
    signal?.addEventListener("abort", () => {                         // ถ้ามีสัญญาณยกเลิก
      clearTimeout(t);                                                // เคลียร์เวลา
      rej(Object.assign(new Error("AbortError"), { name: "AbortError" })); // ปฏิเสธด้วย AbortError
    });                                                               // จบ addEventListener
  });                                                                 // จบพรอมิส

export class MockRestaurantProvider implements RestaurantProvider {   // ผู้ให้บริการแบบ mock
  async getPopularRestaurants(signal?: AbortSignal): Promise<RestaurantSummary[]> { // อ่านร้านยอดนิยม
    await delay(250, signal);                                         // หน่วงเวลาให้เหมือนจริง
    return POPULAR_RESTAURANTS;                                       // คืนลิสต์จากฟิกซ์เจอร์
  }                                                                   // จบฟังก์ชัน

  async getRestaurantDetail(id: string, signal?: AbortSignal): Promise<Restaurant> { // อ่านรายละเอียดร้าน
    await delay(300, signal);                                         // หน่วงเวลา
    const base = POPULAR_RESTAURANTS.find(r => r.id === id);          // หาเรคอร์ดสรุปร้าน
    const menu = MENU_BY_RESTAURANT[id];                              // หาเมนูของร้านนั้น
    if (!base || !menu) throw new Error("ไม่พบร้าน");                 // ถ้าไม่เจอ โยน error
    return { ...base, menu };                                         // รวมสรุป + เมนู แล้วคืนค่า
  }                                                                   // จบฟังก์ชัน
}                                                                     // จบคลาส
