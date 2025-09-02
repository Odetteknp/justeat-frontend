// src/pages/register/Register.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Checkbox, Typography, Alert } from "antd";
import "./Register.css";
import { register } from "../../services/auth/index"; // <- ใช้ตามที่คุณมีอยู่

const { Title, Text } = Typography;

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirm: string;
  accept: boolean;
};

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const onFinish = async (values: FormValues) => {
    setError(null);
    setLoading(true);
    try {
      await register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber?.trim() || undefined,
      });
      // สมัครสำเร็จ → ไปหน้า login (หรือจะ auto-login ก็ได้)
      navigate("/login");
    } catch (e: any) {
      // ดึงข้อความ error จาก response ถ้ามี
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Register failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth auth--center">
      <div className="auth__card">
        <Title level={1} className="auth__title" style={{ color: "#F0572F" }}>
          Create your account
        </Title>

        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}

        <Form<FormValues>
          layout="vertical"
          onFinish={onFinish}
          autoComplete="on"
          initialValues={{ accept: true }}
        >
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "Please input your first name" }]}
          >
            <Input
              placeholder="Your first name"
              className="auth__input"
              autoComplete="given-name"
              style={{ borderRadius: 10, height: 45, fontSize: 16 }}
            />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Please input your last name" }]}
          >
            <Input
              placeholder="Your last name"
              className="auth__input"
              autoComplete="family-name"
              style={{ borderRadius: 10, height: 45, fontSize: 16 }}
            />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: "Please input your email" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input
              placeholder="you@example.com"
              className="auth__input"
              autoComplete="email"
              style={{ borderRadius: 10, height: 45, fontSize: 16 }}
            />
          </Form.Item>

          <Form.Item
            label="Phone Number (optional)"
            name="phoneNumber"
            rules={[
              {
                pattern: /^[+()\-.\s0-9]{6,20}$/,
                message: "Invalid phone number",
              },
            ]}
          >
            <Input
              placeholder="e.g. 0812345678"
              className="auth__input"
              autoComplete="tel"
              style={{ borderRadius: 10, height: 45, fontSize: 16 }}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please input your password" },
              { min: 6, message: "At least 6 characters" },
            ]}
            hasFeedback
          >
            <Input.Password
              placeholder="At least 6 characters"
              className="auth__input"
              autoComplete="new-password"
              style={{ borderRadius: 10, height: 45, fontSize: 16 }}
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) return Promise.resolve();
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Re-enter your password"
              className="auth__input"
              autoComplete="new-password"
              style={{ borderRadius: 10, height: 45, fontSize: 16 }}
            />
          </Form.Item>

          <div className="auth__row">
            <Form.Item
              name="accept"
              valuePropName="checked"
              noStyle
              rules={[
                {
                  validator: (_, v) =>
                    v ? Promise.resolve() : Promise.reject(new Error("Please accept terms")),
                },
              ]}
            >
              <Checkbox>I accept Terms & Privacy</Checkbox>
            </Form.Item>
            <span />
          </div>

          <Form.Item style={{ marginTop: 6 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="signUpBtn"
              style={{
                background: "#F0572F",
                border: "none",
                borderRadius: 15,
                height: 48,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div className="auth__meta">
          <Text type="secondary">Already have an account? </Text>
          <Link to="/login" className="auth__link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
