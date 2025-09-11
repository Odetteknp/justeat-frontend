import { Link } from "react-router-dom";
import type { listRestaurant } from "../../types";
import "./RestaurantCard.css";
import ReviewStarsLink from "../ReviewStarsLink";

const PLACEHOLDER = "/images/placeholder-restaurant.png";

type Props = { restaurant: listRestaurant };

function resolveImage(src?: string, fallback: string = PLACEHOLDER) {
  if (!src) return fallback;
  if (src.startsWith("data:image")) return src;
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return `data:image/png;base64,${src}`;
}

export default function RestaurantCard({ restaurant }: Props) {
  const to = `/restaurants/${restaurant.id}/menus`;
  const coverSrc = resolveImage(restaurant.cover);

  return (
    <div className="rest-card">
      <Link to={to} className="rest-link" aria-label={`เปิดดูร้าน ${restaurant.name}`}>
        <div className="rest-coverOuter">
          <div className="rest-coverInner">
            <img src={coverSrc} alt={restaurant.name} loading="lazy" />
          </div>
        </div>

        <div className="rest-meta">
          <div className="rest-name" title={restaurant.name}>
            {restaurant.name}
          </div>
        </div>
      </Link>

      {typeof restaurant.rating === "number" && (
        <ReviewStarsLink
          restaurantId={restaurant.id}
          rating={restaurant.rating}
          size={14}
          stopPropagation // กันการคลิกไปชนกับ onClick ของการ์ด
          className="ps-ratingSingle"
        />
      )}
    </div>
  );
}
