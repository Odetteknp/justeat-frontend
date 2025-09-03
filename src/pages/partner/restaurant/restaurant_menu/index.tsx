import React, { useState } from "react";
import { FaCamera } from "react-icons/fa";
import "./index.css"; // import ไฟล์ CSS ที่แยกออกมา

type MenuType = "เมนูหลัก" | "ของทานเล่น" | "ของหวาน" | "เครื่องดื่ม";
type SizeType = "S" | "M" | "L";
type SpicyType = "เผ็ดน้อย" | "เผ็ดกลาง" | "เผ็ดมาก";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  type: MenuType;
  size: SizeType;
  spicy?: SpicyType | null;
  toppings: string[];
  toppingLimit: number;
  image?: string | null;
}

export default function MenuManagementUI() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [type, setType] = useState<MenuType>("เมนูหลัก");
  const [size, setSize] = useState<SizeType>("M");
  const [spicy, setSpicy] = useState<SpicyType | "">("เผ็ดน้อย");
  const [toppings, setToppings] = useState<string[]>([]);
  const [newTopping, setNewTopping] = useState("");
  const [toppingLimit, setToppingLimit] = useState<number>(1);
  const [image, setImage] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setPrice("");
    setType("เมนูหลัก");
    setSize("M");
    setSpicy("เผ็ดน้อย");
    setToppings([]);
    setNewTopping("");
    setToppingLimit(1);
    setImage(null);
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (menu: MenuItem) => {
    setEditingId(menu.id);
    setName(menu.name);
    setPrice(menu.price);
    setType(menu.type);
    setSize(menu.size);
    setSpicy(menu.spicy ?? "");
    setToppings([...menu.toppings]);
    setToppingLimit(menu.toppingLimit);
    setImage(menu.image ?? null);
    setShowForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddTopping = () => {
    if (!newTopping) return;
    if (toppings.length >= 20) return;
    setToppings((t) => [...t, newTopping]);
    setNewTopping("");
  };

  const handleRemoveTopping = (index: number) => {
    setToppings((t) => t.filter((_, i) => i !== index));
  };

  const handleUpdateTopping = (index: number, value: string) => {
    setToppings((t) => t.map((it, i) => (i === index ? value : it)));
  };

  const validateForm = () => {
    if (!name.trim()) return false;
    if (price === "" || Number.isNaN(Number(price))) return false;
    if (!["S", "M", "L"].includes(size)) return false;
    if ((type === "เมนูหลัก" || type === "ของทานเล่น") && !spicy) return false;
    if (toppings.length > toppingLimit) return false;
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน (เช่น ชื่อ, ราคา และเงื่อนไขที่จำเป็น)");
      return;
    }

    const payload: MenuItem = {
      id: editingId ?? Date.now(),
      name: name.trim(),
      price: Number(price),
      type,
      size,
      spicy: type === "เมนูหลัก" || type === "ของทานเล่น" ? (spicy as SpicyType) : undefined,
      toppings: [...toppings],
      toppingLimit,
      image,
    };

    if (editingId) {
      setMenus((m) => m.map((it) => (it.id === editingId ? payload : it)));
    } else {
      setMenus((m) => [payload, ...m]);
    }

    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: number) => {
    if (confirm("ต้องการลบเมนูนี้หรือไม่?")) setMenus((m) => m.filter((it) => it.id !== id));
  };

  return (
    <div className="menu-management-container">
      <div className="header-section">
        <h1 className="main-title">จัดการเมนูอาหาร</h1>
        <button onClick={openAddForm} className="add-menu-button">
          เพิ่มเมนูใหม่
        </button>
      </div>

      {menus.length === 0 ? (
        <div className="empty-state-card">
          <p className="empty-message">ไม่พบเมนูอาหาร</p>
        </div>
      ) : (
        <div className="menu-grid">
          {menus.map((menu) => (
            <div key={menu.id} className="menu-card">
              <div className="menu-image-container">
                {menu.image ? (
                  <img src={menu.image} alt={menu.name} className="menu-image" />
                ) : (
                  <div className="no-image-placeholder">no image</div>
                )}
              </div>
              <div className="menu-details">
                <div className="menu-header">
                  <div>
                    <h3 className="menu-name">{menu.name}</h3>
                    <div className="menu-price">{menu.price.toLocaleString()} บาท</div>
                  </div>
                  <div className="menu-actions">
                    <button onClick={() => openEditForm(menu)} className="edit-button">
                      แก้ไข
                    </button>
                    <button onClick={() => handleDelete(menu.id)} className="delete-button">
                      ลบ
                    </button>
                  </div>
                </div>

                <div className="menu-info-section">
                  <div>ประเภท: {menu.type}</div>
                  <div>ขนาด: {menu.size}</div>
                  {(menu.type === "เมนูหลัก" || menu.type === "ของทานเล่น") && (
                    <div>ระดับความเผ็ด: {menu.spicy}</div>
                  )}
                  <div>ท็อปปิ้ง: {menu.toppings.length ? menu.toppings.join(", ") : "-"} (เลือกได้สูงสุด {menu.toppingLimit})</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="form-modal-backdrop">
          <div className="form-modal-panel">
            <div className="form-header">
              <h2 className="form-title">{editingId ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="close-button">
                ปิด
              </button>
            </div>

            <div className="form-content">
              <div>
                <label className="form-label">ชื่อเมนู</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ใส่ชื่อเมนู"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">ราคา</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="ใส่ราคา"
                  value={price === "" ? "" : String(price)}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>

              <div>
                <label className="form-label">ประเภทอาหาร</label>
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value as MenuType)}>
                  <option>เมนูหลัก</option>
                  <option>ของทานเล่น</option>
                  <option>ของหวาน</option>
                  <option>เครื่องดื่ม</option>
                </select>
              </div>

              <div>
                <label className="form-label">ขนาด</label>
                <div className="form-radio-group">
                  {(["S", "M", "L"] as SizeType[]).map((s) => (
                    <label key={s} className="form-radio-label">
                      <input type="radio" name="size" checked={size === s} onChange={() => setSize(s)} /> {s}
                    </label>
                  ))}
                </div>
              </div>

              {(type === "เมนูหลัก" || type === "ของทานเล่น") && (
                <div>
                  <label className="form-label">ระดับความเผ็ด</label>
                  <div className="form-radio-group">
                    {(["เผ็ดน้อย", "เผ็ดกลาง", "เผ็ดมาก"] as SpicyType[]).map((sp) => (
                      <label key={sp} className="form-radio-label">
                        <input type="radio" name="spicy" checked={spicy === sp} onChange={() => setSpicy(sp)} /> {sp}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="form-label">ท็อปปิ้ง</label>
                <div className="topping-input-group">
                  <input className="form-input topping-input" placeholder="ชื่อท็อปปิ้ง" value={newTopping} onChange={(e) => setNewTopping(e.target.value)} />
                  <button onClick={handleAddTopping} className="add-topping-button">
                    เพิ่ม
                  </button>
                </div>
                <div className="topping-limit-group">
                  <label className="topping-limit-label">จำนวนท็อปปิ้งสูงสุดที่ลูกค้าสามารถเลือกได้:</label>
                  <input type="number" min={1} className="topping-limit-input" value={toppingLimit} onChange={(e) => setToppingLimit(Math.max(1, Number(e.target.value) || 1))} />
                </div>
                <ul className="topping-list">
                  {toppings.map((t, idx) => (
                    <li key={idx} className="topping-item">
                      <input className="form-input topping-item-input" value={t} onChange={(e) => handleUpdateTopping(idx, e.target.value)} />
                      <button onClick={() => handleRemoveTopping(idx)} className="remove-topping-button">
                        ลบ
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="form-label">รูปภาพเมนู</label>
                <label className="image-upload-label">
                  <FaCamera className="camera-icon" />
                  <span>คลิกเพื่ออัปโหลด</span>
                  <input type="file" accept="image/*" className="image-upload-input" onChange={handleImageUpload} />
                </label>
                {image && <img src={image} alt="preview" className="image-preview" />}
              </div>

              <div className="form-actions">
                <button onClick={() => { setShowForm(false); resetForm(); }} className="cancel-button">
                  ยกเลิก
                </button>
                <button onClick={handleSave} className="save-button">
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
