import './FoodCard.css'; // ⬅️ เปลี่ยนมาใช้ CSS ปกติ
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
  rating,
  setRating,
  comment,
  setComment,
  onSubmit,
  onSkip,
}: Props) {
  const [anonymous, setAnonymous] = useState(false);

  const handleSubmit = () => {
    onSubmit({ rating, comment, anonymous });
  };

  return (
    <div className="card">
      {/* ปุ่มกากบาท (ถ้ามี) */}
      {onSkip && (
        <button className="closeBtn" onClick={onSkip} aria-label="ปิด">×</button>
      )}

      {/* ดาวให้คะแนน */}
      <div style={{ marginBottom: 10 }}>
        <RatingStars rating={rating} setRating={setRating} />
      </div>

      {/* กล่องคอมเมนต์ */}
      <CommentBox comment={comment} setComment={setComment} />

      {/* ปุ่มยืนยัน */}
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
