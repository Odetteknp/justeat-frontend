// src/components/RestaurantMenu.tsx
import React, { useEffect, useMemo, useRef, useState, createRef } from 'react';
import './RestaurantMenu.css';
import MenuItemCard from './MenuItemCard';
import MenuOptionModal from './MenuOptionModal';
import { SECTIONS, menuItems, type MenuItem } from '../../data/menuData';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../state/CartContext';

type SectionRefs = Record<string, React.RefObject<HTMLDivElement | null>>;
export default function RestaurantMenu() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  const tabsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const cart = useCart();

  const sectionRefs = useMemo<SectionRefs>(() => {
    return SECTIONS.reduce<SectionRefs>((acc, s) => {
      acc[s.id] = createRef<HTMLDivElement>();
      return acc;
    }, {} as SectionRefs);
  }, []);

  const itemsBySection = useMemo(() => {
    const map: Record<string, MenuItem[]> = {};
    for (const s of SECTIONS) map[s.id] = [];
    for (const m of menuItems) (map[m.sectionId] ??= []).push(m);
    return map;
  }, []);

  // ==== Modal ====
  const [open, setOpen] = useState(false);
  const [choosing, setChoosing] = useState<MenuItem | null>(null);

  const openOptions = (item: MenuItem) => { setChoosing(item); setOpen(true); };
  const closeOptions = () => { setOpen(false); setChoosing(null); };
  const handleConfirm = (payload: { item: MenuItem; quantity: number; selected: Record<string,string[]>; note?: string; total: number; }) => {
    cart.addItem(payload);
    closeOptions();
  };

  const goCart = () => navigate('/cart');

  // ==== Scroll & Active tab ====
  const scrollToSection = (id: string) => {
    const el = sectionRefs[id]?.current;
    if (!el) return;
    const stickyH = (tabsRef.current?.offsetHeight ?? 0) + 8;
    const top = window.scrollY + el.getBoundingClientRect().top - stickyH;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  useEffect(() => {
    const ob = new IntersectionObserver((entries) => {
      const vis = entries.filter(e => e.isIntersecting)
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
  }, [sectionRefs]);

  return (
    <>
      {/* Tabs */}
      <div className="category-tabs__holder" ref={tabsRef}>
        <div className="category-tabs">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              data-tab-id={s.id}
              className={`category-tab ${active === s.id ? 'is-active' : ''}`}
              onClick={() => scrollToSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map((sec) => (
        <section
          key={sec.id}
          ref={sectionRefs[sec.id]}
          data-section-id={sec.id}
          className="menu-section"
        >
          <h2 className="section-title">{sec.label}</h2>
          <div className="menu-grid">
            {itemsBySection[sec.id]?.length ? (
              itemsBySection[sec.id].map((item, index) => (
                <MenuItemCard
                  key={`${sec.id}-${index}`}
                  name={item.name}
                  price={item.price}
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

      {/* Modal เลือก Option + หมายเหตุ */}
      <MenuOptionModal
        open={open}
        item={choosing}
        onClose={closeOptions}
        onConfirm={handleConfirm}
      />

      {/* ปุ่มตะกร้าลอย */}
      <button
        onClick={goCart}
        style={{
          position:'fixed', right:600, bottom:20, padding:'12px 60px', borderRadius:999,
          background:'#EF664B', color:'#fff', border:0, fontWeight:700, display:'flex', alignItems:'center', gap:8, zIndex:1500
        }}
      >
        ตะกร้า
        <span style={{ background:'#fff', color:'#111', borderRadius:999, padding: '2px 8px', fontWeight:700 }}>
          {cart.count}
        </span>
      </button>
    </>
  );
}
