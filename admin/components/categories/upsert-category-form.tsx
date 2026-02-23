"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { Button, Form, Input, InputNumber, Space } from "antd";
import type { CategoryRecord, CategorySubcategory } from "@/lib/api";

type UpsertCategoryFormProps = {
  initData?: CategoryRecord;
  type?: "edit" | "create";
};

export type UpsertCategoryFormRef = {
  onConfirm: () => Promise<{
    id?: string;
    slug: string;
    name: string;
    shortName?: string;
    description?: string;
    cardImage?: string;
    icon?: string;
    sortOrder?: number;
    subcategories: CategorySubcategory[];
  }>;
};

export const UpsertCategoryForm = forwardRef<
  UpsertCategoryFormRef,
  UpsertCategoryFormProps
>(({ initData, type = "create" }, ref) => {
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    onConfirm: async () => {
      const values = await form.validateFields();
      const subcategories = (values.subcategories || [])
        .map((item: CategorySubcategory) => ({
          slug: String(item?.slug || "").trim(),
          name: String(item?.name || "").trim(),
        }))
        .filter((item: CategorySubcategory) => item.slug && item.name);

      return {
        id: type === "edit" ? initData?.id : undefined,
        slug: String(values.slug || "").trim(),
        name: String(values.name || "").trim(),
        shortName: String(values.shortName || "").trim(),
        description: String(values.description || "").trim(),
        cardImage: String(values.cardImage || "").trim(),
        icon: String(values.icon || "").trim(),
        sortOrder:
          typeof values.sortOrder === "number"
            ? values.sortOrder
            : Number(values.sortOrder) || 0,
        subcategories,
      };
    },
  }));

  useEffect(() => {
    if (!initData) {
      form.setFieldsValue({
        icon: "category",
        sortOrder: 0,
        subcategories: [{ slug: "", name: "" }],
      });
      return;
    }

    form.setFieldsValue({
      ...initData,
      subcategories:
        initData.subcategories?.length > 0
          ? initData.subcategories
          : [{ slug: "", name: "" }],
    });
  }, [form, initData]);

  return (
    <Form form={form} layout="vertical">
      <Space size="middle" style={{ display: "flex" }}>
        <Form.Item
          name="name"
          label="Category Name"
          style={{ flex: 1 }}
          rules={[{ required: true, message: "Category name is required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="slug"
          label="Slug"
          style={{ flex: 1 }}
          rules={[
            { required: true, message: "Slug is required" },
            {
              pattern: /^[a-z0-9-]+$/,
              message: "Use lowercase letters, numbers and hyphens only",
            },
          ]}
        >
          <Input placeholder="cargo-control" />
        </Form.Item>
      </Space>

      <Space size="middle" style={{ display: "flex" }}>
        <Form.Item name="shortName" label="Short Name" style={{ flex: 1 }}>
          <Input placeholder="Cargo" />
        </Form.Item>
        <Form.Item name="icon" label="Icon" style={{ flex: 1 }}>
          <Input placeholder="category" />
        </Form.Item>
        <Form.Item name="sortOrder" label="Sort Order" style={{ flex: 1 }}>
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Space>

      <Form.Item name="cardImage" label="Card Image URL">
        <Input />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={3} showCount maxLength={240} />
      </Form.Item>

      <Form.List name="subcategories">
        {(fields, { add, remove }) => (
          <div>
            <div className="admin-section-label">Subcategories</div>
            {fields.map((field) => (
              <Space key={field.key} style={{ display: "flex", marginBottom: 8 }}>
                <Form.Item
                  {...field}
                  name={[field.name, "name"]}
                  rules={[{ required: true, message: "Name is required" }]}
                >
                  <Input placeholder="Subcategory name" />
                </Form.Item>
                <Form.Item
                  {...field}
                  name={[field.name, "slug"]}
                  rules={[
                    { required: true, message: "Slug is required" },
                    {
                      pattern: /^[a-z0-9-]+$/,
                      message: "Use lowercase letters, numbers and hyphens only",
                    },
                  ]}
                >
                  <Input placeholder="subcategory-slug" />
                </Form.Item>
                <Button danger onClick={() => remove(field.name)}>
                  Remove
                </Button>
              </Space>
            ))}
            <Button type="dashed" onClick={() => add({ name: "", slug: "" })}>
              Add Subcategory
            </Button>
          </div>
        )}
      </Form.List>
    </Form>
  );
});

UpsertCategoryForm.displayName = "UpsertCategoryForm";
