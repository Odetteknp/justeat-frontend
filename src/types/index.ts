// ==============================
// Hero / Promo (ใช้ในหน้า Home)
// ==============================
export interface HeroImage {
  image: string;
  href: string;
  alt?: string;
}

export interface PromoImage {
  id: string;
  image: string;
  href: string;
  alt?: string;
}

export interface HomePromoPayload {
  hero: HeroImage;
  promos: PromoImage[]; // ควรมี 2 รูป เรียง 2 คอลัมน์
}

// ==============================
// Popular Stores (การ์ดร้านยอดนิยม)
// ==============================
export interface PopularStore {
  id: string;
  name: string;
  cover: string | null;  // URL/asset path
  href?: string;         // external link
  to?: string;           // internal route
  rating?: number;       // 0..5 (allow half)
  tags?: string[];
}

// ==============================
// ร้าน (Restaurant)
// ==============================
export interface Restaurant {
  id: string;
  name: string;
  heroImage?: string;    // รูป hero ด้านบน
  rating: number;
  menu: SimpleMenuItem[]; // ใช้เมนูแบบเรียบง่าย
}

// ==============================
// เมนูแบบเรียบง่าย (ใช้โชว์ทั่วไป / Restaurant.menu)
// ==============================
export interface SimpleMenuItem {
  id: string;
  name: string;
  price: number;         // หน่วย: บาท
  image?: string | null;
  category: string;
}

export type MenuItem = { 
    id: string; 
    sectionId: string; 
    name: string; imageUrl?: 
    string; basePrice: number; // หน่วย: สตางค์ (5000 = ฿50.00) options?: MenuOption[]; 
};

// ==============================
// เมนูแบบมีออปชัน (ใช้กับ UI เลือกตัวเลือก)
// ==============================
export interface Choice {
  id: string;
  name: string;
  priceDelta: number;    // หน่วย: สตางค์ (500 = ฿5.00)
}

export interface MenuOption {
  id: string;
  name: string;
  type: "single" | "multi";
  required?: boolean;
  choices: Choice[];
}

export interface ConfigurableMenuItem {
  id: string;
  sectionId: string;
  name: string;
  imageUrl?: string;
  basePrice: number;      // หน่วย: สตางค์ (5000 = ฿50.00)
  options?: MenuOption[]; // ตัวเลือกเพิ่มเติม
}

export interface MenuSection {
  id: string;
  name: string;
}


// type users
export type UserProfile = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  role: string;
  avatar?: string;
};
