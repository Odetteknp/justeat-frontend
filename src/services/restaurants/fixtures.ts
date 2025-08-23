// รวมฟิกซ์เจอร์ (แหล่งความจริงเดียว) สำหรับหน้า list และ detail
import s1 from "../../assets/Restaurants/res1.svg"; // รูปปกของร้าน r_1
import s2 from "../../assets/Restaurants/res2.svg"; // รูปปกของร้าน r_2
import s3 from "../../assets/Restaurants/res3.svg"; // รูปปกของร้าน r_3
import s4 from "../../assets/Restaurants/res4.svg"; // รูปปกของร้าน r_4
import s5 from "../../assets/Restaurants/res6.svg"; // รูปปกของร้าน r_5
import s6 from "../../assets/Restaurants/res7.svg"; // รูปปกของร้าน r_6

export const POPULAR_RESTAURANTS = [           // ลิสต์ร้านยอดนิยม (ใช้ในหน้า /restaurants)
  { id: "r_1", name: "คลายหิว",           heroImage: s1, rating: 4.7 }, // ร้านที่ 1
  { id: "r_2", name: "ส้มตำปริญญา มทส.", heroImage: s2, rating: 4.6 }, // ร้านที่ 2
  { id: "r_3", name: "มุมอร่อย",           heroImage: s3, rating: 4.5 }, // ร้านที่ 3
  { id: "r_4", name: "TteokDam",           heroImage: s4, rating: 4.4 }, // ร้านที่ 4
  { id: "r_5", name: "ช้อนชา 茶匙",       heroImage: s5, rating: 4.7 }, // ร้านที่ 5
  { id: "r_6", name: "สเต็กเด็กแนว",      heroImage: s6, rating: 4.3 }, // ร้านที่ 6
];                                            // จบลิสต์ยอดนิยม

export const MENU_BY_RESTAURANT: Record<       // เมนูแยกตามร้าน (ใช้ในหน้า /restaurants/:id)
  string,                                      // คีย์คือรหัสร้าน เช่น "r_1"
  Array<{ id: string; name: string; price: number; image?: string | null; category: string; }> // โครงเมนู
> = {
  r_1: [                                       // เมนูของร้าน r_1
    { id: "m1", name: "เฟรนช์ฟรายส์", price: 59,  image: null, category: "เมนูแนะนำ" }, // เมนู 1
    { id: "m2", name: "ข้าวหมูกรอบ",  price: 85,  image: null, category: "ข้าว" },      // เมนู 2
  ],
  r_2: [                                       // เมนูของร้าน r_2
    { id: "m3", name: "ตำปูปลาร้า",   price: 65,  image: null, category: "ส้มตำ" },      // เมนู 3
  ],
  // TODO: ใส่ของ r_3..r_6 เพิ่มได้ตามต้องการ
};                                             // จบเมนูทั้งหมด
