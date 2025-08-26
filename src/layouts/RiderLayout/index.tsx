import React, { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import "../../App.css";
import {
  UserOutlined,
  DashboardOutlined,
  PlayCircleOutlined,
  HeartOutlined,
  HistoryOutlined,
  EditOutlined,
  LeftSquareOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DingdingOutlined,
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
import logo from "../../assets/LOGO.png";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const ROUTE_KEY_MAP: Record<string, string> = {
  "/partner/rider": "riderdashboard",
  "/riderwork": "riderwork",
  "/partner/riderhistories": "partner/riderhistories",
  "/riderprofile": "riderprofile",
};

// --- แก้ KEY_TITLE_MAP ให้ key ตรงชื่อ ---
const KEY_TITLE_MAP: Record<string, string> = {
  riderdashboard: "แดชบอร์ด",
  riderwork: "การจัดส่ง",
  riderworkhistories: "ประวัติการจัดส่ง",
  riderprofile: "โปรไฟล์",
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

  // --- แก้ selectedKey: เช็คอันเฉพาะเจาะจงก่อน ---
  const selectedKey = useMemo(() => {
    const clean = location.pathname.replace(/\/+$/, "");
    if (clean.startsWith("/partner/rider/histories")) return "riderworkhistories";
    if (clean.startsWith("/partner/rider/work")) return "riderwork";
    if (clean.startsWith("/partner/rider/profile")) return "riderprofile";
    if (clean.startsWith("/partner/rider")) return "riderdashboard";
    return "riderdashboard";
  }, [location.pathname]);

  // เมนูแบบเปิดหมด (UI อย่างเดียว ไม่เช็ค role) //แก้ path ตรงนี้
  const menuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "riderdashboard",
        icon: <DashboardOutlined style={{ fontSize: 18 }} />,
        label: "แดชบอร์ด",
        onClick: () => navigate("/partner/rider"),
      },
      {
        key: "riderwork",
        icon: <DingdingOutlined style={{ fontSize: 18 }} />,
        label: "การจัดส่ง",
        onClick: () => navigate("/partner/rider/work"),
      },
      {
        key: "riderworkhistories",
        icon: <HistoryOutlined style={{ fontSize: 18 }} />,
        label: "ประวัติการจัดส่ง",
        onClick: () => navigate("/partner/rider/histories"),
      },
      {
        key: "riderprofile",
        icon: <UserOutlined style={{ fontSize: 18 }} />,
        label: "โปรไฟล์",
        onClick: () => navigate("/partner/rider/profile"),
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
                  <DingdingOutlined /> Rider System
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
      </Layout>
    </Layout>
  );
};

export default RiderLayout;
