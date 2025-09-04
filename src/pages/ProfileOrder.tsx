import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./RestaurantReview.css";

// ===== Types =====
type OrderStatusCode =
  | "PENDING"
  | "CONFIRMED"
  | "COOKING"
  | "ON_THE_WAY"
  | "DELIVERED"
  | "CANCELLED";

interface OrderHistoryResponse {
  id: number;
  restaurant: string;
  restaurantId: number;
  date: string; // ISO
  status: string;
  statusCode: OrderStatusCode;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

interface OrderItemLite {
  id: number;
  name: string;
  quantity: number;
  price: number;
}
interface PaymentLite {
  id: number;
  method: string;
  amount: number;
  paidAt: string;
}
interface ReviewLite {
  id: number;
  rating: number;
  comment?: string;
}

// ===== Mock list =====
const mockOrders: OrderHistoryResponse[] = [
  {
    id: 5001,
    restaurant: "ก๋วยเตี๋ยวเรืออยุธยา",
    restaurantId: 21,
    date: "2025-09-01T12:30:00+07:00",
    status: "Delivered",
    statusCode: "DELIVERED",
    subtotal: 180,
    discount: 20,
    deliveryFee: 25,
    total: 185,
  },
  {
    id: 5002,
    restaurant: "พิซซ่าโฮม",
    restaurantId: 17,
    date: "2025-09-03T18:10:00+07:00",
    status: "On the way",
    statusCode: "ON_THE_WAY",
    subtotal: 399,
    discount: 0,
    deliveryFee: 30,
    total: 429,
  },
  {
    id: 5003,
    restaurant: "ข้าวมันไก่ประตูน้ำ",
    restaurantId: 9,
    date: "2025-09-03T11:50:00+07:00",
    status: "Pending",
    statusCode: "PENDING",
    subtotal: 80,
    discount: 0,
    deliveryFee: 20,
    total: 100,
  },
];

// ===== Mock details =====
const mockDetails: Record<
  number,
  { items: OrderItemLite[]; payments: PaymentLite[]; reviews: ReviewLite[] }
> = {
  5001: {
    items: [
      { id: 1, name: "ก๋วยเตี๋ยวเรือหมู", quantity: 2, price: 40 },
      { id: 2, name: "กากหมูเจียว", quantity: 1, price: 30 },
    ],
    payments: [
      {
        id: 11,
        method: "PromptPay",
        amount: 185,
        paidAt: "2025-09-01T12:35:00+07:00",
      },
    ],
    reviews: [{ id: 21, rating: 5, comment: "อร่อย ส่งไว" }],
  },
  5002: {
    items: [{ id: 3, name: "พิซซ่าหน้าแกงเขียวหวาน", quantity: 1, price: 399 }],
    payments: [],
    reviews: [],
  },
  5003: {
    items: [{ id: 4, name: "ข้าวมันไก่", quantity: 1, price: 80 }],
    payments: [],
    reviews: [],
  },
};

// ===== Utils =====
const fmtTHB = (n: number) =>
  n.toLocaleString("th-TH", { style: "currency", currency: "THB" });
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });

const StatusBadge: React.FC<{ code: OrderStatusCode }> = ({ code }) => {
  const map: Record<
    OrderStatusCode,
    { text: string; bg: string; color: string }
  > = {
    PENDING: { text: "Pending", bg: "#fff7ed", color: "#9a3412" },
    CONFIRMED: { text: "Confirmed", bg: "#eff6ff", color: "#1d4ed8" },
    COOKING: { text: "Cooking", bg: "#f0fdf4", color: "#15803d" },
    ON_THE_WAY: { text: "On the way", bg: "#ecfeff", color: "#0e7490" },
    DELIVERED: { text: "Delivered", bg: "#f5f3ff", color: "#6d28d9" },
    CANCELLED: { text: "Cancelled", bg: "#fef2f2", color: "#b91c1c" },
  };
  const s = map[code];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "0.125rem 0.5rem",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {s.text}
    </span>
  );
};

// ===== Component =====
const ProfileOrderPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<OrderStatusCode | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [openId, setOpenId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return mockOrders
      .filter((o) => (active === "ALL" ? true : o.statusCode === active))
      .filter((o) =>
        lower
          ? o.restaurant.toLowerCase().includes(lower) ||
            String(o.id).includes(lower)
          : true
      )
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [search, active]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container" style={{ padding: "2rem" }}>
      <h1>ประวัติคำสั่งซื้อ</h1>

      <div style={{ marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="ค้นหาตามชื่อร้าน / หมายเลขออเดอร์"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
          }}
        />
      </div>

      <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "ทั้งหมด", code: "ALL" as const },
          { label: "รอดำเนินการ", code: "PENDING" as const },
          { label: "กำลังไป", code: "ON_THE_WAY" as const },
          { label: "สำเร็จ", code: "DELIVERED" as const },
          { label: "ยกเลิก", code: "CANCELLED" as const },
        ].map((t) => (
          <button
            key={t.code}
            onClick={() => {
              setActive(t.code as any);
              setPage(1);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border:
                active === t.code ? "1px solid #111827" : "1px solid #e5e7eb",
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
              onClick={() => setOpenId(o.id)}
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
        {pageData.length === 0 && (
          <li style={{ textAlign: "center", color: "#6b7280", padding: 24 }}>
            ไม่พบคำสั่งซื้อ
          </li>
        )}
      </ul>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }}
        >
          ก่อนหน้า
        </button>
        <span style={{ alignSelf: "center" }}>
          หน้า {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }}
        >
          ถัดไป
        </button>
      </div>

      {openId && (
        <div
          onClick={() => setOpenId(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 12, width: 640, maxWidth: "100%", padding: 16 }}
          >
            <Detail orderId={openId} onClose={() => setOpenId(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

const Detail: React.FC<{ orderId: number; onClose: () => void }> = ({
  orderId,
  onClose,
}) => {
  const navigate = useNavigate(); // ✅ ใช้ navigate ในโมดอล
  const order = mockOrders.find((o) => o.id === orderId)!;
  const details = mockDetails[orderId];

  const goWriteReview = () => {
    navigate(`/review`, {
    //navigate(`/review/restaurant/${order.restaurantId}`, {
      state: {
        orderId: order.id,
        restaurantId: order.restaurantId,
        restaurantName: order.restaurant,
      },
    });
  };

  const canReview = order.statusCode === "DELIVERED"; // ✅ อนุญาตเฉพาะส่งสำเร็จ

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>รายละเอียดออเดอร์ #{orderId}</h2>
        <button onClick={onClose} style={{ background: "transparent", border: 0, cursor: "pointer", fontSize: 18 }}>
          ✕
        </button>
      </div>

      <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
        <div>ร้าน: <strong>{order.restaurant}</strong></div>
        <div>วันที่: {fmtDateTime(order.date)}</div>
        <div>สถานะ: <StatusBadge code={order.statusCode} /></div>
        <div>
          ยอดรวม: {fmtTHB(order.subtotal)} − ส่วนลด {fmtTHB(order.discount)} + ค่าส่ง {fmtTHB(order.deliveryFee)} = <strong>{fmtTHB(order.total)}</strong>
        </div>
      </div>

      <h3 style={{ fontWeight: 700, marginTop: 12 }}>รายการอาหาร</h3>
      <ul style={{ paddingLeft: 18, marginTop: 6 }}>
        {details.items.map((it) => (
          <li key={it.id}>
            {it.name} × {it.quantity} — {fmtTHB(it.price * it.quantity)}
          </li>
        ))}
      </ul>

      <h3 style={{ fontWeight: 700, marginTop: 12 }}>การชำระเงิน</h3>
      {details.payments.length === 0 ? (
        <div style={{ color: "#6b7280" }}>ยังไม่พบข้อมูลการชำระเงิน</div>
      ) : (
        <ul style={{ paddingLeft: 18, marginTop: 6 }}>
          {details.payments.map((p) => (
            <li key={p.id}>
              {p.method} — {fmtTHB(p.amount)} · {fmtDateTime(p.paidAt)}
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ fontWeight: 700, marginTop: 12 }}>รีวิว</h3>
      {details.reviews.length === 0 ? (
        <div style={{ color: "#6b7280" }}>ยังไม่มีรีวิว</div>
      ) : (
        <ul style={{ paddingLeft: 18, marginTop: 6 }}>
          {details.reviews.map((r) => (
            <li key={r.id}>⭐ {r.rating}/5 {r.comment ? `— ${r.comment}` : ""}</li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          onClick={goWriteReview}
          disabled={!canReview}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #111827",
            background: canReview ? "#111827" : "#9ca3af",
            color: "#fff",
            cursor: canReview ? "pointer" : "not-allowed",
            fontWeight: 600,
          }}
          title={canReview ? "ไปเขียนรีวิวร้านนี้" : "สามารถรีวิวได้เมื่อออเดอร์สำเร็จ (Delivered)"}
        >
          เขียนรีวิวร้านนี้
        </button>
      </div>
    </div>
  );
};

export default ProfileOrderPage;
