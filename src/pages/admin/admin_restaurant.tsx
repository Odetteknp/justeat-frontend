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

const { Title, Text } = Typography;

type PendingRestaurant = {
  id: string;
  name: string;
  phone: string;
  description: string;
  restaurantType: string;
  address: string;
  openingTime: string;
  closingTime: string;
  logo?: string;
  submittedAt: string;

  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;

  status: "pending" | "approved" | "rejected";
};

const AdminRestaurant: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState<boolean>(true);
  const [restaurants, setRestaurants] = useState<PendingRestaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<PendingRestaurant | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // ✅ เพิ่ม mock data ชั่วคราวเพื่อแสดงผล
  useEffect(() => {
    const mockData: PendingRestaurant[] = [
      {
        id: "1",
        name: "คลายหิว",
        phone: "0891234567",
        description: "ร้านอาหารชื่อดัง เปิดมายาวนานกว่า 20 ปี",
        restaurantType: "Rice Dishes",
        address: "123/4 ถนนพระราม 2 แขวงบางมด เขตจอมทอง กทม",
        openingTime: "08:00",
        closingTime: "18:00",
        logo: "https://via.placeholder.com/100",
        submittedAt: "2025-09-01",
        ownerFirstName: "กนกพร",
        ownerLastName: "จำปาหอม",
        ownerEmail: "chaauay@example.com",
        ownerPhone: "0812345678",
        status: "pending",
      },
      {
        id: "2",
        name: "BB Bubble Tea",
        phone: "0912345678",
        description: "ชาไข่มุกหอมหวาน กลมกล่อม พร้อมไข่มุกหนึบหนับ",
        restaurantType: "Bubble Tea",
        address: "88 ซอยสุขสันต์ แขวงลาดพร้าว เขตลาดพร้าว กทม",
        openingTime: "10:00",
        closingTime: "20:00",
        logo: "https://via.placeholder.com/100",
        submittedAt: "2025-09-02",
        ownerFirstName: "ปิ่น",
        ownerLastName: "พิมพ์ใจ",
        ownerEmail: "pinpimjai@example.com",
        ownerPhone: "0823456789",
        status: "pending",
      },
      {
        id: "3",
        name: "Healthy House",
        phone: "0923456789",
        description: "อาหารคลีนเพื่อสุขภาพ สด สะอาด ปลอดภัย",
        restaurantType: "Healthy",
        address: "55/7 ถนนสุขภาพดี ตำบลในเมือง อำเภอเมือง ขอนแก่น",
        openingTime: "09:00",
        closingTime: "17:00",
        logo: "https://via.placeholder.com/100",
        submittedAt: "2025-09-03",
        ownerFirstName: "โกวิท",
        ownerLastName: "ภูอ่าง",
        ownerEmail: "kengky@example.com",
        ownerPhone: "0834567890",
        status: "pending",
      },
    ];

    // จำลองโหลดข้อมูล
    setTimeout(() => {
      setRestaurants(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleApprove = (id: string) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
    );
    messageApi.success("✅ อนุมัติร้านเรียบร้อยแล้ว");
    setModalVisible(false);
  };

  const handleReject = (id: string) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
    messageApi.error("❌ ปฏิเสธร้านเรียบร้อยแล้ว");
    setModalVisible(false);
  };

  const showDetails = (restaurant: PendingRestaurant) => {
    setSelectedRestaurant(restaurant);
    setModalVisible(true);
  };

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
          <Spin size="large" />
        </div>
      ) : pendingRestaurants.length === 0 ? (
        <Text>ไม่มีร้านที่รอการอนุมัติในขณะนี้</Text>
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
                  เจ้าของร้าน: {item.ownerFirstName} {item.ownerLastName}
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
              <Descriptions.Item label="ประเภทอาหาร">{selectedRestaurant.restaurantType}</Descriptions.Item>
              <Descriptions.Item label="เวลาเปิด - ปิด">
                {selectedRestaurant.openingTime} - {selectedRestaurant.closingTime}
              </Descriptions.Item>
              <Descriptions.Item label="ที่อยู่">{selectedRestaurant.address}</Descriptions.Item>
              <Descriptions.Item label="ชื่อเจ้าของร้าน">
                {selectedRestaurant.ownerFirstName} {selectedRestaurant.ownerLastName}
              </Descriptions.Item>
              <Descriptions.Item label="อีเมลเจ้าของร้าน">{selectedRestaurant.ownerEmail}</Descriptions.Item>
              <Descriptions.Item label="เบอร์เจ้าของร้าน">{selectedRestaurant.ownerPhone}</Descriptions.Item>
              <Descriptions.Item label="โลโก้ร้าน">
                <Image width={100} src={selectedRestaurant.logo} alt="โลโก้ร้าน" />
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
