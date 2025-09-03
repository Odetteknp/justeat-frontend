import "./RatingStars.css";

interface Props {
  rating: number;
  setRating: (rating: number) => void;
}

export default function RatingStars({ rating, setRating }: Props) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`$"star" ${i <= rating ? "selected" : ''}`}
          onClick={() => setRating(i)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
