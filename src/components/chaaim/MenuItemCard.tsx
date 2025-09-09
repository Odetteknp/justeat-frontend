// src/components/MenuItemCard.tsx
import { IoAddCircle } from "react-icons/io5";

type Props = {
  name: string;
  price: string;
  image?: string | null;
  onAdd?: () => void;
};

export default function MenuItemCard({ name, price, image, onAdd }: Props) {
  const imgSrc = image || undefined;

  return (
    <div
      className="menu-item-card"
      style={{
        position: "relative",
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 12,
      }}
    >
      {/* รูปเมนู */}
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={name}
          style={{
            width: "100%",
            height: 140,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: 140,
            borderRadius: 8,
            background: "#f3f3f3",
          }}
        />
      )}

      {/* ข้อมูลเมนู */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 700 }}>{name}</div>
        <div style={{ color: "#666" }}>{price}</div>
      </div>

      {/* ปุ่มเพิ่ม */}
      <button
        onClick={(e) => {
          if (onAdd) onAdd();
          // ทำให้ปุ่มเด้งเล็กๆ เวลา click
          e.currentTarget.animate(
            [
              { transform: "scale(1)" },
              { transform: "scale(0.9)" },
              { transform: "scale(1.1)" },
              { transform: "scale(1)" },
            ],
            { duration: 200 }
          );
        }}
        style={{
          position: "absolute",
          right: 12,
          bottom: 12,
          border: 0,
          background: "transparent",
          cursor: "pointer",
          padding: 0,
          transition: "transform 0.2s ease, filter 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.2)";
          e.currentTarget.style.filter = "drop-shadow(0 0 1px rgba(0,0,0,0.6))";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.filter = "none";
        }}
      >
        <IoAddCircle size={42} color="#111" />
      </button>
    </div>
  );
}
