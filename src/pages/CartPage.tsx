import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../state/CartContext";
import { createOrder } from "../services/order"; // ✅ เพิ่ม import
import "./CartPage.css";

// --- Promotion type ---
interface Promotion {
  id: number;
  title: string;
  description: string;
  code?: string;
  expiresAt?: string;
  image?: string;
}

// ฟอร์แมตราคาเป็น THB
const fmtTHB = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(n);

type PaymentMethod = "promptpay" | "credit" | "cod";

export default function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();

  // ---------- Promotions ----------
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [savedPromos, setSavedPromos] = useState<Promotion[]>([]);

  // โหลดโปรโมชั่นที่บันทึกไว้จาก localStorage
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
  const subtotal = cart.totalAmount;
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

  // ✅ ประกาศ canCheckout (ของเดิมหายไป)
  const canCheckout = cart.items.length > 0 && hasAddress && !!payment;

  // ✅ คง onCheckout ที่ยิง API จริง แล้วลบตัวที่ alert ธรรมดาออก
  const onCheckout = async () => {
    if (!canCheckout) return;

    try {
      // 1) แปลง cart → payload
      const items = cart.items.map((line) => {
        const selections: { optionId: number; optionValueId: number }[] = [];
        Object.entries(line.selected).forEach(([optId, valIds]) => {
          (valIds || []).forEach((v) => {
            selections.push({ optionId: Number(optId), optionValueId: Number(v) });
          });
        });
        return {
          menuId: Number(line.item.id), // ต้องมั่นใจว่า MenuItem มี id (string) มาจากหน้าเมนู
          qty: line.quantity,
          selections,
        };
      });

      const restaurantId = Number(cart.restaurantId);
      if (!restaurantId) {
        alert("ไม่พบร้านของตะกร้า (restaurantId)");
        return;
      }

      // 2) เรียก API
      const res = await createOrder({ restaurantId, items });

      // 3) แจ้งผล + เคลียร์ + ไปหน้าอื่น
      alert(`สั่งซื้อสำเร็จ เลขที่คำสั่งซื้อ #${res.id}`);
      cart.clear();
      navigate(`/orders/${res.id}`);
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.error || "สั่งซื้อไม่สำเร็จ");
    }
  };

  return (
    <div className="container">
      <h2 className="pageTitle">ยืนยันคำสั่งซื้อ</h2>

      {cart.items.length === 0 ? (
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
                <button onClick={() => cart.clear()} className="btnDanger">
                  ล้างตะกร้า
                </button>
              </div>

              <ul className="listReset">
                {cart.items.map((line) => (
                  <li key={line.id} className="cartLine">
                    <img src={line.item.image} alt={line.item.name} className="itemImage" />
                    <div className="lineBody">
                      <div className="itemName">{line.item.name}</div>
                      <div className="itemMeta">
                        {Object.entries(line.selected).map(([optId, choiceIds], idx) => {
                          if (!Array.isArray(choiceIds)) return null;
                          const opt = line.item.options?.find((o) => o.id === optId);
                          const names = choiceIds.map(
                            (cid) => opt?.choices.find((c) => c.id === cid)?.name ?? cid
                          );
                          return (
                            <span key={optId} className="itemMetaChip">
                              {idx ? " | " : ""}
                              {names.join(", ")}
                            </span>
                          );
                        })}
                        {line.note ? ` • ${line.note}` : null}
                      </div>
                    </div>
                    <div className="qty">× {line.quantity}</div>
                    <div className="lineTotal">{fmtTHB(line.total)}</div>
                    <button onClick={() => cart.removeItem(line.id)} className="btnPlain">
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
                    checked={payment === "credit"}
                    onChange={() => setPayment("credit")}
                  />
                  <span>บัตรเครดิต/เดบิต</span>
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
