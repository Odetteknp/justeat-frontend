import "./ImageRest.css";
import ReviewStarsLink from "../ReviewStarsLink";

type Props = {
  name: string;
  cover?: string;
  rating?: number;
  restaurantId?: number;
};

const ImageRest = ({ name, cover, rating, restaurantId }: Props) => {
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
          {typeof rating === "number" && restaurantId && (
            <ReviewStarsLink
              restaurantId={restaurantId}
              rating={rating}
              size={16}
              className="rating"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageRest;
