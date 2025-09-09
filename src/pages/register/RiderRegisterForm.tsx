// src/components/RiderRegisterForm/RiderRegister.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Card,
  Divider,
  Row,
  Col,
  Switch,
  Checkbox,
  Typography,
  message,
  Space,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { UploadOutlined } from "@ant-design/icons";
import "./RiderRegisterForm.css";
import RiderCartoon from "../../assets/image/riderMen.jpg";
import { getProfile } from "../../services/user";
import { applyRider } from "../../services/riderApplication";

// TH & fallback
const plateRegex = /^(\d{1,2}[ก-ฮ]{1,2}\s?\d{1,4}|[A-Z]{1,3}-?\d{1,4})$/;
const licenseRegex = /^\d{8,12}$/;

interface RiderRegisterFormValues {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;

  address: string;        // ใช้แสดงในฟอร์มเฉย ๆ (controller ไม่ใช้)
  vehiclePlate: string;
  license: string;
  driveCar: boolean;

  avatar?: UploadFile[];  // ใบอนุญาตขับขี่ (1 ไฟล์) -> แปลง base64 ก่อนส่ง
  acceptTerms?: boolean;
}

async function fileToDataURL(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string); // data:image/...;base64,xxxx
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const RiderRegister: React.FC = () => {
  const [form] = Form.useForm<RiderRegisterFormValues>();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // โหลดโปรไฟล์มา prefill และล็อกช่อง owner
  useEffect(() => {
    (async () => {
      try {
        const profile = (await getProfile()) as any;
        form.setFieldsValue({
          firstName: profile?.firstName ?? "",
          lastName: profile?.lastName ?? "",
          email: profile?.email ?? "",
          phoneNumber: profile?.phoneNumber ?? "",
          driveCar: false,
        });
      } catch (err) {
        console.error("❌ โหลดข้อมูล user ไม่สำเร็จ:", err);
        message.error("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ");
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [form]);

  // helper: แปลง event ของ Upload -> fileList
  const normFile = (e: any): UploadFile[] | undefined => {
    if (Array.isArray(e)) return e;
    return e?.fileList?.slice(0, 1); // จำกัด 1 ไฟล์
  };

  // label ประเภทพาหนะจากค่า driveCar
  const driveCar = Form.useWatch("driveCar", form);
  const vehicleLabel = useMemo(() => (driveCar ? "รถยนต์" : "มอเตอร์ไซค์"), [driveCar]);

  const onFinish = async (values: RiderRegisterFormValues) => {
    // ตรวจ client-side (ส่วนใหญ่เหมือนเดิม)
    if (!values.address?.trim()) {
      message.warning("กรุณากรอกที่อยู่");
      return;
    }
    if (!plateRegex.test(values.vehiclePlate || "")) {
      message.warning("รูปแบบทะเบียนรถไม่ถูกต้อง");
      return;
    }
    if (!licenseRegex.test(values.license || "")) {
      message.warning("เลขใบขับขี่ต้องเป็นตัวเลข 8–12 หลัก");
      return;
    }
    const fileObj = values.avatar?.[0]?.originFileObj as File | undefined;
    if (!fileObj) {
      message.warning("กรุณาอัปโหลดไฟล์ใบอนุญาตขับขี่");
      return;
    }
    if (!values.acceptTerms) {
      message.warning("กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว");
      return;
    }

    try {
      setSubmitting(true);

      // ✅ แปลงไฟล์เป็น base64 (data URL) แล้วส่ง JSON 3 ฟิลด์
      const base64 = await fileToDataURL(fileObj);

      await applyRider({
        vehiclePlate: values.vehiclePlate,
        license: values.license,
        driveCarPicture: base64, // ← ชื่อฟิลด์ตรงกับ Controller
      });

      message.success("สมัคร Rider สำเร็จ! เราจะติดต่อกลับโดยเร็ว");

      // reset เฉพาะฟิลด์สมัคร คง owner info
      form.setFieldsValue({
        address: "",
        vehiclePlate: "",
        license: "",
        driveCar: false,
        avatar: [],
        acceptTerms: false,
      });
    } catch (err: any) {
      console.error("❌ สมัคร Rider ล้มเหลว:", err);
      message.error(err?.message || "สมัครไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rider-register-wrapper">
      <Card
        className="rider-register-card"
        bordered={false}
        loading={loadingProfile}
        bodyStyle={{ padding: 32 }}
      >
        <img className="rider-Hero" src={RiderCartoon} alt="Rider" />
        <h1 className="rider-register-title">สมัคร Rider</h1>

        <Form<RiderRegisterFormValues>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={loadingProfile || submitting}
        >
          <Divider orientation="left">ข้อมูลผู้ใช้</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="firstName" label="ชื่อ" rules={[{ required: true }]}>
                <Input readOnly disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="lastName" label="นามสกุล" rules={[{ required: true }]}>
                <Input readOnly disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="อีเมล"
                rules={[{ required: true, type: "email" }]}
              >
                <Input readOnly disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phoneNumber" label="เบอร์โทร" rules={[{ required: true }]}>
                <Input readOnly disabled />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">ข้อมูล Rider</Divider>

          <Form.Item
            name="address"
            label="ที่อยู่"
            rules={[{ required: true, message: "กรุณากรอกที่อยู่" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="vehiclePlate"
                label="ทะเบียนรถ"
                rules={[
                  { required: true, message: "กรุณากรอกทะเบียนรถ" },
                  { pattern: plateRegex, message: "รูปแบบทะเบียนรถไม่ถูกต้อง (เช่น 1กข 1234 หรือ ABC-1234)" },
                ]}
              >
                <Input placeholder="1กข 1234 / ABC-1234" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="license"
                label="เลขใบขับขี่"
                rules={[
                  { required: true, message: "กรุณากรอกเลขใบขับขี่" },
                  {
                    validator: (_, v) =>
                      !v || licenseRegex.test(v)
                        ? Promise.resolve()
                        : Promise.reject("ต้องเป็นตัวเลข 8–12 หลัก"),
                  },
                ]}
              >
                <Input placeholder="12345678" inputMode="numeric" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="driveCar"
                label="ประเภทยานพาหนะ"
                valuePropName="checked"
                initialValue={false}
              >
                <Space align="center">
                  <Switch />
                  <Typography.Text type="secondary">{vehicleLabel}</Typography.Text>
                </Space>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="avatar"
                label="อัปโหลดใบอนุญาตขับขี่"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                extra="รองรับ .jpg, .jpeg, .png, .pdf (สูงสุด 1 ไฟล์)"
                rules={[{ required: true, message: "กรุณาอัปโหลดไฟล์ใบอนุญาตขับขี่" }]}
              >
                <Upload beforeUpload={() => false} maxCount={1} accept=".jpg,.jpeg,.png,.pdf">
                  <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="acceptTerms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, v) =>
                  v
                    ? Promise.resolve()
                    : Promise.reject("กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว"),
              },
            ]}
          >
            <Checkbox>ยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="rider-register-submit"
              loading={submitting}
              block
            >
              {submitting ? "Submitting..." : "สมัคร Rider"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RiderRegister;
