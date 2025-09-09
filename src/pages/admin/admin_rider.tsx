import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Avatar,
  Typography,
  message,
  List,
  Space,
  Modal,
  Descriptions,
  Image,
  Tag,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  IdcardOutlined,
  CarOutlined,
  FieldTimeOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import {
  listRiderApplications,
  approveRiderApplication,
  rejectRiderApplication,
} from "../../services/riderApplication";

const { Title, Text } = Typography;

// === ให้ตรงกับ BE ===
type RiderApplication = {
  id: number;                           // <-- id ตัวเล็ก
  status: "pending" | "approved" | "rejected";
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    avatarUrl?: string | null;
  };
  license?: string;
  vehiclePlate?: string;
  driveCarPicture?: string;             // <-- base64 data URL (ภาพพาหนะ/หลักฐาน)
  submittedAt: string;                  // ISO
};

const AdminRider: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<RiderApplication[]>([]);
  const [selected, setSelected] = useState<RiderApplication | null>(null);
  const [open, setOpen] = useState(false);

  // โหลดรายการ pending
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const rows = await listRiderApplications("pending");
        setApps(rows ?? []);
      } catch (e) {
        console.error("load rider applications failed", e);
        messageApi.error("โหลดคำขอไรเดอร์ไม่สำเร็จ");
        setApps([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [messageApi]);

  const pending = apps.filter((a) => a.status === "pending");

  const openDetail = (row: RiderApplication) => {
    setSelected(row);
    setOpen(true);
  };

  const onApprove = async (id: number) => {
    console.log("[UI] approve click, id=", id);
    try {
      await approveRiderApplication(id);
      messageApi.success("อนุมัติคำขอไรเดอร์เรียบร้อย");
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a)));
      setOpen(false);
    } catch (e) {
      console.error("[UI] approve error", e);
      messageApi.error("อนุมัติไม่สำเร็จ");
    }
  };

  const onReject = async (id: number) => {
    try {
      await rejectRiderApplication(id, "ไม่ผ่านการตรวจสอบ");
      messageApi.warning("ปฏิเสธคำขอเรียบร้อย");
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: "rejected" } : a)));
      setOpen(false);
    } catch {
      messageApi.error("ปฏิเสธไม่สำเร็จ");
    }
  };

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100%", width: "100%", padding: 24 }}>
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
              Admin 👨‍💼
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16 }}>
              ตรวจสอบและอนุมัติไรเดอร์
            </Text>
          </Col>
        </Row>
      </Card>

      <Card title="คำขอสมัครไรเดอร์ (รออนุมัติ)">
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>กำลังโหลด…</div>
        ) : pending.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40 }}>ไม่มีคำขอใหม่</div>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={pending}
            renderItem={(item) => {
              const fullName =
                `${item.user?.firstName ?? ""} ${item.user?.lastName ?? ""}`.trim() || "—";
              return (
                <Card
                  key={item.id}
                  style={{ marginBottom: 16 }}
                  title={
                    <Space>
                      <Avatar src={item.user?.avatarUrl ?? undefined} icon={<UserOutlined />} />
                      <span>{fullName}</span>
                      <Tag color="gold">Pending</Tag>
                    </Space>
                  }
                  extra={
                    <Text type="secondary">
                      ส่งเมื่อ: {new Date(item.submittedAt).toLocaleString("th-TH")}
                    </Text>
                  }
                >
                  <Space direction="vertical" size="small">
                    <Text>
                      <PhoneOutlined /> {item.user?.phoneNumber || "—"}
                    </Text>
                    <Text>
                      <MailOutlined /> {item.user?.email || "—"}
                    </Text>
                    <Text>
                      <IdcardOutlined /> เลขใบขับขี่: {item.license || "—"}
                    </Text>
                    <Text>
                      <CarOutlined /> ทะเบียนรถ: {item.vehiclePlate || "—"}
                    </Text>
                    <Button icon={<EyeOutlined />} onClick={() => openDetail(item)}>
                      ดูรายละเอียด
                    </Button>
                  </Space>
                </Card>
              );
            }}
          />
        )}
      </Card>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={720}
        title="รายละเอียดคำขอสมัครไรเดอร์"
      >
        {selected && (
          <>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="ชื่อ-สกุล">
                {(selected.user?.firstName || "—") + " " + (selected.user?.lastName || "")}
              </Descriptions.Item>
              <Descriptions.Item label="อีเมล">
                {selected.user?.email || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="เบอร์โทร">
                {selected.user?.phoneNumber || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="เลขใบขับขี่">
                {selected.license || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="ทะเบียนรถ">
                {selected.vehiclePlate || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="ส่งเมื่อ">
                <Space>
                  <FieldTimeOutlined />
                  {new Date(selected.submittedAt).toLocaleString("th-TH")}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="รูป/ไฟล์แนบ">
                <Space wrap>
                  <Image
                    width={160}
                    src={
                      selected.driveCarPicture ||
                      "https://via.placeholder.com/160x100?text=Attachment"
                    }
                    alt="แนบจากผู้สมัคร"
                  />
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ textAlign: "right", marginTop: 24 }}>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => onApprove(selected.id)}
                style={{ marginRight: 8 }}
              >
                อนุมัติ
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => onReject(selected.id)}
              >
                ปฏิเสธ
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdminRider;
