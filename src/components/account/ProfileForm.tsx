import { nameRules, phoneRules } from "../../utils/validation";
import type { UserProfile } from "../../types";

import {
  Card,
  Form,
  Input,
  Button,
  Skeleton,
} from "antd";

import type { FormInstance } from "antd/es/form";

type Props = {
  form: FormInstance<UserProfile>;
  isLoading: boolean;
  submitting: boolean;
  onSubmit: (vals: UserProfile) => void;
};

export default function ProfileForm({
  form,
  isLoading,
  submitting,
  onSubmit,
}: Props) {
  if (isLoading) {
    return (
      <Card className="form-card">
        <div className="form-skeleton">
          <Skeleton.Input active block size="large" style={{ height: 40 }} />
          <Skeleton.Input
            active
            block
            size="large"
            style={{ height: 40, marginTop: 12 }}
          />
          <Skeleton.Input
            active
            block
            size="large"
            style={{ height: 40, marginTop: 12 }}
          />
          <Skeleton.Input
            active
            block
            size="large"
            style={{ height: 40, marginTop: 12 }}
          />
          <Skeleton.Input
            active
            block
            style={{ height: 80, marginTop: 12 }}
          />
          <Skeleton.Button
            active
            style={{ width: 220, marginTop: 16, float: "right" }}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className="form-card">
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <div className="row-2">
          <Form.Item label="ชื่อจริง" name="firstName" rules={nameRules("ชื่อจริง")}>
            <Input size="large" />
          </Form.Item>

          <Form.Item label="นามสกุล" name="lastName" rules={nameRules("นามสกุล")}>
            <Input size="large" />
          </Form.Item>
        </div>

        <div className="row-2">
          <Form.Item label="ชื่อผู้ใช้" name="username">
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="อีเมล"
            name="email"
            rules={[{ type: "email", message: "กรุณากรอกอีเมลให้ถูกต้อง" }]}
          >
            <Input size="large" />
          </Form.Item>
        </div>

        <Form.Item label="เบอร์โทรศัพท์" name="phoneNumber" rules={phoneRules}>
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label="ที่อยู่"
          name="address"
          rules={[{ max: 200, message: "ไม่เกิน 200 ตัวอักษร" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <div className="sticky-actions">
          <Button className="brand-outline-btn" htmlType="button">
            ยกเลิก
          </Button>
          <Button className="brand-btn" htmlType="submit" loading={submitting}>
            บันทึกการเปลี่ยนแปลง
          </Button>
        </div>
      </Form>
    </Card>
  );
}
