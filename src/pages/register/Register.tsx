import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Checkbox, Typography, Alert } from "antd";
import "./Register.css";
import { signup } from "../../services/auth/index";

const { Title, Text } = Typography;

type FormValues = {
  name: string;
  email: string;
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
      await signup({ name: values.name, email: values.email, password: values.password });
      // สมัครสำเร็จ พาไปล็อกอิน หรือจะ auto-login ก็ได้
      navigate("/login");
    } catch (e: any) {
      setError(e?.message || "Register failed");
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
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input your name" }]}
          >
            <Input placeholder="Your name"
              className="auth__input"
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
            <Input placeholder="you@example.com"
              className="auth__input"
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
              style={{ borderRadius: 10, height: 45, fontSize: 16 }}
            />
          </Form.Item>

          <div className="auth__row">
            <Form.Item name="accept" valuePropName="checked" noStyle
              rules={[{ validator: (_, v) => (v ? Promise.resolve() : Promise.reject(new Error("Please accept terms"))) }]}>
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
