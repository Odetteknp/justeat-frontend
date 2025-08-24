import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRider } from "../../../../context/RiderContext";
import { riderWorkApi } from "../../../../services/riderWorkApi";
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
  Badge,
} from "antd";
import {
  UserOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  FieldTimeOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
// import axios from "axios"; // <- ใช้เมื่อเชื่อม backend จริง

const { Title, Text } = Typography;

/** ========= Types & Status ========= */
type RiderWorkStatusCode =
  | "QUEUED"        // อยู่ในคิว (ยังไม่ถูกมอบหมาย)
  | "ASSIGNED"      // มอบหมายให้ไรเดอร์นี้แล้ว แต่ยังไม่กดเริ่ม
  | "IN_PROGRESS"   // ไรเดอร์กดเริ่มทำงานแล้ว
  | "COMPLETED"     // ส่งสำเร็จ
  | "CANCELLED";    // ยกเลิก

type RiderWork = {
  id: number;
  created_at: string;  // from gorm.Model
  updated_at: string;
  deleted_at?: string | null;
  work_at?: string | null;
  finish_at?: string | null;
  order_id: number;    // FK
  rider_id: number;    // FK (ปกติดึงจาก auth/me)
  rider_work_status_id: number; // FK -> ตาราง status
  // สำหรับ frontend เราเก็บ code & label ไว้ใช้แสดง
  status_code: RiderWorkStatusCode;
  status_label: string;

  // ---- ข้อมูลสังเคราะห์เพื่อโชว์ (มาจาก join order) ----
  order_code?: string;
  customer_name?: string;
  restaurant_name?: string;
  pickup_address?: string;
  dropoff_address?: string;
  estimate_distance_km?: number;
  estimate_fee?: number;
};

/** ========= Mock Service (เปลี่ยนเป็น axios ได้ทันที) ========= */
// แนวคิด endpoint ที่ควรมีในอนาคต:
// GET    /api/rider/works/active              -> งานที่ถืออยู่ 0..1
// POST   /api/rider/works/pull-next           -> ดึงงานถัดไป (assign ให้ไรเดอร์)
// POST   /api/rider/works/:id/start           -> เปลี่ยนเป็น IN_PROGRESS + set work_at
// POST   /api/rider/works/:id/complete        -> เปลี่ยนเป็น COMPLETED + set finish_at
// GET    /api/rider/works/queue-count         -> จำนวนคิวรอ (สำหรับ badge เล็ก ๆ)
// * ระบบจริงควร auth ด้วย token เพื่อรู้ rider_id ฝั่ง server

const mockQueue: RiderWork[] = [
  {
    id: 101,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_id: 5001,
    rider_id: 1,
    rider_work_status_id: 1,
    status_code: "ASSIGNED",
    status_label: "มอบหมายแล้ว",
    order_code: "ORD-5001",
    customer_name: "คุณเอ",
    restaurant_name: "ร้านกะเพราไฟลุก",
    pickup_address: "ซอย A เขต B",
    dropoff_address: "คอนโด C ชั้น 12",
    estimate_distance_km: 5.3,
    estimate_fee: 42,
  },
  {
    id: 102,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_id: 5002,
    rider_id: 1,
    rider_work_status_id: 1,
    status_code: "ASSIGNED",
    status_label: "มอบหมายแล้ว",
    order_code: "ORD-5002",
    customer_name: "คุณบี",
    restaurant_name: "ข้าวมันไก่ป้าศรี",
    pickup_address: "ตลาด X",
    dropoff_address: "หมู่บ้าน Y",
    estimate_distance_km: 3.2,
    estimate_fee: 35,
  },
];

const mockApi = {
  getActive: async (): Promise<RiderWork | null> => {
    // สมมติไม่มีงานค้างถืออยู่
    return null;
  },
  pullNext: async (): Promise<RiderWork | null> => {
    await new Promise((r) => setTimeout(r, 400));
    const next = mockQueue.shift() || null;
    return next;
  },
  startWork: async (id: number): Promise<void> => {
    await new Promise((r) => setTimeout(r, 250));
  },
  completeWork: async (id: number): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300));
  },
  getQueueCount: async (): Promise<number> => {
    return mockQueue.length;
  },
};

/** ========= UI Helpers ========= */
function StatusTag({ code }: { code: RiderWorkStatusCode }) {
  switch (code) {
    case "ASSIGNED":
      return <Tag color="blue">มอบหมายแล้ว</Tag>;
    case "IN_PROGRESS":
      return <Tag color="gold">กำลังจัดส่ง</Tag>;
    case "COMPLETED":
      return <Tag color="green">สำเร็จ</Tag>;
    case "CANCELLED":
      return <Tag color="red">ยกเลิก</Tag>;
    default:
      return <Tag>รอคิว</Tag>;
  }
}

const RiderWork: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { isWorking, setWorking, currentWork, setCurrentWork, queueCount, setQueueCount } = useRider();
  const [messageApi, contextHolder] = message.useMessage();

  const pollingRef = useRef<number | null>(null);
  const isPullingRef = useRef<boolean>(false);

  const canPullMore = useMemo(() => isWorking && !currentWork, [isWorking, currentWork]);

  const refreshQueueCount = async () => {
    try { setQueueCount(await riderWorkApi.getQueueCount()); } catch {}
  };

  const pullNextIfAny = async () => {
    if (!canPullMore || isPullingRef.current) return;
    isPullingRef.current = true;
    try {
      setLoading(true);
      const work = await riderWorkApi.pullNext();
      if (work) {
        setCurrentWork(work);
        messageApi.info("ได้รับงานใหม่แล้ว!");
      }
      await refreshQueueCount();
    } catch { messageApi.error("ดึงงานถัดไปไม่สำเร็จ"); }
    finally { setLoading(false); isPullingRef.current = false; }
  };

  const handleToggleWorking = async () => {
    if (isWorking) {
      setWorking(false);
      messageApi.warning("โหมดพักงาน");
    } else {
      setWorking(true);
      messageApi.success("พร้อมรับงาน 🚀");
    }
  };

  const handleStart = async () => {
    if (!currentWork) return;
    try {
      setLoading(true);
      await riderWorkApi.startWork(currentWork.id);
      setCurrentWork({
        ...currentWork,
        status_code: "IN_PROGRESS",
        status_label: "กำลังจัดส่ง",
        work_at: new Date().toISOString(),
      });
      messageApi.success("เริ่มงานแล้ว");
    } catch { messageApi.error("เริ่มงานไม่สำเร็จ"); }
    finally { setLoading(false); }
  };

  const handleComplete = async () => {
    if (!currentWork) return;
    try {
      setLoading(true);
      await riderWorkApi.completeWork(currentWork.id);
      messageApi.success(`งาน #${currentWork.order_code || currentWork.id} เสร็จแล้ว ✅`);
      setCurrentWork(null); // ให้ polling ดึงงานถัดไปต่อเอง
      await refreshQueueCount();
    } catch { messageApi.error("ปิดงานไม่สำเร็จ"); }
    finally { setLoading(false); }
  };

  useEffect(() => { // โหลดงานค้าง + นับคิว ตอนเข้าเพจ
    (async () => {
      setLoading(true);
      try {
        const active = await riderWorkApi.getActive();
        setCurrentWork(active);
        await refreshQueueCount();
      } finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { // polling
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    if (isWorking && !currentWork) {
      pullNextIfAny(); // ดึงทันที
      pollingRef.current = window.setInterval(() => { pullNextIfAny(); }, 3000);
    }
    return () => { if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWorking, currentWork]);

  return (
    <div
      style={{
        backgroundColor: "white",
        height: "100%", // ให้เต็มหน้าจอจริง
        width: "100%",
        paddingBottom: 32,
      }}
    >
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
            <Title level={2} style={{ color: "white", margin: 0 }}>
              การจัดส่ง 🛵
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.95)", fontSize: 16 }}>
              {isWorking
                ? "กำลังรอรับงานอัตโนมัติ… (รับได้ครั้งละ 1 งาน)"
                : "กด “เริ่มทำงาน” เพื่อเริ่มรับงานอัตโนมัติ"}
            </Text>
          </Col>

          <Col>
            <Space>
              <Badge count={queueCount} title="จำนวนคิวรอ" offset={[0, 8]}>
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
                  }}
                >
                  {isWorking ? "หยุดทำงาน" : "เริ่มทำงาน"}
                </Button>
              </Badge>
            </Space>
          </Col>
        </Row>
      </Card>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 16px" }}>
        {/* แสดงงานปัจจุบัน (ถ้ามี) */}
        {currentWork ? (
          <Card
            title={
              <Space>
                <ThunderboltOutlined />
                <span>งานปัจจุบัน</span>
                <StatusTag code={currentWork.status_code} />
              </Space>
            }
            bordered
            style={{ borderRadius: 14 }}
            extra={
              <Space>
                {currentWork.status_code === "ASSIGNED" && (
                  <Button
                    type="primary"
                    icon={<FieldTimeOutlined />}
                    onClick={handleStart}
                  >
                    เริ่มงาน
                  </Button>
                )}
                {currentWork.status_code === "IN_PROGRESS" && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={handleComplete}
                  >
                    ส่งสำเร็จ
                  </Button>
                )}
              </Space>
            }
          >
            <Row gutter={[16, 8]}>
              <Col span={24}>
                <Space wrap>
                  <Tag>Order: {currentWork.order_code || currentWork.order_id}</Tag>
                  <Tag>{currentWork.restaurant_name}</Tag>
                  <Tag>{currentWork.customer_name}</Tag>
                </Space>
              </Col>
              <Col span={24}>
                <Text strong>รับของ:</Text>{" "}
                <Text>{currentWork.pickup_address || "-"}</Text>
              </Col>
              <Col span={24}>
                <Text strong>ส่งที่:</Text>{" "}
                <Text>{currentWork.dropoff_address || "-"}</Text>
              </Col>
              <Col span={24}>
                <Space wrap>
                  <Tag>ระยะทาง ~ {currentWork.estimate_distance_km ?? "-"} km</Tag>
                  <Tag>ค่าส่ง ~ {currentWork.estimate_fee ?? "-"} ฿</Tag>
                </Space>
              </Col>
              <Col span={24}>
                <Divider style={{ margin: "8px 0" }} />
                <Space direction="vertical" size={4}>
                  <Text type="secondary">
                    มอบหมายเมื่อ:{" "}
                    {new Date(currentWork.created_at).toLocaleString()}
                  </Text>
                  {currentWork.work_at && (
                    <Text type="secondary">
                      เริ่มงาน: {new Date(currentWork.work_at).toLocaleString()}
                    </Text>
                  )}
                  {currentWork.finish_at && (
                    <Text type="secondary">
                      สำเร็จ: {new Date(currentWork.finish_at).toLocaleString()}
                    </Text>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        ) : (
          <Card style={{ borderRadius: 14 }}>
            <Text style={{ fontSize: 16 }}>
              {isWorking
                ? "กำลังรอรับงานใหม่อัตโนมัติ…"
                : "ยังไม่พร้อมรับงาน กด “เริ่มทำงาน” เพื่อเริ่มรับงาน"}
            </Text>
          </Card>
        )}
      </div>

      {/* Overlay โหลด */}
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 999,
          }}
        >
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default RiderWork;
