import React, { createContext, useContext, useState, useMemo } from 'react';
import type { MenuItem } from '../data/menuData';

type Selected = Record<string, string[]>;

export type CartLine = {
  id: string;
  item: MenuItem;
  quantity: number;
  selected: Selected;
  note?: string;
  total: number;
};

type CartContextType = {
  items: CartLine[];
  addItem: (line: Omit<CartLine, 'id'>) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  count: number;
  totalAmount: number;
};

const CartContext = createContext<CartContextType | null>(null);

// ✅ ฟังก์ชัน gen id ปลอดภัย
const genId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  const addItem = (line: Omit<CartLine, 'id'>) => {
    setItems((prev) => {
      const sizeChoice = line.selected['size']?.[0] ?? '';
      const noteText = line.note?.trim() ?? '';

      const idx = prev.findIndex(
        (x) =>
          x.item.name === line.item.name &&
          (x.selected['size']?.[0] ?? '') === sizeChoice &&
          (x.note?.trim() ?? '') === noteText
      );

      if (idx >= 0) {
        const copy = [...prev];

        // ✅ ใช้ unitPrice ล่าสุด
        const latestUnitPrice = line.total / line.quantity;
        const newQty = copy[idx].quantity + line.quantity;

        copy[idx] = {
          ...copy[idx],
          quantity: newQty,
          total: latestUnitPrice * newQty,
          selected: {
            ...copy[idx].selected,
            ...line.selected,
            size: copy[idx].selected['size'], // size ใช้ค่าของเดิม
          },
          note: line.note,
        };

        return copy;
      }

      return [...prev, { ...line, id: genId() }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const clear = () => setItems([]);

  const count = useMemo(
    () => items.reduce((sum, x) => sum + x.quantity, 0),
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, x) => sum + x.total, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clear, count, totalAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}