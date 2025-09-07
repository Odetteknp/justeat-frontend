// src/hooks/useCartServer.ts
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCart, addCartItem, updateCartItemQty, removeCartItem,
  clearCart, checkoutFromCart,
  type Cart, type AddToCartPayload, type GetCartRes
} from "../services/cart";

export class CartConflictError extends Error {
  constructor(msg = "cart has another restaurant") { super(msg); this.name = "CartConflictError"; }
}

export function useCartServer() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const safeSet = <T,>(setter: (v: T) => void, v: T) => { if (mounted.current) setter(v); };

  const refresh = useCallback(async () => {
    safeSet(setLoading, true);
    safeSet(setErr, null);
    try {
      const res: GetCartRes = await getCart();
      console.log('[GET /cart] res =', res);         
      safeSet(setCart, res.cart);
      safeSet(setSubtotal, res.subtotal);
      console.log('[cart] items =', res.cart?.items?.length ?? 0,
        'count =', (res.cart?.items ?? []).reduce((s, it) => s + (it.qty || 0), 0));
    } catch (e: any) {
      safeSet(setErr, e?.response?.data?.error || e?.message || "โหลดตะกร้าไม่สำเร็จ");
    } finally {
      safeSet(setLoading, false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (payload: AddToCartPayload) => {
    console.log('[add-to-cart] payload =', payload);
    try {
      await addCartItem(payload);     
      console.log('[add-to-cart] done → refresh()');
      await refresh();
    } catch (e: any) {
      if (e?.response?.status === 409) throw new CartConflictError();
      throw e;
    }
  }, [refresh]);

  const setQty = useCallback(async (itemId: number, qty: number) => {
    await updateCartItemQty(itemId, qty);
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

  const checkout = useCallback(async () => {
    const res = await checkoutFromCart();
    await refresh();
    return res; // { id, total }
  }, [refresh]);

  const count = cart?.items?.reduce((s, it) => s + (it.qty ?? 0), 0) ?? 0;

  return { cart, subtotal, count, loading, err, refresh, add, setQty, remove, clear, checkout };
}
