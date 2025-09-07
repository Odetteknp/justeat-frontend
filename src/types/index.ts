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

export interface listRestaurant {
  id: string;
  name: string;
  cover: string;
  rating?: number; 
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


// ==============================
// เมนูแบบมีออปชัน (ใช้กับ UI เลือกตัวเลือก)
// ==============================


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
  avatarBase64?: string;
};

/** Response ของการ Login */
export interface LoginResponse {
  ok: boolean;
  token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
    role: string;
    avatarUrl?: string;
  };
}

/** Response ของการ Register */
export interface RegisterResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
}

/** Response ของ /auth/me */
export interface MeResponse {
  ok: boolean;
  user: LoginResponse["user"];
}

/** Response ของ refresh token */
export interface RefreshResponse {
  ok: boolean;
  token: string;
}

export interface MeResponse {
  ok: boolean;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
    role: string;
    avatarUrl?: string;
  };
}

export interface MeRestaurantResponse {
  ok: boolean;
  restaurant: {
    ID: number;
    name: string;
    address: string;
    description?: string;
    openingTime?: string;
    closingTime?: string;
    pictureBase64?: string | null;
  };
}

export interface Menu {
  id: number;
  menuName: string;
  price: number;
  detail?: string;
  picture?: string | null; 
  menuTypeId: number;
  menuStatusId: number;
}

export type Choice = {
  id: string;
  name: string;
  price?: number; // ราคาเพิ่มเป็นบาท (เช่น 10) ไม่ใส่ = 0
};

/** option ของเมนู (single=เลือกได้ 1, multiple=เลือกได้หลายอัน) */
export type MenuOption = {
  id: string;
  label: string;
  type: "single" | "multiple";
  required?: boolean;
  max?: number; // เผื่ออนาคต
  choices: Choice[];
};

/** เมนูที่ UI ใช้ (price เป็นข้อความ format แล้ว เช่น '฿65') */
export type MenuItem = {
  id: string;
  sectionId: string; // ใช้ชื่อหมวด/ประเภทที่โชว์บนแท็บ
  name: string;
  image: string;
  price: string; // "฿65"
  options?: MenuOption[];
};