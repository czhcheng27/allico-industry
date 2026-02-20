"use client";

import { useEffect, useRef, useState } from "react";
import {
  message,
  Modal,
  Pagination,
  Space,
  Table,
  Typography,
} from "antd";
import dayjs from "dayjs";
import {
  deleteRoleApi,
  getRoleListApi,
  upsertRoleApi,
  type RoleRecord,
} from "@/lib/api";
import { PermissionButton } from "@/components/auth/permission-button";
import {
  UpsertRoleForm,
  type UpsertRoleFormRef,
} from "@/components/system/upsert-role-form";

const { Title, Paragraph } = Typography;

export default function RoleManagementPage() {
  const [tableData, setTableData] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<RoleRecord | undefined>(undefined);
  const formRef = useRef<UpsertRoleFormRef>(null);

  const fetchList = async (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    try {
      const response = await getRoleListApi({ page: nextPage, pageSize: nextPageSize });
      setTableData(response.data.roles || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Fetch roles failed:", error);
      message.error("Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const openCreateModal = () => {
    setModalType("create");
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (record: RoleRecord) => {
    setModalType("edit");
    setEditingItem(record);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formRef.current) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = await formRef.current.onConfirm();
      await upsertRoleApi(payload as {
        id?: string;
        roleName: string;
        description?: string;
        permissions: { route: string; actions: ("read" | "write")[] }[];
      });
      message.success(
        modalType === "create"
          ? "Role created successfully."
          : "Role updated successfully.",
      );
      setIsModalOpen(false);
      fetchList();
    } catch (error) {
      console.error("Save role failed:", error);
      message.error("Failed to save role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (record: RoleRecord) => {
    Modal.confirm({
      title: "Delete Role",
      content: `Delete role "${record.roleName}"?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        await deleteRoleApi(record.id);
        message.success("Role deleted.");
        fetchList();
      },
    });
  };

  return (
    <div>
      <div className="admin-page-title">
        <Title level={3}>Role Management</Title>
        <Paragraph type="secondary">
          Configure route-level permissions by role.
        </Paragraph>
      </div>

      <div className="admin-toolbar">
        <PermissionButton
          type="primary"
          route="/system-management/role"
          onClick={openCreateModal}
        >
          Add Role
        </PermissionButton>
      </div>

      <Table<RoleRecord>
        rowKey="id"
        loading={loading}
        dataSource={tableData}
        pagination={false}
        scroll={{ x: "max-content" }}
        columns={[
          { title: "Role Name", dataIndex: "roleName", width: 180 },
          { title: "Description", dataIndex: "description", width: 320 },
          {
            title: "Permissions",
            dataIndex: "permissions",
            width: 280,
            render: (value: RoleRecord["permissions"]) =>
              value.map((item) => item.route).join(", "),
          },
          {
            title: "Created At",
            dataIndex: "createdAt",
            width: 180,
            render: (value: string) => dayjs(value).format("YYYY-MM-DD HH:mm"),
          },
          {
            title: "Updated At",
            dataIndex: "updatedAt",
            width: 180,
            render: (value: string) => dayjs(value).format("YYYY-MM-DD HH:mm"),
          },
          {
            title: "Action",
            key: "action",
            width: 170,
            fixed: "right",
            render: (_, record) => {
              if (record.roleName === "admin") {
                return null;
              }

              return (
                <Space>
                  <PermissionButton
                    type="link"
                    route="/system-management/role"
                    onClick={() => openEditModal(record)}
                  >
                    Edit
                  </PermissionButton>
                  <PermissionButton
                    type="link"
                    danger
                    route="/system-management/role"
                    onClick={() => handleDelete(record)}
                  >
                    Delete
                  </PermissionButton>
                </Space>
              );
            },
          },
        ]}
      />

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showQuickJumper
          showTotal={(value) => `Total ${value} items`}
          onChange={(nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }}
        />
      </div>

      <Modal
        title={modalType === "create" ? "Add Role" : "Edit Role"}
        open={isModalOpen}
        width={780}
        destroyOnClose
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okButtonProps={{ loading: isSubmitting }}
      >
        <UpsertRoleForm
          key={editingItem?.id || "create-role"}
          ref={formRef}
          type={modalType}
          initData={editingItem}
        />
      </Modal>
    </div>
  );
}
