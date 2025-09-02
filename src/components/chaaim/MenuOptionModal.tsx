import React, { useMemo, useState } from 'react';
import type { MenuItem, MenuOption, Choice } from '../../data/menuData';

type Selected = Record<string, string[]>;

type Props = {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onConfirm: (payload: {
    item: MenuItem;
    quantity: number;
    selected: Selected;
    note?: string;
    total: number;
  }) => void;
};

const parsePrice = (s: string) => {
  const n = Number(String(s).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};

export default function MenuOptionModal({ open, item, onClose, onConfirm }: Props) {
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Selected>({});
  const [note, setNote] = useState('');

  const basePrice = useMemo(() => (item ? parsePrice(item.price) : 0), [item]);

  const addonPrice = useMemo(() => {
    if (!item?.options) return 0;
    let sum = 0;
    for (const opt of item.options) {
      if (opt.id === 'note') continue;
      const picks = selected[opt.id] ?? [];
      for (const pid of picks) {
        const ch = opt.choices.find(c => c.id === pid);
        if (ch?.price) sum += ch.price;
      }
    }
    return sum;
  }, [item, selected]);

  const total = (basePrice + addonPrice) * qty;

  if (!open || !item) return null;

  const toggleSingle = (opt: MenuOption, id: string) => {
    setSelected(prev => ({ ...prev, [opt.id]: [id] }));
  };

  const toggleMulti = (opt: MenuOption, id: string) => {
    setSelected(prev => {
      const set = new Set(prev[opt.id] ?? []);
      set.has(id) ? set.delete(id) : set.add(id);
      return { ...prev, [opt.id]: Array.from(set) };
    });
  };

  const confirm = () => {
    onConfirm({
      item,
      quantity: qty,
      selected,
      note: note.trim() || undefined,
      total,
    });
    setQty(1);
    setSelected({});
    setNote('');
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <img src={item.image} alt={item.name} style={styles.thumb} />
            <div>
              <div style={{ fontWeight: 700 }}>{item.name}</div>
              <div style={{ color: '#666', fontSize: 14 }}>เริ่มต้น {item.price}</div>
            </div>
          </div>
          <button onClick={onClose} style={styles.close}>×</button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {(item.options ?? [])
            .filter(opt => opt.id !== 'note')
            .map((opt) => (
              <div key={opt.id} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  {opt.label}{opt.required ? <span style={{ color: '#e22' }}> *</span> : null}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {opt.choices.map((c: Choice) => {
                    const picked = (selected[opt.id] ?? []).includes(c.id);
                    const priceText = c.price ? ` +฿${c.price}` : '';

                    if (opt.type === 'single') {
                      return (
                        <label key={c.id} style={{ ...styles.chip, ...(picked ? styles.chipActive : {}) }}>
                          <input
                            type="radio"
                            name={`opt-${opt.id}`}
                            checked={picked}
                            onChange={() => toggleSingle(opt, c.id)}
                            style={{ display: 'none' }}
                          />
                          {c.name}{priceText}
                        </label>
                      );
                    }

                    return (
                      <label key={c.id} style={{ ...styles.chip, ...(picked ? styles.chipActive : {}) }}>
                        <input
                          type="checkbox"
                          checked={picked}
                          onChange={() => toggleMulti(opt, c.id)}
                          style={{ display: 'none' }}
                        />
                        {c.name}{priceText}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))
          }

          {/* ช่องหมายเหตุ */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>หมายเหตุ</div>
            <textarea
              placeholder="เช่น ไม่ใส่ผัก / เผ็ดน้อย"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ width: '100%', minHeight: 72, border: '1px solid #ddd', borderRadius: 8, padding: 8 }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={styles.qtyBtn}>–</button>
            <span style={{ margin: '0 12px' }}>{qty}</span>
            <button onClick={() => setQty(qty + 1)} style={styles.qtyBtn}>+</button>
          </div>
          <button onClick={confirm} style={styles.addBtn}>เพิ่มลงตะกร้า • ฿{total}</button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { background: '#fff', width: 'min(720px,100%)', maxHeight: '90vh', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #eee' },
  thumb: { width: 56, height: 56, objectFit: 'cover', borderRadius: 8 },
  close: { border: 0, background: 'transparent', fontSize: 24, cursor: 'pointer', lineHeight: 1 },
  body: { padding: '12px 16px', overflow: 'auto' },
  chip: { border: '1px solid #ddd', borderRadius: 999, padding: '8px 12px', cursor: 'pointer' },
  chipActive: { background: '#111', color: '#fff', borderColor: '#111' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: '1px solid #eee', background: '#fafafa' },
  qtyBtn: { width: 36, height: 36, borderRadius: 999, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  addBtn: { flex: 1, border: 0, background: '#111', color: '#fff', padding: '12px 16px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' },
};