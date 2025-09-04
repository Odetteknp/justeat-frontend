// src/pages/RestaurantReview.tsx
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./RestaurantReview.css";
import chefImage from "../assets/image/chef.png";

type NavState = {
  orderId?: number;
  restaurantId?: number;
  restaurantName?: string;
};

export default function RestaurantReview() {
  const navigate = useNavigate();
  const { restaurantId: restaurantIdParam } = useParams<{ restaurantId: string }>();
  const { state } = useLocation() as { state?: NavState };

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");         // ✅ กลับมาแล้ว แต่เป็น optional
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restaurantId = Number(restaurantIdParam ?? state?.restaurantId);
  const restaurantName = state?.restaurantName ?? (restaurantId ? `ร้าน #${restaurantId}` : "ร้านอาหาร");
  const orderId = state?.orderId;

  // ส่งได้เมื่อเลือกดาวแล้วเท่านั้น (คอมเมนต์ไม่บังคับ)
  const canSubmit = rating > 0 && !submitting;

  const submit = async () => {
    setError(null);
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const payload = {
        restaurantId,
        orderId,
        rating,
        anonymous,
        // ส่ง comment เฉพาะเมื่อไม่ว่าง
        ...(comment.trim() ? { comment: comment.trim() } : {}),
    };

      // TODO: เรียก API จริง
      // await fetch("/api/reviews", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      console.log("Review payload:", payload);
      navigate("/thankyou");
    } catch (e: any) {
      setError(e?.message ?? "ส่งรีวิวไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rr">
      <header className="rr__header">
        <h1 className="rr__title">รีวิวร้านอาหาร</h1>
        <button className="rr__close" onClick={() => navigate(-1)} aria-label="ปิด">
          ×
        </button>
      </header>

      <section className="rr__card">
        <div className="rr__row">
          <div className="rr__image">
            <img src={chefImage} alt="" />
          </div>

          <div className="rr__field">
            <div className="rr__label">
              ให้คะแนน {restaurantName}{orderId ? ` (ออเดอร์ #${orderId})` : ""}
            </div>
            <div className="rr__stars" role="radiogroup" aria-label="ให้คะแนน">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`rr__star ${n <= rating ? "is-active" : ""}`}
                  aria-pressed={n <= rating}
                  onClick={() => setRating(n)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ✅ กล่องคอมเมนต์ (ไม่บังคับกรอก) */}
        <div className="rr__row">
          <label className="rr__label" htmlFor="comment">ความคิดเห็น (ไม่บังคับ)</label>
          <textarea
            id="comment"
            className="rr__commentBox"
            placeholder="อยากบอกอะไรกับร้านนี้ก็พิมพ์ได้เลย… (เว้นว่างได้)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
          />
        </div>

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

        {error && <div className="rr__error">{error}</div>}

        <div className="rr__actions">
          <button className="rr__btn rr__btn--secondary" onClick={() => navigate(-1)} disabled={submitting}>
            ยกเลิก
          </button>
          <button
            className="rr__btn rr__btn--primary"
            onClick={submit}
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
          >
            {submitting ? "กำลังส่ง..." : "ส่งรีวิว"}
          </button>
        </div>
      </section>
    </div>
  );
}
