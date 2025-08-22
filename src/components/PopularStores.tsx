import React from "react";
import { Link } from "react-router-dom"; // ถ้าไม่มี router ลบได้
import { Rate } from "antd"; // ไม่อยากพึ่ง lib ลบได้
import "./PopularStores.css";
import type { PopularStore } from "../types/sections";

type Props = {
  title?: string;
  items: PopularStore[]; // <-- รับจากภายนอกเท่านั้น
  variant?: "scroll" | "grid";
  cardWidth?: number; // ใช้กับ scroll
  rows?: number; // ใช้กับ grid
  showRating?: boolean;
  ratingMode?: "single" | "stars";
};

export default function PopularStores({
  title = "ร้านยอดนิยม",
  items,
  variant = "scroll",
  cardWidth = 250,
  rows = 2,
  showRating = true,
  ratingMode = "single",
}: Props) {
  if (!items?.length) return null;

  const renderRating = (val?: number) => {
    if (!showRating || typeof val !== "number") return null;

    if (ratingMode === "single") {
      return (
        <div className="ps-ratingSingle" aria-label={`rating ${val}`}>
          <svg
            viewBox="0 0 20 20"
            className="ps-ratingSingle__icon"
            aria-hidden
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>

          <span className="ps-ratingSingle__num">{val.toFixed(1)}</span>
        </div>
      );
    }

    // stars mode (ถ้าจะใช้ในอนาคต)
    return <span className="ps-ratingNumOnly">{val.toFixed(1)}</span>;
  };

  const Card = (s: PopularStore) => {
    const inner = (
      <div
        className="ps-card"
        style={variant === "scroll" ? { width: cardWidth } : undefined}
      >
        {/* ภาพมี padding รอบ ๆ และโค้ง */}
        <div className="ps-coverOuter">
          <div className="ps-coverInner">
            <img src={s.cover} alt={s.name} loading="lazy" />
          </div>
        </div>

        {/* เนื้อหาด้านล่าง */}
        <div className="ps-meta">
          <div className="ps-name" title={s.name}>
            {s.name}
          </div>
          {renderRating(s.rating)}
        </div>
      </div>
    );

    if (s.to)
      return (
        <Link key={s.id} to={s.to} className="ps-link">
          {inner}
        </Link>
      );
    if (s.href)
      return (
        <a key={s.id} href={s.href} className="ps-link">
          {inner}
        </a>
      );
    return (
      <div key={s.id} className="ps-link">
        {inner}
      </div>
    );
  };

  return (
    <section className="ps">
      <div className="ps-title">{title}</div>
      {variant === "scroll" ? (
        <div className="ps-scroll">{items.map(Card)}</div>
      ) : (
        <div
          className="ps-grid"
          style={{ gridTemplateRows: `repeat(${rows}, auto)` }}
        >
          {items.map(Card)}
        </div>
      )}
    </section>
  );
}
