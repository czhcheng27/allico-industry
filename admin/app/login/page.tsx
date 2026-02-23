"use client";

/* 更新说明（2026-02-20）：登录成功统一跳转到 /，由 middleware 决定落地页。 */

import { useRouter } from "next/navigation";
import { Button, Form, Input, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useUserStore } from "@/store/user-store";

type LoginFormValues = {
  identifier: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const login = useUserStore((state) => state.login);
  const isLoggingIn = useUserStore((state) => state.isLoggingIn);

  const handleLogin = async (values: LoginFormValues) => {
    const success = await login(values);
    if (!success) {
      message.error("Login failed, please check credentials.");
      return;
    }

    router.replace("/");
  };

  const handleDemoLogin = async () => {
    const success = await login({ identifier: "admin", password: "admin" });
    if (!success) {
      message.error("Demo login failed.");
      return;
    }

    router.replace("/");
  };

  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/page/login/bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/90 via-[#001529]/95 to-slate-900/90" />

        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px]" />

        <div className="relative z-10 w-full flex flex-col justify-between p-16 text-white">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
            <span className="text-xl font-medium tracking-wide opacity-90">
              Allico Admin
            </span>
          </div>

          <div className="mb-12">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Welcome to <br />
              <span className="text-blue-400">Allico Industry</span> <br />
              Admin Center
            </h1>
            <p className="text-lg text-white/60 max-w-lg leading-relaxed">
              Manage users, roles and route permissions from one place.
            </p>
          </div>

          <div className="text-sm text-white/30">
            © {new Date().getFullYear()} Allico Industry
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[45%] bg-white flex flex-col relative">
        <div className="flex-1 flex items-center justify-center px-8 sm:px-12 lg:px-20">
          <div className="w-full max-w-110">
            <div className="text-left mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                Welcome Back
                <br />
                Sign in to continue
              </h2>
              <p className="text-slate-500">
                Enter your account credentials to access the admin system.
              </p>
            </div>

            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={handleLogin}
              className="space-y-6"
              size="large"
            >
              <Form.Item
                name="identifier"
                rules={[
                  {
                    required: true,
                    message: "Please enter username or email.",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-slate-400 mx-2" />}
                  placeholder="Username or Email"
                  className="h-12 bg-slate-50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:bg-white rounded-xl transition-all"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Please enter password." }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-slate-400 mx-2" />}
                  placeholder="Password"
                  className="h-12 bg-slate-50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:bg-white rounded-xl transition-all"
                />
              </Form.Item>

              <div className="flex items-center justify-between text-sm">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-700">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                    />
                    <span>Remember me</span>
                  </label>
                </Form.Item>
                <a className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                  Forgot password
                </a>
              </div>

              <Button
                block
                type="primary"
                htmlType="submit"
                loading={isLoggingIn}
                className="h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 border-none rounded-xl text-base font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300 mt-2"
              >
                Login
              </Button>
            </Form>

            <div className="mt-10">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="bg-white px-2 text-slate-400">
                    Demo Access
                  </span>
                </div>
              </div>

              <div
                onClick={handleDemoLogin}
                className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    A
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">
                      Admin Account
                    </span>
                    <span className="text-xs text-slate-500">
                      Full access permissions
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <code className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
                    admin / admin
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
