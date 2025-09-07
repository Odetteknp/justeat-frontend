import React, { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import "../../App.css";
import {
  ArrowLeftOutlined
} from "@ant-design/icons";

import {
  Layout,
  theme,
  message,
  Typography,
  Avatar,
} from "antd";

const { Header, Content,  } = Layout;
const { Title,  } = Typography;

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

  // const GoMainPage = () => {
  //   setTimeout(() => navigate("/"), 200);
  // };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      {contextHolder}

      {/*---Header Section---*/}
      <Layout><Header
        style={{
          padding: "0 24px",
          backgroundColor: "rgb(239, 102, 75)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",   //  ดันให้อยู่ชิดซ้าย
          gap: "12px",                    //  เพิ่มระยะห่างระหว่างลูกศรกับข้อความ
        }}
      >
        <Avatar
          onClick={() => navigate(-1)} // กลับไปหน้าก่อนหน้า => cart
          size={42}
          icon={<ArrowLeftOutlined />}
          style={{
            cursor: "pointer",
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        />
        <Title level={4} style={{ margin: 0, color: "white" }}>
          {KEY_TITLE_MAP[selectedKey] || "ข้อมูลการชำระเงิน"}
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
