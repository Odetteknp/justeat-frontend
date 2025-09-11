// src/pages/RestaurantReview.tsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./RestaurantReview.css";
import chefImage from "../assets/image/chef.png";
import { getToken } from "../services/tokenStore"; // ถ้ามี

type NavState = {
  orderId?: number;
  restaurantId?: number;
  restaurantName?: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function RestaurantReview() {
  const navigate = useNavigate();
  const { restaurantId: restaurantIdParam } = useParams<{ restaurantId: string }>();
  const { state } = useLocation() as { state?: NavState };

  // ---- derive data from params/state ----
  const restaurantId = useMemo(
    () => Number(restaurantIdParam ?? state?.restaurantId ?? 0) || 0,
    [restaurantIdParam, state?.restaurantId]
  );
  const restaurantName = state?.restaurantName ?? (restaurantId ? `ร้าน #${restaurantId}` : "ร้านอาหาร");
  const orderId = state?.orderId; // 🔴 จำเป็นสำหรับ backend ปัจจุบัน

  // ---- local states ----
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");   // optional
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // เมื่อไม่มี orderId ให้แจ้งและปิดปุ่มส่ง (เพราะ API ต้องมี)
  const missingOrderMsg = !orderId
    ? "ไม่พบหมายเลขออเดอร์ของคุณ จึงไม่สามารถส่งรีวิวได้ (ระบบปัจจุบันต้องรีวิวตามออเดอร์)"
    : null;

  const canSubmit = !!orderId && rating > 0 && !submitting;

  // ---- submit handler ----
  const submit = async () => {
    setError(null);
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      // ✅ payload ตรงกับ backend: Create review expects { orderId, rating, comments }
      const payload: Record<string, any> = {
        orderId,                // required by backend
        rating,                 // required by backend (1..5)
        ...(comment.trim() ? { comments: comment.trim() } : {}), // พหูพจน์ตาม backend
      };

      const headers: HeadersInit = { "Content-Type": "application/json" };
      const token = getToken?.();
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // พยายามดึง error ที่ backend ส่งออกมาเพื่ออ่านง่าย
        let message = `HTTP ${res.status}`;
        try {
          const txt = await res.text();
          if (txt) {
            // backend อาจส่ง { ok:false, error:"..." } หรือ text ตรง ๆ
            try {
              const j = JSON.parse(txt);
              message = j?.error || txt || message;
            } catch {
              message = txt || message;
            }
          }
        } catch {}
        throw new Error(message);
      }

      // ส่งสำเร็จ → กลับหน้ารวมรีวิวร้าน
      navigate(`/restaurants/${restaurantId || ""}/reviews`, { replace: true });
    } catch (e: any) {
      // ตัวอย่าง error จาก backend:
      // - "order not found or not belong to user"
      // - "owners cannot review their own restaurant"
      // - "order is not in a reviewable status"
      setError(e?.message ?? "ส่งรีวิวไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rr">
      <header className="rr__header">
        <h1 className="rr__title">รีวิวร้านอาหาร</h1>
        <button className="rr__close" onClick={() => navigate(-1)} aria-label="ปิด">×</button>
      </header>

      <section className="rr__card">
        <div className="rr__row">
          <div className="rr__image"><img src={chefImage} alt="" /></div>

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

        {/* กล่องคอมเมนต์ (ไม่บังคับ) */}
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

        {/* แจ้งเตือนถ้าไม่มี orderId */}
        {missingOrderMsg && <div className="rr__error">{missingOrderMsg}</div>}
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
