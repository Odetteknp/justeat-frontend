import { Outlet, useLocation } from "react-router-dom";
import NavSidebar, { type NavItem } from "../../components/navigation/navSidebar";

// ไอคอนจาก Ant Design
import {
  HomeOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

export default function PartnerRestLayout() {
  const { pathname } = useLocation();

  const items: NavItem[] = [
    { key: "overview", label: "ภาพรวม",    icon: <HomeOutlined />,         to: "/partner/rest/overview" },
    { key: "menu",     label: "เมนูอาหาร", icon: <AppstoreOutlined />,    to: "/partner/rest/menu" },
    { key: "orders",   label: "คำสั่งซื้อ", icon: <ShoppingCartOutlined />, to: "/partner/rest/orders", badge: 5 },
    { key: "settings", label: "ตั้งค่า",    icon: <SettingOutlined />,      to: "/partner/rest/settings" },
  ];

  const activeKey = items.find(i => pathname.startsWith(i.to || ""))?.key;

  return (
    <div className="container" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
      <NavSidebar
        items={items}
        activeKey={activeKey}
        header={<div>Restaurant</div>}
        footer={
          <button 
            type="button" 
            className="navSidebar_Btn navSidebar_Logout"
            onClick={() => console.log("logout")}
          >
            <LogoutOutlined />
            <span className="sidenav__label">ออกจากระบบ</span>
          </button>
        }
      />
      <div style={{ minWidth: 0 }}>
        <Outlet /> {/* เนื้อหาแต่ละหน้า เช่น overview/menu/orders */}
      </div>
    </div>
  );
}
