import { useMemo, useRef, useState, useEffect } from "react";
import { useMenu } from "../hooks/useMenu";
import { formatPrice } from "../utils/money";
import { useCart } from "../state/CartContext";

export default function ShopMenuPage() {
  const { sections, items, loading, error } = useMenu();
  const { addItem } = useCart();
  const [active, setActive] = useState<string>("");
  const refs = useRef<Record<string, HTMLDivElement|null>>({});

  useEffect(() => { if (!active && sections.length) setActive(sections[0].id); }, [sections, active]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof items> = {};
    sections.forEach(s => (map[s.id] = []));
    items.forEach(it => (map[it.sectionId] ??= []).push(it));
    return map;
  }, [sections, items]);

  if (loading) return <div>กำลังโหลดเมนู…</div>;
  if (error)   return <div>โหลดเมนูล้มเหลว: {error}</div>;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: 16 }}>
      {/* tabs */}
      <div style={{ position:"sticky", top:0, background:"#fff", zIndex:10, paddingBottom:8, display:"flex", gap:8, overflowX:"auto" }}>
        {sections.map(s => (
          <button key={s.id}
            onClick={() => { setActive(s.id); refs.current[s.id]?.scrollIntoView({ behavior:"smooth" }); }}
            style={{
              padding:"8px 12px", borderRadius:999, border:"1px solid #ddd",
              background: active===s.id ? "#111" : "#fff", color: active===s.id ? "#fff" : "#111"
            }}>
            {s.name}
          </button>
        ))}
      </div>

      {/* items */}
      {sections.map(s => (
        <div 
            key={s.id} 
            ref={(el) => {refs.current[s.id] = el}} 
            style={{ marginTop: 24 }}>
          <h3>{s.name}</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
            {grouped[s.id]?.map(it => (
              <div key={it.id} style={{ border:"1px solid #eee", borderRadius:12, padding:12 }}>
                {it.imageUrl && <img src={it.imageUrl} alt={it.name} style={{ width:"100%", height:140, objectFit:"cover", borderRadius:8 }} />}
                <div style={{ fontWeight:700, marginTop:8 }}>{it.name}</div>
                <div style={{ color:"#777" }}>{formatPrice(it.basePrice)}</div>
                <button
                  style={{ marginTop:8 }}
                  onClick={() => {
                    // TODO: แทนที่ด้วย Modal เลือกออปชัน (ถ้ามี)
                    const quantity = 1;
                    const selected: Record<string,string[]> = {};
                    const total = it.basePrice * quantity; // preview เท่านั้น
                    addItem({ item: it, quantity, selected, total });
                  }}
                >
                  เพิ่ม
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
