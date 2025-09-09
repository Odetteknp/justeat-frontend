// src/pages/rider/RiderWork.tsx
import React, { useEffect, useState } from "react";
import { riderWorkApi, type AvailableOrder } from "../../../services/riderWorkApi";
import {
  Card,
  Row,
  Col,
  Spin,
  Button,
  Avatar,
  Typography,
  message,
  Tag,
  Space,
  Divider,
  List,
  Statistic,
  Drawer,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  DingdingOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

type RiderWorkStatus = "ASSIGNED" | "COMPLETED";
type CurrentWork = {
  orderId: number;
  status: RiderWorkStatus;
  // รายละเอียดที่มาจาก available list
  restaurantName?: string;
  customerName?: string;
  address?: string;
  total?: number;
  createdAt?: string;
};

function StatusTag({ code }: { code: RiderWorkStatus }) {
  switch (code) {
    case "ASSIGNED":
      return <Tag color="blue">กำลังจัดส่ง</Tag>;
    case "COMPLETED":
      return <Tag color="green">สำเร็จ</Tag>;
    default:
      return null;
  }
}

function THB(n?: number) {
  if (typeof n !== "number") return "-";
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);
}

export default function RiderWork() {
  const [isWorking, setIsWorking] = useState(false);
  const [currentWork, setCurrentWork] = useState<CurrentWork | null>(null);
  const [available, setAvailable] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(false);       // ปุ่มหลัก
  const [listLoading, setListLoading] = useState(false); // ลิสต์งานว่าง
  const [detailOpen, setDetailOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const refreshAvailable = async () => {
    try {
      setListLoading(true);
      const items = await riderWorkApi.getAvailable();
      setAvailable(items);
    } catch (e: any) {
      messageApi.error(e?.response?.data?.error || "โหลดงานว่างไม่สำเร็จ");
    } finally {
      setListLoading(false);
    }
  };

  const toggleWorking = async () => {
    try {
      setLoading(true);
      if (isWorking) {
        await riderWorkApi.setAvailability("OFFLINE");
        setIsWorking(false);
        setAvailable([]);
        messageApi.warning("โหมดพักงาน");
      } else {
        await riderWorkApi.setAvailability("ONLINE");
        setIsWorking(true);
        messageApi.success("พร้อมรับงาน 🚀");
        await refreshAvailable();
      }
    } catch (e: any) {
      messageApi.error(e?.response?.data?.error || "เปลี่ยนสถานะไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // รับงานจากรายการ (พกข้อมูลเต็ม ๆ มาด้วย เพื่อโชว์รายละเอียดทันที)
  const handleAccept = async (it: AvailableOrder) => {
    try {
      setLoading(true);
      await riderWorkApi.accept(it.id);
      setCurrentWork({
        orderId: it.id,
        status: "ASSIGNED",
        restaurantName: it.restaurantName,
        customerName: it.customerName,
        address: it.address,
        total: it.total,
        createdAt: it.createdAt,
      });
      setAvailable((prev) => prev.filter((x) => x.id !== it.id));
      messageApi.success(`รับงาน #${it.id} แล้ว`);
      setDetailOpen(true); // เปิดรายละเอียดทันที
    } catch (e: any) {
      messageApi.error(e?.response?.data?.error || "รับงานไม่สำเร็จ");
      refreshAvailable(); // เผื่อโดนแย่งงาน
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!currentWork) return;
    try {
      setLoading(true);
      await riderWorkApi.complete(currentWork.orderId);
      messageApi.success(`งาน #${currentWork.orderId} เสร็จแล้ว ✅`);
      setCurrentWork(null);
      setDetailOpen(false);
      if (isWorking) refreshAvailable();
    } catch (e: any) {
      messageApi.error(e?.response?.data?.error || "ปิดงานไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isWorking && !currentWork) {
      refreshAvailable();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWorking, currentWork]);

  return (
    <div style={{ backgroundColor: "white", height: "100%", width: "100%", paddingBottom: 32 }}>
      {contextHolder}

      {/* Header card เดิม */}
      <Card style={{ background: "rgb(239, 102, 75)", color: "white", marginBottom: 24, borderRadius: 16 }}>
        <Row align="middle" gutter={24}>
          <Col>
            <Avatar size={64} icon={<DingdingOutlined />} style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
          </Col>
          <Col flex="1">
            <Title level={2} style={{ color: "white", margin: 0 }}>การจัดส่ง 🛵</Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.95)", fontSize: 16 }}>
              {isWorking ? "ออนไลน์: เลือกรับงานจากรายการด้านล่าง (รับได้ครั้งละ 1 งาน)" : "กด “เริ่มทำงาน” เพื่อออนไลน์"}
            </Text>
          </Col>
          <Col>
            <Button
              onClick={toggleWorking}
              type="primary"
              size="large"
              icon={isWorking ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              loading={loading}
              style={{
                fontSize: 18,
                background: isWorking ? "rgb(232, 81, 81)" : "rgb(64, 212, 106)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
              }}
            >
              {isWorking ? "หยุดทำงาน" : "เริ่มทำงาน"}
            </Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading} size="large">
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 16px" }}>
          {/* งานปัจจุบัน */}
          {currentWork ? (
            <Card
              title={
                <Space>
                  <ThunderboltOutlined />
                  <span>งานปัจจุบัน</span>
                  <StatusTag code={currentWork.status} />
                </Space>
              }
              bordered
              style={{ borderRadius: 14, marginBottom: 16 }}
              extra={
                <Space>
                  <Button onClick={() => setDetailOpen(true)}>ดูรายละเอียด</Button>
                  <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleComplete} disabled={loading}>
                    ส่งสำเร็จ
                  </Button>
                </Space>
              }
            >
              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Space wrap>
                    <Tag>Order: {currentWork.orderId}</Tag>
                    {currentWork.restaurantName && <Tag color="purple">{currentWork.restaurantName}</Tag>}
                    {currentWork.customerName && <Tag color="cyan">{currentWork.customerName}</Tag>}
                  </Space>
                </Col>
                <Col span={24}>
                  <Divider style={{ margin: "8px 0" }} />
                  <Space direction="vertical" size={4}>
                    {currentWork.address && <Text>ที่จัดส่ง: {currentWork.address}</Text>}
                    <Text type="secondary">สถานะล่าสุด: {currentWork.status}</Text>
                    {currentWork.createdAt && (
                      <Text type="secondary">รับเมื่อ: {new Date(currentWork.createdAt).toLocaleString()}</Text>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          ) : (
            // ออนไลน์ + ยังไม่มีงานในมือ -> แสดง "งานว่าง"
            isWorking ? (
              <Card style={{ borderRadius: 14 }}>
                <Row align="middle" justify="space-between" style={{ marginBottom: 8 }}>
                  <Col><Title level={4} style={{ margin: 0 }}>งานว่าง</Title></Col>
                  <Col>
                    <Button icon={<FieldTimeOutlined />} onClick={refreshAvailable} loading={listLoading}>
                      รีเฟรช
                    </Button>
                  </Col>
                </Row>

                <List
                  loading={listLoading}
                  dataSource={available}
                  locale={{ emptyText: "ยังไม่มีงานว่าง" }}
                  renderItem={(it) => (
                    <List.Item
                      key={it.id}
                      actions={[
                        <Button type="primary" onClick={() => handleAccept(it)} disabled={loading}>
                          รับงาน
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space size={8} wrap>
                            <Tag>#{it.id}</Tag>
                            <strong>{it.restaurantName}</strong>
                            <span>→ {it.customerName}</span>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={2}>
                            {it.address && <Text type="secondary">{it.address}</Text>}
                            <Text type="secondary">สร้างเมื่อ: {new Date(it.createdAt).toLocaleString()}</Text>
                          </Space>
                        }
                      />
                      <Statistic value={it.total} title="ยอดรวม" formatter={(v) => THB(Number(v))} />
                    </List.Item>
                  )}
                />
              </Card>
            ) : (
              <Card style={{ borderRadius: 14 }}>
                <Text style={{ fontSize: 16 }}>ยังไม่พร้อมรับงาน กด “เริ่มทำงาน” เพื่อออนไลน์</Text>
              </Card>
            )
          )}
        </div>
      </Spin>

      {/* Drawer รายละเอียดงานปัจจุบัน */}
      <Drawer
        title={`รายละเอียดงาน #${currentWork?.orderId ?? ""}`}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={420}
      >
        {currentWork ? (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Text strong>ร้านอาหาร: </Text>
              <Text>{currentWork.restaurantName ?? "-"}</Text>
            </div>
            <div>
              <Text strong>ชื่อลูกค้า: </Text>
              <Text>{currentWork.customerName ?? "-"}</Text>
            </div>
            <div>
              <Text strong>ที่อยู่จัดส่ง: </Text>
              <Text>{currentWork.address ?? "-"}</Text>
            </div>
            <div>
              <Text strong>ยอดรวม: </Text>
              <Text>{THB(currentWork.total)}</Text>
            </div>
            <div>
              <Text type="secondary">
                รับเมื่อ: {currentWork.createdAt ? new Date(currentWork.createdAt).toLocaleString() : "-"}
              </Text>
            </div>

            {/* NOTE:
              ถ้าต้องการแสดง "รายการเมนู" ด้วย
              - สร้าง/ใช้ endpoint ฝั่ง Rider เช่น GET /rider/works/:orderId/detail
                ให้คืน items ของออเดอร์นี้
              - แล้วค่อยดึงมาแสดงในส่วน Drawer นี้
            */}
          </Space>
        ) : (
          <Text type="secondary">ไม่มีข้อมูลงานปัจจุบัน</Text>
        )}
      </Drawer>
    </div>
  );
}
