// src/pages/RestaurantReview.tsx 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RestaurantReview.css';
import chefImage from "../../src/assets/image/chef.png"

export default function RestaurantReview() {
  const navigate = useNavigate();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false); // ✅ state สำหรับไม่ระบุตัวตน

  const submit = () => {
    // TODO: call API ส่งรีวิว
    console.log({ rating, comment, anonymous });
    navigate("/thankyou"); // ปิดหน้าแล้วกลับหน้าก่อนหน้า (เปลี่ยน path ได้ตามต้องการ)
  };

  return (
    <div className="rr">
      <header className="rr__header">
        <h1 className="rr__title">รีวิวร้านอาหาร</h1>
        <button className="rr__close" onClick={() => navigate(-1)} aria-label="ปิด">×</button>
      </header>

      <section className="rr__card">
        <div className="rr__row">
          <div className="rr_image">
            <img src={chefImage} alt="" />
          </div>
          <span className="rr__label">ให้คะแนน</span>
          <div className="rr__stars" role="radiogroup" aria-label="ให้คะแนน">
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                type="button"
                className={`rr__star ${n <= rating ? 'is-active' : ''}`}
                aria-pressed={n <= rating}
                onClick={() => setRating(n)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="rr__row">
          <label className="rr__label" htmlFor="comment">ความคิดเห็น</label>
          <textarea
            id="comment"
            className="rr__commentBox"
            placeholder="เขียนความเห็นของคุณ…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
          />
        </div>

        {/* ✅ กล่องติ๊กสำหรับไม่ระบุตัวตน */}
        <div className="rr__row rr__checkbox">
          <label>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            รีวิวแบบไม่ระบุตัวตน
          </label>
        </div>

        <div className="rr__actions">
          <button className="rr__btn rr__btn--secondary" onClick={() => navigate(-1)}>ยกเลิก</button>
          <button className="rr__btn rr__btn--primary" onClick={submit} disabled={!rating}>
            ส่งรีวิว
          </button>
        </div>
      </section>
    </div>
  );
}
