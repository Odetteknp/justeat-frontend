import { Outlet, useLocation } from "react-router-dom";
import NavSidebar, { type NavItem } from "../../components/navigation/navSidebar";

import {
  DashboardOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

export default function PartnerRiderLayout() {
  const { pathname } = useLocation();

  const items: NavItem[] = [
    { key: "dashboard", label: "แดชบอร์ด", icon: <DashboardOutlined />, to: "/partner/rider/dashboard" },
    { key: "jobs",      label: "งานวันนี้", icon: <EnvironmentOutlined />, to: "/partner/rider/jobs" },
    { key: "history",   label: "ประวัติ",   icon: <HistoryOutlined />,     to: "/partner/rider/history" },
    { key: "settings",  label: "ตั้งค่า",    icon: <SettingOutlined />,     to: "/partner/rider/settings" },
  ];

  const activeKey = items.find(i => pathname.startsWith(i.to || ""))?.key;

  return (
    <div className="container" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
      <NavSidebar
        items={items}
        activeKey={activeKey}
        header={<div>Rider</div>}
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
        <Outlet /> {/* เนื้อหา rider */}
      </div>
    </div>
  );
}
