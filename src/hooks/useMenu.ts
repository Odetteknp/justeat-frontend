import { useEffect, useState } from "react";
import type { SimpleMenuItem, MenuSection } from "../types";
import { getMenusByRestaurant } from "../services/menu";

export function useMenu(restaurantId?: string) {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [items, setItems] = useState<SimpleMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getMenusByRestaurant(Number(restaurantId));
        if (!mounted) return;

        setItems(data);

        // ✅ generate sections จาก category (menuType)
        const unique = Array.from(new Set(data.map((it) => it.category)));
        setSections(unique.map((c) => ({ id: c, name: c })));
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Load failed");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [restaurantId]);

  return { sections, items, loading, error };
}
