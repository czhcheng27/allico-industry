"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { Button, Cascader, Form, Input, Select, Space, message } from "antd";
import {
  getCategoryListApi,
  getProductImageUploadSignApi,
  upsertProductApi,
  type CategoryRecord,
} from "@/lib/api";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import type { Product } from "@/types/product";

const MAX_GALLERY_IMAGES = 8;
const MAX_DETAIL_TAGS = 4;
const DETAIL_TAG_SUGGESTIONS = [
  "PREMIUM GRADE",
  "USA MADE",
  "HEAVY DUTY",
  "HOT SELLER",
  "NEW ARRIVAL",
  "OEM QUALITY",
].map((item) => ({ label: item, value: item }));

function toSlugBase(input: string) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeStringList(
  input: unknown,
  {
    limit = Number.POSITIVE_INFINITY,
    dedupeCaseInsensitive = false,
    removeValue = "",
  }: {
    limit?: number;
    dedupeCaseInsensitive?: boolean;
    removeValue?: string;
  } = {},
) {
  if (!Array.isArray(input)) {
    return [];
  }

  const removeValueNormalized = String(removeValue || "").trim();
  const dedupe = new Set<string>();
  const normalized: string[] = [];

  for (const item of input) {
    const value = String(item || "").trim();
    if (!value || value === removeValueNormalized) {
      continue;
    }

    const dedupeKey = dedupeCaseInsensitive ? value.toLowerCase() : value;
    if (dedupe.has(dedupeKey)) {
      continue;
    }

    dedupe.add(dedupeKey);
    normalized.push(value);
    if (normalized.length >= limit) {
      break;
    }
  }

  return normalized;
}

type UpsertProductFormProps = {
  initData?: Product;
  type?: "edit" | "create";
  uploadDraftId: string;
};

export type UpsertProductFormRef = {
  onConfirm: () => Promise<{ code: number; data: Record<string, unknown> }>;
};

export const UpsertProductForm = forwardRef<
  UpsertProductFormRef,
  UpsertProductFormProps
>(({ initData, type = "create", uploadDraftId }, ref) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [slugEditedManually, setSlugEditedManually] = useState(type === "edit");

  const watchedName = Form.useWatch("name", form);

  const categoryPathOptions = useMemo(
    () =>
      categories.map((item) => {
        const children = (item.subcategories || []).map((subItem) => ({
          label: subItem.name,
          value: subItem.slug,
        }));

        if (children.length === 0) {
          return {
            label: item.name,
            value: item.slug,
            isLeaf: true,
          };
        }

        return {
          label: item.name,
          value: item.slug,
          children,
        };
      }),
    [categories],
  );

  useImperativeHandle(ref, () => ({
    onConfirm: async () => {
      const values = await form.validateFields();
      const mainImage = String(values.image || "").trim();
      const categoryPath = normalizeStringList(values.categoryPath, {
        limit: 2,
      });
      const normalizedCategory = String(categoryPath[0] || "").trim();
      const normalizedSubcategory = String(categoryPath[1] || "").trim();
      const normalizedSlug = toSlugBase(String(values.slug || ""));
      const normalizedGalleryImages = normalizeStringList(values.galleryImages, {
        limit: MAX_GALLERY_IMAGES,
        removeValue: mainImage,
      });
      const normalizedDetailTags = normalizeStringList(values.detailTags, {
        limit: MAX_DETAIL_TAGS,
        dedupeCaseInsensitive: true,
      }).map((item) => item.slice(0, 24).trim()).filter(Boolean);
      const normalizedSpecs = Array.isArray(values.listSpecs)
        ? values.listSpecs
            .map((item: { label?: string; value?: string }) => ({
              label: String(item?.label || "").trim(),
              value: String(item?.value || "").trim(),
            }))
            .filter((item: { label: string; value: string }) => item.label && item.value)
        : [];

      const payload = {
        ...values,
        id: type === "edit" ? initData?.id : "",
        slug: normalizedSlug,
        name: String(values.name || "").trim(),
        category: normalizedCategory,
        subcategory: normalizedSubcategory,
        sku: String(values.sku || "").trim(),
        price: String(values.price || "").trim(),
        image: mainImage,
        badge: String(values.badge || "").trim(),
        listSpecs: normalizedSpecs,
        galleryImages: normalizedGalleryImages,
        detailTags: normalizedDetailTags,
        uploadDraftId,
      };

      await upsertProductApi(payload);
      message.success(
        type === "create"
          ? "Product created successfully."
          : "Product updated successfully.",
      );

      return {
        code: 200,
        data: payload,
      };
    },
  }));

  useEffect(() => {
    let mounted = true;
    setLoadingCategories(true);

    void getCategoryListApi()
      .then((response) => {
        if (!mounted) {
          return;
        }
        setCategories(response.data.categories || []);
      })
      .catch((error) => {
        console.error("Fetch category list failed:", error);
        message.error("Failed to load category options.");
      })
      .finally(() => {
        if (mounted) {
          setLoadingCategories(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!initData) {
      form.setFieldsValue({
        slug: "",
        categoryPath: [],
        status: "In Stock",
        detailTags: [],
        galleryImages: [],
        listSpecs: [{ label: "Size", value: "" }],
      });
      setSlugEditedManually(false);
      return;
    }

    form.setFieldsValue({
      ...initData,
      categoryPath: initData.subcategory
        ? [initData.category, initData.subcategory]
        : [initData.category],
      detailTags: initData.detailTags || [],
      galleryImages: initData.galleryImages || [],
      listSpecs:
        initData.listSpecs?.length > 0
          ? initData.listSpecs
          : [{ label: "Size", value: "" }],
    });
    setSlugEditedManually(true);
  }, [form, initData]);

  useEffect(() => {
    if (type !== "create" || slugEditedManually) {
      return;
    }

    const generated = toSlugBase(String(watchedName || ""));
    form.setFieldValue("slug", generated);
  }, [form, slugEditedManually, type, watchedName]);

  const slugHint =
    type === "create"
      ? "Auto from name; editable."
      : "Used for search and related mapping.";

  return (
    <Form form={form} layout="vertical" scrollToFirstError>
      <Form.Item
        name="name"
        label="Product Name"
        rules={[{ required: true, message: "Product name is required" }]}
      >
        <Input />
      </Form.Item>

      <Space size="middle" align="start" style={{ display: "flex" }}>
        <Form.Item
          name="slug"
          label="Slug"
          extra={slugHint}
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
              if (type === "create" && !slugEditedManually) {
                setSlugEditedManually(true);
              }
            }}
          />
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

      <Form.Item
        name="categoryPath"
        label="Category / Subcategory"
        rules={[{ required: true, message: "Please select category" }]}
      >
        <Cascader
          options={categoryPathOptions}
          changeOnSelect={false}
          allowClear
          showSearch
          placeholder="Select category and subcategory (if available)"
          loading={loadingCategories}
          classNames={{ popup: { root: "product-category-cascader-popup" } }}
          popupMenuColumnStyle={{ minWidth: 220, height: "auto", maxHeight: 260 }}
          style={{ width: "100%" }}
        />
      </Form.Item>

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
        label="Main Image"
        rules={[{ required: true, message: "Main image is required" }]}
      >
        <ImageUploadField
          draftId={uploadDraftId}
          signApi={getProductImageUploadSignApi}
        />
      </Form.Item>

      <Form.List name="galleryImages">
        {(fields, { add, remove }) => (
          <div>
            <div className="admin-section-label">
              Gallery Images (Optional, up to {MAX_GALLERY_IMAGES})
            </div>
            {fields.map(({ key, name, ...restField }) => (
              <div
                key={key}
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <Form.Item
                  {...restField}
                  name={name}
                  label={`Gallery Image ${name + 1}`}
                  style={{ marginBottom: 8 }}
                >
                  <ImageUploadField
                    draftId={uploadDraftId}
                    signApi={getProductImageUploadSignApi}
                  />
                </Form.Item>
                <Button danger onClick={() => remove(name)}>
                  Remove Image
                </Button>
              </div>
            ))}
            <Button
              type="dashed"
              onClick={() => add("")}
              disabled={fields.length >= MAX_GALLERY_IMAGES}
            >
              Add Gallery Image
            </Button>
          </div>
        )}
      </Form.List>

      <Form.Item name="badge" label="Badge">
        <Input placeholder="New Arrival" />
      </Form.Item>

      <Form.Item
        name="detailTags"
        label="Detail Tags"
        extra={`Shown as top-left badges on product detail image. Up to ${MAX_DETAIL_TAGS} tags.`}
      >
        <Select
          mode="tags"
          tokenSeparators={[","]}
          options={DETAIL_TAG_SUGGESTIONS}
          optionFilterProp="label"
          placeholder="Pick preset or type custom tags"
          onChange={(nextValues: string[]) => {
            const normalizedTags = normalizeStringList(nextValues, {
              limit: MAX_DETAIL_TAGS,
              dedupeCaseInsensitive: true,
            }).map((item) => item.slice(0, 24).trim()).filter(Boolean);
            form.setFieldValue("detailTags", normalizedTags);
          }}
        />
      </Form.Item>

      <Form.List name="listSpecs">
        {(fields, { add, remove }) => (
          <div>
            <div className="admin-section-label">Specs</div>
            {fields.map(({ key, name, ...restField }) => (
              <Space
                key={key}
                align="center"
                style={{ display: "flex", marginBottom: 8 }}
              >
                <Form.Item
                  {...restField}
                  name={[name, "label"]}
                  rules={[{ required: true, message: "Label is required" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Label" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "value"]}
                  rules={[{ required: true, message: "Value is required" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Value" />
                </Form.Item>
                <Button danger style={{ alignSelf: "center" }} onClick={() => remove(name)}>
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
