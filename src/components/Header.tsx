import React from "react";
import { Layout, Menu, Dropdown, Input, Button, Avatar } from "antd";
import {
  DownOutlined,
  UserOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import logoImage from "../assets/LOGO.png";

const { Header } = Layout;

type AppHeaderProps = {
  isLoggedIn?: boolean;
  /** บังคับให้เป็นโหมด Back-only ไม่ว่าอยู่เส้นทางไหน */
  forceBackOnly?: boolean;
};

/** เส้นทางที่ต้องการให้ Header แสดงแค่ปุ่มย้อนกลับ */
const BACK_ONLY_PREFIXES = ["/restaurants/", "/cart"];

/** คืนค่า key ของเมนูบนแถบด้านบน เพื่อให้ active ตรงกับเส้นทางย่อย */
function resolveTopKey(pathname: string) {
  if (pathname === "/") return "/";
  if (pathname.startsWith("/menu")) return "/menu";
  // ปรับให้ตรงกับโค้ดปัจจุบันของคุณ: /restaurants คือหน้ารวมร้าน (ถ้าใช้ /rest ให้แก้ตรงนี้)
  if (pathname.startsWith("/restaurants")) return "/restaurants";
  if (pathname.startsWith("/help")) return "/help";
  if (pathname.startsWith("/promotions")) return "/promotions";
  return "/";
}

function isBackOnlyPath(pathname: string) {
  return BACK_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
}

const AppHeader: React.FC<AppHeaderProps> = ({
  isLoggedIn = false,
  forceBackOnly = false,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isPartner = pathname.startsWith("/partner");
  const backOnly = forceBackOnly || isBackOnlyPath(pathname);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  /** เมนูสำหรับลิงก์ไปพื้นที่ Partner (ตัวอย่าง) */
  const partnerMenuItems = [
    { key: "rider", label: <Link to="/partner/rider">Rider</Link> },
    { key: "rest", label: <Link to="/partner/rest">Restaurant</Link> },
  ];

  // ---------- Back-only Mode ----------
  if (backOnly) {
    return (
      <Header className="header back-only">
        <div className="header-container-back">
          <Button
            type="text"
            className="header-back"
            icon={<ArrowLeftOutlined />}
            onClick={goBack}
            aria-label="ย้อนกลับ"
          />
        </div>
      </Header>
    );
  }

  // ---------- Normal / Partner Mode ----------
  const selectedTopKey = resolveTopKey(pathname);

  return (
    <Header className={isPartner ? "partner-header header" : "header"}>
      <div className="header-container">
        {/* ซ้าย */}
        <div className="header-left">
          {isPartner ? (
            <Button
              type="text"
              className="header-back"
              icon={<ArrowLeftOutlined />}
              onClick={goBack}
              aria-label="ย้อนกลับ"
            />
          ) : (
            <div className="header-logo">
              <Link to="/" aria-label="ไปหน้าแรก">
                <img src={logoImage} alt="Logo" />
              </Link>
            </div>
          )}
        </div>

        {/* กลาง */}
        {!isPartner ? (
          <Menu
            mode="horizontal"
            theme="dark"
            className="header-menu"
            selectedKeys={[selectedTopKey]}
          >
            <Menu.Item key="/">
              <Link to="/">Home</Link>
            </Menu.Item>
            <Menu.Item key="/menu">
              <Link to="/menu">Menu</Link>
            </Menu.Item>
            <Menu.Item key="/restaurants">
              <Link to="/restaurants">Restaurants</Link>
            </Menu.Item>
            <Menu.Item key="/promotions">
              <Link to="/promotions">Promotion</Link>
            </Menu.Item>
            <Menu.Item key="/help">
              <Link to="/help">Help</Link>
            </Menu.Item>
          </Menu>
        ) : (
          <Menu
            mode="horizontal"
            className="header-menu"
            selectedKeys={[pathname]}
          >
            {pathname.startsWith("/partner/rider") ? (
              <>
                <Menu.Item key="/partner/rider/overview">
                  <Link to="/partner/rider/overview">Overview</Link>
                </Menu.Item>
                <Menu.Item key="/partner/rider/orders">
                  <Link to="/partner/rider/orders">Orders</Link>
                </Menu.Item>
                <Menu.Item key="/partner/rider/settings">
                  <Link to="/partner/rider/settings">Settings</Link>
                </Menu.Item>
              </>
            ) : (
              <>
                <Menu.Item key="/partner/rest/overview">
                  <Link to="/partner/rest/overview">Overview</Link>
                </Menu.Item>
                <Menu.Item key="/partner/rest/menu">
                  <Link to="/partner/rest/menu">Menu</Link>
                </Menu.Item>
                <Menu.Item key="/partner/rest/orders">
                  <Link to="/partner/rest/orders">Orders</Link>
                </Menu.Item>
                <Menu.Item key="/partner/rest/settings">
                  <Link to="/partner/rest/settings">Settings</Link>
                </Menu.Item>
              </>
            )}
          </Menu>
        )}

        {/* ขวา */}
        <div className="header-right">
          {!isPartner && (
            <>
              <Input
                placeholder="Search"
                prefix={<SearchOutlined />}
                className="header-search"
                allowClear
                aria-label="ค้นหา"
              />
              <Dropdown menu={{ items: partnerMenuItems }} trigger={["click"]}>
                <Button className="header-partner" type="text">
                  Partner <DownOutlined />
                </Button>
              </Dropdown>
            </>
          )}

          {!isLoggedIn ? (
            <Link to="/login">
              <Button className="header-signin" shape="round">
                Sign In
              </Button>
            </Link>
          ) : (
            <Link to="/profile" aria-label="โปรไฟล์">
              <Avatar icon={<UserOutlined />} />
            </Link>
          )}
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;
