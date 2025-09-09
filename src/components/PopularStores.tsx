// นำเข้า React (ฟังก์ชันคอมโพเนนต์) และ hooks ที่จำเป็น
import React from "react";
// ใช้ <Link> เพื่อนำทางไปหน้า /restaurants/:id
import { Link } from "react-router-dom";
// นำเข้าไฟล์ CSS สำหรับสไตล์การ์ดยอดนิยม
import "./PopularStores.css";
// ประเภทข้อมูล PopularStore (id, name, cover, rating, to?, href?)
import type { PopularStore } from "../types";

// รูปสำรองกรณีที่ไม่มี cover (คุณใส่ path asset ของคุณเองได้)
const PLACEHOLDER = "/images/placeholder-restaurant.png";

// ประเภท props ของคอมโพเนนต์ PopularStores
type Props = {
  title?: string;                      // หัวข้อ section (ค่าเริ่มต้น = "ร้านยอดนิยม")
  items: PopularStore[];               // ลิสต์ร้านที่ต้องการแสดง (ภายนอกส่งเข้ามา)
  variant?: "scroll" | "grid";         // โหมดการจัดเรียง (ค่าเริ่มต้น scroll = เลื่อนแนวนอน)
  cardWidth?: number;                  // ความกว้างของการ์ด (ใช้กับ scroll)
  rows?: number;                       // จำนวนแถว (ใช้กับ grid)
  showRating?: boolean;                // จะโชว์เรตติ้งหรือไม่ (default = true)
  ratingMode?: "single" | "stars";     // วิธีการแสดงเรตติ้ง (default = single = ตัวเลข + ดาว)
};

// คอมโพเนนต์หลัก PopularStores
export default function PopularStores({
  title = "ร้านยอดนิยม",    // ถ้าไม่ส่ง title เข้ามา → ใช้ข้อความนี้แทน
  items,                      // ลิสต์ร้าน (required)
  variant = "scroll",         // โหมดเริ่มต้น = scroll
  cardWidth = 250,            // ความกว้างการ์ดเริ่มต้น = 250px
  rows = 2,                   // จำนวนแถวเริ่มต้น (ใช้กับ grid) = 2
  showRating = true,          // ค่าเริ่มต้น: แสดงเรตติ้ง
  ratingMode = "single",      // ค่าเริ่มต้น: โหมด single (ดาว + ตัวเลข)
}: Props) {
  // ถ้าไม่มี items (หรือเป็น array ว่าง) → ไม่ render อะไรเลย
  if (!items?.length) return null;

  // ---- ฟังก์ชันย่อย renderRating: แสดงเรตติ้ง ----
  const renderRating = (val?: number) => {
    // ถ้าไม่ให้แสดงเรตติ้ง หรือค่า val ไม่ใช่ตัวเลข → ไม่ render
    if (!showRating || typeof val !== "number") return null;

    // โหมด single → แสดงดาว 1 ดวง + ตัวเลข
    if (ratingMode === "single") {
      return (
        <div className="ps-ratingSingle" aria-label={`rating ${val}`}>
          {/* ไอคอนดาว (SVG) */}
          <svg
            viewBox="0 0 20 20"
            className="ps-ratingSingle__icon"
            aria-hidden
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
          {/* ตัวเลขเรตติ้ง (1 ตำแหน่งทศนิยม) */}
          <span className="ps-ratingSingle__num">{val.toFixed(1)}</span>
        </div>
      );
    }

    // โหมด stars (ยังไม่ทำจริง แต่กันไว้)
    return <span className="ps-ratingNumOnly">{val.toFixed(1)}</span>;
  };

  // ---- ฟังก์ชันย่อย Card: เรนเดอร์การ์ดแต่ละร้าน ----
  const Card = (s: PopularStore) => {
    // ถ้ามี s.to → ใช้นั้น, ถ้าไม่มีก็สร้าง route จาก id, ถ้าไม่มี id เลย → undefined
    const to = s.to ?? (s.id ? `/restaurants/${s.id}` : undefined);

    // เนื้อหาการ์ดด้านใน (รูป + ชื่อ + เรตติ้ง)
    const inner = (
      <div
        className="ps-card"
        style={variant === "scroll" ? { width: cardWidth } : undefined}
      >
        {/* ส่วนรูปปก */}
        <div className="ps-coverOuter">
          <div className="ps-coverInner">
            <img
              src={s.cover || PLACEHOLDER} // ถ้าไม่มี cover → ใช้ fallback
              alt={s.name}                 // alt = ชื่อร้าน
              loading="lazy"               // โหลดรูปแบบ lazy
            />
          </div>
        </div>

        {/* ส่วนชื่อ + เรตติ้ง */}
        <div className="ps-meta">
          <div className="ps-name" title={s.name}>{s.name}</div>
          {renderRating(s.rating)}
        </div>
      </div>
    );

    // ถ้ามี to → render เป็น Link
    if (to) {
      return (
        <Link key={s.id} to={to} className="ps-link" aria-label={`เปิดดูร้าน ${s.name}`}>
          {inner}
        </Link>
      );
    }
    // ถ้ามี href (external link) → render เป็น <a>
    if (s.href) {
      return (
        <a key={s.id} href={s.href} className="ps-link" aria-label={`เปิดดูร้าน ${s.name}`}>
          {inner}
        </a>
      );
    }
    // ไม่งั้น render เป็น <div>
    return <div key={s.id} className="ps-link">{inner}</div>;
  };

  // ---- Render Section หลัก ----
  return (
    <section className="ps">
      {/* หัวข้อ section */}
      <div className="ps-title">{title}</div>
      {/* ถ้าโหมด scroll → แถวเลื่อน, ถ้า grid → ตารางหลายแถว */}
      {variant === "scroll"
        ? <div className="ps-scroll">{items.map(Card)}</div>
        : (
          <div className="ps-grid" style={{ gridTemplateRows: `repeat(${rows}, auto)` }}>
            {items.map(Card)}
          </div>
        )
      }
    </section>
  );
}
