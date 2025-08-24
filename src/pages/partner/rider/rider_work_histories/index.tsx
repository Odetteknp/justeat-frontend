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
  PlayCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const RiderWorkHistories: React.FC = () => {

  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [isWorking, setIsWorking] = useState(false); // << สถานะทำงาน
  const [messageApi, contextHolder] = message.useMessage();
  
  const handleToggleWorking = () => {
    if (isWorking) {
      // จากกำลังทำงาน -> หยุดทำงาน
      setIsWorking(false);
      messageApi.warning("เดโม UI: ปุ่มหยุดทำงาน แสดงผล(ไม่มีการลบข้อมูล)");
    } else {
      // จากยังไม่ทำงาน -> เริ่มทำงาน
      setIsWorking(true);
      messageApi.success("เดโม UI: ปุ่มเริ่มทำงาน แสดงผล(ไม่มีการลบข้อมูล)");
    }
  };

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
          background: "rgb(54, 164, 197)",
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
            <Title level={1} style={{ color: "white", margin: 0 }}>
              ประวัติการจัดส่ง, {/*{username}*/}! 🎵                                        {/*เอาชื่อ rider มาใส่ตรงนี้ด้วย*/}
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 20 }}>
              แก้ไขโปรไฟล์ได้ที่นี่! 🚀 {/*{isWorking ? "หยุดทำงาน" : "เริ่มทำงาน"}*/}
            </Text>
          </Col>
          <Col>
            <Button
              onClick={handleToggleWorking}
              type="primary"
              size="large"
              icon={isWorking ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              style={{
                fontSize: 18,
                background: isWorking ? "rgb(232, 81, 81)" : "rgb(64, 212, 106)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                marginRight: 16,
              }}
              className="start-working-button"
            >
              {isWorking ? "หยุดทำงาน" : "เริ่มทำงาน"}
            </Button>
          </Col>
        </Row>
      </Card>
      <p>หน้านี้เป็น ประวัติการจัดส่งทั้งหมด พื้นหลังสีขาวเต็มหน้าจอ</p>
    </div>
  );
};

export default RiderWorkHistories;
