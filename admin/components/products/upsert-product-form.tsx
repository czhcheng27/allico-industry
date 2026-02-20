"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { Button, Form, Input, Select, Space } from "antd";
import type { Product } from "@/types/product";

const categories = [
  { label: "Towing", value: "towing" },
  { label: "Cargo Control", value: "cargo-control" },
  { label: "Industrial Chains", value: "industrial-chains" },
  { label: "Hooks and Accessories", value: "hooks-and-accessories" },
];

type UpsertProductFormProps = {
  initData?: Product;
  type?: "edit" | "create";
};

export type UpsertProductFormRef = {
  onConfirm: () => Promise<Record<string, unknown>>;
};

export const UpsertProductForm = forwardRef<
  UpsertProductFormRef,
  UpsertProductFormProps
>(({ initData, type = "create" }, ref) => {
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    onConfirm: async () => {
      const values = await form.validateFields();
      return {
        ...values,
        id: type === "edit" ? initData?.id : "",
      };
    },
  }));

  useEffect(() => {
    if (!initData) {
      form.setFieldsValue({
        status: "In Stock",
        listSpecs: [{ label: "Size", value: "" }],
      });
      return;
    }

    form.setFieldsValue({
      ...initData,
      listSpecs:
        initData.listSpecs?.length > 0
          ? initData.listSpecs
          : [{ label: "Size", value: "" }],
    });
  }, [form, initData]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="name"
        label="Product Name"
        rules={[{ required: true, message: "Product name is required" }]}
      >
        <Input />
      </Form.Item>

      <Space size="middle" style={{ display: "flex" }}>
        <Form.Item
          name="slug"
          label="Slug"
          style={{ flex: 1 }}
          rules={[{ required: true, message: "Slug is required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="sku"
          label="SKU"
          style={{ flex: 1 }}
          rules={[{ required: true, message: "SKU is required" }]}
        >
          <Input />
        </Form.Item>
      </Space>

      <Space size="middle" style={{ display: "flex" }}>
        <Form.Item
          name="category"
          label="Category"
          style={{ flex: 1 }}
          rules={[{ required: true, message: "Category is required" }]}
        >
          <Select options={categories} />
        </Form.Item>
        <Form.Item name="subcategory" label="Subcategory" style={{ flex: 1 }}>
          <Input />
        </Form.Item>
      </Space>

      <Space size="middle" style={{ display: "flex" }}>
        <Form.Item
          name="price"
          label="Price"
          style={{ flex: 1 }}
          rules={[{ required: true, message: "Price is required" }]}
        >
          <Input placeholder="$89.99" />
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          style={{ flex: 1 }}
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: "In Stock", value: "In Stock" },
              { label: "Low Stock", value: "Low Stock" },
            ]}
          />
        </Form.Item>
      </Space>

      <Form.Item
        name="image"
        label="Main Image URL"
        rules={[{ required: true, message: "Image URL is required" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="badge" label="Badge">
        <Input placeholder="New Arrival" />
      </Form.Item>

      <Form.List name="listSpecs">
        {(fields, { add, remove }) => (
          <div>
            <div className="admin-section-label">Specs</div>
            {fields.map((field) => (
              <Space key={field.key} style={{ display: "flex", marginBottom: 8 }}>
                <Form.Item
                  {...field}
                  name={[field.name, "label"]}
                  rules={[{ required: true, message: "Label is required" }]}
                >
                  <Input placeholder="Label" />
                </Form.Item>
                <Form.Item
                  {...field}
                  name={[field.name, "value"]}
                  rules={[{ required: true, message: "Value is required" }]}
                >
                  <Input placeholder="Value" />
                </Form.Item>
                <Button danger onClick={() => remove(field.name)}>
                  Remove
                </Button>
              </Space>
            ))}
            <Button type="dashed" onClick={() => add({ label: "", value: "" })}>
              Add Spec
            </Button>
          </div>
        )}
      </Form.List>
    </Form>
  );
});

UpsertProductForm.displayName = "UpsertProductForm";
