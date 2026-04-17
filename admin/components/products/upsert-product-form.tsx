"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Button,
  Cascader,
  Form,
  Input,
  Select,
  Space,
  Switch,
  message,
} from "antd";
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
const HOT_SELLER_LABEL = "HOT SELLER";
const DETAIL_TAG_SUGGESTIONS = [
  "PREMIUM GRADE",
  "USA MADE",
  "HEAVY DUTY",
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

function isHotSellerText(value: unknown) {
  return (
    String(value || "")
      .trim()
      .toUpperCase() === HOT_SELLER_LABEL
  );
}

function getInitialHotSellerValue(initData?: Product) {
  if (!initData) {
    return false;
  }

  return (
    Boolean(initData.isHotSeller) ||
    isHotSellerText(initData.badge) ||
    (Array.isArray(initData.detailTags) &&
      initData.detailTags.some((item) => isHotSellerText(item)))
  );
}

function stripLegacyHotSellerTags(input: unknown) {
  return normalizeStringList(input, {
    limit: MAX_DETAIL_TAGS,
    dedupeCaseInsensitive: true,
  }).filter((item) => !isHotSellerText(item));
}

function normalizeProductDetail(input: unknown) {
  const detail =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as { description?: unknown; features?: unknown })
      : {};

  return {
    description: String(detail.description || "").trim(),
    features: normalizeStringList(detail.features),
  };
}

type UpsertProductFormProps = {
  initData?: Product;
  type?: "edit" | "create";
  uploadDraftId: string;
};

type FormSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="space-y-3">
      <div className="px-1">
        <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
        <div className="space-y-4">{children}</div>
      </div>
    </section>
  );
}

export type UpsertProductFormRef = {
  onConfirm: () => Promise<{ code: number; data: Record<string, unknown> }>;
};

export const UpsertProductForm = forwardRef<
  UpsertProductFormRef,
  UpsertProductFormProps
>(({ initData, type = "create", uploadDraftId }, ref) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const slugEditedManuallyRef = useRef(type === "edit");

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
      const normalizedGalleryImages = normalizeStringList(
        values.galleryImages,
        {
          limit: MAX_GALLERY_IMAGES,
          removeValue: mainImage,
        },
      );
      const normalizedDetailTags = stripLegacyHotSellerTags(values.detailTags)
        .map((item) => item.slice(0, 24).trim())
        .filter(Boolean);
      const normalizedDetail = normalizeProductDetail(values.detail);
      const normalizedSpecs = Array.isArray(values.listSpecs)
        ? values.listSpecs
            .map((item: { label?: string; value?: string }) => ({
              label: String(item?.label || "").trim(),
              value: String(item?.value || "").trim(),
            }))
            .filter(
              (item: { label: string; value: string }) =>
                item.label && item.value,
            )
        : [];
      const normalizedBadge = String(values.badge || "").trim();

      if (
        isHotSellerText(normalizedBadge) ||
        normalizedDetailTags.some((item) => isHotSellerText(item))
      ) {
        const errorMessage =
          "Use the Hot Seller toggle instead of typing HOT SELLER in badge or detail tags.";
        message.error(errorMessage);
        throw new Error(errorMessage);
      }

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
        badge: normalizedBadge,
        isHotSeller: Boolean(values.isHotSeller),
        listSpecs: normalizedSpecs,
        galleryImages: normalizedGalleryImages,
        detailTags: normalizedDetailTags,
        detail: normalizedDetail,
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
        isHotSeller: false,
        detail: {
          description: "",
          features: [""],
        },
        detailTags: [],
        galleryImages: [],
        listSpecs: [{ label: "Size", value: "" }],
      });
      slugEditedManuallyRef.current = false;
      return;
    }

    form.setFieldsValue({
      ...initData,
      categoryPath: initData.subcategory
        ? [initData.category, initData.subcategory]
        : [initData.category],
      isHotSeller: getInitialHotSellerValue(initData),
      detail: {
        ...(initData.detail || {}),
        description: String(initData.detail?.description || ""),
        features:
          Array.isArray(initData.detail?.features) &&
          initData.detail.features.length > 0
            ? initData.detail.features.map((item) => String(item || ""))
            : [""],
      },
      badge: isHotSellerText(initData.badge)
        ? ""
        : String(initData.badge || ""),
      detailTags: stripLegacyHotSellerTags(initData.detailTags),
      galleryImages: initData.galleryImages || [],
      listSpecs:
        initData.listSpecs?.length > 0
          ? initData.listSpecs
          : [{ label: "Size", value: "" }],
    });
    slugEditedManuallyRef.current = true;
  }, [form, initData]);

  useEffect(() => {
    if (type !== "create" || slugEditedManuallyRef.current) {
      return;
    }

    const generated = toSlugBase(String(watchedName || ""));
    form.setFieldValue("slug", generated);
  }, [form, type, watchedName]);

  const slugHint =
    type === "create"
      ? "Auto from name; editable."
      : "Used for search and related mapping.";

  return (
    <Form
      form={form}
      layout="vertical"
      scrollToFirstError
      className="space-y-5"
    >
      <FormSection
        title="Basic Information"
        description="Define the product identity, where it lives in the catalog, and how it appears in search."
      >
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
                if (type === "create" && !slugEditedManuallyRef.current) {
                  slugEditedManuallyRef.current = true;
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
            popupMenuColumnStyle={{
              minWidth: 220,
              height: "auto",
              maxHeight: 260,
            }}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Space
          size="middle"
          style={{ display: "flex", width: "100%" }}
          styles={{ item: { flex: 1 } }}
        >
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
                { label: "Out of Stock", value: "Out of Stock" },
              ]}
            />
          </Form.Item>
        </Space>

        <Form.Item
          name="isHotSeller"
          label="Hot Seller"
          valuePropName="checked"
          extra="Controls whether this product appears in the Hot Seller group and shows the HOT SELLER label on the client."
        >
          <Switch checkedChildren="Hot Seller" unCheckedChildren="Regular" />
        </Form.Item>
      </FormSection>

      <FormSection
        title="Media & Merchandising"
        description="Manage the hero image, gallery assets, and optional marketing badge shown across the catalog."
      >
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
                  className="mb-3 rounded-xl border border-slate-200 bg-white p-3"
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
      </FormSection>

      <FormSection
        title="Detail Intro"
        description="Control the descriptive paragraph and bullet list shown beside the spec table on the product detail page."
      >
        <Form.Item
          name={["detail", "description"]}
          label="Detail Description"
          extra="Optional. Shown on the product detail page intro."
        >
          <Input.TextArea
            rows={4}
            placeholder="This product is engineered for high-cycle industrial usage..."
          />
        </Form.Item>

        <Form.List name={["detail", "features"]}>
          {(fields, { add, remove }) => (
            <div>
              <div className="admin-section-label">
                Detail Bullet Points (Optional)
              </div>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  className="mb-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <Space align="center" style={{ display: "flex" }}>
                    <Form.Item
                      {...restField}
                      name={name}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder="Built for demanding field conditions" />
                    </Form.Item>
                    <Button
                      danger
                      style={{ alignSelf: "center" }}
                      onClick={() => remove(name)}
                    >
                      Remove
                    </Button>
                  </Space>
                </div>
              ))}
              <Button type="dashed" onClick={() => add("")}>
                Add Bullet Point
              </Button>
            </div>
          )}
        </Form.List>
      </FormSection>

      <FormSection
        title="Detail Tags"
        description="Add short promotional tags that appear on top of the product gallery image."
      >
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
              const normalizedTags = stripLegacyHotSellerTags(nextValues)
                .map((item) => item.slice(0, 24).trim())
                .filter(Boolean);
              form.setFieldValue("detailTags", normalizedTags);
            }}
          />
        </Form.Item>
      </FormSection>

      <FormSection
        title="Specifications"
        description="Configure the key-value specs used in product cards, listings, and the detail page table."
      >
        <Form.List name="listSpecs">
          {(fields, { add, remove }) => (
            <div>
              <div className="admin-section-label">Specs</div>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  className="mb-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <Space align="center" style={{ display: "flex" }}>
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
                    <Button
                      danger
                      style={{ alignSelf: "center" }}
                      onClick={() => remove(name)}
                    >
                      Remove
                    </Button>
                  </Space>
                </div>
              ))}
              <Button
                type="dashed"
                onClick={() => add({ label: "", value: "" })}
              >
                Add Spec
              </Button>
            </div>
          )}
        </Form.List>
      </FormSection>
    </Form>
  );
});

UpsertProductForm.displayName = "UpsertProductForm";
