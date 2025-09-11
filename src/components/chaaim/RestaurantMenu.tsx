// src/components/RestaurantMenu.tsx
import React, { useEffect, useMemo, useRef, useState, createRef } from "react";
import "./RestaurantMenu.css";
import MenuItemCard from "./MenuItemCard";
import { type SimpleMenuItem } from "../../types";
import { useNavigate, useParams } from "react-router-dom";

import Header from "./ImageRest";
import { getMenusByRestaurant } from "../../services/menu";
import { getRestaurant } from "../../services/restaurants";
import { useCartServer } from "../../hooks/useCartServer";
import { fetchRestaurantReviews } from "../../services/reviews";

type Section = { id: string; label: string };
type SectionRefs = Record<string, React.RefObject<HTMLDivElement | null>>;

const fmtTHB = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(n);

// แปลงอะไรก็ได้ให้เป็น number ถ้าไม่ได้ให้คืน null
function toNumberOrNull(x: unknown): number | null {
  const n = typeof x === "string" ? Number(x) : (x as number);
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

export default function RestaurantMenu() {
  const { id } = useParams<{ id: string }>();

  // ทำให้แน่ใจว่าเป็นเลขที่ใช้ได้
  const restId = Number(id);
  const hasRestId = Number.isFinite(restId) && restId > 0;

  const [restaurant, setRestaurant] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [itemsBySection, setItemsBySection] = useState<
    Record<string, SimpleMenuItem[]>
  >({});

  const [active, setActive] = useState<string>("");
  const tabsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { add, count, subtotal } = useCartServer();

  // rating จาก Reviews API
  const [avgRating, setAvgRating] = useState<number | null>(null);

  // ค่าที่จะโชว์: เลือก avg ถ้ามี, ไม่งั้น fallback เป็นของร้าน
  const ratingToShow: number | null = (() => {
    const fromAvg = toNumberOrNull(avgRating);
    if (fromAvg !== null) return fromAvg;
    const fromRest = toNumberOrNull(restaurant?.rating);
    return fromRest;
  })();

  const sectionRefs = useMemo<SectionRefs>(() => {
    return sections.reduce<SectionRefs>((acc, s) => {
      acc[s.id] = createRef<HTMLDivElement>();
      return acc;
    }, {} as SectionRefs);
  }, [sections]);

  // เพิ่มลงตะกร้า
  const handleAdd = async (item: SimpleMenuItem) => {
    const menuId = Number(item.id);
    if (!menuId || !hasRestId) return;

    try {
      await add({ restaurantId: restId, menuId, qty: 1 });
      console.log("[Cart] add item:", { restaurantId: restId, menuId, qty: 1 });
    } catch (e: any) {
      if (e?.response?.status === 409) {
        navigate("/cart");
        return;
      }
      alert(e?.response?.data?.error || "เพิ่มลงตะกร้าไม่สำเร็จ");
    }
  };

  const goCart = () => navigate("/cart");

  // โหลดข้อมูลร้าน
  useEffect(() => {
    if (!hasRestId) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await getRestaurant(restId);
        if (!mounted) return;
        setRestaurant(data);
        console.log("[Restaurant] loaded:", data);
      } catch (e) {
        console.error("[Restaurant] load error:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [restId, hasRestId]);

  // โหลด avg rating (พอสำหรับ header)
  useEffect(() => {
    if (!hasRestId) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        const { avg } = await fetchRestaurantReviews(
          String(restId),
          { limit: 1, offset: 0 },
          ctrl.signal
        );
        const n = toNumberOrNull(avg);
        setAvgRating(n);
        console.log("[Reviews] rating loaded:", { avg: n });
      } catch (e) {
        console.error("[Reviews] load rating error:", e);
        setAvgRating(null);
      }
    })();
    return () => ctrl.abort();
  }, [restId, hasRestId]);

  // โหลดเมนู
  useEffect(() => {
    if (!hasRestId) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const items = await getMenusByRestaurant(restId);
        if (!mounted) return;

        const PRIORITY = ["เมนูหลัก", "ของทานเล่น", "ของหวาน", "เครื่องดื่ม"];
        const labels = Array.from(new Set(items.map((i) => i.category)));

        labels.sort((a, b) => {
          const ia = PRIORITY.indexOf(a);
          const ib = PRIORITY.indexOf(b);
          if (ia === -1 && ib === -1) return a.localeCompare(b);
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        });

        const secs: Section[] = labels.map((l) => ({ id: l, label: l }));
        const map: Record<string, SimpleMenuItem[]> = {};
        for (const s of secs) map[s.id] = [];
        for (const it of items) (map[it.category] ??= []).push(it);

        setSections(secs);
        setItemsBySection(map);
        setActive(secs[0]?.id || "");

        console.log("[Menu] loaded:", { sections: secs.length, items: items.length });
      } catch (e) {
        console.error("[Menu] load error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [restId, hasRestId]);

  // Observer → ตั้ง active tab
  useEffect(() => {
    if (sections.length === 0) return;
    const ob = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) {
          const id = (vis[0].target as HTMLDivElement).dataset.sectionId!;
          setActive(id);
          const btn = tabsRef.current?.querySelector<HTMLButtonElement>(
            `button[data-tab-id="${id}"]`
          );
          btn?.scrollIntoView({
            inline: "center",
            block: "nearest",
            behavior: "smooth",
          });
        }
      },
      {
        rootMargin: `-${(tabsRef.current?.offsetHeight ?? 0) + 12}px 0px -60% 0px`,
        threshold: [0.01, 0.25, 0.5],
      }
    );
    Object.values(sectionRefs).forEach((r) => r.current && ob.observe(r.current!));
    return () => ob.disconnect();
  }, [sectionRefs, sections]);

  return (
    <>
      {/* Header แสดงข้อมูลร้าน + ดาว (ภายใน ImageRest จะลิงก์ไปหน้ารีวิว) */}
      {restaurant && (
        <Header
          name={restaurant.name}
          cover={restaurant.logo}
          rating={ratingToShow ?? undefined}     // ส่งเฉพาะเมื่อเป็น number แล้ว
          restaurantId={hasRestId ? restId : undefined}
        />
      )}

      <div className="menu-layout">
        <div className="menu-left">
          {/* Tabs */}
          <div className="category-tabs__holder" ref={tabsRef}>
            <div className="category-tabs">
              {sections.map((s) => (
                <button
                  key={s.id}
                  data-tab-id={s.id}
                  className={`category-tab ${active === s.id ? "is-active" : ""}`}
                  onClick={() => {
                    setActive(s.id);
                    const el = sectionRefs[s.id]?.current;
                    if (!el) return;
                    const stickyH = (tabsRef.current?.offsetHeight ?? 0) + 8;
                    const top =
                      window.scrollY + el.getBoundingClientRect().top - stickyH;
                    window.scrollTo({ top, behavior: "smooth" });
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sections */}
          {sections.map((sec) => (
            <section
              key={sec.id}
              ref={sectionRefs[sec.id]}
              data-section-id={sec.id}
              className="menu-section"
            >
              <h2 className="section-title">{sec.label}</h2>
              <div className="menu-grid">
                {loading ? (
                  <p className="empty">กำลังโหลดเมนู…</p>
                ) : itemsBySection[sec.id]?.length ? (
                  itemsBySection[sec.id].map((item) => (
                    <MenuItemCard
                      key={item.id}
                      name={item.name}
                      price={fmtTHB(item.price)}
                      image={item.image || ""}
                      onAdd={() => handleAdd(item)}
                    />
                  ))
                ) : (
                  <p className="empty">ยังไม่มีเมนูในหมวดนี้</p>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Floating cart */}
      {count > 0 && (
        <button className="floating-cart" onClick={goCart}>
          <span className="floating-cart__left">ตะกร้า • {count} รายการ</span>
          <span className="floating-cart__right">{fmtTHB(subtotal)}</span>
        </button>
      )}
    </>
  );
}
