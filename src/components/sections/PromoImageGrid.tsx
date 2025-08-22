import React from "react";
import type { PromoImage } from "../../types/sections";

export default function PromoImageGrid({ items }: { items: PromoImage[] }) {
  if (!items?.length) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 16
      }}
    >
      {items.map(p => (
        <a key={p.id} href={p.href} aria-label={p.alt ?? "promotion"}>
          <img
            src={p.image}
            alt={p.alt ?? "promotion"}
            loading="lazy"
            style={{
              width: "100%",
              borderRadius: 12,
              display: "block",
              objectFit: "cover",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)"
            }}
          />
        </a>
      ))}
    </div>
  );
}
