"use client";

/* Updated (2026-02-20): user page now uses overlay modal CRUD with dynamic role options. */

import { useCallback, useEffect, useState } from "react";
import { Pagination, Table, message } from "antd";
import type { PaginationProps, TableColumnsType } from "antd";
import dayjs from "dayjs";
import { useOverlay } from "@/components/overlay/OverlayProvider";
import { PermissionButton } from "@/components/auth/permission-button";
import { UpsertUserForm } from "@/components/system/upsert-user-form";
import { useTableScrollHeight } from "@/hooks/use-table-scroll-height";
import {
  deleteUserApi,
  getRoleListApi,
  getUserListApi,
  resetUserPasswordApi,
  type UserRecord,
} from "@/lib/api";

type RoleOption = {
  label: string;
  value: string;
};

export default function UserManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [tableData, setTableData] = useState<UserRecord[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(false);

  const { containerRef, scrollY } = useTableScrollHeight();
  const overlay = useOverlay();

  const getUserList = useCallback(async (page: number, size: number) => {
    setLoading(true);
    try {
      const response = await getUserListApi({ page, pageSize: size });
      setTableData(response.data.users || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Fetch users failed:", error);
      message.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, []);

  const getRoleOptions = useCallback(async () => {
    try {
      const response = await getRoleListApi({ page: 1, pageSize: 200 });
      const options = (response.data.roles || []).map((role) => ({
        label: role.roleName,
        value: role.roleName,
      }));
      setRoleOptions(options);
    } catch (error) {
      console.error("Fetch roles failed:", error);
      message.error("Failed to fetch roles.");
    }
  }, []);

  useEffect(() => {
    void getUserList(currentPage, pageSize);
  }, [currentPage, pageSize, getUserList]);

  useEffect(() => {
    void getRoleOptions();
  }, [getRoleOptions]);

  const onPaginationChange: PaginationProps["onChange"] = (page) => {
    setCurrentPage(page);
  };

  const onPageSizeChange: PaginationProps["onShowSizeChange"] = (_, nextSize) => {
    setPageSize(nextSize);
    setCurrentPage(1);
  };

  const openUserModal = (type: "create" | "edit", initData?: UserRecord) => {
    const modal = overlay?.modal;
    if (!modal) {
      return;
    }

    if (roleOptions.length === 0) {
      message.warning("Role options are loading. Please try again.");
      return;
    }

    modal.open(<UpsertUserForm initData={initData} type={type} roleOptions={roleOptions} />, {
      title: type === "create" ? "Add User" : "Edit User",
      width: 640,
      okCallback: () => {
        void getUserList(currentPage, pageSize);
      },
    });
  };

  const openDeleteConfirm = (record: UserRecord) => {
    const modal = overlay?.modal;
    if (!modal) {
      return;
    }

    modal.open(<div>Are you sure you want to delete user {record.username}?</div>, {
      title: "Delete User",
      width: 420,
      okText: "Delete",
      onOk: async () => {
        await deleteUserApi(record.id);
        message.success("Delete successfully.");
      },
      okCallback: () => {
        void getUserList(currentPage, pageSize);
      },
    });
  };

  const openResetPasswordConfirm = (record: UserRecord) => {
    const modal = overlay?.modal;
    if (!modal) {
      return;
    }

    modal.open(<div>Reset password for {record.username} to username?</div>, {
      title: "Reset Password",
      width: 420,
      okText: "Reset",
      onOk: async () => {
        await resetUserPasswordApi(record.id);
        message.success("Password reset successfully.");
      },
    });
  };

  const columns: TableColumnsType<UserRecord> = [
    {
      title: "Username",
      dataIndex: "username",
      width: 160,
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 220,
    },
    {
      title: "Roles",
      dataIndex: "roles",
      width: 220,
      render: (value: string[]) => value.join(", "),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      width: 200,
      render: (value) => dayjs(value).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      width: 200,
      render: (value) => dayjs(value).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Operation",
      fixed: "right",
      width: 280,
      render: (_, record) =>
        record.roles.includes("admin") ? null : (
          <>
            <PermissionButton
              type="link"
              route="/system-management/user"
              onClick={() => {
                openUserModal("edit", record);
              }}
            >
              Edit
            </PermissionButton>
            <PermissionButton
              type="link"
              route="/system-management/user"
              onClick={() => {
                openResetPasswordConfirm(record);
              }}
            >
              Reset Password
            </PermissionButton>
            <PermissionButton
              type="link"
              danger
              route="/system-management/user"
              onClick={() => {
                openDeleteConfirm(record);
              }}
            >
              Delete
            </PermissionButton>
          </>
        ),
    },
  ];

  return (
    <>
      <div className="flex justify-end items-center mb-4">
        <PermissionButton
          type="primary"
          route="/system-management/user"
          onClick={() => {
            openUserModal("create");
          }}
        >
          Add User
        </PermissionButton>
      </div>

      <div ref={containerRef} className="h-[calc(100%-100px)]">
        <Table<UserRecord>
          rowKey="id"
          loading={loading}
          dataSource={tableData}
          columns={columns}
          scroll={{ x: "max-content", y: scrollY }}
          pagination={false}
        />
      </div>

      <div className="flex justify-end mt-4">
        <Pagination
          total={total}
          current={currentPage}
          pageSize={pageSize}
          showSizeChanger
          showQuickJumper
          showTotal={(value) => `Total ${value} items`}
          onChange={onPaginationChange}
          onShowSizeChange={onPageSizeChange}
        />
      </div>
    </>
  );
}
