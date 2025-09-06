// src/services/menu.ts
import { SECTIONS, menuItems } from "../mock/menuData";        // ← mock ของเพื่อน
import type { MenuItem, MenuSection } from "../types";
import { api } from "../services/api"

// ใช้ .env ของ Vite (ต้อง restart dev server เมื่อแก้ค่า)
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/* -------------------- Normalizers (แปลง mock → type กลางของคุณ) -------------------- */

function normalizeSections(): MenuSection[] {
  return SECTIONS.map(s => ({ id: s.id, name: s.label }));
}

function normalizeMenuItems(): MenuItem[] {
  return menuItems.map((m, idx) => ({
    id: String(idx), // mock เดิมไม่มี id → ใช้ index ชั่วคราว (หรือ crypto.randomUUID())
    sectionId: m.sectionId,
    name: m.name,
    imageUrl: m.image,
    // mock เก็บราคาเป็น "$50" → แปลงเป็นสตางค์ (5000)
    basePrice: parsePriceToCents(m.price),
    options: m.options?.map(o => ({
      id: o.id,
      name: o.label,
      type: o.type === "multiple" ? "multi" : "single",
      required: o.required,
      choices: o.choices.map(c => ({
        id: c.id,
        name: c.name,
        priceDelta: ((c.price ?? 0) * 100), // เพิ่มราคาเป็นสตางค์
      })),
    })),
  }));
}

function parsePriceToCents(priceStr: string): number {
  // "$50" / "50" / "฿50" → 5000
  const digits = priceStr.replace(/[^\d.]/g, "");
  const value = Number(digits || 0);
  return Math.round(value * 100);
}

/* -------------------- Services (API-first, fallback → mock) -------------------- */

export async function fetchSections(restaurantId?: string): Promise<MenuSection[]> {
  // ถ้าไม่ได้ตั้ง BASE_URL → ใช้ mock
  if (!BASE_URL) return normalizeSections();

  // ปรับ path ให้ตรง backend ของคุณเอง
  const url = restaurantId
    ? `${BASE_URL}/v1/restaurants/${restaurantId}/sections`
    : `${BASE_URL}/v1/sections`;

  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // ล้มเหลว → ใช้ mock
    console.warn("[fetchSections] fallback to mock:", err);
    return normalizeSections();
  }
}

export async function fetchMenuItems(restaurantId?: string): Promise<MenuItem[]> {
  if (!BASE_URL) return normalizeMenuItems();

  const url = restaurantId
    ? `${BASE_URL}/v1/restaurants/${restaurantId}/menu-items`
    : `${BASE_URL}/v1/menu-items`;

  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[fetchMenuItems] fallback to mock:", err);
    return normalizeMenuItems();
  }
}

export const menu = {
  listByRestaurant: (restaurantId: number) =>
    api.get(`/restaurants/${restaurantId}/menus`),

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
};