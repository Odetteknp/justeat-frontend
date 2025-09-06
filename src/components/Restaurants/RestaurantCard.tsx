// components/RestaurantCard/RestaurantCard.tsx
import { Link } from "react-router-dom";
import type { listRestaurant } from "../../types";
import "./RestaurantCard.css";

const PLACEHOLDER = "/images/placeholder-restaurant.png";

type Props = {
  restaurant: listRestaurant;
};

// ครอบรูปให้ใช้ได้ทุกเคส (data URI / raw base64 / URL/path)
function resolveImage(src?: string, fallback: string = PLACEHOLDER) {
  if (!src) return fallback;
  if (src.startsWith("data:image")) return src;                 // data URI พร้อม prefix
  if (src.startsWith("http") || src.startsWith("/")) return src; // URL หรือ public path
  return `data:image/png;base64,${src}`;                         // raw base64 → เติม prefix
}

export default function RestaurantCard({ restaurant }: Props) {
  const to = `/restaurants/${restaurant.id}`;
  const coverSrc = resolveImage(restaurant.cover);

  return (
    <Link to={to} className="rest-link" aria-label={`เปิดดูร้าน ${restaurant.name}`}>
      <div className="rest-card">
        {/* Cover */}
        <div className="rest-coverOuter">
          <div className="rest-coverInner">
            <img src={coverSrc} alt={restaurant.name} loading="lazy" />
          </div>
        </div>

        {/* Meta */}
        <div className="rest-meta">
          <div className="rest-name" title={restaurant.name}>
            {restaurant.name}
          </div>

          {/* rating (ถ้ามี) */}
          {typeof restaurant.rating === "number" && (
            <div className="ps-ratingSingle" aria-label={`rating ${restaurant.rating}`}>
              <svg viewBox="0 0 20 20" className="ps-ratingSingle__icon" aria-hidden>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span className="ps-ratingSingle__num">{restaurant.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
