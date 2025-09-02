import React, { useMemo, useState } from "react";
import { Form, Input, Button, Typography, message, Card, Divider } from "antd";

/**
 * หน้าเปลี่ยนรหัสผ่าน (แยกจากโปรไฟล์)
 * - รองรับกฎความปลอดภัยพื้นฐาน (ยาว >= 12, มีตัวพิมพ์เล็ก/ใหญ่/ตัวเลข/อักขระพิเศษ)
 * - แสดง checklist แบบเรียลไทม์
 * - ข้อความและแจ้งเตือนเป็นภาษาไทย
 * - เตรียมพร้อมเชื่อมต่อ Backend: PUT /me/password
 */

const { Title, Text } = Typography;

// กฎความปลอดภัยแบบพื้นฐาน
const MIN_LEN = 12;
const hasLower = (s: string) => /[a-z]/.test(s);
const hasUpper = (s: string) => /[A-Z]/.test(s);
const hasNumber = (s: string) => /[0-9]/.test(s);
const hasSymbol = (s: string) => /[^A-Za-z0-9]/.test(s);

type FormVals = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function ChangePasswordPage() {
  const [form] = Form.useForm<FormVals>();
  const [submitting, setSubmitting] = useState(false);
  const newPass = Form.useWatch("newPassword", form);

  // สถานะ checklist แบบเรียลไทม์
  const status = useMemo(() => {
    const pwd = newPass || "";
    return {
      len: pwd.length >= MIN_LEN,
      lower: hasLower(pwd),
      upper: hasUpper(pwd),
      num: hasNumber(pwd),
      sym: hasSymbol(pwd),
    };
  }, [newPass]);

  const strengthPct = useMemo(() => {
    const checks = Object.values(status).filter(Boolean).length;
    return (checks / 5) * 100;
  }, [status]);

  const barBg = useMemo(() => {
    if (strengthPct >= 80) return "#52c41a"; // strong
    if (strengthPct >= 60) return "#faad14"; // medium
    return "#ff4d4f"; // weak
  }, [strengthPct]);

  const onSubmit = async (values: FormVals) => {
    setSubmitting(true);
    try {
      // TODO: เชื่อมต่อ Backend จริง
      // await api.put("/me/password", values)
      //   โดย backend ต้องตรวจ currentPassword, บันทึก hash(newPassword), ทำ revoke refresh token ฯลฯ
      console.log("Change password payload:", {
        currentPassword: "***", // อย่าล็อกค่าจริง
        newPasswordMasked: "******",
      });

      message.success("เปลี่ยนรหัสผ่านเรียบร้อย ✅");
      form.resetFields();
    } catch (e) {
      message.error("ไม่สามารถเปลี่ยนรหัสผ่านได้ ❌ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: 20 }}>
      <Title level={3}>ความปลอดภัยของบัญชี</Title>
      <Text type="secondary">
        เพื่อความปลอดภัย กรุณาใช้รหัสผ่านที่คาดเดายาก และไม่ซ้ำกับที่อื่น
      </Text>

      <Card style={{ marginTop: 16 }}>
        <Title level={4} style={{ marginTop: 0 }}>เปลี่ยนรหัสผ่าน</Title>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item
            label="รหัสผ่านปัจจุบัน"
            name="currentPassword"
            rules={[{ required: true, message: "กรุณากรอกรหัสผ่านปัจจุบัน" }]}
          >
            <Input.Password
              autoComplete="current-password"
              placeholder="กรอกรหัสผ่านปัจจุบัน"
            />
          </Form.Item>

          <Form.Item
            label="รหัสผ่านใหม่"
            name="newPassword"
            rules={[
              { required: true, message: "กรุณากรอกรหัสผ่านใหม่" },
              {
                validator: (_, value: string) => {
                  if (!value) return Promise.resolve();
                  const ok =
                    value.length >= MIN_LEN &&
                    hasLower(value) &&
                    hasUpper(value) &&
                    hasNumber(value) &&
                    hasSymbol(value);
                  return ok
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          "รหัสผ่านต้องยาวอย่างน้อย 12 ตัวอักษร และมีตัวพิมพ์เล็ก/ใหญ่ ตัวเลข และอักขระพิเศษ"
                        )
                      );
                },
              },
            ]}
            hasFeedback
          >
            <Input.Password
              autoComplete="new-password"
              placeholder="ตั้งรหัสผ่านใหม่"
            />
          </Form.Item>

          {/* แถบความแข็งแรงแบบง่าย */}
          <div style={{ marginTop: -8, marginBottom: 8 }}>
            <div
              aria-hidden
              style={{
                height: 6,
                background: "#f0f0f0",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${strengthPct}%`,
                  background: barBg,
                  transition: "width .2s ease",
                }}
              />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
              ความแข็งแรงของรหัสผ่าน:{" "}
              {strengthPct >= 80 ? "ดีมาก" : strengthPct >= 60 ? "ปานกลาง" : "อ่อน"}
            </div>
          </div>

          {/* Checklist เงื่อนไข */}
          <div style={{ fontSize: 13, lineHeight: 1.8, marginBottom: 8 }}>
            <Check ok={status.len} text={`ยาวอย่างน้อย ${MIN_LEN} ตัวอักษร`} />
            <Check ok={status.lower} text="มีตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z)" />
            <Check ok={status.upper} text="มีตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ (A-Z)" />
            <Check ok={status.num} text="มีตัวเลข (0-9)" />
            <Check ok={status.sym} text="มีอักขระพิเศษ (!@#$% เป็นต้น)" />
          </div>

          <Form.Item
            label="ยืนยันรหัสผ่านใหม่"
            name="confirmNewPassword"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "กรุณายืนยันรหัสผ่านใหม่" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("รหัสผ่านไม่ตรงกัน"));
                },
              }),
            ]}
          >
            <Input.Password
              autoComplete="new-password"
              placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
            />
          </Form.Item>

          <Divider />

          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            block
          >
            บันทึกการเปลี่ยนรหัสผ่าน
          </Button>
        </Form>
      </Card>
    </div>
  );
}

// แสดงรายการเงื่อนไขสำเร็จ/ยังไม่ผ่านแบบย่อ
function Check({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: ok ? "#52c41a" : "#d9d9d9",
        }}
      />
      <span style={{ color: ok ? "#262626" : "#8c8c8c" }}>{text}</span>
    </div>
  );
}
