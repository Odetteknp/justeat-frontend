import React from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ReviewStarsLink.css";

type Props = {
  restaurantId: number | string;
  rating: number;          // 0..5
  total?: number;          // จำนวนรีวิวทั้งหมด (ถ้ามี)
  className?: string;
  stopPropagation?: boolean; // true ถ้าดาวอยู่ในการ์ดที่ทั้งใบ onClick
  size?: number;           // px (default 14)
};

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) nodes.push(<span key={i}>★</span>);
    else if (i === full && half) nodes.push(<span key={i}>☆</span>); // ไว้ทำครึ่งดาวทีหลัง
    else nodes.push(<span key={i}>☆</span>);
  }
  return nodes;
}

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
  const label =
    `ดูรีวิวร้านนี้ (${(Math.round(rating * 10) / 10).toFixed(1)} ดาว` +
    (typeof total === "number" ? `, ทั้งหมด ${total} รีวิว` : "") + ")";

  const style: React.CSSProperties = { fontSize: size, lineHeight: 1 };

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
        <span className="stars">{renderStars(rating)}</span>
        <span className="rating-text">{(Math.round(rating * 10) / 10).toFixed(1)}</span>
        {typeof total === "number" && <span className="total">({total})</span>}
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
      <span className="stars">{renderStars(rating)}</span>
      <span className="rating-text">{(Math.round(rating * 10) / 10).toFixed(1)}</span>
      {typeof total === "number" && <span className="total">({total})</span>}
    </Link>
  );
}
