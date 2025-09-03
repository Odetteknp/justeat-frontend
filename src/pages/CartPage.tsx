// src/pages/CartPage.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../state/CartContext';
import './CartPage.css';

// ฟอร์แมตราคาเป็น THB (ไม่ปัดทศนิยม)
const fmtTHB = (n: number) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(n);

// ประเภทช่องทางชำระเงิน
type PaymentMethod = 'promptpay' | 'credit' | 'cod';

export default function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();

  // ---------- Promo code ----------
  const [promoCode, setPromoCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  // ---------- Address ----------
  const [addressId, setAddressId] = useState<string>('addr1');
  const [newAddress, setNewAddress] = useState('');

  // ---------- Payment ----------
  const [payment, setPayment] = useState<PaymentMethod | null>(null);

  // ---------- Pricing ----------
  const subtotal = cart.totalAmount; // ยอดรวมจากตะกร้า
  const baseDelivery = 15; // ค่าส่งตั้งต้น

  // คำนวนส่วนลด/ค่าส่ง/ยอดสุทธิด้วย useMemo เพื่อกัน re-render ที่ไม่จำเป็น
  const { discount, deliveryFee, total } = useMemo(() => {
    let discountVal = 0;
    let delivery = baseDelivery;

    if (appliedCode) {
      const code = appliedCode.trim().toUpperCase();
      if (code === 'SAVE10') {
        discountVal = Math.round(subtotal * 0.1);
      } else if (code === 'SAVE50') {
        discountVal = 50;
      } else if (code === 'SHIPFREE') {
        delivery = 0;
      }
    }
    if (discountVal > subtotal) discountVal = subtotal; // ป้องกันติดลบ
    const t = subtotal - discountVal + delivery;
    return { discount: discountVal, deliveryFee: delivery, total: t };
  }, [appliedCode, subtotal]);

  // ---------- Promo code handlers ----------
  const applyCode = () => {
    const c = promoCode.trim();
    if (!c) return;
    setAppliedCode(c);
  };
  const clearCode = () => {
    setAppliedCode(null);
    setPromoCode('');
  };

  // ---------- Helpers ----------
  // มีที่อยู่พร้อมใช้งานหรือไม่ (ถ้าเลือก "เพิ่มที่อยู่ใหม่" ต้องยาวพอประมาณ)
  const hasAddress =
    (addressId && addressId !== 'new') ||
    (addressId === 'new' && newAddress.trim().length > 8);

  // ปุ่ม Checkout จะกดได้เมื่อ: มีสินค้า + มีที่อยู่ + เลือกชำระเงินแล้ว
  const canCheckout = cart.items.length > 0 && hasAddress && !!payment;

  const onCheckout = () => {
    if (!canCheckout) return;
    // ที่นี่สามารถต่อกับ payment gateway / API จริงได้
    alert('สั่งซื้อสำเร็จ ขอบคุณค่ะ 🧡');
    cart.clear();
    navigate('/');
  };

  return (
    <div className="container">
      <h2 className="pageTitle">ยืนยันคำสั่งซื้อ</h2>

      {cart.items.length === 0 ? (
        <>
          <p className="emptyText">ยังไม่มีสินค้าในตะกร้า</p>
          <button onClick={() => navigate('/')} className="btnPlain">
            กลับไปเลือกเมนู
          </button>
        </>
      ) : (
        <div className="grid">
          {/* LEFT: รายการอาหารในตะกร้า */}
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
            const opt = line.item.options?.find(o => o.id === optId);
            const names = choiceIds
              .map(cid => opt?.choices.find(c => c.id === cid)?.name ?? cid);
            return (
              <span key={optId} className="itemMetaChip">
                {idx ? ' | ' : ''}
                {names.join(', ')}
              </span>
            );
          })}
          {line.note ? ` • ${line.note}` : null}
        </div>
      </div>
      <div className="qty">× {line.quantity}</div>
      <div className="lineTotal">{fmtTHB(line.total)}</div>
      <button
        onClick={() => cart.removeItem(line.id)}
        className="btnPlain"
      >
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

          {/* RIGHT: สรุปราคา + คูปอง + ที่อยู่ + ชำระเงิน */}
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

            {/* โค้ดโปรโมชั่น */}
            <div className="card">
              <strong className="blockTitle">โค้ดโปรโมชั่น</strong>
              <div className="inlineFields">
                <input
                  value={appliedCode ? appliedCode : promoCode}
                  onChange={(e) =>
                    appliedCode
                      ? setAppliedCode(e.target.value)
                      : setPromoCode(e.target.value)
                  }
                  placeholder="เช่น SAVE10 / SAVE50 / SHIPFREE"
                  className="input"
                  aria-label="ระบุโค้ดโปรโมชั่น"
                />
                {appliedCode ? (
                  <button onClick={clearCode} className="btnPlain">
                    ยกเลิก
                  </button>
                ) : (
                  <button onClick={applyCode} className="btnPrimary">
                    ใช้โค้ด
                  </button>
                )}
              </div>
              <div className="helpText">
                ตัวอย่าง: <code>SAVE10</code> ลด 10% • <code>SAVE50</code> ลด 50฿ •{' '}
                <code>SHIPFREE</code> ส่งฟรี
              </div>
            </div>

            {/* ที่อยู่จัดส่ง */}
            <div className="card">
              <strong className="blockTitle">ที่อยู่จัดส่ง</strong>
              <div className="vStack">
                <label className="radioRow">
                  <input
                    type="radio"
                    name="addr"
                    checked={addressId === 'addr1'}
                    onChange={() => setAddressId('addr1')}
                  />
                  <span>บ้าน: 99/99 ถ.สุขสบาย แขวงสดใส เขตอิ่มใจ กทม. 10110</span>
                </label>
                <label className="radioRow">
                  <input
                    type="radio"
                    name="addr"
                    checked={addressId === 'addr2'}
                    onChange={() => setAddressId('addr2')}
                  />
                  <span>ที่ทำงาน: 123 อาคาร ABC ชั้น 12 ถ.พหลโยธิน จตุจักร กทม. 10900</span>
                </label>
                <label className="radioRow">
                  <input
                    type="radio"
                    name="addr"
                    checked={addressId === 'new'}
                    onChange={() => setAddressId('new')}
                  />
                  <span>เพิ่มที่อยู่ใหม่</span>
                </label>
                {addressId === 'new' && (
                  <textarea
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="พิมพ์ที่อยู่จัดส่งใหม่..."
                    className={`$"input" $"textarea"`}
                    aria-label="ที่อยู่ใหม่"
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
                    checked={payment === 'promptpay'}
                    onChange={() => setPayment('promptpay')}
                  />
                  <span>พร้อมเพย์ (PromptPay)</span>
                </label>
                <label className="radioRow">
                  <input
                    type="radio"
                    name="pay"
                    checked={payment === 'credit'}
                    onChange={() => setPayment('credit')}
                  />
                  <span>บัตรเครดิต/เดบิต</span>
                </label>
                <label className="radioRow">
                  <input
                    type="radio"
                    name="pay"
                    checked={payment === 'cod'}
                    onChange={() => setPayment('cod')}
                  />
                  <span>เก็บเงินปลายทาง</span>
                </label>
              </div>
            </div>

            <button
              onClick={onCheckout}
              disabled={!canCheckout}
              className={`$"btnPrimary" $"checkoutBtn"`}
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