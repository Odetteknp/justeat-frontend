import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Upload,
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
  DeleteOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

type RiderProfileData = {
  firstName: string;
  lastName: string;
  phone: string;
  nationalId?: string;
  licensePlate?: string;
  zone?: string; // โซนประจำ
  addressLine?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  serviceStart?: string;
  serviceEnd?: string;
  ready?: boolean;
  avatarUrl?: string;
  driverLicenseBase64?: string;
};

const RiderProfile: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [preview, setPreview] = useState<string>("");
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<RiderProfileData>();

  const orders = [{ id : 123, total : 500 }];

  const navigate = useNavigate();
  const riderId = useMemo(() => localStorage.getItem("riderId") || "demo-rider", []);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const beforeUpload = () => false;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data: RiderProfileData = {
        firstName: "สมชาย",
        lastName: "ใจดี",
        phone: "0812345678",
        nationalId: "1234567890123",
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
        driverLicenseBase64: "",
      };

      form.setFieldsValue({ ...data });
      setFileList([]);
      setPreview(data.driverLicenseBase64 || "");
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
      const payload: RiderProfileData = { ...values };
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
              โปรไฟล์ไรเดอร์
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
              แก้ไขข้อมูลส่วนตัวได้ที่นี่
            </Text>
          </Col>
          <Col>
            {orders.map((o) => (
        <button
          key={o.id}
          onClick={() =>
            navigate(`/payment?orderId=${o.id}&amount=${(o.total / 100).toFixed(2)}`)
          }
        >
          ไปชำระเงิน (#{o.id})
        </button>
      ))}
          </Col>
        </Row>
      </Card>

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
                    <Form.Item label="ชื่อ" name="firstName" rules={[{ required: true, message: "กรอกชื่อ" }]}>
                      <Input placeholder="สมชาย" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="สกุล" name="lastName" rules={[{ required: true, message: "กรอกสกุล" }]}>
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
                    <Form.Item label="ที่อยู่" name="addressLine" rules={[{ required: true, message: "กรอกที่อยู่" }]}>
                      <Input.TextArea rows={3} placeholder="บ้านเลขที่/ถนน/ตำบล/อำเภอ/จังหวัด" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>ข้อมูลยานพาหนะ</Title>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="ป้ายทะเบียน" name="licensePlate" rules={[{ required: true, message: "กรอกป้ายทะเบียน" }]}>
                      <Input placeholder="เช่น กทม-1234" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="โซนประจำ" name="zone">
                      <Input placeholder="เช่น ประตู 1 / ประตู 2 / ในเมือง" />
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

                <Divider />

                <Title level={4}>อัปโหลดใบขับขี่</Title>
                <Form.Item label="ไฟล์ใบขับขี่ (รูปภาพ)">
                  <Upload.Dragger
                    listType="picture"
                    multiple={false}
                    beforeUpload={beforeUpload}
                    fileList={fileList}
                    onChange={async ({ fileList: fl }) => {
                      const latest = fl.slice(-1);
                      setFileList(latest);

                      const f = latest[0]?.originFileObj as File | undefined;
                      if (f) {
                        try {
                          const b64 = await fileToBase64(f);
                          form.setFieldsValue({ driverLicenseBase64: b64 });
                          setPreview(b64);
                        } catch {
                          messageApi.error("ไม่สามารถอ่านไฟล์เป็น Base64 ได้");
                          form.setFieldsValue({ driverLicenseBase64: "" });
                          setPreview("");
                        }
                      } else {
                        form.setFieldsValue({ driverLicenseBase64: "" });
                        setPreview("");
                      }
                    }}
                    maxCount={1}
                    accept="image/*"
                    disabled={loading}
                    showUploadList={false}
                    style={{ height: 260 }}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Driver License Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    ) : (
                      <>
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">ลากไฟล์รูปมาวาง หรือคลิกเพื่อเลือก</p>
                        <p className="ant-upload-hint">
                          รองรับไฟล์ภาพเท่านั้น (เช่น .jpg, .png) • ระบบจะเตรียม Base64 ให้โดยอัตโนมัติ
                        </p>
                      </>
                    )}
                  </Upload.Dragger>
                </Form.Item>

                <Form.Item name="driverLicenseBase64" hidden>
                  <Input />
                </Form.Item>

                <Space style={{ marginTop: 16 }}>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      setFileList([]);
                      setPreview("");
                      form.setFieldsValue({ driverLicenseBase64: "" });
                    }}
                  >
                    ลบรูป
                  </Button>
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

              <Col xs={24} md={8} />
            </Row>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default RiderProfile;