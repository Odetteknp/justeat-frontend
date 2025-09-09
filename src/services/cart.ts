// src/services/cart.ts
import { api } from "./api";

// ---------- Types ----------

export type CartItem = {
  id: number;
  cartId: number;
  menuId: number;
  qty: number;
  unitPrice: number;
  total: number;
  note?: string;
  
  menu?: {
    id: number;
    name?: string;
    image?: string | null;
    price?: number;
  };
};

export type Cart = {
  id?: number;
  userId: number;
  restaurantId?: number;
  items: CartItem[];
};

export type GetCartRes = {
  cart: Cart;
  subtotal: number;
};


// ---------- helpers ----------
const toNum = (v: any, def = 0) =>
  typeof v === "number" ? v : (v == null ? def : Number(v) || def);

const normMenu = (m: any) =>
  !m
    ? undefined
    : {
        id: m.id ?? m.ID,
        name: m.name ?? m.Name,
        image: m.image ?? m.Image ?? null,
        price: toNum(m.price ?? m.Price, 0),
      };

const normItem = (it: any): CartItem => {
  const qty = toNum(it.qty ?? it.Qty, 0);
  const unitPrice = toNum(it.unitPrice ?? it.UnitPrice, 0);
  const total = toNum(it.total ?? it.Total, qty * unitPrice);
  return {
    id: it.id ?? it.ID,
    cartId: it.cartId ?? it.CartID,
    menuId: it.menuId ?? it.MenuID,
    qty,
    unitPrice,
    total,
    note: it.note ?? it.Note,
    menu: normMenu(it.menu ?? it.Menu),
  };
};

const normCartObj = (c: any): Cart => {
  const itemsSrc = c.items ?? c.Items ?? c.CartItems ?? [];
  const items: CartItem[] = Array.isArray(itemsSrc) ? itemsSrc.map(normItem) : [];
  return {
    id: c.id ?? c.ID,
    userId: c.userId ?? c.UserID ?? 0,
    restaurantId: c.restaurantId ?? c.RestaurantID,
    items,
  };
};

// ---------- API ----------
export async function getCart(): Promise<GetCartRes> {
  const { data } = await api.get("/cart");

  // รองรับทั้ง {cart, subtotal} / {data:{cart, subtotal}} / หรือทั้งก้อนคือ cart
  const raw = data?.cart ?? data?.data?.cart ?? data;
  const looksLikeCart = !!(raw?.items ?? raw?.Items ?? raw?.CartItems);

  const cart = looksLikeCart ? normCartObj(raw) : normCartObj({});
  const fallbackSubtotal = cart.items.reduce((s, v) => s + toNum(v.total, 0), 0);

  const explicitSubtotal = data?.subtotal ?? data?.data?.subtotal;
  const subtotal = toNum(explicitSubtotal, fallbackSubtotal);

  return { cart, subtotal };
}

export type AddToCartPayload = {
  restaurantId: number;
  menuId: number;
  qty: number;
  note?: string;
};

// เพิ่ม type ไว้บนสุดใกล้ๆ type อื่น
export type CheckoutPayload = {
  address: string;
  paymentMethod?: "PromptPay" | "Cash on Delivery";
};

// แทนที่ฟังก์ชันนี้
export async function checkoutFromCart(payload: CheckoutPayload): Promise<{ id: number; total: number }> {
  const { data } = await api.post("/orders/checkout-from-cart", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}

export async function addCartItem(payload: AddToCartPayload) {
  return api.post("/cart/items", payload, {
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateCartItemQty(itemId: number, qty: number) {
  // PATCH แบบ body รวม; ถ้า BE ไม่รองรับ ลอง path param แทน
  try {
    await api.patch("/cart/items/qty", { itemId, qty });
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.response?.status === 405) {
      await api.patch(`/cart/items/${itemId}`, { qty });
      return;
    }
    throw e;
  }
}

export async function removeCartItem(itemId: number) {
  // บางเซิร์ฟเวอร์ไม่รับ body ใน DELETE → fallback path param
  try {
    await api.delete("/cart/items", { data: { itemId } });
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.response?.status === 405) {
      await api.delete(`/cart/items/${itemId}`);
      return;
    }
    throw e;
  }
}

export async function clearCart() {
  await api.delete("/cart");
}
