export interface SimpleMenuItem {
  id: string;
  name: string;
  price: number;   // บาท
  image?: string | null;
  category: string;
}

export interface MenuSection {
  id: string;
  name: string;
}

export interface Menu {
  id: number;
  name: string;
  detail?: string;
  price: number;
  picture?: string | null;
  menuTypeId: number;
  menuStatusId: number;
}

export interface Restaurant {
  id: string;
  name: string;
  heroImage?: string;
  rating: number;
  menu: SimpleMenuItem[];
}

export interface PopularStore {
  id: string;
  name: string;
  cover: string | null;
  href?: string;
  to?: string;
  rating?: number;
  tags?: string[];
}
