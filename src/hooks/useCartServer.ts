// src/hooks/useCartServer.ts
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCart, 
  addCartItem, 
  updateCartItemQty, 
  removeCartItem,
  clearCart, 
  checkoutFromCart,
  type Cart, 
  type AddToCartPayload, 
  type GetCartRes,
  type CheckoutPayload, 
} from "../services/cart";

import { api } from "../services/api";

export class CartConflictError extends Error {
  constructor(msg = "cart has another restaurant") { super(msg); this.name = "CartConflictError"; }
}

/** ---------- helper: ดึงรายการเมนูของร้าน + แปลงให้อ่านง่าย ---------- */
type MenuLite = { id: number; name?: string; image?: string | null; price?: number };

async function fetchMenusByRestaurant(restaurantId: number): Promise<MenuLite[]> {
  try {
    const { data } = await api.get(`/restaurants/${restaurantId}/menus`);
    const raw = data?.items ?? data?.data?.items ?? data ?? [];
    return (Array.isArray(raw) ? raw : []).map((m: any) => ({
      id: m.id ?? m.ID,
      name: m.name ?? m.Name,
      image: m.image ?? m.Image ?? null,
      price: typeof m.price === "number" ? m.price : (m.Price != null ? Number(m.Price) || undefined : undefined),
    }));
  } catch {
    try {
      const { data } = await api.get(`/menus`, { params: { restaurantId } });
      const raw = data?.items ?? data?.data?.items ?? data ?? [];
      return (Array.isArray(raw) ? raw : []).map((m: any) => ({
        id: m.id ?? m.ID,
        name: m.name ?? m.Name,
        image: m.image ?? m.Image ?? null,
        price: typeof m.price === "number" ? m.price : (m.Price != null ? Number(m.Price) || undefined : undefined),
      }));
    } catch {
      return [];
    }
  }
}

/** ✅ คืนค่าเป็น Cart เสมอ (ไม่ใช่ Cart|null) เพื่อไม่ชนกับ res.cart ที่เป็น Cart */
async function hydrateMenuIntoCart(
  cart: Cart,
  getMenus: (rid: number) => Promise<Map<number, MenuLite>>
): Promise<Cart> {
  if (!cart.items?.length || !cart.restaurantId) return cart;

  const needsHydrate = cart.items.some((it) => !it.menu?.name);
  if (!needsHydrate) return cart;

  const menuMap = await getMenus(cart.restaurantId);
  if (!menuMap.size) return cart;

  const items = cart.items.map((it) => {
    if (it.menu?.name) return it;
    const m = menuMap.get(it.menuId);
    if (!m) return it;
    return {
      ...it,
      menu: {
        id: it.menu?.id ?? m.id,
        name: it.menu?.name ?? m.name,
        image: it.menu?.image ?? m.image ?? null,
        price: it.menu?.price ?? m.price,
      },
    };
  });

  return { ...cart, items };
}

export function useCartServer() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // กัน refresh ซ้อน (race) และกัน update หลัง unmount
  const mounted = useRef(true);
  const runIdRef = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const safeSet = <T,>(setter: (v: T) => void, v: T) => { if (mounted.current) setter(v); };

  /** cache เมนูตามร้าน: restaurantId -> (menuId -> menu) */
  const menuCacheRef = useRef<Map<number, Map<number, MenuLite>>>(new Map());

  const getMenusMap = useCallback(async (restaurantId: number) => {
    const cached = menuCacheRef.current.get(restaurantId);
    if (cached && cached.size) return cached;

    const menus = await fetchMenusByRestaurant(restaurantId);
    const map = new Map<number, MenuLite>();
    for (const m of menus) map.set(m.id, m);
    menuCacheRef.current.set(restaurantId, map);
    return map;
  }, []);

  const refresh = useCallback(async () => {
    const myRun = ++runIdRef.current;
    safeSet(setLoading, true);
    safeSet(setErr, null);
    try {
      const res: GetCartRes = await getCart();

      // 🔹 ดึงและเติมชื่อเมนู: หลัง getCart() แต่ก่อน setCart()
      let cartData: Cart = res.cart;
      if (cartData.restaurantId && cartData.items?.length) {
        cartData = await hydrateMenuIntoCart(cartData, getMenusMap);
      }

      if (myRun !== runIdRef.current) return; // ทิ้งผลลัพธ์เก่า
      console.log("[GET /cart] parsed =", { ...res, cart: cartData });
      safeSet(setCart, cartData);
      safeSet(setSubtotal, res.subtotal);
      console.log(
        "[cart] items =", cartData?.items?.length ?? 0,
        "count =", (cartData?.items ?? []).reduce((s, it) => s + (it.qty || 0), 0)
      );
    } catch (e: any) {
      if (myRun !== runIdRef.current) return;
      safeSet(setErr, e?.response?.data?.error || e?.message || "โหลดตะกร้าไม่สำเร็จ");
    } finally {
      if (myRun === runIdRef.current) safeSet(setLoading, false);
    }
  }, [getMenusMap]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (payload: AddToCartPayload) => {
    console.log("[add-to-cart] payload =", payload);
    try {
      await addCartItem(payload);
      console.log("[add-to-cart] done → refresh()");
      await refresh();
    } catch (e: any) {
      if (e?.response?.status === 409) throw new CartConflictError();
      throw e;
    }
  }, [refresh]);

  const setQty = useCallback(async (itemId: number, qty: number) => {
    // ไม่ให้ติดลบ; ถ้า 0 ให้ลบแทน
    if (qty <= 0) {
      await removeCartItem(itemId);
    } else {
      await updateCartItemQty(itemId, qty);
    }
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (itemId: number) => {
    await removeCartItem(itemId);
    await refresh();
  }, [refresh]);

  const clear = useCallback(async () => {
    await clearCart();
    await refresh();
  }, [refresh]);

  // ✅ ปรับให้รับ payload (snapshot address/paymentMethod) แล้วส่งไป BE
  const checkout = useCallback(async (payload: CheckoutPayload) => {
    const res = await checkoutFromCart(payload);
    await refresh();
    return res; // { id, total }
  }, [refresh]);

  const count = cart?.items?.reduce((s, it) => s + (it.qty ?? 0), 0) ?? 0;

  return { cart, subtotal, count, loading, err, refresh, add, setQty, remove, clear, checkout };
}
