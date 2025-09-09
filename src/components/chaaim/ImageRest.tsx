import "./ImageRest.css";

type Props = {
  name: string;
  cover?: string;
  rating?: number;
};

const ImageRest = ({ name, cover, rating }: Props) => {
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
          {rating && <span className="rating">⭐ {rating.toFixed(1)}</span>}
        </div>
      </div>
    </div>
  );
};

export default ImageRest;
