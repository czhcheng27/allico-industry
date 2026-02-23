"use client";

/* 更新说明（2026-02-20）： 角色页改为 overlay drawer 流程，表格与分页布局对齐 playground 行为。 */

import { useCallback, useEffect, useState } from "react";
import { Pagination, Table, message } from "antd";
import type { PaginationProps, TableColumnsType } from "antd";
import dayjs from "dayjs";
import { useOverlay } from "@/components/overlay/OverlayProvider";
import { PermissionButton } from "@/components/auth/permission-button";
import { UpsertRoleForm } from "@/components/system/upsert-role-form";
import { useTableScrollHeight } from "@/hooks/use-table-scroll-height";
import { deleteRoleApi, getRoleListApi, type RoleRecord } from "@/lib/api";

export default function RoleManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [tableData, setTableData] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const { containerRef, scrollY } = useTableScrollHeight();
  const overlay = useOverlay();

  const getRoleList = useCallback(async (page: number, size: number) => {
    setLoading(true);
    try {
      const response = await getRoleListApi({ page, pageSize: size });
      setTableData(response.data.roles || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Fetch roles failed:", error);
      message.error("Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void getRoleList(currentPage, pageSize);
  }, [currentPage, pageSize, getRoleList]);

  const onPaginationChange: PaginationProps["onChange"] = (page) => {
    setCurrentPage(page);
  };

  const onPageSizeChange: PaginationProps["onShowSizeChange"] = (_, nextSize) => {
    setPageSize(nextSize);
    setCurrentPage(1);
  };

  const openRoleDrawer = (type: "create" | "edit", initData?: RoleRecord) => {
    const drawer = overlay?.drawer;
    if (!drawer) {
      return;
    }

    drawer.open(<UpsertRoleForm initData={initData} type={type} />, {
      title: type === "create" ? "Add Role" : "Edit Role",
      width: 650,
      okCallback: () => {
        void getRoleList(currentPage, pageSize);
      },
    });
  };

  const openDeleteConfirm = (record: RoleRecord) => {
    const modal = overlay?.modal;
    if (!modal) {
      return;
    }

    modal.open(<div>Are you sure you want to delete role {record.roleName}?</div>, {
      title: "Delete Role",
      width: 420,
      okText: "Delete",
      onOk: async () => {
        await deleteRoleApi(record.id);
        message.success("Delete successfully.");
      },
      okCallback: () => {
        void getRoleList(currentPage, pageSize);
      },
    });
  };

  const columns: TableColumnsType<RoleRecord> = [
    {
      title: "Role Name",
      dataIndex: "roleName",
      width: 160,
    },
    {
      title: "Description",
      dataIndex: "description",
      width: 320,
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
      width: 220,
      render: (_, record) =>
        record.roleName === "admin" ? null : (
          <>
            <PermissionButton
              type="link"
              route="/system-management/role"
              onClick={() => {
                openRoleDrawer("edit", record);
              }}
            >
              Edit
            </PermissionButton>
            <PermissionButton
              type="link"
              danger
              route="/system-management/role"
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
          route="/system-management/role"
          onClick={() => {
            openRoleDrawer("create");
          }}
        >
          Add Role
        </PermissionButton>
      </div>

      <div ref={containerRef} className="h-[calc(100%-100px)]">
        <Table<RoleRecord>
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
