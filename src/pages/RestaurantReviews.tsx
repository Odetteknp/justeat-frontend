// src/pages/RestaurantReviews.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchRestaurantReviews, type Review } from "../services/reviews";
import "./RestaurantReviews.css";

export default function RestaurantReviews() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgFromApi, setAvgFromApi] = useState<number | null>(null);
  const [totalFromApi, setTotalFromApi] = useState<number | null>(null);

  // โหลดครั้งแรก (หรือเมื่อ id เปลี่ยน)
  useEffect(() => {
    if (!id) {
      setReviews([]);
      setAvgFromApi(null);
      setTotalFromApi(null);
      setLoading(false);
      setErr("ไม่พบรหัสร้าน");
      return;
    }

    const ac = new AbortController();
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const { rows, avg, total } = await fetchRestaurantReviews(id, undefined, ac.signal);
        if (!alive) return;
        setReviews(rows || []);
        setAvgFromApi(typeof avg === "number" ? avg : null);
        setTotalFromApi(typeof total === "number" ? total : null);
      } catch (e: any) {
        if (!alive) return;
        if (e?.name === "AbortError") return;
        setErr(e?.message ?? "โหลดรีวิวไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ac.abort();
    };
  }, [id]);

  const total = totalFromApi ?? reviews.length;

  const avg = useMemo(() => {
    const v =
      avgFromApi ??
      (reviews.length
        ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
        : 0);
    return Number.isFinite(v) ? v : 0;
  }, [avgFromApi, reviews]);

  const breakdown = useMemo(() => {
    const b: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      const k = Math.max(1, Math.min(5, Math.round(r.rating || 0)));
      b[k] += 1;
    }
    return b;
  }, [reviews]);

  return (
    <div className="rvw">
      <div className="rvw__topbar">
        <Link to={`/restaurants/${id}/menus`} className="rvw__back">
          ← กลับไปหน้าร้าน
        </Link>
      </div>

      <header className="rvw__header">
        <h1 className="rvw__title">รีวิวทั้งหมดของร้าน #{id || "-"}</h1>
        <div className="rvw__avg">
          <span className="rvw__avgNum">{avg.toFixed(1)}</span>
          <span className="rvw__avgStars" aria-label={`${avg.toFixed(1)} ดาว`}>
            {renderStars(avg)}
          </span>
          <span className="rvw__count">จาก {total} รีวิว</span>
        </div>
      </header>

      {/* Breakdown 5 → 1 ดาว */}
      <section className="rvw__breakdown">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = breakdown[star] ?? 0;
          const pct = total ? Math.round((count / total) * 100) : 0;
          return (
            <div className="rvw__row" key={star}>
              <div className="rvw__rowLabel">{star} ดาว</div>
              <div className="rvw__bar">
                <div className="rvw__barFill" style={{ width: `${pct}%` }} />
              </div>
              <div className="rvw__rowCount">{count}</div>
            </div>
          );
        })}
      </section>

      {/* ลิสต์รีวิว */}
      <section className="rvw__list">
        {loading ? (
          <div className="rvw__status">กำลังโหลดรีวิว…</div>
        ) : err ? (
          <div className="rvw__status rvw__status--error">เกิดข้อผิดพลาด: {err}</div>
        ) : reviews.length === 0 ? (
          <div className="rvw__status">ยังไม่มีรีวิว</div>
        ) : (
          reviews.map((r) => (
            <article className="rvw__item" key={r.id}>
              <div className="rvw__itemHead">
                <div className="rvw__stars" title={`${r.rating} ดาว`}>
                  {renderStars(r.rating)}
                </div>
                <div className="rvw__user">
                  {formatName(r.user)}
                  {r.reviewDate && (
                    <span className="rvw__date">{formatDate(r.reviewDate)}</span>
                  )}
                </div>
              </div>
              {r.comments && <p className="rvw__text">{r.comments}</p>}
            </article>
          ))
        )}
      </section>
    </div>
  );
}

/* -------- utils -------- */
function formatName(u?: { firstName?: string; lastName?: string } | null) {
  if (!u) return "ผู้ใช้ไม่ระบุชื่อ";
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  return name || "ผู้ใช้ไม่ระบุชื่อ";
}

function formatDate(d?: string) {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(d));
  } catch {
    return "";
  }
}

function renderStars(v: number) {
  const n = Math.max(0, Math.min(5, Math.round(v)));
  const filled = "★".repeat(n);
  const empty = "★".repeat(5 - n);
  return (
    <span aria-hidden>
      <span className="rvw__starFill">{filled}</span>
      <span className="rvw__starEmpty">{empty}</span>
    </span>
  );
}
