import React from "react";
import { Form, Input, Button, Upload, Checkbox, Card, Divider, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./RiderRegisterForm.css";

interface RiderRegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  avatar?: File;
  vehiclePlate: string;
  license: string;
  driveCar: boolean;
}

const RiderRegister: React.FC = () => {
  const [form] = Form.useForm<RiderRegisterForm>();

  const onFinish = (values: RiderRegisterForm) => {
    console.log("Form Values:", values);
    // TODO: call API ไปที่ backend เช่น POST /api/rider/register
  };

  return (
    <div className="rider-register-wrapper">
      <Card className="rider-register-card" bordered={false}>
        <h1 className="rider-register-title">สมัคร Rider</h1>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Divider orientation="left">ข้อมูลผู้ใช้</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="firstName" label="ชื่อ" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="lastName" label="นามสกุล" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="email" label="อีเมล" rules={[{ required: true, type: "email" }]}>
                <Input placeholder="example@email.com" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="phoneNumber" label="เบอร์โทร" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="address" label="ที่อยู่" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">ข้อมูล Rider</Divider>
          <Form.Item name="avatar" label="อัพโหลดใบอนุญาตขับขี่">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined/>}>เลือกไฟล์</Button>
            </Upload>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="vehiclePlate" label="ทะเบียนรถ" rules={[{ required: true }]}>
                <Input placeholder="1กข 1234" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="license" label="เลขใบขับขี่" rules={[{ required: true }]}>
                <Input placeholder="1234567890" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="rider-register-submit">
              สมัคร Rider
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RiderRegister;
