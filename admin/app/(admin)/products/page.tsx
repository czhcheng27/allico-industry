"use client";

import { useEffect, useRef, useState } from "react";
import {
  Button,
  Image,
  Input,
  message,
  Modal,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import {
  deleteProductApi,
  getProductListApi,
  upsertProductApi,
} from "@/lib/api";
import { PermissionButton } from "@/components/auth/permission-button";
import {
  UpsertProductForm,
  type UpsertProductFormRef,
} from "@/components/products/upsert-product-form";
import type { Product } from "@/types/product";

const { Title, Paragraph } = Typography;

type ProductFilter = {
  keyword: string;
  category: string;
};

export default function ProductsPage() {
  const [tableData, setTableData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ProductFilter>({
    keyword: "",
    category: "",
  });

  const [keywordInput, setKeywordInput] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<Product | undefined>(undefined);
  const formRef = useRef<UpsertProductFormRef>(null);

  const fetchList = async (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    try {
      const response = await getProductListApi({
        page: nextPage,
        pageSize: nextPageSize,
        keyword: filters.keyword || undefined,
        category: filters.category || undefined,
      });
      setTableData(response.data.products || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Fetch products failed:", error);
      message.error("Failed to fetch product list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters.keyword, filters.category]);

  const openCreateModal = () => {
    setModalType("create");
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (record: Product) => {
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
      await upsertProductApi(payload);
      message.success(
        modalType === "create"
          ? "Product created successfully."
          : "Product updated successfully.",
      );
      setIsModalOpen(false);
      fetchList();
    } catch (error: unknown) {
      console.error("Save product failed:", error);
      message.error("Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (record: Product) => {
    Modal.confirm({
      title: "Delete Product",
      content: `Are you sure you want to delete "${record.name}"?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        await deleteProductApi(record.id);
        message.success("Product deleted.");
        fetchList();
      },
    });
  };

  return (
    <div>
      <div className="admin-page-title">
        <Title level={3}>Products</Title>
        <Paragraph type="secondary">
          Add, edit and delete products for the catalog website.
        </Paragraph>
      </div>

      <div className="admin-toolbar">
        <Input
          style={{ width: 260 }}
          placeholder="Search name / slug / sku"
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          onPressEnter={() => {
            setPage(1);
            setFilters((prev) => ({ ...prev, keyword: keywordInput.trim() }));
          }}
        />
        <Select
          style={{ width: 220 }}
          allowClear
          placeholder="Filter by category"
          value={filters.category || undefined}
          options={[
            { label: "Towing", value: "towing" },
            { label: "Cargo Control", value: "cargo-control" },
            { label: "Industrial Chains", value: "industrial-chains" },
            { label: "Hooks and Accessories", value: "hooks-and-accessories" },
          ]}
          onChange={(value) => {
            setPage(1);
            setFilters((prev) => ({ ...prev, category: value || "" }));
          }}
        />
        <Button
          onClick={() => {
            setPage(1);
            setFilters((prev) => ({ ...prev, keyword: keywordInput.trim() }));
          }}
        >
          Search
        </Button>
        <Button
          onClick={() => {
            setKeywordInput("");
            setPage(1);
            setFilters({ keyword: "", category: "" });
          }}
        >
          Reset
        </Button>
        <PermissionButton
          type="primary"
          route="/products"
          onClick={openCreateModal}
        >
          Add Product
        </PermissionButton>
      </div>

      <Table<Product>
        rowKey="id"
        loading={loading}
        dataSource={tableData}
        pagination={false}
        scroll={{ x: "max-content" }}
        columns={[
          {
            title: "Image",
            dataIndex: "image",
            width: 90,
            render: (value: string) => (
              <Image
                src={value}
                width={52}
                height={52}
                style={{ objectFit: "cover", borderRadius: 8 }}
                alt="product"
              />
            ),
          },
          {
            title: "Name",
            dataIndex: "name",
            width: 220,
          },
          {
            title: "Category",
            dataIndex: "category",
            width: 170,
          },
          {
            title: "SKU",
            dataIndex: "sku",
            width: 150,
          },
          {
            title: "Price",
            dataIndex: "price",
            width: 120,
          },
          {
            title: "Status",
            dataIndex: "status",
            width: 120,
            render: (value: Product["status"]) =>
              value === "In Stock" ? (
                <Tag color="green">{value}</Tag>
              ) : (
                <Tag color="orange">{value}</Tag>
              ),
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
            width: 180,
            render: (_, record) => (
              <Space>
                <PermissionButton
                  type="link"
                  route="/products"
                  onClick={() => openEditModal(record)}
                >
                  Edit
                </PermissionButton>
                <PermissionButton
                  type="link"
                  route="/products"
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
        title={modalType === "create" ? "Add Product" : "Edit Product"}
        open={isModalOpen}
        width={760}
        destroyOnClose
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okButtonProps={{ loading: isSubmitting }}
      >
        <UpsertProductForm
          ref={formRef}
          type={modalType}
          initData={editingItem}
        />
      </Modal>
    </div>
  );
}
