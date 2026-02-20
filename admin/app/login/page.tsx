"use client";

import { useEffect } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";

const { Title, Paragraph, Text } = Typography;

type LoginFormValues = {
  identifier: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const login = useUserStore((state) => state.login);
  const isLoggingIn = useUserStore((state) => state.isLoggingIn);

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [router, token]);

  const onFinish = async (values: LoginFormValues) => {
    const success = await login(values);
    if (!success) {
      message.error("Login failed, please check credentials.");
      return;
    }
    router.replace("/dashboard");
  };

  const loginAsDemo = async () => {
    const success = await login({ identifier: "admin", password: "admin" });
    if (!success) {
      message.error("Demo login failed.");
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <div className="admin-center-screen">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-10 text-white lg:block">
          <Title level={2} style={{ color: "white", marginBottom: 12 }}>
            Allico Industry Admin
          </Title>
          <Paragraph style={{ color: "rgba(255,255,255,0.8)" }}>
            Manage products, users, roles and route permissions in one place.
          </Paragraph>
          <div className="mt-20 rounded-xl border border-white/20 bg-white/10 p-4">
            <Text style={{ color: "rgba(255,255,255,0.9)" }}>
              Demo account
              <br />
              <code>admin / admin</code>
            </Text>
          </div>
        </div>
        <div className="p-8 sm:p-10">
          <Card bordered={false}>
            <Title level={3}>Sign In</Title>
            <Paragraph type="secondary">Use your account to access admin features.</Paragraph>
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="identifier"
                label="Username / Email"
                rules={[{ required: true, message: "Please enter username or email" }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: "Please enter password" }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isLoggingIn}
                size="large"
              >
                Login
              </Button>
            </Form>
            <Button style={{ marginTop: 12 }} block onClick={loginAsDemo}>
              Use Demo Account
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
