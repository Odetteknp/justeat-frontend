import { useNavigate } from "react-router-dom";
import { useCart } from "../state/CartContext";
import { formatPrice } from "../utils/money";

export default function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 960, margin: "16px auto", padding: "0 16px" }}>
      <h2 style={{ marginBottom: 12 }}>ยืนยันคำสั่งซื้อ</h2>

      {cart.items.length === 0 ? (
        <>
          <p style={{ color:"#777" }}>ยังไม่มีสินค้าในตะกร้า</p>
          <button onClick={() => navigate("/menu")}>กลับไปเลือกเมนู</button>
        </>
      ) : (
        <>
          <ul style={{ listStyle:"none", padding:0 }}>
            {cart.items.map(line => (
              <li key={line.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #eee" }}>
                <div>
                  <div style={{ fontWeight:700 }}>{line.item.name} × {line.quantity}</div>
                  {line.note && <div style={{ color:"#999", fontSize:12 }}>หมายเหตุ: {line.note}</div>}
                </div>
                <div>{formatPrice(line.total)}</div>
                <button onClick={() => cart.removeItem(line.id)} style={{ marginLeft: 8 }}>ลบ</button>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 14, display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={() => navigate("/menu")}>เพิ่มเมนูต่อ</button>
            <button onClick={() => cart.clear()} style={{ background:"#ef4444", color:"#fff", border:0, padding:"8px 12px", borderRadius:8 }}>
              ล้างตะกร้า
            </button>
            <div style={{ marginLeft:"auto", fontWeight:700 }}>
              รวมทั้งสิ้น: {formatPrice(cart.totalAmount)}
            </div>
            <button style={{ background:"#111", color:"#fff", border:0, padding:"10px 14px", borderRadius:10 }}>
              ดำเนินการชำระเงิน
            </button>
          </div>
        </>
      )}
    </div>
  );
}
