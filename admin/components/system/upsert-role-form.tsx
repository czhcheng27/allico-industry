"use client";

/* 更新说明（2026-02-20）： 角色抽屉表单改为树形权限配置，支持 read/write 联动与批量操作。 */

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  type Key,
} from "react";
import { Button, Checkbox, Form, Input, Space, Tree, message } from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import type { DataNode, TreeProps } from "antd/es/tree";
import { getMenuConfig } from "@/lib/permission";
import { upsertRoleApi, type RoleRecord } from "@/lib/api";
import type { MenuItem } from "@/types/menu";
import type { PermissionAction } from "@/types/auth";

type UpsertRoleFormProps = {
  initData?: RoleRecord;
  type?: "edit" | "create";
};

export type UpsertRoleFormRef = {
  onConfirm: () => Promise<{ code: number; data: Record<string, unknown> }>;
};

type PermissionMap = Map<string, PermissionAction[]>;

function toTreeData(items: MenuItem[]): DataNode[] {
  return items.map((item) => ({
    key: item.key,
    title: item.label,
    children: item.children ? toTreeData(item.children) : undefined,
  }));
}

function collectLeafKeys(items: MenuItem[]): string[] {
  const leafKeys: string[] = [];
  const walk = (nodes: MenuItem[]) => {
    nodes.forEach((node) => {
      if (!node.children || node.children.length === 0) {
        leafKeys.push(node.key);
        return;
      }
      walk(node.children);
    });
  };
  walk(items);
  return leafKeys;
}

function normalizeCheckedKeys(checked: Key[] | { checked: Key[] }): Key[] {
  return Array.isArray(checked) ? checked : checked.checked;
}

function getInitialCheckedKeys(initData?: RoleRecord): Key[] {
  return (initData?.permissions || [])
    .map((permission) => permission.route)
    .filter(Boolean);
}

function getInitialPermissionMap(initData?: RoleRecord): PermissionMap {
  const map: PermissionMap = new Map();
  (initData?.permissions || []).forEach((permission) => {
    if (!permission.route) {
      return;
    }
    map.set(permission.route, permission.actions || ["read"]);
  });
  return map;
}

export const UpsertRoleForm = forwardRef<UpsertRoleFormRef, UpsertRoleFormProps>(
  ({ initData, type = "create" }, ref) => {
    const [form] = Form.useForm();
    const menuConfig = useMemo(() => getMenuConfig(), []);
    const treeData = useMemo(() => toTreeData(menuConfig), [menuConfig]);
    const allLeafKeys = useMemo(() => collectLeafKeys(menuConfig), [menuConfig]);

    const [checkedKeys, setCheckedKeys] = useState<Key[]>(() =>
      getInitialCheckedKeys(initData),
    );
    const [permissionMap, setPermissionMap] = useState<PermissionMap>(() =>
      getInitialPermissionMap(initData),
    );

    const handleActionChange = (
      route: string,
      actionType: PermissionAction,
      event: CheckboxChangeEvent,
    ) => {
      const checked = event.target.checked;
      const previousActions = permissionMap.get(route) || [];
      const nextActions = new Set(previousActions);

      if (actionType === "read") {
        if (checked) {
          nextActions.add("read");
        } else {
          if (nextActions.has("write")) {
            return;
          }
          return;
        }
      }

      if (actionType === "write") {
        if (checked) {
          nextActions.add("read");
          nextActions.add("write");
        } else {
          nextActions.delete("write");
        }
      }

      const nextMap = new Map(permissionMap);
      nextMap.set(route, Array.from(nextActions));
      setPermissionMap(nextMap);
    };

    const onCheck: TreeProps["onCheck"] = (checked) => {
      const nextChecked = normalizeCheckedKeys(checked);
      setCheckedKeys(nextChecked);

      const nextMap = new Map(permissionMap);
      allLeafKeys.forEach((route) => {
        const enabled = nextChecked.includes(route);
        if (!enabled) {
          nextMap.delete(route);
          return;
        }

        if (!nextMap.has(route)) {
          nextMap.set(route, ["read"]);
        }
      });
      setPermissionMap(nextMap);
    };

    const handleSelectAllRoutes = () => {
      setCheckedKeys(allLeafKeys);
      const nextMap = new Map(permissionMap);
      allLeafKeys.forEach((route) => {
        if (!nextMap.has(route)) {
          nextMap.set(route, ["read"]);
        }
      });
      setPermissionMap(nextMap);
    };

    const handleDeselectAllRoutes = () => {
      setCheckedKeys([]);
      setPermissionMap(new Map());
    };

    const handleSetAllReadOnly = () => {
      const nextMap = new Map(permissionMap);
      checkedKeys.forEach((route) => {
        if (typeof route === "string" && allLeafKeys.includes(route)) {
          nextMap.set(route, ["read"]);
        }
      });
      setPermissionMap(nextMap);
    };

    const handleSetAllReadWrite = () => {
      const nextMap = new Map(permissionMap);
      checkedKeys.forEach((route) => {
        if (typeof route === "string" && allLeafKeys.includes(route)) {
          nextMap.set(route, ["read", "write"]);
        }
      });
      setPermissionMap(nextMap);
    };

    const renderTreeTitle = (node: DataNode) => {
      const key = String(node.key);
      const isLeaf = !node.children || node.children.length === 0;
      const enabled = checkedKeys.includes(key);
      const actions = permissionMap.get(key) || [];
      const isRead = actions.includes("read");
      const isWrite = actions.includes("write");

      return (
        <Space size={14}>
          <span>{String(node.title)}</span>
          {isLeaf && (
            <>
              <Checkbox
                checked={isRead}
                disabled={!enabled || isWrite}
                onChange={(event) => handleActionChange(key, "read", event)}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                Read Only
              </Checkbox>
              <Checkbox
                checked={isWrite}
                disabled={!enabled || !isRead}
                onChange={(event) => handleActionChange(key, "write", event)}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                Read + Write
              </Checkbox>
            </>
          )}
        </Space>
      );
    };

    useImperativeHandle(ref, () => ({
      onConfirm: async () => {
        const values = await form.validateFields();
        const permissions = allLeafKeys
          .filter((route) => checkedKeys.includes(route))
          .map((route) => ({
            route,
            actions: permissionMap.get(route) || ["read"],
          }));

        const payload = {
          id: type === "edit" ? initData?.id : "",
          roleName: values.roleName,
          description: values.description || "",
          permissions,
        };

        await upsertRoleApi(payload);
        message.success(
          type === "create"
            ? "Role created successfully."
            : "Role updated successfully.",
        );

        return {
          code: 200,
          data: payload,
        };
      },
    }));

    return (
      <Form
        form={form}
        layout="vertical"
        name="upsert-role-form"
        initialValues={{
          roleName: initData?.roleName || "",
          description: initData?.description || "",
        }}
      >
        <Form.Item
          name="roleName"
          label="Role Name"
          rules={[{ required: true, message: "Please enter role name." }]}
        >
          <Input placeholder="Enter role name" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Enter description" />
        </Form.Item>

        <Form.Item label="Permission Configuration">
          <Space direction="vertical" size={10} style={{ width: "100%" }}>
            <Space wrap>
              <Button type="primary" onClick={handleSelectAllRoutes}>
                Select All Routes
              </Button>
              <Button danger onClick={handleDeselectAllRoutes}>
                Deselect All Routes
              </Button>
            </Space>

            <Space wrap>
              <Button onClick={handleSetAllReadOnly}>All Routes Read Only</Button>
              <Button onClick={handleSetAllReadWrite}>All Routes Read + Write</Button>
            </Space>

            <Tree
              checkable
              checkedKeys={checkedKeys}
              onCheck={onCheck}
              treeData={treeData}
              titleRender={renderTreeTitle}
              selectable={false}
              defaultExpandAll
            />
          </Space>
        </Form.Item>
      </Form>
    );
  },
);

UpsertRoleForm.displayName = "UpsertRoleForm";
