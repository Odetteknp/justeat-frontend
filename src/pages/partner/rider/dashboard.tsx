import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Spin,
  Button,
  Avatar,
  Typography,
  message,
  Statistic,
  Space,
  Tag,
  List,
  Empty,
  Divider,
} from "antd";
import {
  UserOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

/* ---------------- Types ---------------- */
type OrderStatus = "PENDING" | "PICKED_UP" | "DELIVERED" | "CANCELLED";

interface DashboardSummary {
  todayTrips: number;
  todayEarnings: number; // THB
  onlineMinutes: number; // นาทีที่ออนไลน์วันนี้
  rating?: number;       // คะแนนเฉลี่ยไรเดอร์ (ถ้ามี)
}

interface RecentWork {
  workId: string;
  orderId: string;
  when: string;          // ISO เวลาเสร็จงาน/อัปเดตล่าสุด
  fareTHB: number;
  status: OrderStatus;
  pickupName: string;
  dropoffName: string;
}

/* โปรไฟล์ย่อสำหรับแสดงบน Dashboard */
type RiderProfileSummary = {
  firstName: string;
  lastName: string;
  phone: string;
  vehicleType?: "motorcycle" | "car" | "bicycle";
  licensePlate?: string;
  zone?: string;
  // serviceStart?: string;
  // serviceEnd?: string;
  avatarUrl?: string;
};

/* ---------------- Helper UI ---------------- */
const statusTag = (s: OrderStatus) => {
  switch (s) {
    case "PENDING": return <Tag color="gold">รอรับงาน</Tag>;
    case "PICKED_UP": return <Tag color="blue">รับของแล้ว</Tag>;
    case "DELIVERED": return <Tag color="green">ส่งสำเร็จ</Tag>;
    case "CANCELLED": return <Tag color="red">ยกเลิก</Tag>;
    default: return <Tag>—</Tag>;
  }
};

const vehicleLabel = (v?: RiderProfileSummary["vehicleType"]) =>
  v === "motorcycle" ? "มอเตอร์ไซค์" : v === "car" ? "รถยนต์" : v === "bicycle" ? "จักรยาน" : "-";

/* ---------------- Mock API ---------------- */
async function fetchDashboardData(signal?: AbortSignal): Promise<{
  summary: DashboardSummary;
  recentWorks: RecentWork[];
}> {
  await new Promise((r) => setTimeout(r, 500));
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const now = dayjs();
  const recent: RecentWork[] = Array.from({ length: 5 }).map((_, i) => ({
    workId: `w_${990 + i}`,
    orderId: `ODR10${200 + i}`,
    when: now.subtract(i + 1, "hour").toISOString(),
    fareTHB: 35 + (i % 4) * 10,
    status: (["DELIVERED", "DELIVERED", "DELIVERED", "CANCELLED"] as OrderStatus[])[i % 4],
    pickupName: `ร้าน #${(i % 6) + 1}`,
    dropoffName: `ลูกค้า #${(i % 8) + 1}`,
  }));

  return {
    summary: {
      todayTrips: 7,
      todayEarnings: 355,
      onlineMinutes: 198,
      rating: 4.9,
    },
    recentWorks: recent,
  };
}

async function fetchRiderProfileSummary(signal?: AbortSignal): Promise<RiderProfileSummary> {
  await new Promise((r) => setTimeout(r, 300));
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  return {
    firstName: "สมชาย",
    lastName: "ใจดี",
    phone: "0812345678",
    vehicleType: "motorcycle",
    licensePlate: "กทม-1234",
    zone: "ประตู 4",
    avatarUrl: "",
  };
}

/* ---------------- Component ---------------- */
const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [messageApi, contextHolder] = message.useMessage();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentWorks, setRecentWorks] = useState<RecentWork[]>([]);
  const [profile, setProfile] = useState<RiderProfileSummary | null>(null);

  const navigate = useNavigate();
  const abortRef = useRef<AbortController | null>(null);

  const handleStartWork = () => {
    navigate("/partner/rider/work");
  };

  const loadAll = async () => {
    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);

      const res = await fetchDashboardData(controller.signal);
      setSummary(res.summary);
      setRecentWorks(res.recentWorks);

      const p = await fetchRiderProfileSummary(controller.signal);
      setProfile(p);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error(err);
      messageApi.error("โหลดข้อมูลแดชบอร์ดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    return () => abortRef.current?.abort();
  }, []);

  const onlineHhmm = useMemo(() => {
    if (!summary) return "—";
    const h = Math.floor(summary.onlineMinutes / 60);
    const m = summary.onlineMinutes % 60;
    return `${h} ชม. ${m} นาที`;
  }, [summary]);

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", width: "100%", paddingBottom: 24 }}>
      {contextHolder}

      {/* Header */}
      <Card
        style={{
          background: "rgb(239, 102, 75)",
          color: "white",
          marginBottom: 16,
          borderRadius: 16,
        }}
      >
        <Row align="middle" gutter={[16, 16]}>
          <Col>
            <Avatar
              size={64}
              icon={<DashboardOutlined />}
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            />
          </Col>

          <Col flex="1">
            <Title level={2} style={{ color: "white", margin: 0 }}>
              แดชบอร์ดไรเดอร์
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
              เริ่มงานเพื่อไปรับงาน หรือดูโปรไฟล์ของคุณด้านซ้ายมือ
            </Text>
          </Col>

          <Col>
            <Space wrap>
              <Button
                onClick={handleStartWork}
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                style={{
                  fontSize: 16,
                  background: "rgb(64, 212, 106)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: 8,
                }}
              >
                เริ่มทำงาน
              </Button>
              <Button size="large" icon={<ReloadOutlined />} onClick={loadAll}>
                รีเฟรช
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Content */}
      <Spin spinning={loading} size="large">
        <Row gutter={[16, 16]} style={{ padding: "0 12px" }}>
          {/* KPI */}
          <Col xs={24} sm={12} md={6}>
            <Card bordered>
              <Statistic title="งานวันนี้ (คำสั่งซื้อ)" value={summary?.todayTrips ?? 0} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered>
              <Statistic title="รายได้วันนี้ (฿)" value={summary?.todayEarnings ?? 0} precision={0} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered>
              <Statistic title="ออนไลน์วันนี้" value={onlineHhmm} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered>
              <Statistic title="คะแนนเฉลี่ย" value={summary?.rating ?? 0} precision={1} />
            </Card>
          </Col>
        </Row>

        {/* ซ้าย: โปรไฟล์, ขวา: งานล่าสุด */}
        <Row gutter={[16, 16]} style={{ padding: "0 12px", marginTop: 8 }}>
          <Col xs={24} lg={12}>
            <Card
              title="โปรไฟล์ไรเดอร์"
              bordered
              extra={
                <Button type="primary" onClick={() => navigate("/partner/rider/profile")}>
                  แก้ไขโปรไฟล์
                </Button>
              }
            >
              {profile ? (
                <>
                  <Space align="start">
                    <Avatar size={64} icon={<UserOutlined />} src={profile.avatarUrl || undefined} />
                    <div>
                      <Title level={4} style={{ margin: 0 }}>
                        {profile.firstName} {profile.lastName}
                      </Title>
                      <Text type="secondary">{profile.phone}</Text>
                    </div>
                  </Space>

                  <Divider style={{ margin: "12px 0" }} />

                  <Row gutter={[12, 8]}>
                    <Col xs={24} md={12}>
                      <Text type="secondary">ยานพาหนะ</Text>
                      <div>
                        {vehicleLabel(profile.vehicleType)}{" "}
                        {profile.licensePlate ? `• ${profile.licensePlate}` : ""}
                      </div>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text type="secondary">โซนประจำ</Text>
                      <div>{profile.zone || "-"}</div>
                    </Col>
                  </Row>
                </>
              ) : (
                <Empty description="ไม่พบข้อมูลโปรไฟล์" />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title="งานล่าสุด"
              bordered
              extra={
                <Button type="primary" onClick={() => navigate("/partner/rider/histories")}>
                  ประวัติการจัดส่ง
                </Button>
              }
            >
              {recentWorks.length ? (
                <List
                  itemLayout="horizontal"
                  dataSource={recentWorks}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text strong>{item.orderId}</Text>
                            {statusTag(item.status)}
                          </Space>
                        }
                        description={
                          <>
                            <div>
                              <Text type="secondary">เมื่อ:</Text>{" "}
                              {dayjs(item.when).format("YYYY-MM-DD HH:mm")}
                            </div>
                            <div>
                              <Text type="secondary">จาก:</Text> {item.pickupName}{" "}
                              <Text type="secondary">→ ถึง:</Text> {item.dropoffName}
                            </div>
                          </>
                        }
                      />
                      <div>
                        <Text strong>{item.fareTHB.toLocaleString("th-TH")} ฿</Text>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="ยังไม่มีประวัติงานล่าสุด" />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;
