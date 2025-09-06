import React from "react";
import type { HeroImage } from "../../types";

export default function HeroImage({ image, href, alt }: HeroImage) {
  return (
    <a href={href} aria-label={alt ?? "promotion"}>
      <img
        src={image}
        alt={alt ?? "promotion"}
        loading="eager"
        style={{
          width: "100%",
          borderRadius: 16,
          display: "block",
          objectFit: "cover",
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
        }}
      />
    </a>
  );
}
