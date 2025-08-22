// src/components/sections/HomePromoSection.tsx
import HeroImage from "./HeroImage";
import PromoImageGrid from "./PromoImageGrid";
import { homePromoMock } from "../../mock/homePromo";

export default function HomePromoSection() {
  const data = homePromoMock; // ตอนนี้ใช้ mock จาก src/assets

  return (
    <section style={{ maxWidth: 1120, margin: "0 auto", padding: "12px 16px 24px" }}>
      <HeroImage {...data.hero} />
      <div style={{ height: 16 }} />
      <PromoImageGrid items={data.promos} />
    </section>
  );
}
