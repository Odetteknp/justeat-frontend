// src/components/ImageRest.tsx
import "./ImageRest.css";
import ReviewStarsLink from "../ReviewStarsLink";
import { Link } from "react-router-dom";

type Props = {
  name: string;
  cover?: string;
  rating?: number | string;              // รับได้ทั้ง number/string
  restaurantId?: string | number;
};

const ImageRest = ({ name, cover, rating, restaurantId }: Props) => {
  // แปลง rating ให้เป็น number ถ้าไม่ได้จะเป็น NaN
  const ratingNum = typeof rating === "string" ? Number(rating) : rating;
  const hasRating = typeof ratingNum === "number" && Number.isFinite(ratingNum);

  const hasId = typeof restaurantId === "string" || typeof restaurantId === "number";

  // ดาวแบบ fallback เผื่ออยากเห็นตัวเลขง่าย ๆ
  const SimpleStars = hasRating ? (
    <div className="rating">⭐ {Math.round((ratingNum as number) * 10) / 10}</div>
  ) : null;

  return (
    <div className="header">
      <div className="header-image-container">
        <img
          src={cover || "/fallback.png"}
          alt={name}
          className="header-image"
        />
        <div className="restaurant-overlay">
          <h1 className="restaurant-name">{name}</h1>

          {/* ดาวอยู่ใต้ชื่อ:
              - ถ้ามี restaurantId => ลิงก์ไปหน้ารีวิว + ใช้ ReviewStarsLink
              - ถ้าไม่มี id => โชว์ SimpleStars */}
          {hasRating && (
            hasId ? (
              <Link
                to={`/restaurants/${restaurantId}/reviews`}
                className="restaurant-rating-link"
                aria-label={`ดูรีวิวของ ${name}`}
              >
                <ReviewStarsLink
                  restaurantId={restaurantId as string | number}
                  rating={ratingNum as number}
                  size={18}
                  className="rating"
                />
              </Link>
            ) : (
              <div className="restaurant-rating-link">
                {SimpleStars}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageRest;
