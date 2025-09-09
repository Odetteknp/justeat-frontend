import React, { createContext, useContext, useState, useMemo } from 'react';
import type { SimpleMenuItem } from '../types';

export type CartLine = {
  id: string;
  item: SimpleMenuItem;
  quantity: number;
  note?: string;
  total: number; // line total = unitPrice * qty
};

type AddItemInput = Omit<CartLine, 'id'> & {
  restaurantId?: number;
};

type CartContextType = {
  items: CartLine[];
  addItem: (line: AddItemInput) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  count: number;
  totalAmount: number;
  restaurantId?: number;
};

const CartContext = createContext<CartContextType | null>(null);

// ✅ generator id
const genId = () =>
  (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
    ? (crypto as any).randomUUID()
    : Math.random().toString(36).slice(2);

type CartState = {
  items: CartLine[];
  restaurantId?: number;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({ items: [], restaurantId: undefined });

  const addItem = (line: AddItemInput) => {
    setState((prev) => {
      if (prev.restaurantId && line.restaurantId && prev.restaurantId !== line.restaurantId) {
        console.warn('Cart contains items from another restaurant. Rejecting new item.');
        return prev;
      }

      const itemsPrev = prev.items;
      const noteText = line.note?.trim() ?? '';

      // รวม item ถ้าชื่อเมนู + note ตรงกัน
      const idx = itemsPrev.findIndex(
        (x) =>
          x.item.id === line.item.id &&
          (x.note?.trim() ?? '') === noteText
      );

      if (idx >= 0) {
        const copy = [...itemsPrev];
        const latestUnitPrice = line.total / line.quantity;
        const newQty = copy[idx].quantity + line.quantity;

        copy[idx] = {
          ...copy[idx],
          quantity: newQty,
          total: latestUnitPrice * newQty,
          note: line.note,
        };

        return {
          restaurantId: prev.restaurantId ?? line.restaurantId,
          items: copy,
        };
      }

      return {
        restaurantId: prev.restaurantId ?? line.restaurantId,
        items: [...itemsPrev, { ...line, id: genId() }],
      };
    });
  };

  const removeItem = (id: string) => {
    setState((prev) => {
      const items = prev.items.filter((x) => x.id !== id);
      return { items, restaurantId: items.length ? prev.restaurantId : undefined };
    });
  };

  const clear = () => setState({ items: [], restaurantId: undefined });

  const count = useMemo(
    () => state.items.reduce((sum, x) => sum + x.quantity, 0),
    [state.items]
  );
  const totalAmount = useMemo(
    () => state.items.reduce((sum, x) => sum + x.total, 0),
    [state.items]
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        clear,
        count,
        totalAmount,
        restaurantId: state.restaurantId,
      }}
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
