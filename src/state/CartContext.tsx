// src/state/CartContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import type { MenuItem } from '../data/menuData';

export type CartLine = {
  id: string;
  item: MenuItem;
  quantity: number;
  selected: Record<string, string[]>; // optionId -> choiceIds
  note?: string;
  total: number; // รวมราคาต่อแถว
};

type CartContextType = {
  items: CartLine[];
  addItem: (line: Omit<CartLine, 'id'>) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  totalAmount: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  const addItem = (line: Omit<CartLine, 'id'>) => {
    setItems(prev => [{ id: crypto.randomUUID(), ...line }, ...prev]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(x => x.id !== id));
  };

  const clear = () => setItems([]);

  const totalAmount = useMemo(
    () => items.reduce((s, x) => s + x.total, 0),
    [items]
  );

  const count = useMemo(() => items.reduce((s, x) => s + x.quantity, 0), [items]);

  const value = { items, addItem, removeItem, clear, totalAmount, count };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
