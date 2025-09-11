// src/components/ReviewStarsLink.tsx
import React from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ReviewStarsLink.css";

type Props = {
  restaurantId: number | string;
  rating: number;          // ค่าเฉลี่ยที่คำนวณจากรีวิว
  total?: number;          // จำนวนรีวิวทั้งหมด (optional)
  className?: string;
  stopPropagation?: boolean;
  size?: number;           // px (default 14)
};

export default function ReviewStarsLink({
  restaurantId,
  rating,
  total,
  className,
  stopPropagation,
  size = 14,
}: Props) {
  const to = `/restaurants/${restaurantId}/reviews`;
  const navigate = useNavigate();

  const fixedRating = rating.toFixed(1); // ✅ บังคับ 1 ตำแหน่ง

  const label =
    `ดูรีวิวร้านนี้ (${fixedRating} ดาว` +
    (typeof total === "number" ? `, ทั้งหมด ${total} รีวิว` : "") +
    ")";

  const style: React.CSSProperties = {
    fontSize: size,
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    gap: "4 px",
    color: "black", 
    textDecoration: "none",
  };

  const Content = (
    <>
      <span className="star">⭐</span>
      <span className="rating-text" style={{ color: "black" }}>
        {fixedRating}
      </span>
      {typeof total === "number" && (
        <span className="total" style={{ color: "black" }}>
          ({total})
        </span>
      )}
    </>
  );

  if (stopPropagation) {
    const go = (e: MouseEvent | KeyboardEvent) => {
      e.stopPropagation();
      navigate(to);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go(e);
      }
    };

    return (
      <button
        type="button"
        className={`stars-link ${className ?? ""}`}
        aria-label={label}
        title={label}
        onClick={go}
        onKeyDown={onKeyDown}
        style={style}
      >
        {Content}
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={`stars-link ${className ?? ""}`}
      aria-label={label}
      title={label}
      style={style}
      onClick={(e) => e.stopPropagation?.()}
    >
      {Content}
    </Link>
  );
}
