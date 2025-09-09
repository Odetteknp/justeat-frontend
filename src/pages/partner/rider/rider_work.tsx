// src/pages/rider/RiderWork.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { riderWorkApi, type AvailableOrder } from "../../../services/riderWorkApi";
import { chatApi } from "../../../services/chatApi";
import {
  Card, Row, Col, Spin, Button, Avatar, Typography, message, Tag,
  Space, Divider, List, Statistic, Drawer, Tabs, Input
} from "antd";
import {
  PlayCircleOutlined, PauseCircleOutlined, CheckCircleOutlined,
  ThunderboltOutlined, DingdingOutlined, FieldTimeOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

type RiderWorkStatus = "ASSIGNED" | "COMPLETED";
type CurrentWork = {
  orderId: number;
  status: RiderWorkStatus;
  restaurantName?: string;
  customerName?: string;
  address?: string;
  total?: number;
  createdAt?: string;
};

function StatusTag({ code }: { code: RiderWorkStatus }) {
  switch (code) {
    case "ASSIGNED": return <Tag color="blue">กำลังจัดส่ง</Tag>;
    case "COMPLETED": return <Tag color="green">สำเร็จ</Tag>;
    default: return null;
  }
}
function THB(n?: number) {
  if (typeof n !== "number") return "-";
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);
}

/** ---------- Chat panel สำหรับออเดอร์ ---------- */
function OrderChat({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Awaited<ReturnType<typeof chatApi.listMessages>>>([]);
  const [input, setInput] = useState("");
  const [myId, setMyId] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [msgLoading, setMsgLoading] = useState(false);

  // โหลด user id ของเราเพื่อจัดแนวซ้าย/ขวา
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await (await import("../../../services/api")).api.get("/auth/me");
        if (!cancelled) setMyId(me.data?.id ?? me.data?.ID ?? null);
      } catch {
        setMyId(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const scrollToBottom = () => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const loadRoomAndMessages = async () => {
    setLoading(true);
    try {
      const rooms = await chatApi.listRooms();
      const room = rooms.find(r => r.orderId === orderId) || null;
      setRoomId(room?.id ?? null);
      if (room) {
        const msgs = await chatApi.listMessages(room.id);
        setMessages(msgs);
        setTimeout(scrollToBottom, 0);
      } else {
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // polling ข้อความทุก 3 วิ
  useEffect(() => {
    let timer: number | null = null;
    (async () => { await loadRoomAndMessages(); })();
    if (roomId) {
      timer = window.setInterval(async () => {
        setMsgLoading(true);
        try {
          const msgs = await chatApi.listMessages(roomId);
          setMessages(msgs);
        } finally {
          setMsgLoading(false);
        }
      }, 3000);
    }
    return () => { if (timer) window.clearInterval(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, roomId]);

  const onSend = async () => {
    const text = input.trim();
    if (!text || !roomId) return;
    try {
      setSending(true);
      await chatApi.sendMessage(roomId, text);
      setInput("");
      const msgs = await chatApi.listMessages(roomId);
      setMessages(msgs);
      setTimeout(scrollToBottom, 0);
    } finally {
      setSending(false);
    }
  };

  const rightIds = useMemo(() => new Set([myId ?? -1]), [myId]);

  return (
    <div>
      {loading ? (
        <Spin />
      ) : roomId ? (
        <>
          <div
            ref={listRef}
            style={{ height: 300, overflowY: "auto", padding: 8, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}
          >
            {messages.length === 0 && <Text type="secondary">ยังไม่มีข้อความ</Text>}
            {messages.map(m => {
              const isMe = rightIds.has(m.userSenderId);
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 6 }}>
                  <div
                    style={{
                      background: isMe ? "#1677ff" : "#f5f5f5",
                      color: isMe ? "#fff" : "inherit",
                      padding: "8px 12px",
                      borderRadius: 12,
                      maxWidth: "72%",
                    }}
                  >
                    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.body}</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4, textAlign: "right" }}>
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Space.Compact style={{ width: "100%", marginTop: 8 }}>
            <TextArea
              autoSize={{ minRows: 1, maxRows: 4 }}
              placeholder="พิมพ์ข้อความ…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) { e.preventDefault(); onSend(); }
              }}
              disabled={sending || msgLoading}
            />
            <Button type="primary" onClick={onSend} loading={sending} disabled={!input.trim()}>
              ส่ง
            </Button>
          </Space.Compact>
        </>
      ) : (
        <Space direction="vertical">
          <Text>ยังไม่มีห้องแชทสำหรับออเดอร์นี้</Text>
          <Button onClick={loadRoomAndMessages}>ลองอีกครั้ง</Button>
          {/* ถ้าจะให้สร้างห้องอัตโนมัติ แนะนำเพิ่ม BE endpoint: GET /chatrooms/ensure?orderId=xxx */}
        </Space>
      )}
    </div>
  );
}

/** ---------- หน้าไรเดอร์เดิม + ผนวกแชท ---------- */
export default function RiderWork() {
  const [isWorking, setIsWorking] = useState(false);
  const [currentWork, setCurrentWork] = useState<CurrentWork | null>(null);
  const [available, setAvailable] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
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
      setDetailOpen(true);
    } catch (e: any) {
      messageApi.error(e?.response?.data?.error || "รับงานไม่สำเร็จ");
      refreshAvailable();
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
              title={<Space><ThunderboltOutlined /><span>งานปัจจุบัน</span><StatusTag code={currentWork.status} /></Space>}
              bordered
              style={{ borderRadius: 14, marginBottom: 16 }}
              extra={
                <Space>
                  <Button onClick={() => setDetailOpen(true)}>ดูรายละเอียด/แชท</Button>
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
                        <Button type="primary" onClick={() => handleAccept(it)} disabled={loading}>รับงาน</Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={<Space size={8} wrap><Tag>#{it.id}</Tag><strong>{it.restaurantName}</strong><span>→ {it.customerName}</span></Space>}
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

      {/* Drawer: รายละเอียด + แชท */}
      <Drawer
        title={`ออเดอร์ #${currentWork?.orderId ?? ""}`}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={520}
      >
        {currentWork ? (
          <Tabs
            defaultActiveKey="detail"
            items={[
              {
                key: "detail",
                label: "รายละเอียด",
                children: (
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <div><Text strong>ร้านอาหาร: </Text><Text>{currentWork.restaurantName ?? "-"}</Text></div>
                    <div><Text strong>ชื่อลูกค้า: </Text><Text>{currentWork.customerName ?? "-"}</Text></div>
                    <div><Text strong>ที่อยู่จัดส่ง: </Text><Text>{currentWork.address ?? "-"}</Text></div>
                    <div><Text strong>ยอดรวม: </Text><Text>{THB(currentWork.total)}</Text></div>
                    <div><Text type="secondary">รับเมื่อ: {currentWork.createdAt ? new Date(currentWork.createdAt).toLocaleString() : "-"}</Text></div>
                  </Space>
                ),
              },
              {
                key: "chat",
                label: "แชท",
                children: <OrderChat orderId={currentWork.orderId} />,
              },
            ]}
          />
        ) : (
          <Text type="secondary">ไม่มีข้อมูลงานปัจจุบัน</Text>
        )}
      </Drawer>
    </div>
  );
}
