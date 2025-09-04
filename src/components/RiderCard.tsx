// components/RiderCard.tsx
import './FoodCard.css'; 
import riderImg from '../assets/image/rider.png';
import RatingStars from './RatingStars';
import CommentBox from './CommentBox';
import { useState } from 'react';

interface Props {
  riderName: string;
  rating: number;
  setRating: (rating: number) => void;
  comment: string;
  setComment: (comment: string) => void;
  onSubmit: (data: { rating: number; comment: string; anonymous: boolean }) => void;
  onSkip?: () => void;
}

export default function RiderCard({
  riderName,
  rating,
  setRating,
  comment,
  setComment,
  onSubmit,
  onSkip,
}: Props) {
  const [anonymous, setAnonymous] = useState(false);

  const handleSubmit = () => onSubmit({ rating, comment, anonymous });

  return (
    <div className="card">
      {onSkip && (
        <button className="closeBtn" onClick={onSkip} aria-label="ปิด">×</button>
      )}

      <img className="riderImg" src={riderImg} alt={riderName} />
      <p style={{ fontWeight: 600, marginBottom: 8 }}>{riderName}</p>

      <div style={{ marginBottom: 10 }}>
        <RatingStars rating={rating} setRating={setRating} />
      </div>

      <CommentBox comment={comment} setComment={setComment} />

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
        />
        ไม่ระบุตัวตน
      </label>

      <button
        className="submitBtn"
        onClick={handleSubmit}
        disabled={rating === 0}
        style={{ marginTop: 12 }}
      >
        ยืนยัน
      </button>
    </div>
  );
}
