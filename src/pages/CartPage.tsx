// src/pages/CartPage.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartServer } from "../hooks/useCartServer";
import { getProfile, updateProfile } from "../services/user"; // ⬅️ ปรับ path หากต่างจากนี้
import type { UserProfile } from "../types";                  // ⬅️ ปรับ path หากต่างจากนี้
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

  // ---------- Address (ใช้จากโปรไฟล์ + เพิ่มใหม่ได้) ----------
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addrChoice, setAddrChoice] = useState<"saved" | "new">("saved");
  const [newAddress, setNewAddress] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await getProfile();
        if (cancelled) return;
        setProfile(u);
        const hasSaved = !!u.address && u.address.trim().length >= 8;
        setAddrChoice(hasSaved ? "saved" : "new");
      } catch {
        if (cancelled) return;
        setProfile(null);
        setAddrChoice("new");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const selectedAddress =
    addrChoice === "saved"
      ? (profile?.address?.trim() ?? "")
      : newAddress.trim();

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
  const hasAddress = selectedAddress.length >= 8;
  const canCheckout = (cart?.items?.length ?? 0) > 0 && hasAddress && !!payment;

  const onCheckout = async () => {
    if (!canCheckout) return;
    try {
      // ถ้าเพิ่มใหม่และติ๊กบันทึกเป็นโปรไฟล์ → อัปเดตโปรไฟล์ก่อน
      if (addrChoice === "new" && saveAsDefault) {
        await updateProfile({ address: selectedAddress });
        const u = await getProfile();
        setProfile(u);
      }
      // ส่ง snapshot address + paymentMethod ไปที่ BE
      const res = await checkout({ address: selectedAddress, paymentMethod: payment! });
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
                    {line.menu?.image ? (
                      <img src={line.menu.image} alt={line.menu?.name || `เมนู #${line.menuId}`} className="itemImage" />
                    ) : (
                      <div className="itemImage" style={{ background: "#f3f3f3" }} />
                    )}

                    <div className="lineBody">
                      <div className="itemName">{line.menu?.name ?? `เมนู #${line.menuId}`}</div>
                      <div className="itemMeta">
                        {line.selections?.length ? <span className="itemMetaChip">ตัวเลือก {line.selections.length} รายการ</span> : null}
                        {line.note ? ` • ${line.note}` : null}
                      </div>
                    </div>

                    <div className="qty">
                      × {line.qty}
                      <button className="btnPlain" onClick={() => setQty(line.id, line.qty + 1)}>+</button>
                      <button className="btnPlain" onClick={() => setQty(line.id, line.qty - 1)}>-</button>
                    </div>

                    <div className="lineTotal">{fmtTHB(line.total)}</div>
                    <button onClick={() => remove(line.id)} className="btnPlain">
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

            {/* ที่อยู่จัดส่ง (โปรไฟล์ / เพิ่มใหม่) */}
            <div className="card">
              <strong className="blockTitle">ที่อยู่จัดส่ง</strong>
              <div className="vStack">
                <label className="radioRow">
                  <input
                    type="radio"
                    name="addr"
                    checked={addrChoice === "saved"}
                    onChange={() => setAddrChoice("saved")}
                    disabled={!profile?.address || profile.address.trim().length < 8}
                  />
                  <span>
                    ใช้ที่อยู่ในโปรไฟล์
                    {!profile?.address || profile.address.trim().length < 8
                      ? " (ยังไม่ได้ตั้งค่า)"
                      : `: ${profile.address}`}
                  </span>
                </label>

                <label className="radioRow">
                  <input
                    type="radio"
                    name="addr"
                    checked={addrChoice === "new"}
                    onChange={() => setAddrChoice("new")}
                  />
                  <span>เพิ่มที่อยู่ใหม่</span>
                </label>

                {addrChoice === "new" && (
                  <div className="vStack" style={{ gap: 8 }}>
                    <textarea
                      className="input textarea"
                      placeholder="พิมพ์ที่อยู่จัดส่งใหม่..."
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                    />
                    <label className="checkboxRow">
                      <input
                        type="checkbox"
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                      />
                      <span>บันทึกเป็นที่อยู่โปรไฟล์</span>
                    </label>
                  </div>
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
