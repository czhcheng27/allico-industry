"use client";

import { forwardRef, useEffect, useMemo, useState, useImperativeHandle } from "react";
import { Checkbox, Form, Input, Space, Typography } from "antd";
import { getMenuConfig } from "@/lib/permission";
import type { RoleRecord } from "@/lib/api";

type UpsertRoleFormProps = {
  initData?: RoleRecord;
  type?: "edit" | "create";
};

export type UpsertRoleFormRef = {
  onConfirm: () => Promise<Record<string, unknown>>;
};

function collectLeafRoutes() {
  const leaves: string[] = [];
  const traverse = (items: ReturnType<typeof getMenuConfig>) => {
    items.forEach((item) => {
      if (!item.children?.length) {
        leaves.push(item.key);
      } else {
        traverse(item.children);
      }
    });
  };
  traverse(getMenuConfig());
  return leaves;
}

export const UpsertRoleForm = forwardRef<UpsertRoleFormRef, UpsertRoleFormProps>(
  ({ initData, type = "create" }, ref) => {
    const [form] = Form.useForm();
    const [selectedRoutes, setSelectedRoutes] = useState<string[]>(() =>
      (initData?.permissions || []).map((item) => item.route),
    );
    const [writeRoutes, setWriteRoutes] = useState<string[]>(() =>
      (initData?.permissions || [])
        .filter((item) => item.actions.includes("write"))
        .map((item) => item.route),
    );

    const routeOptions = useMemo(() => collectLeafRoutes(), []);

    useImperativeHandle(ref, () => ({
      onConfirm: async () => {
        const values = await form.validateFields();
        const permissions = selectedRoutes.map((route) => ({
          route,
          actions: writeRoutes.includes(route) ? ["read", "write"] : ["read"],
        }));

        return {
          ...values,
          permissions,
          id: type === "edit" ? initData?.id : "",
        };
      },
    }));

    useEffect(() => {
      if (!initData) {
        form.resetFields();
        return;
      }

      form.setFieldsValue({
        roleName: initData.roleName,
        description: initData.description || "",
      });
    }, [form, initData]);

    const toggleRoute = (route: string, checked: boolean) => {
      if (checked) {
        setSelectedRoutes((prev) => [...new Set([...prev, route])]);
        return;
      }
      setSelectedRoutes((prev) => prev.filter((item) => item !== route));
      setWriteRoutes((prev) => prev.filter((item) => item !== route));
    };

    const toggleWrite = (route: string, checked: boolean) => {
      if (checked) {
        setWriteRoutes((prev) => [...new Set([...prev, route])]);
        return;
      }
      setWriteRoutes((prev) => prev.filter((item) => item !== route));
    };

    return (
      <Form form={form} layout="vertical">
        <Form.Item
          name="roleName"
          label="Role Name"
          rules={[{ required: true, message: "Role name is required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <div className="admin-section-label">Permission Config</div>
        <Space direction="vertical" style={{ width: "100%" }}>
          {routeOptions.map((route) => {
            const routeChecked = selectedRoutes.includes(route);
            const writeChecked = writeRoutes.includes(route);
            return (
              <div key={route} className="admin-permission-row">
                <Checkbox
                  checked={routeChecked}
                  onChange={(event) => toggleRoute(route, event.target.checked)}
                >
                  <Typography.Text code>{route}</Typography.Text>
                </Checkbox>
                <Checkbox
                  checked={writeChecked}
                  disabled={!routeChecked}
                  onChange={(event) => toggleWrite(route, event.target.checked)}
                >
                  Read + Write
                </Checkbox>
              </div>
            );
          })}
        </Space>
      </Form>
    );
  },
);

UpsertRoleForm.displayName = "UpsertRoleForm";
