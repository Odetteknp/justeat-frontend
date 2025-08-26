import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Button,
  Avatar,
  Typography,
  message,
} from "antd";

import {
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminProfile: React.FC = () => {

  const [messageApi, contextHolder] = message.useMessage();

  //ใส่ไว้เผื่อต้องโหลด Backend หรือข้อมูลอื่น ๆ จะได้ Spin หมุนรอ
  /*if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }*/

  return (

    <div
      style={{
        backgroundColor: "white",
        height: "100%",   // กินเต็มความสูงหน้าจอ
        width: "100%",        // กินเต็มความกว้าง
      }}
    >

      {/* ต้องใส่ไว้ตรงนี้ เพื่อให้ message ทำงานได้ */}
      {contextHolder}

      <Card
              style={{
                background: "rgb(239, 102, 75)",
                color: "white",
                marginBottom: 24,
                borderRadius: 16,
              }}
            >
        <Row align="middle" gutter={24}>
          <Col>
            <Avatar
              size={64}
              icon={<UserOutlined />}
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            />
          </Col>

          <Col flex="1">
            <Title level={2} style={{ color: "white", margin: 0 }}>
                แอดมิน, {/*{username}*/}! 🎵                                        {/*เอาชื่อ rider มาใส่ตรงนี้ด้วย*/}
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
              เริ่มต้นการจัดส่งกดที่ปุ่ม "เริ่มทำงาน" เลย! 🚀 {/*{isWorking ? "หยุดทำงาน" : "เริ่มทำงาน"}*/}
            </Text>
          </Col>
        </Row>
      </Card>
      <p>หน้านี้เป็น แดชบอร์ด พื้นหลังสีขาวเต็มหน้าจอ</p>
    </div>
  );
};

export default AdminProfile;
