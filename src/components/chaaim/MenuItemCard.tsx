// src/components/MenuItemCard.tsx

type Props = {
  name: string;
  price: string;
  image?: string | null;
  onAdd?: () => void;
};

export default function MenuItemCard({ name, price, image, onAdd }: Props) {
  const imgSrc = image || undefined;

  return (
    <div className="menu-item-card" style={{ position:'relative', border:'1px solid #eee', borderRadius:12, padding:12 }}>
      {imgSrc ? (
        <img src={imgSrc} alt={name} style={{ width:'100%', height:140, objectFit:'cover', borderRadius:8 }} />
      ) : (
        <div style={{ width:'100%', height:140, borderRadius:8, background:'#f3f3f3' }} />
      )}
      <div style={{ marginTop:8 }}>
        <div style={{ fontWeight:700 }}>{name}</div>
        <div style={{ color:'#666' }}>{price}</div>
      </div>
      <button onClick={onAdd}
        style={{ position:'absolute', right:12, bottom:12, width:36, height:36, borderRadius:'50%', border:0, background:'#111', color:'#fff', fontSize:20, cursor:'pointer' }}>
        ＋
      </button>
    </div>
  );
}


