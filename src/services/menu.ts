// src/services/menu.ts
import { api } from "./api";
import type { MenuItem, MenuOption, Choice } from "../types";
export interface Menu {
  id: number;
  menuName: string;
  price: number;
  detail?: string;
  picture?: string | null; 
  menuTypeId: number;
  menuStatusId: number;
}
/** =========================
 * API Types (ตาม Backend)
 * ========================= */
export type OptionValue = {
  id: number;
  name: string;
  priceAdjustment: number;
  defaultSelect?: boolean;
  isAvailable?: boolean;
  sortOrder?: number;
};

export type MenuOptionBE = {
  id: number;
  name: string;
  type: "radio" | "checkbox"; // BE
  minSelect?: number;
  maxSelect?: number;
  isRequired?: boolean;
  sortOrder?: number;
  optionValues?: OptionValue[];
};

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
  options?: MenuOptionBE[];
};

/** =========================
 * Helpers
 * ========================= */
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

/** =========================
 * Adapter: API -> UI MenuItem
 * ========================= */
// ---- Adapter: BE -> UI ----
function adaptMenu(be: any): MenuItem {
  // รองรับทั้ง id และ ID จาก BE
  const rawId = be?.id ?? be?.ID;
  const idNum = Number(rawId || 0);

  const sectionName = be?.menuType?.typeName || String(be?.menuTypeId);

  const options: MenuOption[] | undefined = (be?.options ?? []).map((op: any) => ({
    id: String(op.id),
    label: op.name,
    type: op.type === "radio" ? "single" : "multiple",
    required: !!op.isRequired,
    max: op.maxSelect ?? (op.type === "radio" ? 1 : undefined),
    choices: (op.optionValues ?? []).map((v: any) => ({
      id: String(v.id),
      name: v.name,
      price: Number(v.priceAdjustment || 0),
    })),
  }));

  return {
    id: String(idNum),                              // <-- ตรงนี้สำคัญ
    name: be?.name ?? "",
    price: fmtTHB(Number(be?.price || 0)),
    image: toImgSrc(be?.image),
    sectionId: sectionName,
    options,
  };
}

// ---- API ----
export async function getMenusByRestaurant(restId: number): Promise<MenuItem[]> {
  const res = await api.get<{ items: MenuBE[] }>(`/restaurants/${restId}/menus`);
  const items = res.data.items ?? [];
  return items.map(adaptMenu);
}
/** =========================
 * Owner / Management APIs
 * (คงรูปแบบเดิมไว้)
 * ========================= */
export const menu = {
  // Public (raw)
  listByRestaurant: (restaurantId: number) =>
    api.get<{ items: Menu[] }>(`/restaurants/${restaurantId}/menus`),

  // Owner
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

  listOptionsByMenu: (menuId: number) => api.get(`/menus/${menuId}/options`),

  // Menu Options
  attachOption: (menuId: number, optionId: number, token: string) =>
    api.post(
      `/owner/menus/${menuId}/options`,
      { optionId },
      { headers: { Authorization: `Bearer ${token}` } }
    ),

  detachOption: (menuId: number, optionId: number, token: string) =>
    api.delete(`/owner/menus/${menuId}/options/${optionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
