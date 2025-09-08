// src/pages/ProfileOrderPage.tsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import "./RestaurantReview.css";

// ===== Types =====
type OrderStatusCode = "Pending" | "Delivering" | "Completed" | "Cancelled";

interface BEOrderSummary {
  id: number;
  restaurantId: number;
  total: number;
  orderStatusId: number;
  createdAt: string; // from BE
}
interface OrderHistoryResponse {
  id: number;
  restaurant: string;
  restaurantId: number;
  date: string; // ISO
  statusCode: OrderStatusCode;
  total: number;
}

interface BEOrderDetail {
  id: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  orderStatusId: number;
  restaurantId: number;
  items: Array<{ id: number; qty: number; unitPrice: number; total: number; menuId: number }>;
}

// สำหรับ hydrate เมนู/ร้าน
type MenuLite = { id: number; name?: string; price?: number; image?: string | null };

const fmtTHB = (n: number) =>
  n.toLocaleString("th-TH", { style: "currency", currency: "THB" });
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });

const statusMap: Record<number, OrderStatusCode> = {
  1: "Pending",
  2: "Delivering",
  3: "Completed",
  4: "Cancelled",
};

const StatusBadge: React.FC<{ code: OrderStatusCode }> = ({ code }) => {
  const map: Record<OrderStatusCode, { text: string; bg: string; color: string }> = {
    Pending: { text: "Pending", bg: "#fff7ed", color: "#9a3412" },
    Delivering: { text: "Delivering", bg: "#eff6ff", color: "#1d4ed8" },
    Completed: { text: "Completed", bg: "#f5f3ff", color: "#15803d" },
    Cancelled: { text: "Cancelled", bg: "#fef2f2", color: "#b91c1c" },
  };
  const s = map[code];
  return (
    <span style={{ background: s.bg, color: s.color, padding: "0.125rem 0.5rem", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
      {s.text}
    </span>
  );
};

// ===== helpers: cache ชื่อร้าน/เมนู =====
async function fetchRestaurantName(restaurantId: number): Promise<string | null> {
  try {
    const { data } = await api.get(`/restaurants/${restaurantId}`);
    const name = data?.name ?? data?.Name ?? data?.restaurant?.name ?? null;
    return typeof name === "string" ? name : null;
  } catch {
    // fallback รูปแบบอื่น
    try {
      const { data } = await api.get(`/restaurants`, { params: { id: restaurantId } });
      const row = Array.isArray(data?.items) ? data.items.find((r: any) => Number(r.id ?? r.ID) === restaurantId) : null;
      const name = row?.name ?? row?.Name ?? null;
      return typeof name === "string" ? name : null;
    } catch { return null; }
  }
}

async function fetchMenusByRestaurant(restaurantId: number): Promise<Map<number, MenuLite>> {
  const map = new Map<number, MenuLite>();
  try {
    const { data } = await api.get(`/restaurants/${restaurantId}/menus`);
    const raw = data?.items ?? data?.data?.items ?? data ?? [];
    (Array.isArray(raw) ? raw : []).forEach((m: any) => {
      const id = Number(m.id ?? m.ID);
      if (!id) return;
      map.set(id, {
        id,
        name: m.name ?? m.Name,
        price: typeof m.price === "number" ? m.price : (m.Price != null ? Number(m.Price) || undefined : undefined),
        image: m.image ?? m.Image ?? null,
      });
    });
    return map;
  } catch {
    try {
      const { data } = await api.get(`/menus`, { params: { restaurantId } });
      const raw = data?.items ?? data?.data?.items ?? data ?? [];
      (Array.isArray(raw) ? raw : []).forEach((m: any) => {
        const id = Number(m.id ?? m.ID);
        if (!id) return;
        map.set(id, {
          id,
          name: m.name ?? m.Name,
          price: typeof m.price === "number" ? m.price : (m.Price != null ? Number(m.Price) || undefined : undefined),
          image: m.image ?? m.Image ?? null,
        });
      });
      return map;
    } catch {
      return map;
    }
  }
}

// ===== Component =====
const ProfileOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // /profile/orders/:id
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<OrderStatusCode | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [orders, setOrders] = useState<OrderHistoryResponse[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errList, setErrList] = useState<string | null>(null);

  const [openId, setOpenId] = useState<number | null>(null);

  // caches
  const restaurantNameCache = useRef<Map<number, string>>(new Map());
  const menuCacheRef = useRef<Map<number, Map<number, MenuLite>>>(new Map());

  // โหลดลิสต์ออเดอร์
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      setErrList(null);
      try {
        const { data } = await api.get(`/profile/orders`, { params: { limit: 100 } });
        const beItems: BEOrderSummary[] = data?.items ?? [];
        // เติมชื่อร้านแบบขนาน + map สถานะ
        const results = await Promise.all(
          beItems.map(async (o) => {
            let name = restaurantNameCache.current.get(o.restaurantId) ?? null;
            if (!name) {
              name = await fetchRestaurantName(o.restaurantId);
              if (name) restaurantNameCache.current.set(o.restaurantId, name);
            }
            const code = statusMap[o.orderStatusId] ?? "Pending";
            const row: OrderHistoryResponse = {
              id: o.id,
              restaurant: name ?? `ร้าน #${o.restaurantId}`,
              restaurantId: o.restaurantId,
              date: o.createdAt,
              statusCode: code,
              total: o.total,
            };
            return row;
          })
        );
        if (!cancelled) setOrders(results);
      } catch (e: any) {
        if (!cancelled) setErrList(e?.response?.data?.error || "โหลดรายการคำสั่งซื้อไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // เปิดโมดอลอัตโนมัติถ้ามี :id ในพาธ
  useEffect(() => {
    if (id) setOpenId(Number(id));
  }, [id]);

  const closeModal = () => {
    setOpenId(null);
    navigate("/profile/orders");
  };

  const filtered = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return orders
      .filter((o) => (active === "ALL" ? true : o.statusCode === active))
      .filter((o) => (lower ? o.restaurant.toLowerCase().includes(lower) || String(o.id).includes(lower) : true))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, search, active]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container" style={{ padding: "2rem" }}>
      <h1>รายการคำสั่งซื้อ</h1>

      <div style={{ marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="ค้นหาตามชื่อร้าน / หมายเลขออเดอร์"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
      </div>

      <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "ทั้งหมด", code: "ALL" as const },
          { label: "รอดำเนินการ", code: "Pending" as const },
          { label: "กำลังไป", code: "Delivering" as const },
          { label: "สำเร็จ", code: "Completed" as const },
          { label: "ยกเลิก", code: "Cancelled" as const },
        ].map((t) => (
          <button
            key={t.code}
            onClick={() => { setActive(t.code as any); setPage(1); }}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: active === t.code ? "1px solid #111827" : "1px solid #e5e7eb",
              background: active === t.code ? "#111827" : "#fff",
              color: active === t.code ? "#fff" : "#111827",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loadingList && <div style={{ color: "#6b7280", marginBottom: 12 }}>กำลังโหลดรายการ…</div>}
      {errList && <div style={{ color: "#b91c1c", marginBottom: 12 }}>{errList}</div>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {pageData.map((o) => (
          <li
            key={o.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong>ออเดอร์ #{o.id}</strong>
                <StatusBadge code={o.statusCode} />
              </div>
              <div style={{ color: "#4b5563" }}>
                ร้าน: <strong>{o.restaurant}</strong> · วันที่: {fmtDateTime(o.date)}
              </div>
              <div style={{ fontWeight: 700 }}>{fmtTHB(o.total)}</div>
            </div>

            <button
              onClick={() => navigate(`/profile/orders/${o.id}`)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #111827",
                background: "#111827",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                height: 40,
              }}
            >
              ดูรายละเอียด
            </button>
          </li>
        ))}
        {pageData.length === 0 && !loadingList && (
          <li style={{ textAlign: "center", color: "#6b7280", padding: 24 }}>ไม่พบคำสั่งซื้อ</li>
        )}
      </ul>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }}>
          ก่อนหน้า
        </button>
        <span style={{ alignSelf: "center" }}>หน้า {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }}>
          ถัดไป
        </button>
      </div>

      {openId && (
        <DetailModal
          orderId={openId}
          onClose={closeModal}
          menuCacheRef={menuCacheRef}
        />
      )}
    </div>
  );
};

// ====== Modal (โหลดจาก BE) ======
const DetailModal: React.FC<{
  orderId: number;
  onClose: () => void;
  menuCacheRef: React.MutableRefObject<Map<number, Map<number, MenuLite>>>;
}> = ({ orderId, onClose, menuCacheRef }) => {
  const navigate = useNavigate();
  const [detail, setDetail] = useState<BEOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [menuMap, setMenuMap] = useState<Map<number, MenuLite>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        const d: BEOrderDetail = data;
        // เติมชื่อเมนู: โหลดเมนูทั้งร้านครั้งเดียวแล้ว cache
        let map = menuCacheRef.current.get(d.restaurantId);
        if (!map) {
          map = await fetchMenusByRestaurant(d.restaurantId);
          menuCacheRef.current.set(d.restaurantId, map);
        }
        if (!cancelled) {
          setDetail(d);
          setMenuMap(map);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.response?.data?.error || "โหลดรายละเอียดไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderId]);

  const goWriteReview = () => {
    if (!detail) return;
    navigate(`/review`, {
      state: { orderId: detail.id, restaurantId: detail.restaurantId },
    });
  };

  if (loading) {
    return (
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "grid", placeItems: "center", padding: 16 }}
      >
        <div onClick={(e) => e.stopPropagation()}
          style={{ background: "#fff", borderRadius: 12, width: 640, maxWidth: "100%", padding: 16 }}>
          <div style={{ color: "#6b7280" }}>กำลังโหลดรายละเอียด…</div>
        </div>
      </div>
    );
  }

  if (err || !detail) {
    return (
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "grid", placeItems: "center", padding: 16 }}
      >
        <div onClick={(e) => e.stopPropagation()}
          style={{ background: "#fff", borderRadius: 12, width: 640, maxWidth: "100%", padding: 16 }}>
          <div style={{ color: "#b91c1c" }}>{err || "ไม่พบข้อมูล"}</div>
          <div style={{ marginTop: 12, textAlign: "right" }}>
            <button onClick={onClose} className="btnPlain">ปิด</button>
          </div>
        </div>
      </div>
    );
  }

  const statusCode: OrderStatusCode = (statusMap as any)[detail.orderStatusId] ?? "Pending";

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "grid", placeItems: "center", padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 12, width: 640, maxWidth: "100%", padding: 16 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>รายละเอียดออเดอร์ #{detail.id}</h2>
          <button onClick={onClose} style={{ background: "transparent", border: 0, cursor: "pointer", fontSize: 18 }}>
            ✕
          </button>
        </div>

        <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
          <div>สถานะ: <StatusBadge code={statusCode} /></div>
          <div>
            ยอดรวม: {fmtTHB(detail.subtotal)} − ส่วนลด {fmtTHB(detail.discount)} + ค่าส่ง {fmtTHB(detail.deliveryFee)} =
            {" "}<strong>{fmtTHB(detail.total)}</strong>
          </div>
        </div>

        <h3 style={{ fontWeight: 700, marginTop: 12 }}>รายการอาหาร</h3>
        <ul style={{ paddingLeft: 18, marginTop: 6 }}>
          {detail.items.map((it) => {
            const m = menuMap.get(it.menuId);
            const name = m?.name ?? `เมนู #${it.menuId}`;
            return (
              <li key={it.id}>
                {name} × {it.qty} — {fmtTHB(it.total)}
              </li>
            );
          })}
        </ul>

        {/* การชำระเงิน (ยังไม่เปิด endpoint ฝั่ง BE) */}
        <h3 style={{ fontWeight: 700, marginTop: 12 }}>การชำระเงิน</h3>
        <div style={{ color: "#6b7280" }}>
          {detail.orderStatusId === 1 ? "รอชำระ/ชำระปลายทาง" : "—"}
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button
            onClick={goWriteReview}
            disabled={statusCode !== "Completed"}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #111827",
              background: statusCode === "Completed" ? "#111827" : "#9ca3af",
              color: "#fff",
              cursor: statusCode === "Completed" ? "pointer" : "not-allowed",
              fontWeight: 600,
            }}
            title={statusCode === "Completed" ? "ไปเขียนรีวิวร้านนี้" : "รีวิวได้เมื่อออเดอร์สำเร็จ"}
          >
            เขียนรีวิวร้านนี้
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileOrderPage;
