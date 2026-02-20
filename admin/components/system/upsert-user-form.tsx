"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { Form, Input, Select } from "antd";
import type { UserRecord } from "@/lib/api";

type UpsertUserFormProps = {
  initData?: UserRecord;
  type?: "edit" | "create";
};

export type UpsertUserFormRef = {
  onConfirm: () => Promise<Record<string, unknown>>;
};

const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
];

export const UpsertUserForm = forwardRef<UpsertUserFormRef, UpsertUserFormProps>(
  ({ initData, type = "create" }, ref) => {
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
      onConfirm: async () => {
        const values = await form.validateFields();
        return {
          ...values,
          id: type === "edit" ? initData?.id : "",
          password: type === "create" ? values.username : undefined,
        };
      },
    }));

    useEffect(() => {
      if (!initData) {
        form.resetFields();
        return;
      }

      form.setFieldsValue({
        username: initData.username,
        email: initData.email,
        roles: initData.roles,
      });
    }, [form, initData]);

    return (
      <Form form={form} layout="vertical">
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Username is required" }]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Invalid email format" },
          ]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="roles"
          label="Roles"
          rules={[{ required: true, message: "Please select at least one role" }]}
        >
          <Select mode="multiple" options={roleOptions} />
        </Form.Item>
      </Form>
    );
  },
);

UpsertUserForm.displayName = "UpsertUserForm";
