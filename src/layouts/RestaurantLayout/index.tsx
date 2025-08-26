import React, { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import "../../App.css";
import {
  UserOutlined,
  DashboardOutlined,
  HeartOutlined,
  HistoryOutlined,
  EditOutlined,
  LeftSquareOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

import {
  Layout,
  Menu,
  theme,
  Button,
  message,
  Typography,
  Avatar,
  Space,
} from "antd";
import type { MenuProps } from "antd";
import { 
  IoFastFood, 
  IoFastFoodOutline 
} from "react-icons/io5"; //npm install react-icons --save    //ไอค่อน อาหาร ของ RestaurantLayout

import logo from "../../assets/LOGO.png";

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;

const ROUTE_KEY_MAP: Record<string, string> = {
  "/partner/restaurant": "restaurantdashboard",
  "/restaurantorder": "restaurantorder",
  "/partner/restaurantmenu": "restaurantmenu",
  "/restaurantsetting": "restaurantsetting",
};

// --- แก้ KEY_TITLE_MAP ให้ key ตรงชื่อ ---
const KEY_TITLE_MAP: Record<string, string> = {
  restaurantdashboard: "แดชบอร์ด",
  restaurantorder: "คำสั่งซื้อ",
  restaurantmenu: "เมนูอาหาร",
  restaurantsetting: "ตั้งค่าร้านอาหาร",
};

const RiderLayout: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [collapsed, setCollapsed] = useState(false);
  const siderRef = React.useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // --- แก้ selectedKey: เช็คอันเฉพาะเจาะจงก่อน --- // Hover เมื่อเลือกแต่ละหัวข้อ 
  const selectedKey = useMemo(() => {
    const clean = location.pathname.replace(/\/+$/, "");
    if (clean.startsWith("/partner/restaurant/order")) return "restaurantorder";
    if (clean.startsWith("/partner/restaurant/menu")) return "restaurantmenu";
    if (clean.startsWith("/partner/restaurant/setting")) return "restaurantsetting";
    if (clean.startsWith("/partner/restaurant")) return "restaurantdashboard";
    return "restaurantdashboard";
  }, [location.pathname]);

  // Hover เมื่อเลือกแต่ละหัวข้อ 
  const menuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "restaurantdashboard",
        icon: <DashboardOutlined style={{ fontSize: 18 }} />,
        label: "แดชบอร์ด",
        onClick: () => navigate("/partner/restaurant"), //แก้ path ของ page ตรงนี้
      },
      {
        key: "restaurantworkorder",
        icon: <HistoryOutlined style={{ fontSize: 18 }} />,
        label: "คำสั่งซื้อ",
        onClick: () => navigate("/partner/restaurant/order"),
      },
      {
        key: "restaurantmenu",
        icon: <IoFastFoodOutline   style={{ fontSize: 18 , color: "rgba(255, 255, 255, 1)"}} />,
        label: "เมนูอาหาร",
        onClick: () => navigate("/partner/restaurant/menu"),
      },
      {
        key: "restaurantsetting",
        icon: <UserOutlined style={{ fontSize: 18 }} />,
        label: "ตั้งค่าร้านอาหาร",
        onClick: () => navigate("/partner/restaurant/setting"),
      },
    ],
    [navigate]
  );

  const GoMainPage = () => {
    // โหมด UI อย่างเดียว: แค่โชว์ข้อความเฉย ๆ ไม่ลบข้อมูล/redirect
    messageApi.success("เดโม UI: กำลังกลับไปหน้าหลัก... (ไม่มีการลบข้อมูล)");
    setTimeout(() => {
      navigate("/");      // ไปหน้าหลัก
    }, 1500);
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      {contextHolder}
      <Sider
        ref={siderRef}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          background: "rgb(239, 102, 75)",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          height: "100vh",
          overflow: "hidden",
        }}
        trigger={
          <div
            style={{
              textAlign: "center",
              padding: 8,
              color: "white",
              fontSize: 16,
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            padding: "16px 0",
          }}
        >
          <div>
            {/* Logo Section */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: 32,
                padding: "0 16px",
              }}
            >
              <img
                src={logo}
                alt="Logo"
                style={{
                  width: collapsed ? "60%" : "70%",
                  marginBottom: 16,
                  filter: "brightness(0) invert(1)",
                  cursor: "pointer", // ให้เมาส์เปลี่ยนเป็นมือ
                }}
                onClick={GoMainPage}
              />
              {!collapsed && (
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    color: "white",
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  <IoFastFood style={{ fontSize: 18 , color: "rgba(255, 255, 255, 1)"}} /> Restaurant System
                </Title>
              )}
            </div>

            {/* User Info Section (เดโม) */}
            {!collapsed && (
              <div
                style={{
                  padding: 16,
                  margin: "0 8px 24px 8px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <Avatar
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                    }}
                  />
                  <div>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      Guest
                    </Text>
                    <br />
                    <Text
                      style={{
                        color: "rgba(255, 255, 255, 0.8)",
                        fontSize: 12,
                      }}
                    >
                      โหมดสาธิต UI
                    </Text>
                  </div>
                </Space>
              </div>
            )}

            {/* Menu */}
            <Menu
              theme="dark"
              selectedKeys={[selectedKey]}
              mode="inline"
              items={menuItems}
              style={{ background: "transparent", border: "none" }}
              className="modern-sidebar-menu"
            />
          </div>

          {/* GoMainPage Button */}
          <div style={{ padding: "0 16px" }}>
            <Button
              onClick={GoMainPage}
              icon={<LeftSquareOutlined style={{ fontSize: 20, marginRight: 2 }} />}
              style={{
                width: "100%",
                background: "rgba(220, 60, 30, 1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                borderRadius: 8,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="GoMainPage-button"
            >
              {!collapsed && "ไปที่หน้าหลัก"}
            </Button>
          </div>
        </div>
      </Sider>

      {/*---Header Section---*/}
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Title level={4} style={{ margin: 0, color: "rgb(239, 102, 75)" }}>
            {KEY_TITLE_MAP[selectedKey] || "แดชบอร์ด"}
          </Title>
          <Space>
            <Text type="secondary">ยินดีต้อนรับ, Guest</Text>
          </Space>
        </Header>

        <Content style={{ margin: 16, background: "#f5f5f5", overflow: "auto" }}>
          <div
            style={{
              padding: 24,
              minHeight: "calc(100vh - 200px)",
              background: "white",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Outlet />
          </div>
        </Content>

        {/*---Footer Section---*/}
        <Footer
          style={{
            textAlign: "center",
            background: "white",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Text type="secondary">G19-JustEat</Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default RiderLayout;
