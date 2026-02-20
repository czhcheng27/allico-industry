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
  deleteUserApi,
  getUserListApi,
  resetUserPasswordApi,
  upsertUserApi,
  type UserRecord,
} from "@/lib/api";
import { PermissionButton } from "@/components/auth/permission-button";
import {
  UpsertUserForm,
  type UpsertUserFormRef,
} from "@/components/system/upsert-user-form";

const { Title, Paragraph } = Typography;

export default function UserManagementPage() {
  const [tableData, setTableData] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<UserRecord | undefined>(undefined);
  const formRef = useRef<UpsertUserFormRef>(null);

  const fetchList = async (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    try {
      const response = await getUserListApi({ page: nextPage, pageSize: nextPageSize });
      setTableData(response.data.users || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Fetch users failed:", error);
      message.error("Failed to fetch users.");
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

  const openEditModal = (record: UserRecord) => {
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
      await upsertUserApi(payload as {
        id?: string;
        username: string;
        email: string;
        roles: string[];
        password?: string;
      });
      message.success(
        modalType === "create"
          ? "User created successfully."
          : "User updated successfully.",
      );
      setIsModalOpen(false);
      fetchList();
    } catch (error) {
      console.error("Save user failed:", error);
      message.error("Failed to save user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (record: UserRecord) => {
    Modal.confirm({
      title: "Delete User",
      content: `Delete user "${record.username}"?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        await deleteUserApi(record.id);
        message.success("User deleted.");
        fetchList();
      },
    });
  };

  const handleResetPassword = (record: UserRecord) => {
    Modal.confirm({
      title: "Reset Password",
      content: `Reset password for "${record.username}" to their username?`,
      onOk: async () => {
        await resetUserPasswordApi(record.id);
        message.success("Password reset.");
      },
    });
  };

  return (
    <div>
      <div className="admin-page-title">
        <Title level={3}>User Management</Title>
        <Paragraph type="secondary">
          Manage admin users and role assignments.
        </Paragraph>
      </div>

      <div className="admin-toolbar">
        <PermissionButton
          type="primary"
          route="/system-management/user"
          onClick={openCreateModal}
        >
          Add User
        </PermissionButton>
      </div>

      <Table<UserRecord>
        rowKey="id"
        loading={loading}
        dataSource={tableData}
        pagination={false}
        scroll={{ x: "max-content" }}
        columns={[
          { title: "Username", dataIndex: "username", width: 160 },
          { title: "Email", dataIndex: "email", width: 180 },
          {
            title: "Roles",
            dataIndex: "roles",
            width: 220,
            render: (value: string[]) => value.join(", "),
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
            width: 240,
            fixed: "right",
            render: (_, record) => {
              if (record.email === "admin") {
                return null;
              }

              return (
                <Space>
                  <PermissionButton
                    type="link"
                    route="/system-management/user"
                    onClick={() => openEditModal(record)}
                  >
                    Edit
                  </PermissionButton>
                  <PermissionButton
                    type="link"
                    route="/system-management/user"
                    onClick={() => handleResetPassword(record)}
                  >
                    Reset Password
                  </PermissionButton>
                  <PermissionButton
                    type="link"
                    danger
                    route="/system-management/user"
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
        title={modalType === "create" ? "Add User" : "Edit User"}
        open={isModalOpen}
        width={640}
        destroyOnClose
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okButtonProps={{ loading: isSubmitting }}
      >
        <UpsertUserForm
          ref={formRef}
          type={modalType}
          initData={editingItem}
        />
      </Modal>
    </div>
  );
}
