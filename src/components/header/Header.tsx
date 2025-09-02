import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoFastFood } from "react-icons/io5";

// antd
import { Layout, Menu, Dropdown, Input, Button, Space } from "antd";
import type { MenuProps } from "antd";
import { DownOutlined, UserOutlined, SearchOutlined, DingdingOutlined, LogoutOutlined } from "@ant-design/icons";

// CSS
import "./Header.css";
import logoImage from "../../assets/LOGO.png";

// ✅ เพิ่มบรรทัดนี้ (ปรับ path ให้ตรงโปรเจกต์คุณ)
import { useAuthGuard } from "../../hooks/useAuthGuard";

const { Header } = Layout;

type Props = {
  isLoggedIn?: boolean; // จะเลิกใช้ prop นี้ก็ได้ เพราะเราอ่านจาก hook แทน
};

const MenuKey = [
  { key: "/", label: "Home" },
  { key: "/restaurants", label: "Restaurants" },
  { key: "/promotions", label: "Promotions" },
  { key: "/help", label: "Help" },
];

function getActiveMenuKey(pathname: string) {
  return (
    MenuKey.find((item) =>
      item.key === "/" ? pathname === "/" : pathname.startsWith(item.key)
    )?.key ?? "/"
  );
}

export default function CustomerHeader({ isLoggedIn = false }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const selectedKey = useMemo(() => getActiveMenuKey(pathname), [pathname]);

  // ✅ ใช้ hook: ดึง user + logout (ปิด autoRedirect ใน Header เพื่อกันการเด้งหน้าโดย Header เอง)
  const { user, logout, loading } = useAuthGuard([], {
    autoRedirect: false,
    redirectDelayMs: 0,
  });
  const isAuthed = !!user; // ใช้สถานะล็อกอินจาก hook

  // เมนู Partner
  const partnerItems: MenuProps["items"] = [
    {
      key: "rider",
      label: <Link to="/partner/rider">Rider</Link>,
      icon: <DingdingOutlined />,
    },
    {
      key: "restaurant",
      label: <Link to="/partner/restaurant">Restaurant</Link>,
      icon: <IoFastFood />,
    },
  ];

  // เมนูโปรไฟล์ + logout
  const profileItems: MenuProps["items"] = [
    {
      key: "profile",
      label: <Link to="/profile">My Profile</Link>,
      icon: <DingdingOutlined />,
    },
    {
      key: "order",
      label: <Link to="/profile/order">My Orders</Link>,
      icon: <IoFastFood />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Log out",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  // ✅ จัดการคลิกเมนูโปรไฟล์ (โดยเฉพาะ logout)
  const onProfileMenuClick: MenuProps["onClick"] = async ({ key }) => {
    if (key === "logout") {
      // แบบ A: frontend-only — ลบ token + เด้งไปหน้า login
      logout("/login"); // ไม่ใส่ก็ได้ จะเด้งไป redirectTo.unauthorized ใน hook
      return;
    }
    // อื่น ๆ ไม่ต้องทำอะไร เพราะเราใช้ <Link> แล้ว
  };

  return (
    <Header className="header">
      <div className="header-container">
        {/* ซ้าย */}
        <div className="header-left">
          <div className="header-logo">
            <Link to="/" aria-label="ไปหน้าแรก">
              <img src={logoImage} alt="Logo" />
            </Link>
          </div>
        </div>

        {/* กลาง */}
        <Menu
          mode="horizontal"
          theme="dark"
          className="header-menu"
          selectedKeys={[selectedKey]}
          aria-label="เมนูหลักลูกค้า"
        >
          {MenuKey.map((item) => (
            <Menu.Item key={item.key}>
              <Link to={item.key}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>

        {/* ขวา */}
        <div className="header-right">
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            className="header-search"
            allowClear
            aria-label="ค้นหา"
          />

          <Space wrap>
            <Dropdown menu={{ items: partnerItems }}>
              <Button className="header-partner" type="text" aria-label="เปิดเมนู partner">
                <Space>
                  Partner
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </Space>

          {/* ถ้าอยากแสดงระหว่างโหลด auth.me: จะ render ปุ่ม Sign In ไปก่อนก็ได้ */}
          {!isAuthed ? (
            <Link to="/login" aria-label="เข้าสู่ระบบ">
              <Button className="header-signin" shape="round" disabled={loading}>
                Sign In
              </Button>
            </Link>
          ) : (
            <Dropdown
              menu={{ items: profileItems, onClick: onProfileMenuClick }}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <Button className="header-avatar-btn" shape="circle" icon={<UserOutlined />} />
            </Dropdown>
          )}
        </div>
      </div>
    </Header>
  );
}
