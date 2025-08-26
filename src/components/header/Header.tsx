import React, { useMemo } from "react"; // useMemo ไว้จำค่า react จะได้ไม่ต้องคำนวณซ้ำ
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoFastFood  } from "react-icons/io5"; //npm install react-icons --save

// antd
import { Layout, Menu, Dropdown, Input, Button, Space } from "antd";
import type { MenuProps } from "antd";
import { DownOutlined, UserOutlined, SearchOutlined, DingdingOutlined  } from "@ant-design/icons";

// CSS
import "./Header.css";
import logoImage from "../../assets/LOGO.png";

const { Header } = Layout;

type Props = {
  isLoggedIn?: boolean;
};

// array ของ Object แต่ละ Obkect มี key = path และ label เป็นชื่อแสดงเมนู
const MenuKey = [
  { key: "/", label: "Home" },
  { key: "/menu", label: "Menu" },
  { key: "/restaurants", label: "Restaurants" },
  { key: "/promotions", label: "Promotions" },
  { key: "/help", label: "Help" },
];

const ProfileItem = [
  { key: "/profile", label: "My Profile" },
  { key: "/order", label: "My Orders"}
]

// หาว่าเมนูไหนควรถูกเลือก (active) จาก pathname ปัจจุบัน
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

  // เมนูลัดไปหน้า Partner
  const partnerItems: MenuProps["items"] = [
    {
      key: "rider",
      label: <Link to="/partner/rider">Rider</Link>,
      icon: <DingdingOutlined/>
    },
    {
      key: "rest",
      label: <Link to="/partner/rest">Restaurant</Link>,
      icon: <IoFastFood/>
    },
  ];

  return (
    <Header className="header">
    
      {/* จะแบ่งเป็น 3 ส่วน : ซ้าย | กลาง | ขวา */}
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
              <Button
                className="header-partner"
                type="text"
                aria-label="เปิดเมนู partner"
              >
                <Space>
                  Partner
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </Space>

          {!isLoggedIn ? (
            <Link to="/login" aria-label="เข้าสู่ระบบ">
              <Button className="header-signin" shape="round">
                Sign In
              </Button>
            </Link>
          ) : (
            <Dropdown menu={{ items: ProfileItem }} placement="bottomRight" arrow={{ pointAtCenter: true }}>
              <Button
                className="header-avatar-btn"
                shape="circle"
                icon={<UserOutlined />}
              />
            </Dropdown>

          )}
        </div>
      </div>
    </Header>
  );
}
