import React, { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "../../App.css";
import { ArrowLeftOutlined } from "@ant-design/icons";

import {
  Layout,
  message,
  Typography,
  Avatar,
  Spin,
  Result,
  Space,
  Button,
} from "antd";

import { useAuthGuard } from "../../hooks/useAuthGuard";

const { Header, Content } = Layout;
const { Title } = Typography;

// --- key -> title
const KEY_TITLE_MAP: Record<string, string> = {
  payment: "ข้อมูลการชำระเงิน",
};

const PaymentLayout: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();

  // บังคับให้ “ต้องล็อกอินก่อน” และอนุญาตเฉพาะ role ที่กำหนด
  //   - ถ้า status=401 (ไม่ล็อกอิน/หมดอายุ) ให้แสดงปุ่มไปหน้า Login
  //   - ถ้า status=403 (ไม่มีสิทธิ์) ให้แสดงปุ่มกลับหน้าหลัก
  const guard = useAuthGuard(["customer", "admin"], {   //ใส่ Admin เทสไปก่อน
    autoRedirect: false,
    redirectDelayMs: 0,
    redirectTo: { unauthorized: "/login", forbidden: "/" },
  });

  const selectedKey = "payment";

  // ระหว่างเช็คสิทธิ์
  if (guard.loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {contextHolder}
        <Spin tip="กำลังตรวจสอบสิทธิ์..." size="large" />
      </div>
    );
  }

  // ไม่ผ่านสิทธิ์
  if (!guard.allowed) {
    const is401 = guard.status === 401; // ยังไม่ล็อกอิน / token หมดอายุ
    return (
      <>
        {contextHolder}
        <Result
          status={is401 ? "warning" : "403"}
          title={is401 ? "กรุณาเข้าสู่ระบบ" : "ไม่มีสิทธิ์เข้าหน้านี้"}
          subTitle={
            is401
              ? "บัญชีของคุณยังไม่เข้าสู่ระบบ หรือเซสชันหมดอายุ"
              : "หน้านี้อนุญาตเฉพาะผู้ใช้ที่มีสิทธิ์เท่านั้น"
          }
          extra={
            <Space>
              {is401 ? (
                <Button
                  type="primary"
                  onClick={() => navigate("/login")}
                >
                  ไปหน้าเข้าสู่ระบบ
                </Button>
              ) : (
                <Button type="primary" onClick={() => navigate("/")}>
                  กลับหน้าหลัก
                </Button>
              )}
            </Space>
          }
        />
      </>
    );
  }

  // ผ่านสิทธิ์ — แสดงหน้า Payment ตามปกติ
  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      {contextHolder}

      {/*---Header Section---*/}
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            backgroundColor: "rgb(239, 102, 75)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "12px",
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