// components/RiderCard.tsx  (แก้ให้ไม่ใช้ .module.css)
import './FoodCard.css'; // ⬅️ เปลี่ยนมาใช้ CSS ปกติ
//import riderImg from '../assets/image/rider.png';
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

  const handleSubmit = () => {
    onSubmit({ rating, comment, anonymous });
  };

  return (
    <div className="card">
      {/* ปุ่มกากบาท (ถ้ามี) */}
      {onSkip && (
        <button className="closeBtn" onClick={onSkip} aria-label="ปิด">×</button>
      )}

      {/* รูปไรเดอร์ */}
      <img className="riderImg" src={riderImg} alt={riderName} />

      {/* ชื่อไรเดอร์ */}
      <p style={{ fontWeight: 600, marginBottom: 8 }}>{riderName}</p>

      {/* ดาวให้คะแนน */}
      <div style={{ marginBottom: 10 }}>
        <RatingStars rating={rating} setRating={setRating} />
      </div>

      {/* กล่องคอมเมนต์ */}
      <CommentBox comment={comment} setComment={setComment} />

      {/* ไม่ระบุตัวตน */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
        />
        ไม่ระบุตัวตน
      </label>

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
