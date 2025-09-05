import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import loadingDotsBlue from "../../assets/Lottie/Loading Dots Blue.json"
import {
  Card,
  Row,
  Col,
  Spin,
  Button,
  Avatar,
  Typography,
  message,
  List,
  Space,
  Modal,
  Descriptions,
  Image,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import {
  listApplications,
  approveApplication,
  rejectApplication,
} from "../../services/restaurantApplication";

const { Title, Text } = Typography;

type PendingRestaurant = {
  id: number;
  name: string;
  phone: string;
  description: string;
  address: string;
  openingTime: string;
  closingTime: string;
  logo?: string;
  submittedAt: string;

  restaurantCategory: {
    id: number;
    name: string;
  }

  ownerUser: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };

  status: "pending" | "approved" | "rejected";
};

const AdminRestaurant: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState<boolean>(true);
  const [restaurants, setRestaurants] = useState<PendingRestaurant[]>([]); // 👈 default เป็น []
  const [selectedRestaurant, setSelectedRestaurant] = useState<PendingRestaurant | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // ✅ โหลดจาก backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apps = await listApplications("pending");
        setRestaurants(apps ?? []); // 👈 ถ้า apps เป็น null ให้เป็น []
      } catch (err) {
        console.error("❌ โหลด applications ล้มเหลว", err);
        messageApi.error("โหลดข้อมูลไม่สำเร็จ");
        setRestaurants([]); // กัน error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [messageApi]);

  const handleApprove = async (id: number) => {
    try {
      await approveApplication(id);
      messageApi.success("✅ อนุมัติร้านเรียบร้อยแล้ว");
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
      );
      setModalVisible(false);
    } catch (err) {
      messageApi.error("❌ อนุมัติไม่สำเร็จ");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectApplication(id, "ไม่ผ่านการตรวจสอบ");
      messageApi.error("❌ ปฏิเสธร้านเรียบร้อยแล้ว");
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
      );
      setModalVisible(false);
    } catch (err) {
      messageApi.error("❌ ปฏิเสธไม่สำเร็จ");
    }
  };

  const showDetails = (restaurant: PendingRestaurant) => {
    setSelectedRestaurant(restaurant);
    setModalVisible(true);
  };

  // 👇 ปลอดภัยจาก null เสมอ เพราะ restaurants เป็น array ว่างได้
  const pendingRestaurants = restaurants.filter((r) => r.status === "pending");

  return (
    <div style={{ backgroundColor: "white", height: "100%", width: "100%", padding: 24 }}>
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
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
              ตรวจสอบและอนุมัติร้านอาหาร
            </Text>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Lottie animationData={loadingDotsBlue} loop={true} style={{ height:200 }}/>
          <p>กำลังโหลดข้อมูลร้านค้า...</p>
        </div>
      ) : pendingRestaurants.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Lottie animationData={loadingDotsBlue} loop={true} style={{ height: 250 }} />
            <p>ไม่มีร้านที่รอการอนุมัติในขณะนี้</p>
          </div>
      ) : (
        <List
          itemLayout="vertical"
          dataSource={pendingRestaurants}
          renderItem={(item) => (
            <Card
              style={{ marginBottom: 16 }}
              title={item.name}
              extra={<Text type="secondary">ส่งเมื่อ: {item.submittedAt}</Text>}
            >
              <Space direction="vertical" size="small">
                <Text>
                  เจ้าของร้าน: {item.ownerUser.firstName} {item.ownerUser.lastName}
                </Text>
                <Button icon={<EyeOutlined />} onClick={() => showDetails(item)}>
                  ดูรายละเอียด
                </Button>
              </Space>
            </Card>
          )}
        />
      )}

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
        title="รายละเอียดร้านอาหาร"
      >
        {selectedRestaurant && (
          <>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="ชื่อร้าน">{selectedRestaurant.name}</Descriptions.Item>
              <Descriptions.Item label="คำอธิบาย">{selectedRestaurant.description}</Descriptions.Item>
              <Descriptions.Item label="เบอร์โทรร้าน">{selectedRestaurant.phone}</Descriptions.Item>
              <Descriptions.Item label="ประเภทอาหาร">{selectedRestaurant.restaurantCategory.name}</Descriptions.Item>
              <Descriptions.Item label="เวลาเปิด - ปิด">
                {selectedRestaurant.openingTime} - {selectedRestaurant.closingTime}
              </Descriptions.Item>
              <Descriptions.Item label="ที่อยู่">{selectedRestaurant.address}</Descriptions.Item>
              <Descriptions.Item label="ชื่อเจ้าของร้าน">
                {selectedRestaurant.ownerUser.firstName} {selectedRestaurant.ownerUser.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="อีเมลเจ้าของร้าน">{selectedRestaurant.ownerUser.email}</Descriptions.Item>
              <Descriptions.Item label="เบอร์เจ้าของร้าน">{selectedRestaurant.ownerUser.phoneNumber}</Descriptions.Item>
              <Descriptions.Item label="โลโก้ร้าน">
                <Image
                  width={100}
                  src={selectedRestaurant.logo || "https://via.placeholder.com/100"} // 👈 กัน null ด้วย placeholder
                  alt="โลโก้ร้าน"
                />
              </Descriptions.Item>
            </Descriptions>

            <div style={{ textAlign: "right", marginTop: 24 }}>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(selectedRestaurant.id)}
                style={{ marginRight: 8 }}
              >
                อนุมัติ
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(selectedRestaurant.id)}
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

export default AdminRestaurant;
