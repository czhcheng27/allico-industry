"use client";

/* 更新说明（2026-02-20）： 用户表单改为动态角色单选，并通过 overlay 的 ref.onConfirm 提交。 */

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { Form, Input, Select, message } from "antd";
import { upsertUserApi, type UserRecord } from "@/lib/api";

type RoleOption = {
  label: string;
  value: string;
};

type UpsertUserFormProps = {
  initData?: UserRecord;
  type?: "edit" | "create";
  roleOptions: RoleOption[];
};

export type UpsertUserFormRef = {
  onConfirm: () => Promise<{ code: number; data: Record<string, unknown> }>;
};

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

export const UpsertUserForm = forwardRef<UpsertUserFormRef, UpsertUserFormProps>(
  ({ initData, type = "create", roleOptions }, ref) => {
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
      onConfirm: async () => {
        const values = await form.validateFields();
        const payload = {
          id: type === "edit" ? initData?.id : "",
          username: values.username,
          email: values.email,
          roles: values.role ? [values.role] : [],
          password: type === "create" ? values.username : undefined,
        };

        await upsertUserApi(payload);
        message.success(
          type === "create"
            ? "User created successfully."
            : "User updated successfully.",
        );

        return {
          code: 200,
          data: payload,
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
        role: initData.roles?.[0] || undefined,
      });
    }, [form, initData]);

    return (
      <Form
        form={form}
        {...formItemLayout}
        autoComplete="off"
        scrollToFirstError
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please enter username." }]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter email." },
            { type: "email", message: "Please enter a valid email." },
          ]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: "Please select role." }]}
        >
          <Select
            options={roleOptions}
            placeholder="Select role"
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
      </Form>
    );
  },
);

UpsertUserForm.displayName = "UpsertUserForm";
