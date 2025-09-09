// src/services/menu.ts
import { api } from "./api";
import type { SimpleMenuItem  } from "../types";

export interface Menu {
  id: number;
  menuName: string;
  price: number;
  detail?: string;
  picture?: string | null; 
  menuTypeId: number;
  menuStatusId: number;
}

export type MenuBE = {
  id: number;
  name: string;
  detail: string;
  price: number;      // int/number (บาท)
  image?: string;     // base64 หรือ URL
  menuTypeId: number;
  menuStatusId: number;
  menuType?: { typeName: string };
  menuStatus?: { statusName: string };
};


// Helpers
const fmtTHB = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(n);

function toImgSrc(img?: string) {
  if (!img) return "";
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) return img;
  return `data:image/jpeg;base64,${img}`;
}

// ---- API ----
export async function getMenusByRestaurant(restId: number): Promise<SimpleMenuItem[]> {
  const res = await api.get<{ items: MenuBE[] }>(`/restaurants/${restId}/menus`);
  const items = res.data.items ?? [];
  return items.map(adaptMenu);
}

/** =========================
 * Owner / Management APIs
 * ========================= */
export const menu = {
  listByRestaurant: (restaurantId: number) =>
    api.get<{ items: Menu[] }>(`/restaurants/${restaurantId}/menus`),

  create: (restaurantId: number, body: any, token: string) =>
    api.post(`/owner/restaurants/${restaurantId}/menus`, body, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  update: (id: number, body: any, token: string) =>
    api.patch(`/owner/menus/${id}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  remove: (id: number, token: string) =>
    api.delete(`/owner/menus/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateStatus: (id: number, statusId: number, token: string) =>
    api.patch(
      `/owner/menus/${id}/status`,
      { menuStatusId: statusId },
      { headers: { Authorization: `Bearer ${token}` } }
    ),
};

export type MenuDetail = {
  id: number;
  name?: string;
  menuName?: string;
  price?: number;
};

export async function getMenuName(menuId: number): Promise<string> {
  const { data } = await api.get<MenuDetail>(`/menus/${menuId}`);
  return data.name ?? data.menuName ?? `เมนู #${menuId}`;
}

/** =========================
 * Adapter: API -> UI MenuItem
 * ========================= */

// mapping menuTypeId -> ชื่อภาษาไทย
const MENU_TYPES: Record<number, string> = {
  1: "เมนูหลัก",
  2: "ของทานเล่น",
  3: "ของหวาน",
  4: "เครื่องดื่ม",
};

function adaptMenu(be: any): SimpleMenuItem {
  const rawId = be?.id ?? be?.ID;
  const idNum = Number(rawId || 0);

  const category =
    be?.menuType?.typeName ||
    be?.menuType?.TypeName ||
    (typeof be?.menuTypeId === "number"
      ? MENU_TYPES[be.menuTypeId] || String(be.menuTypeId)
      : "อื่น ๆ");

  return {
    id: String(idNum),
    name: be?.name ?? "",
    price: Number(be?.price || 0),   // number (บาท)
    image: toImgSrc(be?.image),
    category, // ใช้ category ที่แปลงแล้ว
  };
}
