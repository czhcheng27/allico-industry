"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Button, Form, Input, InputNumber, Select, Space, message } from "antd";
import {
  getCategoryImageUploadSignApi,
  upsertCategoryApi,
  type CategoryRecord,
  type CategorySubcategory,
  type CategoryUpsertSubcategory,
} from "@/lib/api";
import { ImageUploadField } from "@/components/shared/image-upload-field";

const ICON_OPTIONS = [
  { label: "Category", value: "category" },
  { label: "Auto Towing", value: "auto_towing" },
  { label: "Inventory", value: "inventory_2" },
  { label: "Link", value: "link" },
  { label: "Anchor", value: "anchor" },
  { label: "Construction", value: "construction" },
  { label: "Precision", value: "precision_manufacturing" },
  { label: "Settings", value: "settings" },
  { label: "Build", value: "build" },
  { label: "Warehouse", value: "warehouse" },
  { label: "Local Shipping", value: "local_shipping" },
  { label: "Verified", value: "verified" },
  { label: "Factory", value: "factory" },
  { label: "Engineering", value: "engineering" },
  { label: "Bolt", value: "bolt" },
  { label: "Hardware", value: "hardware" },
  { label: "Handshake", value: "handshake" },
  { label: "Forklift", value: "forklift" },
  { label: "Inventory 2", value: "inventory" },
  { label: "Tune", value: "tune" },
  { label: "Shield", value: "shield" },
  { label: "Safety Check", value: "safety_check" },
  { label: "Route", value: "route" },
  { label: "Directions Car", value: "directions_car" },
  { label: "Electric Bolt", value: "electric_bolt" },
  { label: "Package 2", value: "deployed_code" },
  { label: "Military Tech", value: "military_tech" },
  { label: "Extension", value: "extension" },
  { label: "Hub", value: "hub" },
  { label: "Widgets", value: "widgets" },
];

type CategorySubcategoryDraft = CategorySubcategory & {
  originalSlug?: string;
  slugEdited?: number;
};

function toSlugBase(input: string, fallback = "category") {
  const normalized = String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (normalized) {
    return normalized;
  }

  return String(fallback || "category")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type UpsertCategoryFormProps = {
  initData?: CategoryRecord;
  type?: "edit" | "create";
  uploadDraftId: string;
};

export type UpsertCategoryFormRef = {
  onConfirm: () => Promise<{
    code: number;
    data: {
      id?: string;
      slug: string;
      name: string;
      shortName?: string;
      description?: string;
      cardImage?: string;
      icon?: string;
      sortOrder?: number;
      subcategories: CategoryUpsertSubcategory[];
    };
  }>;
};

export const UpsertCategoryForm = forwardRef<
  UpsertCategoryFormRef,
  UpsertCategoryFormProps
>(({ initData, type = "create", uploadDraftId }, ref) => {
  const [form] = Form.useForm();
  const slugEditedManuallyRef = useRef(type === "edit");
  const watchedName = Form.useWatch("name", form);

  useImperativeHandle(ref, () => ({
    onConfirm: async () => {
      const values = await form.validateFields();
      const normalizedName = String(values.name || "").trim();
      const normalizedSlug = toSlugBase(
        String(values.slug || "").trim() || normalizedName,
        "category",
      );
      const dedupe = new Set<string>();
      const subcategories = (values.subcategories || [])
        .map((item: CategorySubcategoryDraft) => {
          const name = String(item?.name || "").trim();
          const slug = toSlugBase(String(item?.slug || "").trim() || name, "subcategory");
          const originalSlugRaw = String(item?.originalSlug || "").trim();
          const originalSlug = originalSlugRaw
            ? toSlugBase(originalSlugRaw, "subcategory")
            : "";

          return {
            slug,
            name,
            originalSlug: originalSlug || undefined,
          };
        })
        .filter((item: CategoryUpsertSubcategory) => {
          if (!item.slug || !item.name || dedupe.has(item.slug)) {
            return false;
          }
          dedupe.add(item.slug);
          return true;
        });

      const payload = {
        id: type === "edit" ? initData?.id : undefined,
        slug: normalizedSlug,
        name: normalizedName,
        shortName: String(values.shortName || "").trim(),
        description: String(values.description || "").trim(),
        cardImage: String(values.cardImage || "").trim(),
        icon: String(values.icon || "category").trim() || "category",
        sortOrder:
          typeof values.sortOrder === "number"
            ? values.sortOrder
            : Number(values.sortOrder) || 0,
        subcategories,
        uploadDraftId,
      };

      await upsertCategoryApi(payload);
      message.success(
        type === "create"
          ? "Category created successfully."
          : "Category updated successfully.",
      );

      return {
        code: 200,
        data: payload,
      };
    },
  }));

  useEffect(() => {
    if (!initData) {
      form.setFieldsValue({
        slug: "",
        icon: "category",
        sortOrder: 0,
        subcategories: [{ slug: "", name: "", originalSlug: "", slugEdited: 0 }],
      });
      slugEditedManuallyRef.current = false;
      return;
    }

    form.setFieldsValue({
      ...initData,
      subcategories:
        initData.subcategories?.length > 0
          ? initData.subcategories.map((item) => ({
              ...item,
              originalSlug: item.slug,
              slugEdited: 1,
            }))
          : [{ slug: "", name: "", originalSlug: "", slugEdited: 0 }],
    });
    slugEditedManuallyRef.current = true;
  }, [form, initData]);

  useEffect(() => {
    if (type !== "create" || slugEditedManuallyRef.current) {
      return;
    }

    const generated = toSlugBase(String(watchedName || ""), "category");
    form.setFieldValue("slug", generated);
  }, [form, type, watchedName]);

  const slugLabel =
    type === "create"
      ? "Slug (Auto from name; editable.)"
      : "Slug (Editable. Changing it will migrate linked products.)";

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
          label={slugLabel}
          style={{ flex: 1 }}
          rules={[
            {
              pattern: /^[a-z0-9-]*$/,
              message: "Use lowercase letters, numbers and hyphens only",
            },
          ]}
        >
          <Input
            placeholder="auto-generated-from-name"
            onChange={() => {
              if (type === "create" && !slugEditedManuallyRef.current) {
                slugEditedManuallyRef.current = true;
              }
            }}
          />
        </Form.Item>
      </Space>

      <Space size="middle" style={{ display: "flex" }}>
        <Form.Item name="shortName" label="Short Name" style={{ flex: 1 }}>
          <Input placeholder="Cargo" />
        </Form.Item>
        <Form.Item
          name="icon"
          label="Icon"
          style={{ flex: 1 }}
        >
          <Select
            className="category-icon-select"
            showSearch={false}
            classNames={{ popup: { root: "category-icon-select-popup" } }}
            listHeight={280}
            popupMatchSelectWidth={false}
            placeholder="Select icon"
            suffixIcon={<span className="material-symbols-outlined">expand_more</span>}
            options={ICON_OPTIONS.map((item) => ({
              label: (
                <span
                  className="category-icon-option"
                  title={`${item.label} (${item.value})`}
                >
                  <span className="material-symbols-outlined">{item.value}</span>
                </span>
              ),
              value: item.value,
            }))}
          />
        </Form.Item>
        <Form.Item name="sortOrder" label="Sort Order" style={{ flex: 1 }}>
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Space>

      <Form.Item name="cardImage" label="Card Image">
        <ImageUploadField
          draftId={uploadDraftId}
          signApi={getCategoryImageUploadSignApi}
        />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={3} showCount maxLength={240} />
      </Form.Item>

      <Form.List name="subcategories">
        {(fields, { add, remove }) => (
          <div>
            <div className="admin-section-label">Subcategories</div>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} align="start" style={{ display: "flex", marginBottom: 8 }}>
                <Form.Item {...restField} name={[name, "originalSlug"]} hidden>
                  <Input type="hidden" />
                </Form.Item>
                <Form.Item {...restField} name={[name, "slugEdited"]} hidden>
                  <Input type="hidden" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "name"]}
                  rules={[{ required: true, message: "Name is required" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    placeholder="Subcategory name"
                    onChange={(event) => {
                      const edited = Boolean(
                        Number(form.getFieldValue(["subcategories", name, "slugEdited"])) === 1,
                      );
                      if (edited) {
                        return;
                      }
                      const generatedSlug = toSlugBase(
                        String(event.target.value || ""),
                        "subcategory",
                      );
                      form.setFieldValue(["subcategories", name, "slug"], generatedSlug);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "slug"]}
                  rules={[
                    {
                      pattern: /^[a-z0-9-]*$/,
                      message: "Use lowercase letters, numbers and hyphens only",
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    placeholder="auto-generated-from-name"
                    onChange={() => {
                      const edited = Boolean(
                        Number(form.getFieldValue(["subcategories", name, "slugEdited"])) === 1,
                      );
                      if (!edited) {
                        form.setFieldValue(["subcategories", name, "slugEdited"], 1);
                      }
                    }}
                  />
                </Form.Item>
                <Button danger style={{ alignSelf: "flex-start" }} onClick={() => remove(name)}>
                  Remove
                </Button>
              </Space>
            ))}
            <Button
              type="dashed"
              onClick={() =>
                add({
                  name: "",
                  slug: "",
                  originalSlug: "",
                  slugEdited: 0,
                })
              }
            >
              Add Subcategory
            </Button>
          </div>
        )}
      </Form.List>
    </Form>
  );
});

UpsertCategoryForm.displayName = "UpsertCategoryForm";
