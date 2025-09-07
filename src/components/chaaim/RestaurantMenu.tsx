// src/components/RestaurantMenu.tsx

import React, { useEffect, useMemo, useRef, useState, createRef } from 'react';
import './RestaurantMenu.css';
import MenuItemCard from './MenuItemCard';
import MenuOptionModal from './MenuOptionModal';
import { type MenuItem } from '../../data/menuData'; // ✅ คง type ไว้ใช้ร่วมกับ Modal
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../../state/CartContext';

import Header from './ImageRest';
import { getMenusByRestaurant, type Menu as ApiMenu } from '../../services/menu';

type Section = { id: string; label: string };
type SectionRefs = Record<string, React.RefObject<HTMLDivElement | null>>;

const fmtTHB = (n: number) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n);

// รองรับ base64 หรือ URL
function toImgSrc(img?: string) {
  if (!img) return undefined;
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) return img;
  return `data:image/jpeg;base64,${img}`;
}

// แปลงจาก API -> รูปแบบ MenuItem ที่ FE ใช้
function adapt(api: ApiMenu): MenuItem {
  const sectionName = api.menuType?.typeName || String(api.menuTypeId);
  return {
    id: String(api.id),
    name: api.name,
    price: fmtTHB(api.price),             // FE ต้องการ string เช่น "฿199"
    image: toImgSrc(api.image) || '',     // ป้องกัน null
    sectionId: sectionName,               // ใช้ชื่อ type เป็น id/label
    // map options เป็นรูปแบบเดิมของ Modal (single/multi + choices)
    options: (api.options ?? []).map(op => ({
      id: String(op.id),
      label: op.name,
      // GORM: Option.Type => 'radio'|'checkbox' -> FE: 'single'|'multiple'
      type: op.type === 'radio' ? 'single' : 'multiple',
      required: !!op.isRequired,
      max: op.maxSelect ?? (op.type === 'radio' ? 1 : undefined),
      choices: (op.optionValues ?? []).map(v => ({
        id: String(v.id),
        name: v.name,
        price: Number(v.priceAdjustment || 0),
      })),
    })),
  };
}

export default function RestaurantMenu() {
  const { id } = useParams<{ id: string }>();
  const restId = Number(id);

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [itemsBySection, setItemsBySection] = useState<Record<string, MenuItem[]>>({});

  const [active, setActive] = useState<string>('');
  const tabsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const cart = useCart();

  // สร้าง refs ตามจำนวน section แบบ dynamic
  const sectionRefs = useMemo<SectionRefs>(() => {
    return sections.reduce<SectionRefs>((acc, s) => {
      acc[s.id] = createRef<HTMLDivElement>();
      return acc;
    }, {} as SectionRefs);
  }, [sections]);

  // ==== Modal ====
  const [open, setOpen] = useState(false);
  const [choosing, setChoosing] = useState<MenuItem | null>(null);

  const openOptions = (item: MenuItem) => { setChoosing(item); setOpen(true); };
  const closeOptions = () => { setOpen(false); setChoosing(null); };
  const handleConfirm = (payload: { 
    item: MenuItem; quantity: number; 
    selected: Record<string,string[]>; note?: string; total: number; 
  }) => {
    cart.addItem({ ...payload, restaurantId: restId });
    closeOptions();
  };

  const goCart = () => navigate('/cart');

  // โหลดเมนูจาก API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const menus = await getMenusByRestaurant(restId);
        if (!mounted) return;

        // แปลงทั้งหมดเป็น MenuItem (FE shape)
        const items = menus.map(adapt);

        // สร้าง sections จาก menuTypeName ที่มีจริง และเรียงตามชุดที่อยากแสดง
        const ORDER = ['เมนูหลัก', 'ของทานเล่น', 'ของหวาน', 'เครื่องดื่ม'];
        const labels = Array.from(new Set(items.map(i => i.sectionId)));
        labels.sort((a, b) => {
          const ia = ORDER.indexOf(a);
          const ib = ORDER.indexOf(b);
          if (ia === -1 && ib === -1) return a.localeCompare(b);
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        });

        const secs: Section[] = labels.map(l => ({ id: l, label: l }));
        const map: Record<string, MenuItem[]> = {};
        for (const s of secs) map[s.id] = [];
        for (const it of items) (map[it.sectionId] ??= []).push(it);

        setSections(secs);
        setItemsBySection(map);
        setActive(secs[0]?.id || '');
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [restId]);

  // ตั้ง active tab ตาม section ที่เลื่อนเข้ามา
  useEffect(() => {
    if (sections.length === 0) return;
    const ob = new IntersectionObserver((entries) => {
      const vis = entries
        .filter(e => e.isIntersecting)
        .sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      if (vis[0]) {
        const id = (vis[0].target as HTMLDivElement).dataset.sectionId!;
        setActive(id);
        const btn = tabsRef.current?.querySelector<HTMLButtonElement>(`button[data-tab-id="${id}"]`);
        btn?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      }
    }, {
      rootMargin: `-${(tabsRef.current?.offsetHeight ?? 0) + 12}px 0px -60% 0px`,
      threshold: [0.01, 0.25, 0.5],
    });
    Object.values(sectionRefs).forEach(r => r.current && ob.observe(r.current));
    return () => ob.disconnect();
  }, [sectionRefs, sections]);

  return (
    <>
      <Header/>
      <div className="menu-layout">
        {/* LEFT: เมนู + แท็บ */}
        <div className="menu-left">
          {/* Tabs */}
          <div className="category-tabs__holder" ref={tabsRef}>
            <div className="category-tabs">
              {sections.map((s) => (
                <button
                  key={s.id}
                  data-tab-id={s.id}
                  className={`category-tab ${active === s.id ? 'is-active' : ''}`}
                  onClick={() => {
                    const el = sectionRefs[s.id]?.current;
                    if (!el) return;
                    const stickyH = (tabsRef.current?.offsetHeight ?? 0) + 8;
                    const top = window.scrollY + el.getBoundingClientRect().top - stickyH;
                    window.scrollTo({ top, behavior: 'smooth' });
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
                  itemsBySection[sec.id].map((item, index) => (
                    <MenuItemCard
                      key={`${sec.id}-${index}`}
                      name={item.name}
                      price={item.price}   // string ที่ format แล้ว
                      image={item.image}
                      onAdd={() => openOptions(item)}
                    />
                  ))
                ) : (
                  <p className="empty">ยังไม่มีเมนูในหมวดนี้</p>
                )}
              </div>
            </section>
          ))}
        </div>

        <MenuOptionModal
          open={open}
          item={choosing}
          onClose={closeOptions}
          onConfirm={handleConfirm}
        />

        {/* Floating cart */}
        {cart.count > 0 && (
          <button className="floating-cart" onClick={goCart}>
            <span className="floating-cart__left">
              ตะกร้า • {cart.count} รายการ
            </span>
            <span className="floating-cart__right">
              {fmtTHB(cart.totalAmount)}
            </span>
          </button>
        )}
      </div>
    </>
  );
}
