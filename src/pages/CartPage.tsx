// src/pages/CartPage.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartServer } from "../hooks/useCartServer"; // ⬅️ ใช้ hook ใหม่
import "./CartPage.css";

// --- Promotion type (คงไว้ได้) ---
interface Promotion {
  id: number;
  title: string;
  description: string;
  code?: string;
  expiresAt?: string;
  image?: string;
}

const fmtTHB = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

type PaymentMethod = "promptpay" | "cod";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, subtotal, loading, setQty, remove, clear, checkout } = useCartServer();

  // ---------- Promotions ----------
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [savedPromos, setSavedPromos] = useState<Promotion[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedPromotions");
      if (raw) setSavedPromos(JSON.parse(raw));
    } catch {
      setSavedPromos([]);
    }
  }, []);

  // ---------- Address ----------
  const [addressId, setAddressId] = useState<string>("addr1");
  const [newAddress, setNewAddress] = useState("");

  // ---------- Payment ----------
  const [payment, setPayment] = useState<PaymentMethod | null>(null);

  // ---------- Pricing ----------
  const baseDelivery = 15;
  const { discount, deliveryFee, total } = useMemo(() => {
    let discountVal = 0;
    let delivery = baseDelivery;

    if (appliedPromo?.code) {
      const code = appliedPromo.code.toUpperCase();
      if (code === "SHIPFREE") delivery = 0;
      else if (code === "FOOD30") discountVal = Math.round(subtotal * 0.3);
      else if (code === "DRINKB1G1") discountVal = 40;
      else if (code === "NEW50") discountVal = 50;
    }

    if (discountVal > subtotal) discountVal = subtotal;
    const t = subtotal - discountVal + delivery;
    return { discount: discountVal, deliveryFee: delivery, total: t };
  }, [appliedPromo, subtotal]);

  // ---------- Checkout ----------
  const hasAddress =
    (addressId && addressId !== "new") ||
    (addressId === "new" && newAddress.trim().length > 8);

  const canCheckout = (cart?.items?.length ?? 0) > 0 && hasAddress && !!payment;

  const onCheckout = async () => {
    if (!canCheckout) return;
    try {
      const res = await checkout(); // POST /orders/checkout-from-cart
      alert(`สั่งซื้อสำเร็จ เลขที่คำสั่งซื้อ #${res.id}`);
      navigate(`/orders/${res.id}`);
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.error || "สั่งซื้อไม่สำเร็จ");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h2 className="pageTitle">ยืนยันคำสั่งซื้อ</h2>
        <p className="emptyText">กำลังโหลดตะกร้า…</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="pageTitle">ยืนยันคำสั่งซื้อ</h2>

      {!cart || cart.items.length === 0 ? (
        <>
          <p className="emptyText">ยังไม่มีสินค้าในตะกร้า</p>
          <button onClick={() => navigate("/")} className="btnPlain">
            กลับไปเลือกเมนู
          </button>
        </>
      ) : (
        <div className="grid">
          {/* LEFT: รายการอาหาร */}
          <div>
            <div className="card">
              <div className="cardHead">
                <strong>รายการอาหาร</strong>
                <button onClick={() => clear()} className="btnDanger">
                  ล้างตะกร้า
                </button>
              </div>

              <ul className="listReset">
                {cart.items.map((line) => (
                  <li key={line.id} className="cartLine">
                    {/* ถ้า BE ส่ง menu.image มาแล้ว ใช้ได้เลย; ถ้ายังไม่ส่ง จะไม่แสดงรูป */}
                    {line.menu?.image ? (
                      <img src={line.menu.image} alt={line.menu?.name || `เมนู #${line.menuId}`} className="itemImage" />
                    ) : (
                      <div className="itemImage" style={{ background: "#f3f3f3" }} />
                    )}

                    <div className="lineBody">
                      <div className="itemName">{line.menu?.name ?? `เมนู #${line.menuId}`}</div>
                      <div className="itemMeta">
                        {/* ตอนนี้ selections ไม่มีชื่อจาก BE → แสดง count แทน (หรือแก้ BE ส่งชื่อมา) */}
                        {line.selections?.length ? <span className="itemMetaChip">ตัวเลือก {line.selections.length} รายการ</span> : null}
                        {line.note ? ` • ${line.note}` : null}
                      </div>
                    </div>

                    <div className="qty">
                      × {line.qty}
                      {/* ถ้าชอบแบบเดิมไม่ต้องมีปุ่ม +/− ก็ลบทิ้งสองปุ่มนี้ได้ */}
                      <button className="btnPlain" onClick={() => setQty((line.id ?? (line as any).ID), line.qty + 1)}>+</button>
                      <button className="btnPlain" onClick={() => setQty((line.id ?? (line as any).ID), line.qty - 1)}>-</button>
                    </div>

                    <div className="lineTotal">{fmtTHB(line.total)}</div>
                    <button onClick={() => remove((line.id ?? (line as any).ID))} className="btnPlain">
                      ลบ
                    </button>
                  </li>
                ))}
              </ul>

              <div className="actionsRow">
                <button onClick={() => navigate(-1)} className="btnPlain">
                  เพิ่มเมนูต่อ
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: ราคา + โปร + ที่อยู่ + ชำระเงิน */}
          <div className="rightCol">
            {/* สรุปราคา */}
            <div className="card">
              <strong className="blockTitle">สรุปราคา</strong>
              <Row label="ยอดรวม" value={fmtTHB(subtotal)} />
              <Row label="ส่วนลด" value={`− ${fmtTHB(discount)}`} />
              <Row label="ค่าส่ง" value={fmtTHB(deliveryFee)} />
              <div className="hr" />
              <Row
                label={<span className="totalLabel">ยอดสุทธิ</span>}
                value={<span className="totalValue">{fmtTHB(total)}</span>}
              />
            </div>

            {/* เลือกโปรโมชั่นจากที่เก็บไว้ */}
            <div className="card">
              <strong className="blockTitle">เลือกโปรโมชั่น</strong>
              {savedPromos.length === 0 ? (
                <p className="helpText">ยังไม่มีโปรโมชั่นที่คุณเก็บไว้</p>
              ) : (
                <select
                  value={appliedPromo?.id ?? ""}
                  onChange={(e) => {
                    const selected = savedPromos.find((p) => p.id === Number(e.target.value));
                    setAppliedPromo(selected ?? null);
                  }}
                  className="input"
                >
                  <option value="">-- เลือกโปรโมชั่น --</option>
                  {savedPromos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.code})
                    </option>
                  ))}
                </select>
              )}
              {appliedPromo && (
                <div className="helpText">
                  ใช้งานแล้ว: <strong>{appliedPromo.title}</strong> • โค้ด: <code>{appliedPromo.code}</code>
                </div>
              )}
            </div>

            {/* ที่อยู่จัดส่ง */}
            <div className="card">
              <strong className="blockTitle">ที่อยู่จัดส่ง</strong>
              <div className="vStack">
                <label className="radioRow">
                  <input
                    type="radio"
                    name="addr"
                    checked={addressId === "addr1"}
                    onChange={() => setAddressId("addr1")}
                  />
                  <span>บ้าน: 99/99 ถ.สุขสบาย แขวงสดใส เขตอิ่มใจ กทม. 10110</span>
                </label>
                <label className="radioRow">
                  <input
                    type="radio"
                    name="addr"
                    checked={addressId === "addr2"}
                    onChange={() => setAddressId("addr2")}
                  />
                  <span>ที่ทำงาน: 123 อาคาร ABC ชั้น 12 ถ.พหลโยธิน จตุจักร กทม. 10900</span>
                </label>
                <label className="radioRow">
                  <input
                    type="radio"
                    name="addr"
                    checked={addressId === "new"}
                    onChange={() => setAddressId("new")}
                  />
                  <span>เพิ่มที่อยู่ใหม่</span>
                </label>
                {addressId === "new" && (
                  <textarea
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="พิมพ์ที่อยู่จัดส่งใหม่..."
                    className="input textarea"
                  />
                )}
              </div>
            </div>

            {/* ช่องทางการชำระเงิน */}
            <div className="card">
              <strong className="blockTitle">ช่องทางการชำระเงิน</strong>
              <div className="vStack">
                <label className="radioRow">
                  <input
                    type="radio"
                    name="pay"
                    checked={payment === "promptpay"}
                    onChange={() => setPayment("promptpay")}
                  />
                  <span>พร้อมเพย์ (PromptPay)</span>
                </label>

                <label className="radioRow">
                  <input
                    type="radio"
                    name="pay"
                    checked={payment === "cod"}
                    onChange={() => setPayment("cod")}
                  />
                  <span>เก็บเงินปลายทาง</span>
                </label>
              </div>
            </div>

            <button
              onClick={onCheckout}
              disabled={!canCheckout}
              className="btnPrimary checkoutBtn"
              aria-disabled={!canCheckout}
              aria-label={`ยืนยันคำสั่งซื้อ มูลค่า ${fmtTHB(total)}`}
            >
              ยืนยันคำสั่งซื้อ • {fmtTHB(total)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** แถวสรุปราคา (label / value) */
function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="row">
      <div>{label}</div>
      <div>{value}</div>
    </div>
  );
}
