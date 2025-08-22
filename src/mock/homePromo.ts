// src/mocks/homePromo.ts
import type { HomePromoPayload } from "../types/sections";

// นำเข้ารูปจาก src/assets (Vite จะให้เป็น URL หลัง build)
import hero from "../assets/Promo2.png";
import p1   from "../assets/Promo3.svg";
import p2   from "../assets/Promo4.svg";

export const homePromoMock: HomePromoPayload = {
  hero: {
    image: hero,
    href: "/promotions/free-delivery",
    alt: "FREE DELIVERY • ใช้โค้ด JustDrink",
  },
  promos: [
    { id: "p1", image: p1, href: "/promotions/hot-deal",  alt: "ดีลร้านเด็ด ลดแรง! ใส่โค้ด JustEat" },
    { id: "p2", image: p2, href: "/promotions/add-10",    alt: "พิเศษเดือนนี้ ลดเพิ่ม 10%" }
  ]
};
