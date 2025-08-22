export interface HeroImage { image: string; href: string; alt?: string; }
export interface PromoImage { id: string; image: string; href: string; alt?: string; }

export interface HomePromoPayload {
  hero: HeroImage;
  promos: PromoImage[]; // ควรมี 2 ใบเพื่อเรียง 2 คอลัมน์
}

export interface PopularStore {
  id: string;
  name: string;
  cover: string;
  href?: string;
  to?: string;
  rating?: number;
  tags?: string[];
}