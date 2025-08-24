import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Avatar,
  Typography,
  message,
  Form,
  Input,
  Select,
  Upload,
  TimePicker,
  Divider,
  Space,
  Spin,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  UserOutlined,
  InboxOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

type RiderProfileData = {
  firstName: string;
  lastName: string;
  phone: string;
  nationalId?: string;
  vehicleType?: "motorcycle" | "car" | "bicycle";
  licensePlate?: string;
  zone?: string;
  addressLine?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  serviceStart?: string; // "HH:mm"
  serviceEnd?: string;   // "HH:mm"
  ready?: boolean;
  avatarUrl?: string;
  timeRange?: [dayjs.Dayjs, dayjs.Dayjs];
};

const RiderProfile: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<RiderProfileData>();

  const riderId = useMemo(() => localStorage.getItem("riderId") || "demo-rider", []);

  // อัปโหลดเฉพาะฝั่งหน้า (ยังไม่อัปขึ้น server)
  const beforeUpload = () => false;

  // โหลดข้อมูล (mock) + map serviceStart/serviceEnd -> timeRange
  const fetchProfile = async () => {
    try {
      setLoading(true);
      // const { data } = await axios.get<RiderProfileData>(`/api/riders/${riderId}`);
      const data: RiderProfileData = {
        firstName: "สมชาย",
        lastName: "ใจดี",
        phone: "0812345678",
        nationalId: "1234567890123",
        vehicleType: "motorcycle",
        licensePlate: "กทม-1234",
        zone: "ประตู 4",
        addressLine: "123/45 ถ.มิตรภาพ ต.สุรนารี อ.เมือง จ.นครราชสีมา",
        bankName: "กสิกรไทย",
        bankAccountName: "สมชาย ใจดี",
        bankAccountNumber: "123-4-56789-0",
        emergencyName: "วิไล ใจดี",
        emergencyPhone: "0899999999",
        serviceStart: "08:00",
        serviceEnd: "20:00",
        ready: true,
        avatarUrl: "",
      };

      form.setFieldsValue({
        ...data,
        timeRange:
          data.serviceStart && data.serviceEnd
            ? [dayjs(data.serviceStart, "HH:mm"), dayjs(data.serviceEnd, "HH:mm")]
            : undefined,
      });

      if (data.avatarUrl) {
        setFileList([
          { uid: "-1", name: "avatar.jpg", status: "done", url: data.avatarUrl },
        ]);
      } else {
        setFileList([]);
      }
    } catch {
      messageApi.error("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riderId]);

  const onFinish = async (values: RiderProfileData) => {
    setSubmitting(true);
    try {
      const timeRange = form.getFieldValue("timeRange") as [dayjs.Dayjs, dayjs.Dayjs] | undefined;
      const [start, end] = timeRange || [];
      const payload: RiderProfileData = {
        ...values,
        serviceStart: start ? start.format("HH:mm") : undefined,
        serviceEnd: end ? end.format("HH:mm") : undefined,
      };

      // อัปโหลดไฟล์จริง: ทำที่นี่ -> ได้ URL -> payload.avatarUrl = url
      // await axios.put(`/api/riders/${riderId}`, payload);
      messageApi.success("บันทึกโปรไฟล์สำเร็จ (เดโม)");
    } catch {
      messageApi.error("บันทึกโปรไฟล์ไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => fetchProfile();

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", width: "100%" }}>
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
              โปรไฟล์ไรเดอร์
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
              แก้ไขข้อมูลส่วนตัวได้ที่นี่
            </Text>
          </Col>
        </Row>
      </Card>

      {/* ครอบด้วย Spin ตอน loading */}
      <Spin spinning={loading} tip="กำลังโหลดข้อมูล..." size="large">
        <Card style={{ borderRadius: 16 }}>
          <Form<RiderProfileData>
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{}}
            disabled={loading}
          >
            <Row gutter={[16, 8]}>
              <Col xs={24} md={16}>
                <Title level={4} style={{ marginTop: 0 }}>ข้อมูลส่วนตัว</Title>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="ชื่อ"
                      name="firstName"
                      rules={[{ required: true, message: "กรอกชื่อ" }]}
                    >
                      <Input placeholder="สมชาย" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="สกุล"
                      name="lastName"
                      rules={[{ required: true, message: "กรอกสกุล" }]}
                    >
                      <Input placeholder="ใจดี" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="เบอร์โทร"
                      name="phone"
                      rules={[
                        { required: true, message: "กรอกเบอร์โทร" },
                        { pattern: /^[0-9]{9,10}$/, message: "รูปแบบเบอร์ไม่ถูกต้อง" },
                      ]}
                    >
                      <Input placeholder="เช่น 0812345678" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="เลขบัตรประชาชน"
                      name="nationalId"
                      rules={[
                        { required: true, message: "กรอกเลขบัตรประชาชน" },
                        { pattern: /^[0-9]{13}$/, message: "เลขบัตรไม่ถูกต้อง (13 หลัก)" },
                      ]}
                    >
                      <Input placeholder="เช่น 1234567890123" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="ที่อยู่"
                      name="addressLine"
                      rules={[{ required: true, message: "กรอกที่อยู่" }]}
                    >
                      <Input.TextArea rows={3} placeholder="บ้านเลขที่/ถนน/ตำบล/อำเภอ/จังหวัด" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="เวลาให้บริการ" name="timeRange">
                      <TimePicker.RangePicker format="HH:mm" minuteStep={5} />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>ข้อมูลยานพาหนะ</Title>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="ประเภทยานพาหนะ"
                      name="vehicleType"
                      rules={[{ required: true, message: "เลือกประเภทยานพาหนะ" }]}
                    >
                      <Select placeholder="เลือกประเภท">
                        <Option value="motorcycle">มอเตอร์ไซค์</Option>
                        <Option value="car">รถยนต์</Option>
                        <Option value="bicycle">จักรยาน</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="ป้ายทะเบียน"
                      name="licensePlate"
                      rules={[{ required: true, message: "กรอกป้ายทะเบียน" }]}
                    >
                      <Input placeholder="เช่น กทม-1234" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="โซนประจำ" name="zone">
                      <Select placeholder="เลือกโซน">
                        <Option value="ประตู 4">ประตู 4</Option>
                        <Option value="ประตู 1">ประตู 1</Option>
                        <Option value="ประตู 2">ประตู 2</Option>
                        <Option value="ประตู 3">ประตู 3</Option>
                        <Option value="ในเมือง">ในเมือง</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>ผู้ติดต่อฉุกเฉิน</Title>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="ชื่อ" name="emergencyName">
                      <Input placeholder="เช่น วิไล ใจดี" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="เบอร์โทร"
                      name="emergencyPhone"
                      rules={[{ pattern: /^[0-9]{9,10}$/, message: "รูปแบบเบอร์ไม่ถูกต้อง" }]}
                    >
                      <Input placeholder="เช่น 0899999999" />
                    </Form.Item>
                  </Col>
                </Row>

                {/* ✅ ย้ายส่วนนี้มาต่อใต้ผู้ติดต่อฉุกเฉิน */}
                <Divider />

                <Title level={4}>การตั้งค่า / รูปโปรไฟล์</Title>
                <Form.Item label="รูปโปรไฟล์">
                  <Upload.Dragger
                    listType="picture"
                    multiple={false}
                    beforeUpload={beforeUpload}
                    fileList={fileList}
                    onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
                    maxCount={1}
                    accept="image/*"
                    disabled={loading}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">ลากไฟล์รูปมาวาง หรือคลิกเพื่อเลือก</p>
                    <p className="ant-upload-hint">รองรับไฟล์ภาพเท่านั้น</p>
                  </Upload.Dragger>
                </Form.Item>

                <Space style={{ marginTop: 8 }}>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={submitting}
                  >
                    บันทึก
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    disabled={loading || submitting}
                  >
                    โหลดข้อมูลล่าสุด
                  </Button>
                </Space>
              </Col>

              {/* ถ้าต้องการพื้นที่ว่างด้านขวาในจอใหญ่ ให้คอลัมน์นี้ว่างไว้ */}
              <Col xs={24} md={8} />
            </Row>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default RiderProfile;
