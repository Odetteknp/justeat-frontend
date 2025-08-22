import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Checkbox, Typography, Alert } from "antd";
import "./Login.css";
import { login } from "../../services/auth";

const { Title, Text } = Typography;

type LoginForm = { email: string; password: string; remember: boolean };

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onFinish(values: LoginForm) {
    setError(null);
    setLoading(true);
    try {
      const res = await login(values);
      if (values.remember && res.token) {
        // โปรดพิจารณาใช้ HttpOnly cookie ในโปรดักชัน
        localStorage.setItem("token", res.token);
      }
      navigate("/profile");
    } catch (e: any) {
      setError(e?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth auth--center">
      <div className="auth__card">
        <Title level={1} className="auth__title" style={{ color: "#F0572F" }}>
          Login to your account
        </Title>

        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}

        <Form<LoginForm>
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ remember: true }}
          autoComplete="on"
        >
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input
              placeholder="you@example.com"
              className="auth__input"
              style={{ borderRadius: 10, height: 45, fontSize: 16 }}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              placeholder="Enter your password"
              className="auth__input"
              style={{ borderRadius: 10, height: 45, fontSize: 16 }}
            />
          </Form.Item>

          <div className="auth__row">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link to="/forgot" className="auth__link">Forget password?</Link>
          </div>

          <Form.Item style={{ marginTop: 6 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="signInBtn"
              style={{
                background: "#F0572F",
                border: "none",
                borderRadius: 15,
                height: 48,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="auth__meta">
          <Text type="secondary">Don't have an account? </Text>
          <Link to="/register" className="auth__link">Register</Link>
        </div>
      </div>
    </div>
  );
}
