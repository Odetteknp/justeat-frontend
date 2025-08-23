// นำเข้า React hooks พื้นฐานสำหรับจัดการ state / lifecycle / memoization
import { useEffect, useMemo, useState } from "react"; // useEffect=เรียกตอน mount/update, useState=state ภายใน, useMemo=คำนวณทอน
// นำเข้าเครื่องมือจาก react-router-dom สำหรับอ่านพารามิเตอร์และนำทาง
import { useParams, useNavigate } from "react-router-dom"; // useParams=อ่าน :id จาก URL, useNavigate=สั่งเปลี่ยนหน้า/ย้อนกลับ
// นำเข้าคอมโพเนนต์จาก Ant Design ที่ใช้ในหน้านี้
import {
  Layout,         // เลย์เอาต์หลักของหน้า
  Card,           // การ์ดแสดงเมนู
  Button,         // ปุ่มต่าง ๆ
  Tabs,           // แถบแท็บสำหรับหมวดเมนู
  Affix,          // ทำให้แถบแท็บ sticky ตอนสกรอลล์
  Drawer,         // ลิ้นชักตะกร้าสำหรับมือถือ/แท็บเล็ต
  Badge,          // แสดงจำนวนบนปุ่มตะกร้า
  Grid,           // ใช้ตรวจขนาดหน้าจอ (breakpoints)
  Skeleton,       // โครงร่างโหลดข้อมูล
  Alert,          // กล่องแจ้งเตือน error
} from "antd"; // นำเข้าจาก antd
// ไอคอนที่ใช้จาก @ant-design/icons
import {
  ArrowLeftOutlined,       // ไอคอนลูกศรกลับ
  HeartOutlined,           // ไอคอนหัวใจแบบกรอบ (ยังไม่ favorite)
  HeartFilled,             // ไอคอนหัวใจทึบ (favorite)
  ShoppingCartOutlined,    // ไอคอนรถเข็น
  PlusOutlined,            // ไอคอนเครื่องหมายบวก
} from "@ant-design/icons"; // นำเข้าไอคอน
// นำเข้าไฟล์สไตล์ของหน้านี้ (ใช้ .css ปกติตามที่ทีมกำหนด)
import "./RestaurantDetailPage.css"; // โหลดคลาส .res-* ที่เราเขียนไว้
// นำเข้าบริการ (service) สำหรับดึงข้อมูลร้าน (ตอนนี้ผูกกับ mock แต่โครงเหมือนจริง)
import {
  getRestaurantDetail,     // ฟังก์ชันดึงรายละเอียดร้านตาม id
} from "../services/restaurants"; // entry ของ service ร้านอาหาร

import type { Restaurant, MenuItem } from "../services/restaurants/index";

// ดึง Content ออกจาก Layout เพื่อใช้งานสะดวก
const { Content } = Layout; // Layout.Content
// hook สำหรับดู breakpoint ปัจจุบัน (เช่น xs/sm/md/lg)
const { useBreakpoint } = Grid; // ใช้ screens.lg เพื่อตัดสินใจเปิด Drawer อัตโนมัติ

// ประเภทข้อมูลของรายการในตะกร้าที่เก็บใน state หน้า (ชั่วคราว ยังไม่ต่อ service/cart)
type CartItem = { id: string; name: string; price: number; qty: number }; // id=เมนู, name=ชื่อเมนู, price=ราคา, qty=จำนวน

// คอมโพเนนต์หลักของหน้า /restaurants/:id
export default function RestaurantDetailPage() { // เริ่มประกาศคอมโพเนนต์
  const { id } = useParams<{ id: string }>(); // อ่านพารามิเตอร์ :id จาก URL (เช่น /restaurants/r_1)
  const navigate = useNavigate();             // ใช้สั่งย้อนกลับหรือไปหน้าอื่น
  const screens = useBreakpoint();            // ได้อ็อบเจ็กต์บอกสถานะ breakpoint (เช่น screens.lg)

  // ---- สเตทของหน้า ----
  const [data, setData] = useState<Restaurant | null>(null); // เก็บรายละเอียดร้าน (รวมเมนู); เริ่มต้นยังไม่มี
  const [loading, setLoading] = useState(true);              // true ระหว่างกำลังโหลดข้อมูลจาก service
  const [error, setError] = useState<string | null>(null);   // เก็บข้อความ error ถ้าโหลดล้มเหลว
  const [fav, setFav] = useState(false);                     // สถานะ favorite (ฝั่ง UI; ต่อ API ภายหลัง)
  const [cartOpen, setCartOpen] = useState(false);           // ควบคุมการเปิด/ปิด Drawer ตะกร้า (มือถือ/แท็บเล็ต)
  const [cart, setCart] = useState<Record<string, CartItem>>({}); // ตะกร้าในหน้า (map ด้วย key=menuId)

  // ---- โหลดข้อมูลร้านตาม id จาก service (ตอนนี้คือ mock provider) ----
  useEffect(() => {                                   // ใช้ effect เมื่อ id เปลี่ยนหรือ mount ครั้งแรก
    if (!id) return;                                  // ถ้าไม่มี id (ผิดพลาด) ไม่ต้องโหลด
    const ac = new AbortController();                 // สร้าง AbortController เพื่อยกเลิกคำขอได้
    setLoading(true);                                 // เริ่มสถานะโหลด
    setError(null);                                   // ล้าง error เก่า
    getRestaurantDetail(id, ac.signal)                // เรียก service ด้วย id และส่ง signal สำหรับยกเลิก
      .then((res) => {                                // เมื่อสำเร็จ
        setData(res);                                 // เซ็ตข้อมูลร้านลง state
        setFav(false);                                // รีเซ็ตสถานะ favorite (ต่อ API ทีหลัง)
      })
      .catch((err) => {                               // เมื่อผิดพลาด
        if (err.name !== "AbortError") {              // ถ้าไม่ใช่ยกเลิกเอง
          setError(err.message || "โหลดข้อมูลไม่สำเร็จ"); // เก็บข้อความ error เพื่อแสดงผล
        }
      })
      .finally(() => setLoading(false));              // ไม่ว่าจะสำเร็จ/ล้มเหลว ให้ปิดสถานะโหลด
    return () => ac.abort();                          // cleanup: ยกเลิกคำขอเมื่อคอมโพเนนต์ unmount หรือ id เปลี่ยน
  }, [id]);                                           // เดิน effect เมื่อ id เปลี่ยน

  // ---- สร้างลิสต์หมวดหมู่จากเมนู (unique) ----
  const categories = useMemo(() => {                  // คำนวณเฉพาะเมื่อ data เปลี่ยน
    const set = new Set<string>();                    // ใช้ Set เพื่อเก็บไม่ซ้ำ
    data?.menu.forEach((m) => set.add(m.category));   // loop เมนูทุกอัน เพิ่มชื่อหมวดลง Set
    return Array.from(set);                           // แปลง Set เป็น Array เพื่อใช้กับ Tabs
  }, [data]);                                         // ผูกกับ data

  // ---- จัดกลุ่มเมนูตามหมวดเพื่อเรนเดอร์ได้เร็วขึ้น ----
  const grouped = useMemo(() => {                     // สร้าง map category -> เมนู[]
    const map: Record<string, MenuItem[]> = {};       // เริ่มจากอ็อบเจ็กต์ว่าง
    data?.menu.forEach((m) => {                       // loop เมนูทั้งหมด
      if (!map[m.category]) map[m.category] = [];     // ถ้ายังไม่มีหมวดนี้ใน map ให้สร้าง array ใหม่
      map[m.category].push(m);                        // ใส่เมนูเข้า array ของหมวดนั้น
    });
    return map;                                       // คืนค่า map สำหรับใช้งาน
  }, [data]);                                         // คำนวณใหม่เมื่อ data เปลี่ยน

  // ---- เพิ่มเมนูลงตะกร้า (ชั่วคราว เก็บใน state หน้า) ----
  const addToCart = (item: MenuItem) => {             // รับเมนูที่จะเพิ่ม
    setCart((prev) => {                                // อัปเดต state แบบอิง prev state
      const found = prev[item.id];                     // หา item เดิมในตะกร้า
      return {                                         // คืน state ใหม่
        ...prev,                                       // คัดลอกของเดิม
        [item.id]: found                               // ถ้ามีอยู่แล้ว
          ? { ...found, qty: found.qty + 1 }           // เพิ่มจำนวน +1
          : { id: item.id, name: item.name, price: item.price, qty: 1 }, // ถ้ายังไม่มี สร้างใหม่ qty=1
      };
    });
    if (!screens.md) setCartOpen(true);                // ถ้าจอเล็ก (ต่ำกว่า md) เปิด Drawer ให้เห็นทันที
  };                                                   // จบ addToCart

  // ---- จำนวนรวมของสินค้าทั้งหมดในตะกร้า ----
  const cartCount = useMemo(                           // ใช้ useMemo ลดคำนวณซ้ำ
    () => Object.values(cart).reduce((n, it) => n + it.qty, 0), // รวม qty ทุกชิ้น
    [cart]                                             // ผูกกับ cart
  );                                                   // จบ cartCount

  // ---- ยอดเงินรวมทั้งหมดในตะกร้า ----
  const cartTotal = useMemo(                           // ลดคำนวณซ้ำ
    () => Object.values(cart).reduce((s, it) => s + it.price * it.qty, 0), // sum ราคา*จำนวน
    [cart]                                             // ผูกกับ cart
  );                                                   // จบ cartTotal

  // ---- ระหว่างโหลด: แสดงโครง Skeleton กันหน้าว่าง ----
  if (loading) {                                       // ถ้ากำลังโหลดข้อมูล
    return (                                           // คืนโครงหน้าแบบกำลังโหลด
      <Layout className="res-page">                    {/* คอนเทนเนอร์หลัก */}
        <Content>                                      {/* พื้นที่เนื้อหา */}
          <div className="res-hero">                   {/* กล่อง hero */}
            <Skeleton.Node active style={{ width: "100%", height: 280 }} /> {/* โครงรูป hero */}
            <Button                                       // ปุ่มย้อนกลับ (ยังให้กดได้ระหว่างโหลด)
              type="text"                                  // ปุ่มแบบ text (พื้นหลังโปร่ง)
              icon={<ArrowLeftOutlined />}                 // ไอคอนลูกศร
              className="res-backBtn"                      // จัดตำแหน่งมุมขวาบน (ดู CSS)
              onClick={() => navigate(-1)}                 // ย้อนกลับ 1 หน้า
            />
          </div>                                         {/* จบ hero */}
          <div className="res-sheet">                    {/* กล่องขาวหลัก */}
            <Skeleton active paragraph={{ rows: 2 }} />  {/* โครงข้อความส่วนหัว */}
            <Skeleton active paragraph={{ rows: 6 }} />  {/* โครงแท็บ/ลิสต์เมนู */}
          </div>                                         {/* จบ sheet */}
        </Content>                                       {/* จบ content */}
      </Layout>                                          // จบเลย์เอาต์
    );
  }                                                     // จบโหลด

  // ---- กรณีเกิด error หรือไม่มีข้อมูล (data=null) ----
  if (error || !data) {                                // ถ้าโหลดล้มเหลวหรือไม่มีข้อมูล
    return (                                           // แสดงหน้าพร้อม error
      <Layout className="res-page">                    {/* คอนเทนเนอร์หลัก */}
        <Content>                                      {/* พื้นที่เนื้อหา */}
          <div className="res-hero">                   {/* hero */}
            <img src="https://placehold.co/1600x280?text=Restaurant" alt="" /> {/* รูป fallback */}
            <Button                                      // ปุ่มย้อนกลับ
              type="text"                                 // ปุ่มโปร่ง
              icon={<ArrowLeftOutlined />}                // ไอคอนลูกศร
              className="res-backBtn"                     // จัดตำแหน่ง
              onClick={() =>                             // เมื่อคลิก
                window.history.length > 1                 // ถ้ามีประวัติย้อนกลับได้
                  ? navigate(-1)                          // ย้อนกลับ
                  : navigate("/restaurants")              // ไม่งั้นไปลิสต์ร้าน
              }
            />
          </div>                                         {/* จบ hero */}
          <div className="res-sheet">                    {/* กล่องขาว */}
            <Alert                                        // กล่องแจ้งเตือน
              type="error"                                // สีแดง
              message="โหลดข้อมูลไม่สำเร็จ"               // ข้อความหลัก
              description={error || "ไม่พบข้อมูลร้าน"}     // รายละเอียด error/fallback
            />
          </div>                                         {/* จบ sheet */}
        </Content>                                       {/* จบ content */}
      </Layout>                                          // จบเลย์เอาต์
    );
  }                                                     // จบ error-case

  // ---- ปกติ: แสดงหน้าเต็มพร้อมข้อมูลจริง (mock/ภายหลังเป็น API) ----
  return (                                              // เริ่มเรนเดอร์หน้า
    <Layout className="res-page">                       {/* คอนเทนเนอร์หลัก */}
      <Layout>                                          {/* หุ้ม Content (เผื่ออนาคตเพิ่ม Sider อื่น) */}
        <Content>                                       {/* พื้นที่เนื้อหา */}
          {/* HERO: รูปใหญ่ด้านบน + ปุ่มย้อนกลับมุมขวาบน */}
          <div className="res-hero">                    {/* กล่อง hero */}
            <img                                         // รูป hero
              src={data.heroImage || "https://placehold.co/1600x280?text=Restaurant"} // รูปจริงหรือ fallback
              alt=""                                     // alt เว้นไว้ก่อน (จะปรับเป็นชื่อร้านได้)
            />
            <Button                                      // ปุ่มย้อนกลับ
              type="text"                                 // สไตล์โปร่ง
              icon={<ArrowLeftOutlined />}                // ไอคอนลูกศร
              className="res-backBtn"                     // ตำแหน่งมุมขวาบน (ดู CSS)
              onClick={() =>                              // คลิกเพื่อย้อนหรือไปลิสต์
                window.history.length > 1                 // ถ้ากลับได้
                  ? navigate(-1)                          // กลับ
                  : navigate("/restaurants")              // ไม่งั้นไปหน้า /restaurants
              }
            />
          </div>                                         {/* จบ hero */}

          {/* กล่องขาวโค้งมนซ้อนใต้ hero */}
          <div className="res-sheet">                    {/* แผ่นขาวหลัก */}
            {/* แถวบน: ชื่อร้าน + เรตติ้ง + ปุ่มหัวใจ */}
            <div className="res-headerRow">              {/* แถวหัว */}
              <div className="res-titleArea">            {/* โซนชื่อ/เรตติ้ง */}
                <h1 className="res-title">{data.name}</h1>                 {/* ชื่อร้าน */}
                <div className="res-ratingLine">                           {/* แถวเรตติ้ง */}
                  <span>⭐</span>                                          {/* ไอคอนดาวแบบง่าย */}
                  <span className="res-ratingNum">{data.rating.toFixed(1)}</span> {/* ตัวเลขเรตติ้ง 1 ตำแหน่งทศนิยม */}
                </div>                                                     {/* จบเรตติ้ง */}
              </div>                                                       {/* จบโซนชื่อ */}
              <Button                                                      // ปุ่ม favorite
                type="text"                                                // ปุ่มโปร่ง
                icon={fav ? <HeartFilled /> : <HeartOutlined />}           // ไอคอนไดนามิกตามสถานะ
                onClick={() => setFav((s) => !s)}                          // สลับสถานะเมื่อกด (ต่อ API ทีหลัง)
                className="res-favBtn"                                     // สไตล์ปุ่มหัวใจ
                aria-label="favorite"                                      // เพื่อการเข้าถึง
              />
            </div>                                                         {/* จบหัวแถว */}

            {/* Tabs หมวดหมู่เมนู (ทำ sticky ด้วย Affix เพื่อ UX ดีขึ้น) */}
            <Affix offsetTop={80}>                                         {/* ติดบนสุดห่าง 80px จากขอบ (กันชน header) */}
              <div className="res-tabsWrap">                               {/* ห่อ Tabs สำหรับพื้นหลัง/เส้นแบ่ง */}
                <Tabs                                                      // คอมโพเนนต์แท็บ
                  items={categories.map((c) => ({                          // สร้างแท็บตามหมวด
                    key: c,                                                // key = ชื่อหมวด
                    label: c,                                              // ป้ายแท็บ
                    children: (                                            // เนื้อหาแต่ละแท็บ
                      <div className="res-grid">                           {/* กริดการ์ดเมนู */}
                        {(grouped[c] || []).map((m) => (                   // loop เมนูของหมวดนี้
                          <Card                                            // การ์ดเมนู
                            key={m.id}                                     // key ของรายการ
                            className="res-menuCard"                       // สไตล์การ์ด
                            cover={                                         // ส่วนรูปด้านบนของการ์ด
                              <img                                         // รูปเมนู
                                src={m.image || "https://placehold.co/600x400?text=Menu"} // รูปจริงหรือ fallback
                                alt={m.name}                                // คำอธิบายรูปเพื่อการเข้าถึง
                              />
                            }
                            actions={[                                      // แถบปุ่มล่างของการ์ด
                              <Button                                       // ปุ่มเพิ่มลงตะกร้า
                                type="primary"                              // ปุ่มหลักสีแบรนด์
                                icon={<PlusOutlined />}                     // ไอคอนบวก
                                onClick={() => addToCart(m)}                // คลิกแล้วเพิ่มเมนูนี้
                              >
                                เพิ่ม                                        {/* ข้อความปุ่ม */}
                              </Button>,
                            ]}
                          >
                            <Card.Meta                                     // เมทาของการ์ด (title/description)
                              title={                                       // ชื่อเมนู (พร้อม ellipsis)
                                <div className="res-itemName" title={m.name}> {m.name} </div> // แสดงชื่อ (ตัดคำด้วย CSS)
                              }
                              description={                                  // บรรยายราคา
                                <div className="res-price">฿{m.price}</div> // ราคาเมนู
                              }
                            />
                          </Card>                                           // จบการ์ดหนึ่งใบ
                        ))}                                                 // จบ map เมนูในหมวด
                      </div>                                               // จบกริดเมนู
                    ),                                                     // จบ children ของแท็บ
                  }))}                                                     // จบ map สร้างรายการแท็บ
                />                                                         {/* จบ Tabs */}
              </div>                                                       {/* จบตัวห่อ tabs */}
            </Affix>                                                       {/* จบ Affix */}
          </div>                                                           {/* จบ sheet */}
        </Content>                                                         {/* จบ content */}
      </Layout>                                                            {/* จบ layout inner */}
      
      {/* ปุ่มตะกร้าลอย + Drawer สำหรับจอเล็ก (มือถือ/แท็บเล็ต) */}
      {!screens.lg && (                                                    // แสดงเฉพาะถ้าหน้าจอเล็กกว่า lg
        <>                                                                  {/* fragment ครอบสองชิ้น */}
          <Badge                                                            // ป้ายตัวเลขนับบนปุ่ม
            count={cartCount}                                               // จำนวนทั้งหมดในตะกร้า
            className="res-floatCartBadge"                                  // ตำแหน่งปุ่มลอย (fixed)
          >
            <Button                                                         // ปุ่มลอยเปิดตะกร้า
              shape="round"                                                 // มุมโค้งมน
              size="large"                                                  // ขนาดใหญ่
              icon={<ShoppingCartOutlined />}                                // ไอคอนรถเข็น
              onClick={() => setCartOpen(true)}                              // คลิกเพื่อเปิด Drawer
              className="res-floatCart"                                      // สไตล์ปุ่มลอย
            >
              ตะกร้า · ฿{cartTotal}                                         {/* แสดงยอดรวม */}
            </Button>
          </Badge>

          <Drawer                                                           // ลิ้นชักด้านขวา
            title="ตะกร้าของคุณ"                                            // หัวข้อ Drawer
            placement="right"                                               // เปิดจากขวา
            open={cartOpen}                                                 // เปิด/ปิดตาม state
            onClose={() => setCartOpen(false)}                               // ปิดเมื่อคลิกกากบาท/พื้นหลัง
            width={360}                                                     // ความกว้าง Drawer
          >
            {/* เนื้อหาตะกร้าแบบย่อใน Drawer (เก็บ state ในหน้า) */}
            {Object.values(cart).length === 0 ? (                            // ถ้าไม่มีสินค้า
              <div className="res-cartEmpty">ยังไม่มีสินค้าในตะกร้า</div>   // ข้อความว่าง
            ) : (                                                            // ถ้ามีสินค้า
              Object.values(cart).map((it) => (                              // loop แสดงแต่ละรายการ
                <div key={it.id} className="res-cartRow">                    {/* แถวหนึ่งรายการ */}
                  <div className="res-cartName">{it.name}</div>              {/* ชื่อเมนู */}
                  <div className="res-cartPrice">฿{it.price} × {it.qty}</div> {/* ราคา x จำนวน */}
                </div>
              ))
            )}
            <div className="res-cartFooter">                                 {/* แถวสรุปรวม */}
              <div>รวมทั้งหมด</div>                                         {/* ป้ายข้อความ */}
              <div className="res-cartTotal">฿{cartTotal}</div>              {/* ยอดรวมทั้งหมด */}
            </div>
            <Button type="primary" block disabled={cartCount === 0}>         {/* ปุ่มไปชำระเงิน */}
              ไปชำระเงิน                                                    {/* ข้อความปุ่ม */}
            </Button>
          </Drawer>
        </>
      )}
    </Layout>                                                               // จบคอนเทนเนอร์หลัก
  );                                                                         // จบ return
}                                                                             // จบคอมโพเนนต์
