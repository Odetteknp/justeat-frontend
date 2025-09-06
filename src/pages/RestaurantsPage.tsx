// pages/RestaurantsPage.tsx
import { useEffect, useState } from "react";
import RestaurantList from "../components/Restaurants/RestaurantList";
import { api } from "../services/api";
import type { listRestaurant } from "../types";

function toListRestaurant(r: any): listRestaurant {
  return {
    id: String(r.id ?? r.ID),
    name: r.name ?? r.restaurantName ?? "",
    cover: r.logo ?? r.picture ?? "",         // base64 / dataURI / URL ก็ได้
    rating: typeof r.rating === "number" ? r.rating : undefined,
  };
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<listRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/restaurants");
        const items = res?.data?.items ?? res?.data ?? [];
        const mapped: listRestaurant[] = items.map(toListRestaurant);
        if (alive) setRestaurants(mapped);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>กำลังโหลด...</div>;
  if (err) return <div style={{ padding: 24 }}>เกิดข้อผิดพลาด: {err}</div>;

  return (
    <div className="container">
      <RestaurantList title="ร้านทั้งหมด" items={restaurants} />
    </div>
  )
    
}
