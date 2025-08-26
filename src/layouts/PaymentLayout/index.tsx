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
  "/payment": "payment",
};

// --- แก้ KEY_TITLE_MAP ให้ key ตรงชื่อ ---
const KEY_TITLE_MAP: Record<string, string> = {
  paymentinfo: "ข้อมูลการชำระเงิน",
};

const PaymentLayout: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // --- แก้ selectedKey: เช็คอันเฉพาะเจาะจงก่อน ---
  const selectedKey = useMemo(() => {
    const clean = location.pathname.replace(/\/+$/, "");
    if (clean.startsWith("/payment")) return "payment";
    return "payment";
  }, [location.pathname]);

  const GoMainPage = () => {
    // โหมด UI อย่างเดียว: แค่โชว์ข้อความเฉย ๆ ไม่ลบข้อมูล/redirect
    messageApi.success("เดโม UI: กำลังกลับไปหน้าหลัก... (ไม่มีการลบข้อมูล)");
    setTimeout(() => {
      navigate("/");      // ไปหน้าหลัก
    }, 500);
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      {contextHolder}

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
            {KEY_TITLE_MAP[selectedKey] || "ชำระเงิน"}
          </Title>
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

export default PaymentLayout;
