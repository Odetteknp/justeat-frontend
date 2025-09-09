// components/RestaurantList/RestaurantList.tsx
import RestaurantCard from "./RestaurantCard";
import type { listRestaurant } from "../../types";
import "./RestaurantList.css";

type Props = {
  title?: string;
  items: listRestaurant[];
};

export default function RestaurantList({ title = "ร้านทั้งหมด", items }: Props) {
  if (!items || items.length === 0) {
    return (
      <section className="rest-list">
        <h2 className="rest-title">{title}</h2>
        <p className="rest-empty">ยังไม่มีร้าน</p>
      </section>
    );
  }

  return (
    <section className="rest-list">
      <h2 className="rest-title">{title}</h2>
      <div className="rest-grid">
        {items.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>
    </section>
  );
}
