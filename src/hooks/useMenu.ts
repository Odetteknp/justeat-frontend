// src/hooks/useMenu.ts
import { useEffect, useState } from "react";
import type { MenuItem, MenuSection } from "../types";
import { fetchSections, fetchMenuItems } from "../services/menu";

export function useMenu(restaurantId?: string) {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [s, i] = await Promise.all([
          fetchSections(restaurantId),
          fetchMenuItems(restaurantId),
        ]);
        if (!mounted) return;
        setSections(s); setItems(i);
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
