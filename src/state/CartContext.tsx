import React, { createContext, useContext, useMemo, useState } from "react";
import type { MenuItem } from "../types/menu";

export type CartLine = {
  id: string;
  item: MenuItem;
  quantity: number;
  selected: Record<string, string[]>; // optionId -> choiceIds
  note?: string;
  // ราคาในตะกร้าฝั่งหน้า (แสดงผลเท่านั้น) — ที่จริง backend ควรคำนวณอีกครั้งตอนสั่ง
  total: number;
};

type CartContextType = {
  items: CartLine[];
  addItem: (line: Omit<CartLine, "id">) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  totalAmount: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  const addItem: CartContextType["addItem"] = (line) => {
    const id = crypto.randomUUID();
    setItems(prev => [...prev, { ...line, id }]);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(x => x.id !== id));
  const clear = () => setItems([]);

  const totalAmount = useMemo(
    () => items.reduce((s, x) => s + x.total, 0),
    [items]
  );

  const count = useMemo(
    () => items.reduce((s, x) => s + x.quantity, 0),
    [items]
  );

  const value: CartContextType = { items, addItem, removeItem, clear, totalAmount, count };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
