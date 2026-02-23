"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Input,
  message,
  Modal,
  Pagination,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import {
  deleteCategoryApi,
  getCategoryListApi,
  upsertCategoryApi,
  type CategoryRecord,
  type CategorySubcategory,
} from "@/lib/api";
import { PermissionButton } from "@/components/auth/permission-button";
import {
  UpsertCategoryForm,
  type UpsertCategoryFormRef,
} from "@/components/categories/upsert-category-form";

const { Title, Paragraph } = Typography;

type CategoryFilter = {
  keyword: string;
};

export default function CategoriesPage() {
  const [tableData, setTableData] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<CategoryFilter>({ keyword: "" });
  const [keywordInput, setKeywordInput] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<CategoryRecord | undefined>(
    undefined,
  );
  const formRef = useRef<UpsertCategoryFormRef>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await getCategoryListApi({
        keyword: filters.keyword || undefined,
      });
      const categories = response.data.categories || [];
      setTableData(categories);
      setTotal(response.data.total || categories.length);
    } catch (error) {
      console.error("Fetch categories failed:", error);
      message.error("Failed to fetch category list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.keyword]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, pageSize, total]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tableData.slice(start, start + pageSize);
  }, [tableData, page, pageSize]);

  const openCreateModal = () => {
    setModalType("create");
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (record: CategoryRecord) => {
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
      await upsertCategoryApi(payload);
      message.success(
        modalType === "create"
          ? "Category created successfully."
          : "Category updated successfully.",
      );
      setIsModalOpen(false);
      await fetchList();
    } catch (error: unknown) {
      console.error("Save category failed:", error);
      message.error("Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (record: CategoryRecord) => {
    Modal.confirm({
      title: "Delete Category",
      content: `Are you sure you want to delete "${record.name}"?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteCategoryApi(record.id);
          message.success("Category deleted.");
          await fetchList();
        } catch (error) {
          console.error("Delete category failed:", error);
          message.error("Failed to delete category.");
        }
      },
    });
  };

  return (
    <div>
      <div className="admin-page-title">
        <Title level={3}>Categories</Title>
        <Paragraph type="secondary">
          Manage top-level categories and their subcategories for product
          browsing.
        </Paragraph>
      </div>

      <div className="admin-toolbar">
        <Input
          style={{ width: 280 }}
          placeholder="Search name / slug / subcategory"
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          onPressEnter={() => {
            setPage(1);
            setFilters({ keyword: keywordInput.trim() });
          }}
        />
        <Button
          onClick={() => {
            setPage(1);
            setFilters({ keyword: keywordInput.trim() });
          }}
        >
          Search
        </Button>
        <Button
          onClick={() => {
            setKeywordInput("");
            setPage(1);
            setFilters({ keyword: "" });
          }}
        >
          Reset
        </Button>
        <PermissionButton
          type="primary"
          route="/categories"
          onClick={openCreateModal}
        >
          Add Category
        </PermissionButton>
      </div>

      <Table<CategoryRecord>
        rowKey="id"
        loading={loading}
        dataSource={pagedData}
        pagination={false}
        scroll={{ x: "max-content" }}
        columns={[
          {
            title: "Category",
            dataIndex: "name",
            width: 240,
            render: (_, record) => (
              <div>
                <div style={{ fontWeight: 600 }}>{record.name}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>
                  {record.shortName || "-"}
                </div>
              </div>
            ),
          },
          {
            title: "Slug",
            dataIndex: "slug",
            width: 180,
          },
          {
            title: "Subcategories",
            dataIndex: "subcategories",
            width: 360,
            render: (value: CategorySubcategory[]) => {
              if (!value || value.length === 0) {
                return <span style={{ color: "#94a3b8" }}>-</span>;
              }

              const visible = value.slice(0, 4);
              const hiddenCount = value.length - visible.length;

              return (
                <div className="admin-category-tags">
                  {visible.map((item) => (
                    <Tag key={`${item.slug}-${item.name}`}>{item.name}</Tag>
                  ))}
                  {hiddenCount > 0 ? <Tag>{`+${hiddenCount}`}</Tag> : null}
                </div>
              );
            },
          },
          {
            title: "Sort",
            dataIndex: "sortOrder",
            width: 100,
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
            fixed: "right",
            width: 170,
            render: (_, record) => (
              <Space>
                <PermissionButton
                  type="link"
                  route="/categories"
                  onClick={() => openEditModal(record)}
                >
                  Edit
                </PermissionButton>
                <PermissionButton
                  type="link"
                  route="/categories"
                  danger
                  onClick={() => handleDelete(record)}
                >
                  Delete
                </PermissionButton>
              </Space>
            ),
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
        title={modalType === "create" ? "Add Category" : "Edit Category"}
        open={isModalOpen}
        width={780}
        destroyOnClose
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okButtonProps={{ loading: isSubmitting }}
      >
        <UpsertCategoryForm
          ref={formRef}
          type={modalType}
          initData={editingItem}
        />
      </Modal>
    </div>
  );
}
