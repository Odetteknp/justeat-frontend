// ประเภทข้อมูลสรุปร้าน (ใช้หน้า list)
export type RestaurantSummary = {                   // โครงร้านสรุป
  id: string;                                       // ไอดีร้าน
  name: string;                                     // ชื่อร้าน
  heroImage?: string | null;                        // รูปปก (อาจไม่มี)
  rating: number;                                   // คะแนน
};                                                  // จบ RestaurantSummary

// ประเภทข้อมูลเมนูแต่ละจาน
export type MenuItem = {                            // โครงเมนู
  id: string;                                       // ไอดีเมนู
  name: string;                                     // ชื่อเมนู
  price: number;                                    // ราคา
  image?: string | null;                            // รูป (อาจไม่มี)
  category: string;                                 // หมวดหมู่
};                                                  // จบ MenuItem

// ประเภทข้อมูลรายละเอียดร้าน (รวมเมนู)
export type Restaurant = RestaurantSummary & {      // สืบทอดจากสรุป
  menu: MenuItem[];                                 // รายการเมนูทั้งหมด
};                                                  // จบ Restaurant

// อินเตอร์เฟซ provider (ให้ทั้ง mock/api ทำตาม)
export interface RestaurantProvider {               // ผู้ให้บริการข้อมูลร้าน
  getPopularRestaurants(signal?: AbortSignal):      // ฟังก์ชันอ่านร้านยอดนิยม
    Promise<RestaurantSummary[]>;                   // คืนลิสต์สรุปร้าน
  getRestaurantDetail(                              // ฟังก์ชันอ่านรายละเอียดร้าน
    id: string,                                     // รับไอดีร้าน
    signal?: AbortSignal                            // รองรับยกเลิกคำขอ
  ): Promise<Restaurant>;                           // คืนรายละเอียดร้าน
}                                                   // จบอินเตอร์เฟซ
