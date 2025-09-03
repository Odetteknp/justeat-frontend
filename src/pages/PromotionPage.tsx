import { useState, useEffect, useMemo } from 'react';
import './PromotionPage.css';

// --- Types ---
interface Promotion {
  id: number;
  title: string;
  description: string;
  code?: string;
  expiresAt?: string; // ISO date string
  image?: string; // URL
}

// --- Mock data (แทนการดึงจาก API ในตอนนี้) ---
const ALL_PROMOS: Promotion[] = [
  {
    id: 1,
    title: "ลด 30% อาหารจานหลัก",
    description: "ใช้ได้ทุกวันจันทร์-พฤหัส สำหรับเมนูจานหลักทุกประเภท",
    code: "FOOD30",
    expiresAt: "2025-12-31",
    image: "https://i.pinimg.com/736x/4c/73/f1/4c73f1199c41c3dfb81f2c19116e3720.jpg",
  },
  {
    id: 2,
    title: "ซื้อ 1 แถม 1 เครื่องดื่ม",
    description: "เฉพาะเมนูชา/กาแฟ เย็นเท่านั้น ใช้ได้ที่สาขาที่ร่วมรายการ",
    code: "DRINKB1G1",
    expiresAt: "2025-10-15",
    image: "https://i.pinimg.com/736x/4b/54/2b/4b542b7e18bc41f306157442220467ae.jpg",
  },
  {
    id: 3,
    title: "ส่งฟรี เมื่อสั่งครบ 299฿",
    description: "เฉพาะออเดอร์เดลิเวอรีในพื้นที่ที่กำหนด",
    code: "SHIPFREE",
    expiresAt: "2025-09-30",
    image: "https://i.pinimg.com/736x/7a/de/a7/7adea7f7c6d90802127d300bc4fb59a0.jpg",
  },
  {
    id: 4,
    title: "สมาชิกใหม่รับส่วนลด 50฿",
    description: "สมัครสมาชิกวันนี้ รับส่วนลดทันทีสำหรับบิลแรก",
    code: "NEW50",
    expiresAt: "2025-12-31",
    image: "https://i.pinimg.com/736x/81/96/af/8196afc9a98cad937d15e161995754ff.jpg",
  },
];

// --- LocalStorage helpers ---
const LS_KEY = "savedPromotions";

function loadSaved(): Promotion[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Promotion[];
    if (!Array.isArray(list)) return [];
    return list;
  } catch {
    return [];
  }
}

function saveAll(list: Promotion[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

// --- Small UI helpers ---
function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

// --- Main Component ---
export default function PromotionsPage() {
  const [saved, setSaved] = useState<Promotion[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  // โหลดคูปองที่เก็บไว้ครั้งแรก
  useEffect(() => {
    setSaved(loadSaved());
  }, []);

  // sync localStorage ทุกครั้งที่ saved เปลี่ยน
  useEffect(() => {
    saveAll(saved);
  }, [saved]);

  // สร้าง set ของ id ที่ถูกเก็บไว้ เพื่อเช็คสถานะปุ่มเร็ว ๆ
  const savedIds = useMemo(() => new Set(saved.map((p) => p.id)), [saved]);

  // Actions
  const handleSave = (promo: Promotion) => {
    if (savedIds.has(promo.id)) return; // กันกดซ้ำ
    setSaved((prev) => [...prev, promo]);
  };

  const handleUnsave = (id: number) => {
    setSaved((prev) => prev.filter((p) => p.id !== id));
  };

  const copyCode = async (code?: string) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      alert(`คัดลอกโค้ด: ${code}`);
    } catch {
      // fallback
    }
  };

  return (
    <div className="promotions-page-container">
      {/* Header */}
      <header className="promotions-header">
        <div className="header-content">
          <h1 className="header-title">โปรโมชั่น</h1>
          <button
            onClick={() => setShowSaved(true)}
            className="saved-button"
            title="ดูที่เก็บไว้"
          >
            ดูที่เก็บไว้ ({saved.length})
          </button>
        </div>
      </header>

      {/* Grid of promotions */}
      <main className="promotions-grid">
        {ALL_PROMOS.map((p) => (
          <article
            key={p.id}
            className="promo-card"
          >
            {p.image && (
              <div className="promo-image-container">
                <img
                  src={p.image}
                  alt={p.title}
                  className="promo-image"
                  loading="lazy"
                />
              </div>
            )}
            <div className="promo-details">
              <div className="promo-title-and-description">
                <div>
                  <h2 className="promo-title">{p.title}</h2>
                  <p className="promo-description">{p.description}</p>
                </div>
              </div>
              
              <div className="promo-info-row">
                <div className="promo-expiry">
                  {p.expiresAt ? `หมดเขต ${formatDate(p.expiresAt)}` : ""}
                </div>
                <button
                  onClick={() => copyCode(p.code)}
                  className="promo-code-button"
                  disabled={!p.code}
                  title="คัดลอกโค้ด"
                >
                  {p.code ? p.code : "ไม่มีโค้ด"}
                </button>
              </div>
              <div className="promo-action-area">
                {savedIds.has(p.id) ? (
                  <button
                    onClick={() => handleUnsave(p.id)}
                    className="save-button saved"
                    title="นำออกจากที่เก็บ"
                  >
                    ✓ เก็บแล้ว – นำออก
                  </button>
                ) : (
                  <button
                    onClick={() => handleSave(p)}
                    className="save-button"
                    title="เก็บโปรนี้"
                  >
                    + เก็บโปรนี้
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </main>

      {/* Saved Drawer / Modal */}
      {showSaved && (
        <div className="saved-modal-backdrop" aria-modal role="dialog">
          {/* backdrop */}
          <div
            className="saved-modal-overlay"
            onClick={() => setShowSaved(false)}
          />

          {/* panel */}
          <div className="saved-modal-panel">
            <div className="saved-modal-header">
              <h3 className="saved-modal-title">ที่เก็บไว้ ({saved.length})</h3>
              <button
                onClick={() => setShowSaved(false)}
                className="saved-modal-close-button"
              >
                ปิด
              </button>
            </div>

            {saved.length === 0 ? (
              <div className="saved-empty-message">
                ยังไม่มีรายการที่เก็บไว้ ลองกด "+ เก็บโปรนี้" จากหน้าหลัก
              </div>
            ) : (
              <ul className="saved-list">
                {saved.map((p) => (
                  <li key={p.id} className="saved-list-item">
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="saved-promo-image"
                      />
                    )}
                    <div className="saved-promo-details">
                      <div className="saved-promo-title">{p.title}</div>
                      <div className="saved-promo-description">
                        {p.description}
                      </div>
                      <div className="saved-promo-expiry">
                        {p.expiresAt ? `หมดเขต ${formatDate(p.expiresAt)}` : ""}
                      </div>
                    </div>
                    <div className="saved-promo-actions">
                      <button
                        onClick={() => copyCode(p.code)}
                        className="saved-promo-code"
                        disabled={!p.code}
                        title="คัดลอกโค้ด"
                      >
                        {p.code ? p.code : "ไม่มีโค้ด"}
                      </button>
                      <button
                        onClick={() => handleUnsave(p.id)}
                        className="saved-promo-remove-button"
                      >
                        ลบออก
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {saved.length > 0 && (
              <div className="saved-modal-footer">
                <button
                  onClick={() => {
                    if (confirm("ลบทั้งหมดจากที่เก็บไว้?")) setSaved([]);
                  }}
                  className="saved-clear-all-button"
                >
                  ลบทั้งหมด
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="promotions-footer">
        
      </footer>
    </div>
  );
}