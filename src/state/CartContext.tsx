import React, { createContext, useContext, useState, useMemo } from 'react';
import type { MenuItem } from '../data/menuData';

type Selected = Record<string, string[]>;
export type CartLine = {
  id: string;
  item: MenuItem;
  quantity: number;
  selected: Selected;
  note?: string;
  total: number;          // line total (unit * qty)
};

type AddItemInput = Omit<CartLine, 'id'> & {
  restaurantId?: number;  // <- เพิ่ม: ร้านของเมนูที่เพิ่มเข้าตะกร้า
};

type CartContextType = {
  items: CartLine[];
  addItem: (line: AddItemInput) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  count: number;
  totalAmount: number;
  restaurantId?: number;  // <- เพิ่ม: ร้านของตะกร้าปัจจุบัน
};

const CartContext = createContext<CartContextType | null>(null);

// ✅ ฟังก์ชัน gen id ปลอดภัย
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
      // ถ้ามี restaurantId เดิมอยู่แล้ว และของใหม่มาจากร้านอื่น -> ไม่อนุญาต (กันข้ามร้าน)
      if (prev.restaurantId && line.restaurantId && prev.restaurantId !== line.restaurantId) {
        console.warn('Cart contains items from another restaurant. Rejecting new item.');
        return prev; // จะเปลี่ยนเป็น popup/confirm ภายนอกได้
      }

      const itemsPrev = prev.items;
      const sizeChoice = line.selected['size']?.[0] ?? '';
      const noteText = line.note?.trim() ?? '';

      const idx = itemsPrev.findIndex(
        (x) =>
          x.item.name === line.item.name &&
          (x.selected['size']?.[0] ?? '') === sizeChoice &&
          (x.note?.trim() ?? '') === noteText
      );

      if (idx >= 0) {
        const copy = [...itemsPrev];

        // ใช้ unitPrice ล่าสุดจาก input ที่เข้ามา
        const latestUnitPrice = line.total / line.quantity;
        const newQty = copy[idx].quantity + line.quantity;

        copy[idx] = {
          ...copy[idx],
          quantity: newQty,
          total: latestUnitPrice * newQty,
          selected: {
            ...copy[idx].selected,
            ...line.selected,
            size: copy[idx].selected['size'], // ล็อกไซซ์ตามของเดิม
          },
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
      // ถ้าลบจนว่าง เคลียร์ restaurantId ด้วย
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
