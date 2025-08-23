export interface HeroImage { image: string; href: string; alt?: string; }
export interface PromoImage { id: string; image: string; href: string; alt?: string; }

export interface HomePromoPayload {
  hero: HeroImage;
  promos: PromoImage[]; // ควรมี 2 ใบเพื่อเรียง 2 คอลัมน์
}

export interface PopularStore {
  id: string;
  name: string;
  cover: string | null;   // URL/asset path
  href?: string;   // external link
  to?: string;     // internal route
  rating?: number; // 0..5 (allow half)
  tags?: string[];
}


export type MenuItem = {
  id: string;            // ไอดีเมนู
  name: string;          // ชื่อเมนู
  price: number;         // ราคา
  image?: string | null; // url รูป (อาจไม่มี)
  category: string;      // หมวดหมู่
};

export type Restaurant = {
  id: string;            // ไอดีร้าน
  name: string;          // ชื่อร้าน
  heroImage?: string;    // รูป hero ด้านบน
  rating: number;        // คะแนนเรตติ้ง
  menu: MenuItem[];      // เมนูทั้งหมดของร้าน (รวมมาด้วยเลย)
};