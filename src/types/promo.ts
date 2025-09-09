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
  promos: PromoImage[];
}
