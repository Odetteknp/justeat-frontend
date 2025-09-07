import { api } from "../services/api";

// ---------- Types (ให้ตรงกับ BE ตอนนี้) ----------
export type CartItemSelection = {
  id: number;
  cartItemId: number;
  optionId: number;
  optionValueId: number;
  priceDelta: number;
};

export type CartItem = {
  id: number;
  cartId: number;
  menuId: number;
  qty: number;
  unitPrice: number;
  total: number;
  note?: string;

  // BE ตอนนี้ไม่ส่งชื่อ option/value มา (json:"-" ที่ฝั่ง Go)
  selections: CartItemSelection[];

  // ถ้าอยากให้ FE แสดงชื่อเมนู/รูปได้ แนะนำแก้ BE ให้ส่ง Menu มาด้วย (ดูหมายเหตุด้านล่าง)
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

// ---------- API ----------
export async function getCart(): Promise<GetCartRes> {
  const { data } = await api.get("/cart");

  // normalize id fields ที่มาจาก gorm.Model (ID ใหญ่)
  const normItem = (it: any) => ({
    ...it,
    id: it.id ?? it.ID,            // ใช้ตัวเล็กให้สม่ำเสมอ
    cartId: it.cartId ?? it.CartID // เผื่อมี CartID ใหญ่
  });

  const normCart = (c: any) => ({
    ...c,
    id: c.id ?? c.ID,
    items: Array.isArray(c.items) ? c.items.map(normItem) : [],
  });

  return {
    cart: normCart(data.cart ?? {}),
    subtotal: data.subtotal ?? 0,
  };
}

export type AddToCartPayload = {
  restaurantId: number;
  menuId: number;
  qty: number;
  note?: string;
  selections: { optionValueId: number }[]; // ตาม BE ปัจจุบัน
};

export async function addCartItem(payload: AddToCartPayload) {
  return api.post('/cart/items', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function updateCartItemQty(itemId: number, qty: number) {
  await api.patch("/cart/items/qty", { itemId, qty });
}

export async function removeCartItem(itemId: number) {
  await api.delete("/cart/items", { data: { itemId } });
}

export async function clearCart() {
  await api.delete("/cart");
}

export async function checkoutFromCart(): Promise<{ id: number; total: number }> {
  const { data } = await api.post("/orders/checkout-from-cart");
  return data;
}
